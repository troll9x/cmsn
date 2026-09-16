import * as THREE from 'three';
import { CONTENT } from '../content.js';

// Hairline strokes, like a flowing musical staff; there is no filled surface.
export function musicLines(points, spacing = 0.18, segments = 96, fadeNearCamera = false) {
  const curve = Array.isArray(points) ? new THREE.CatmullRomCurve3(points) : points;
  const group = new THREE.Group(), materials = [];
  const tangent = new THREE.Vector3(), across = new THREE.Vector3();
  [CONTENT.colors.blush, CONTENT.colors.gold, CONTENT.colors.pink].forEach((color, lineIndex) => {
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments, p = curve.getPoint(t);
      curve.getTangent(t, tangent);
      across.set(-tangent.z, 0, tangent.x).normalize();
      p.addScaledVector(across, (lineIndex - 1) * spacing);
      p.y += Math.sin(t * Math.PI * 2) * (lineIndex - 1) * spacing * 0.25;
      vertices.push(p);
    }
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: lineIndex === 1 ? 0.3 : 0.22, depthWrite: false });
    {
      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vPathDepth;').replace('#include <project_vertex>', '#include <project_vertex>\nvPathDepth = -mvPosition.z;');
        const near = fadeNearCamera ? 'smoothstep(5.0, 11.0, vPathDepth)' : '1.0';
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vPathDepth;').replace('#include <color_fragment>', `#include <color_fragment>\ndiffuseColor.a *= ${near} * (1.0 - smoothstep(18.0, 48.0, vPathDepth));`);
      };
      mat.customProgramCacheKey = () => `music-path-depth-fade-${fadeNearCamera}`;
    }
    materials.push(mat);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices), mat));
  });
  group.userData.materials = materials;
  group.userData.curve = curve;
  return group;
}
