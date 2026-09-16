import * as THREE from 'three';
import { CONTENT } from '../content.js';

const LAYERS = [
  { count: 9, radius: 1.0, height: 0.58, offset: 0.12, depth: 0 },
  { count: 8, radius: 0.78, height: 0.67, offset: 0.52, depth: 0.22 },
  { count: 6, radius: 0.55, height: 0.73, offset: 0.18, depth: 0.45 },
  { count: 5, radius: 0.32, height: 0.77, offset: 0.7, depth: 0.72 },
  { count: 3, radius: 0.15, height: 0.80, offset: 0.3, depth: 0.92 },
];
const PETAL_COUNT = LAYERS.reduce((sum, layer) => sum + layer.count, 0);
const transform = new THREE.Object3D();
const root = new THREE.Object3D();
const head = new THREE.Object3D();
const combined = new THREE.Matrix4();
const tint = new THREE.Color();
const centerTint = new THREE.Color();

function curvedPetal() {
  const across = 18, along = 28;
  const positions = [], colors = [], indices = [];
  for (let row = 0; row <= along; row++) {
    const v = row / along;
    for (let col = 0; col <= across; col++) {
      const u = col / across * 2 - 1;
      // A rounded outline and cupped sides keep neighboring petals distinct.
      const width = Math.sqrt(Math.max(0, 1 - Math.pow(v * 2 - 1, 2)));
      const height = 0.75 * Math.sin(v * Math.PI / 2) - 0.18 * Math.pow(v, 4);
      positions.push(u * 0.8 * width, height + 0.18 * u * u * width, 0.045 + 0.95 * v);
      const shade = 0.62 + 0.38 * Math.pow(v, 0.6);
      colors.push(shade, shade, shade);
      if (row < along && col < across) {
        const a = row * (across + 1) + col, b = a + across + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function curvedLeaf() {
  const positions = [], indices = [];
  for (let row = 0; row <= 12; row++) {
    const v = row / 12, width = Math.sin(v * Math.PI) * 0.24;
    for (let col = 0; col <= 4; col++) {
      const u = col / 4 * 2 - 1;
      positions.push(u * width, v * 0.85, Math.sin(v * Math.PI) * 0.11 - Math.abs(u) * width * 0.28);
      if (row < 12 && col < 4) { const a = row * 5 + col; indices.push(a, a + 5, a + 1, a + 5, a + 6, a + 1); }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export function roseAssets() {
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08, -1.75, 0), new THREE.Vector3(0.11, -1.12, 0.07),
    new THREE.Vector3(0.05, -0.42, 0.015), new THREE.Vector3(0, 0.12, 0),
  ]);
  return {
    petal: curvedPetal(), leaf: curvedLeaf(), stem: new THREE.TubeGeometry(stemCurve, 16, 0.025, 7, false),
    petalMaterial: new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, side: THREE.DoubleSide, roughness: 0.68, metalness: 0.02, envMapIntensity: 0.3 }),
    leafMaterial: new THREE.MeshStandardMaterial({ color: CONTENT.garden.leafColor, side: THREE.DoubleSide, roughness: 0.8, metalness: 0 }),
    stemMaterial: new THREE.MeshStandardMaterial({ color: CONTENT.garden.stemColor, roughness: 0.8, metalness: 0 }),
  };
}

function petalMatrix(layer, index, openness, layerIndex) {
  const angle = layer.offset + index / layer.count * Math.PI * 2;
  const spread = 0.35 + openness * 0.65;
  transform.position.set(0, layerIndex * 0.015, 0);
  transform.rotation.set(0.03 * Math.sin(index * 2), angle, 0.025 * Math.cos(index * 3));
  transform.scale.set(layer.radius * spread, layer.height * (1.12 - openness * 0.12), layer.radius * spread);
  transform.updateMatrix(); return transform.matrix;
}

function leafMatrix(side) {
  transform.position.set(side * 0.015, side === 1 ? -0.95 : -0.65, 0.025);
  transform.rotation.set(0.15, side * 0.4, -side * 1.08);
  transform.scale.setScalar(side === 1 ? 1 : 0.8); transform.updateMatrix(); return transform.matrix;
}

function colorFor(layer, color) {
  const center = color === CONTENT.garden.ivoryColor ? CONTENT.garden.ivoryCenter : CONTENT.garden.roseCenter;
  return tint.set(color).lerp(centerTint.set(center), layer.depth * 0.7);
}

export function rose(assets, color, size = 1) {
  const group = new THREE.Group();
  const bloom = new THREE.Group(); bloom.position.y = 0.12; bloom.rotation.x = 0.88;
  const petals = new THREE.InstancedMesh(assets.petal, assets.petalMaterial, PETAL_COUNT);
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  petals.frustumCulled = false;
  let index = 0;
  LAYERS.forEach((layer) => { for (let j = 0; j < layer.count; j++) petals.setColorAt(index++, colorFor(layer, color)); });
  bloom.add(petals); group.add(bloom);
  group.add(new THREE.Mesh(assets.stem, assets.stemMaterial));
  const leaves = new THREE.InstancedMesh(assets.leaf, assets.leafMaterial, 2);
  [-1, 1].forEach((side, i) => leaves.setMatrixAt(i, leafMatrix(side))); group.add(leaves);
  group.userData = { rose: true, petals, head: bloom, bloom: 0, openness: 0 };
  group.scale.setScalar(size); updateRose(group, 0, 0); return group;
}

export function updateRose(group, openness, time) {
  const data = group.userData;
  let index = 0;
  LAYERS.forEach((layer, layerIndex) => {
    for (let j = 0; j < layer.count; j++) data.petals.setMatrixAt(index++, petalMatrix(layer, j, openness, layerIndex));
  });
  data.petals.instanceMatrix.needsUpdate = true;
  // The flower sways as a whole; its petals retain their overlapping layers.
  data.head.rotation.y = Math.sin(time * 0.28 + group.position.x) * 0.06;
  data.openness = openness;
}

export function backgroundRoses(assets, count = 14) {
  const group = new THREE.Group();
  const petals = new THREE.InstancedMesh(assets.petal, assets.petalMaterial, count * PETAL_COUNT);
  const stems = new THREE.InstancedMesh(assets.stem, assets.stemMaterial, count);
  const leaves = new THREE.InstancedMesh(assets.leaf, assets.leafMaterial, count * 2);
  head.position.set(0, 0.12, 0); head.rotation.set(0.88, 0, 0); head.scale.setScalar(1); head.updateMatrix();
  let petalIndex = 0;
  for (let i = 0; i < count; i++) {
    const size = 0.22 + Math.random() * 0.13;
    root.position.set(Math.sin(i * 2.4) * 3.6, -2 + size * 1.75, -1.2 - Math.random() * 3.8);
    root.rotation.set(0, Math.sin(i) * 0.3, Math.cos(i) * 0.1); root.scale.setScalar(size); root.updateMatrix();
    stems.setMatrixAt(i, root.matrix);
    [-1, 1].forEach((side, j) => { combined.multiplyMatrices(root.matrix, leafMatrix(side)); leaves.setMatrixAt(i * 2 + j, combined); });
    LAYERS.forEach((layer, layerIndex) => {
      for (let j = 0; j < layer.count; j++) {
        combined.multiplyMatrices(root.matrix, head.matrix).multiply(petalMatrix(layer, j, 1, layerIndex));
        petals.setMatrixAt(petalIndex, combined);
        petals.setColorAt(petalIndex++, colorFor(layer, i % 3 ? CONTENT.garden.roseColor : CONTENT.garden.ivoryColor));
      }
    });
  }
  petals.frustumCulled = false; group.add(petals, stems, leaves); return group;
}
