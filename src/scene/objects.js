import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rose } from './roses.js';
import { CONTENT } from '../content.js';

const C = CONTENT.colors;
export function material(color = C.pink, options = {}) {
  const { clearcoat, ...standardOptions } = options;
  return new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.18, ...standardOptions });
}
export function crystal(size = 1, color = C.pink) {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.85);
  shape.bezierCurveTo(0.25, 1.45, 0.95, 1.7, 1.35, 1.05);
  shape.bezierCurveTo(1.9, 0.25, 1.1, -0.6, 0, -1.55);
  shape.bezierCurveTo(-1.1, -0.6, -1.9, 0.25, -1.35, 1.05);
  shape.bezierCurveTo(-0.95, 1.7, -0.25, 1.45, 0, 0.85);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.16, bevelSegments: 4, curveSegments: 24, steps: 1 });
  geometry.translate(0, 0, -0.14);
  geometry.computeVertexNormals();
  const body = new THREE.Mesh(geometry, material(color, { transparent: true, opacity: 0.9, metalness: 0.2, roughness: 0.22, envMapIntensity: 0.8, emissive: color, emissiveIntensity: 0.08 }));
  group.add(body);
  const core = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), new THREE.MeshBasicMaterial({ color: C.pearl, transparent: true, opacity: 0.08, depthWrite: false }));
  core.scale.setScalar(0.7);
  group.add(core);
  group.scale.setScalar(size);
  return group;
}

export function glowTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,249,252,1)');
  gradient.addColorStop(0.08, 'rgba(255,225,239,.8)');
  gradient.addColorStop(0.3, 'rgba(244,167,195,.22)');
  gradient.addColorStop(1, 'rgba(244,167,195,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
export function glow(texture, color = C.pink, size = 4, opacity = 0.65) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  sprite.scale.set(size, size, 1); return sprite;
}
export function ring(radius, color = C.gold, thickness = 0.009) {
  return new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 6, 96), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65 }));
}
export function lineCurve(points, color = C.pink, opacity = 0.65) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
export function pedestal(texture) {
  const group = new THREE.Group();
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.15, 0.09, 64), material('#261a29', { metalness: 0.15, roughness: 0.5, clearcoat: 0, envMapIntensity: 0.18 }));
  platform.position.y = -2.05; group.add(platform);
  [1.35, 2.15, 2.6, 3.05].forEach((r, i) => {
    const hoop = ring(r, i === 1 ? C.blush : C.gold, i === 1 ? 0.018 : 0.006);
    hoop.rotation.x = -Math.PI / 2; hoop.position.y = -2 + i * 0.008;
    hoop.material.opacity = i > 1 ? 0.23 : 0.6; group.add(hoop);
  });
  const light = glow(texture, C.pink, 6, 0.32); light.position.y = -1.85; light.scale.y = 1.25; group.add(light);
  return group;
}

export function flower(assets, color = C.pink, size = 1) { return rose(assets, color, size); }

export function giftBox(texture) {
  const group = new THREE.Group();
  const ivory = material(C.pearl, { roughness: 0.35, metalness: 0.05, transparent: true });
  const ribbonMat = material(C.pink, { metalness: 0.5 });
  const box = new THREE.Mesh(new RoundedBoxGeometry(2.1, 1.5, 1.65, 3, 0.12), ivory); box.position.y = -0.8; group.add(box);
  const lid = new THREE.Group(); lid.position.y = 0.02;
  lid.add(new THREE.Mesh(new RoundedBoxGeometry(2.22, 0.25, 1.77, 3, 0.09), ivory.clone())); group.add(lid);
  const ribbon = new THREE.Group();
  const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.53, 1.69), ribbonMat); vertical.position.y = -0.8; ribbon.add(vertical);
  const cross = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.235, 0.2), ribbonMat); ribbon.add(cross);
  [-1, 1].forEach((side) => {
    const bow = ring(0.35, C.pink, 0.09); bow.scale.set(1.35, 0.55, 1); bow.position.set(side * 0.38, 0.3, 0); bow.rotation.z = side * 0.3; ribbon.add(bow);
  });
  group.add(ribbon);
  const light = glow(texture, C.gold, 5, 0); light.position.y = 0.2; group.add(light);
  group.userData = { box, lid, ribbon, light, opening: 0 }; return group;
}
