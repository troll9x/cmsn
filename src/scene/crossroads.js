import * as THREE from 'three';
import { CONTENT } from '../content.js';
import { crystal, glow } from './objects.js';
import { musicLines } from './music-path.js';

const C = CONTENT.colors;
const chosenColor = new THREE.Color(C.pink);
const ROAD_SLOPE = 0.12;

function traveller(file, height, mirror = false) {
  const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}images/${file}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (mirror) { texture.repeat.x = -1; texture.offset.x = 1; }
  const figure = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, alphaTest: 0.02 }));
  figure.center.set(0.5, 19 / 420); // The illustrated soles rest on the fine path.
  figure.scale.set(height * 160 / 420, height, 1);
  return figure;
}

export function crossroads(texture) {
  const group = new THREE.Group();
  const boy = traveller('traveller-boy.svg', 2.55);
  const girl = traveller('traveller.svg', 2.4, true); group.add(boy, girl);
  const heart = crystal(0.43, C.pink); heart.position.set(0, 1.35, 0.8); heart.visible = false; group.add(heart);
  const light = glow(texture, C.pink, 3, 0); light.position.copy(heart.position); group.add(light);
  group.userData = { roads: [], boy, girl, heart, light, revealedAt: null, feet: new THREE.Vector3() };
  setCrossroadsGround(group, -1.85);
  return group;
}

export function setCrossroadsGround(group, floor) {
  group.userData.roads.forEach((road) => {
    group.remove(road);
    const materials = new Set();
    road.traverse((object) => { object.geometry?.dispose(); if (object.material) materials.add(object.material); });
    materials.forEach((mat) => mat.dispose());
  });
  const point = (x, z) => new THREE.Vector3(x, floor + Math.max(0, 1 - z) * ROAD_SLOPE, z);
  group.userData.roads = [-3.8, 3.8].map((x) => {
    const road = musicLines([point(0, 0.8), point(x * 0.25, -1.1), point(x * 0.8, -4), point(x, -7.5)], 0.16);
    group.add(road); return road;
  });
}

export function updateCrossroads(group, road, time, discovered, reduced, mobile) {
  const state = group.userData;
  if (!discovered) state.revealedAt = null;
  else state.revealedAt ??= time;
  const elapsed = discovered ? time - state.revealedAt : 0;
  const p = discovered ? reduced ? 1 : THREE.MathUtils.clamp(elapsed / 2.4, 0, 1) : 0;
  const ease = p * p * (3 - 2 * p);
  group.updateWorldMatrix(true, false);
  [state.boy, state.girl].forEach((figure, i) => {
    const side = i ? 1 : -1;
    state.roads[i].userData.curve.getPoint(0.65 * (1 - ease), figure.position);
    figure.position.x += side * 0.48 * ease;
    figure.material.rotation = reduced ? 0 : Math.sin(p * Math.PI * 8) * side * 0.015;
  });
  const feet = state.feet.set(0, 0, 0.8).applyMatrix4(group.matrixWorld);
  group.worldToLocal(road.userData.pointAtZ(feet.z, feet));
  state.heart.position.set(feet.x, feet.y + 3.2, feet.z);
  const reveal = !discovered ? 0 : reduced ? 1 : THREE.MathUtils.clamp((elapsed - 2.4) / 0.9, 0, 1);
  const heartEase = reveal * reveal * (3 - 2 * reveal);
  state.heart.visible = reveal > 0;
  state.heart.scale.setScalar(0.43 * heartEase);
  state.heart.position.y += heartEase * (mobile ? -0.55 : 0.12);
  state.light.position.copy(state.heart.position);
  state.roads.forEach((branch) => {
    branch.userData.materials.forEach((mat, i) => { mat.opacity = (i === 1 ? 0.28 : 0.2) - ease * 0.1; });
  });
  const selected = road.userData.selected.userData;
  selected.materials.forEach((mat) => { mat.opacity = ease * 0.4; mat.color.copy(chosenColor); });
  state.light.material.opacity = heartEase * 0.42;
  state.heart.rotation.y = reduced ? 0 : Math.sin(time * 0.5) * 0.16;
}
