import * as THREE from 'three';
import { CONTENT } from '../content.js';

// One GPU draw call for the entire swarm. Only uniforms change per frame.
export function giftHearts(mobile, reduced) {
  const count = reduced ? CONTENT.giftHearts.reducedCount : mobile ? CONTENT.giftHearts.mobileCount : CONTENT.giftHearts.desktopCount;
  const targets = new Float32Array(count * 3);
  const bursts = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    let x, y;
    do { x = Math.random() * 2.3 - 1.15; y = Math.random() * 2.5 - 1.15; }
    while ((x * x + y * y - 1) ** 3 - x * x * y ** 3 > 0);
    targets.set([x * 2.2, y * 2.2 + 0.6, (Math.random() - 0.5) * 0.65 * Math.max(0.2, 1 - Math.abs(x))], i * 3);
    const angle = Math.random() * Math.PI * 2, radius = 0.7 + Math.random() * 2.6;
    bursts.set([Math.cos(angle) * radius, 0.2 + Math.random() * 2.7, Math.sin(angle) * radius * 0.4], i * 3);
    // Keep a few large, readable hearts even when the swarm is reduced.
    seeds[i] = i < Math.min(180, count * 0.05) ? Math.random() * 0.0006 : 0.01 + Math.random() * 0.99;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute('aBurst', new THREE.BufferAttribute(bursts, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uProgress: { value: 0 }, uTime: { value: 0 }, uScale: { value: 500 }, uDirection: { value: mobile ? -1 : 1 },
      uDensity: { value: Math.min(1, 30000 / count) },
      uPink: { value: new THREE.Color(CONTENT.colors.pink) },
      uBlush: { value: new THREE.Color(CONTENT.colors.blush) },
      uGold: { value: new THREE.Color(CONTENT.colors.gold) },
    },
    vertexShader: `
      attribute vec3 aBurst;
      attribute float aSeed;
      uniform float uProgress, uTime, uScale, uDirection;
      varying float vSeed, vAlpha, vGather;
      void main() {
        float emitted = smoothstep(0.12 + aSeed * 0.16, 0.38 + aSeed * 0.12, uProgress);
        float gather = smoothstep(0.50, 0.94, uProgress);
        vec3 source = vec3(sin(aSeed * 178.0) * 0.5, -0.1, cos(aSeed * 97.0) * 0.35);
        vec3 burst = aBurst;
        burst.y = source.y + (aBurst.y - source.y) * uDirection;
        vec3 flight = mix(source, burst, emitted);
        flight.x += sin(uTime * 1.1 + aSeed * 60.0) * emitted * (1.0 - gather) * 0.35;
        flight.y += sin(aSeed * 40.0 + uTime) * emitted * (1.0 - gather) * 0.2;
        vec3 target = position;
        target.z += sin(uTime * 0.7 + aSeed * 50.0) * 0.045;
        vec3 point = mix(flight, target, gather);
        vec4 mv = modelViewMatrix * vec4(point, 1.0);
        gl_Position = projectionMatrix * mv;
        float foreground = 1.0 - step(0.001, aSeed);
        float size = mix(0.022 + aSeed * 0.022, 0.14, foreground);
        gl_PointSize = clamp(size * uScale / max(1.0, -mv.z), 1.5, 22.0);
        vSeed = aSeed;
        vAlpha = smoothstep(0.12 + aSeed * 0.16, 0.22 + aSeed * 0.16, uProgress);
        vGather = gather;
      }
    `,
    fragmentShader: `
      uniform vec3 uPink, uBlush, uGold;
      uniform float uDensity;
      varying float vSeed, vAlpha, vGather;
      void main() {
        vec2 p = (gl_PointCoord - 0.5) * vec2(2.5, -2.5);
        p.y += 0.15;
        float k = p.x * p.x + p.y * p.y - 1.0;
        float curve = k * k * k - p.x * p.x * p.y * p.y * p.y;
        float edge = max(fwidth(curve), 0.02);
        float coverage = 1.0 - smoothstep(-edge, edge, curve);
        if (coverage < 0.01 || vAlpha < 0.01) discard;
        float foreground = 1.0 - step(0.001, vSeed);
        vec3 color = mix(uPink, uBlush, vSeed * 0.65);
        color = mix(color, uGold, step(0.88, vSeed) * 0.35);
        float alpha = mix(0.18 * uDensity, mix(0.60, 0.32, vGather), foreground) * vAlpha * coverage;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const swarm = new THREE.Points(geometry, material);
  swarm.frustumCulled = false; swarm.visible = false;
  return swarm;
}
