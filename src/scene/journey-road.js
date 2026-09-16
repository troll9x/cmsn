import * as THREE from 'three';
import { musicLines } from './music-path.js';

// One curve in world space owns the road, including the chosen branch at the fork.
export function journeyRoad(groups, mobile) {
  const points = [];
  const local = (index, x, y, z) => {
    const point = new THREE.Vector3(x, y, z).applyMatrix4(groups[index].matrixWorld);
    if (mobile) point.y = 1.35;
    return point;
  };
  groups.forEach((group) => group.updateWorldMatrix(true, false));
  points.push(local(0, 0, -2.05, 11));
  groups.forEach((_, i) => {
    if (i === 1) {
      points.push(local(i, 0, -1.85, 0.8), local(i, 0.85, -1.85, -7.5));
    } else points.push(local(i, 0, -2.05, 0));
  });
  points.push(local(groups.length - 1, 0, -2.05, -12));
  const base = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const scale = groups[0].scale.x;
  const curve = new class extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      base.getPoint(t, target);
      const wave = Math.sin(t * (points.length - 1) * Math.PI);
      target.x += wave * 1.3 * scale;
      target.y += wave * 0.09 * scale;
      return target;
    }
  }();
  const road = musicLines(curve, 0.18 * scale, 1024, true);
  const forkZ = points[2].z;
  const endZ = points[3].z;
  const sample = new THREE.Vector3();
  const parameterAtZ = (z) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (curve.getPoint(mid, sample).z > z) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  const from = parameterAtZ(forkZ), to = parameterAtZ(endZ);
  const selectedCurve = { getPoint: (t) => curve.getPoint(THREE.MathUtils.lerp(from, to, t)), getTangent: (t, target) => curve.getTangent(THREE.MathUtils.lerp(from, to, t), target) };
  const selected = musicLines(selectedCurve, 0.18 * scale);
  selected.userData.materials.forEach((mat) => { mat.opacity = 0; });
  road.add(selected);
  road.userData.selected = selected;
  road.userData.curve = curve;
  road.userData.pointAtZ = (z, target) => curve.getPoint(parameterAtZ(z), target);
  return road;
}

export function disposeRoad(road) {
  const geometries = new Set(), materials = new Set();
  road.traverse((object) => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
  geometries.forEach((geometry) => geometry.dispose()); materials.forEach((material) => material.dispose());
}
