import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { giftHearts } from './gift-hearts.js';
import { heartMessage } from './heart-message.js';
import { roseAssets, backgroundRoses, updateRose } from './roses.js';
import { crossroads, updateCrossroads, setCrossroadsGround } from './crossroads.js';
import { journeyRoad, disposeRoad } from './journey-road.js';
import { CONTENT, text } from '../content.js';
import { DISPLAY_FONT } from '../utils/fonts.js';
import { crystal, flower, giftBox, glow, glowTexture, ring, material } from './objects.js';

const SCENE_SPACING = 24;

export class World {
  constructor(canvas, journey, reducedMotion, onUnavailable) {
    this.journey = journey; this.reduced = reducedMotion; this.onUnavailable = onUnavailable;
    this.mobile = innerWidth < 760; this.time = 0; this.active = 0;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    this.renderer.setClearColor(0x000000, 0); this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.35 : 1.6));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.1;
    this.scene = new THREE.Scene(); this.scene.fog = new THREE.Fog(CONTENT.colors.night, 22, 43);
    const room = new RoomEnvironment(); const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(room, 0.04); this.scene.environment = this.environment.texture;
    room.dispose(); pmrem.dispose();
    this.camera = new THREE.PerspectiveCamera(39, innerWidth / innerHeight, 0.1, 220);
    this.scene.add(new THREE.HemisphereLight(CONTENT.colors.pearl, '#29142c', 1.1));
    const key = new THREE.DirectionalLight(CONTENT.colors.blush, 2); key.position.set(-3, 8, 8); this.scene.add(key);
    const rim = new THREE.DirectionalLight(CONTENT.colors.gold, 2); rim.position.set(5, 3, -8); this.scene.add(rim);
    this.texture = glowTexture(); this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.temp = new THREE.Vector3(); this.look = new THREE.Vector3(); this.matrix = new THREE.Object3D();
    this.distanceTarget = new THREE.Vector3(); this.distanceDirection = new THREE.Vector3(); this.distanceAnchors = [];
    this.groups = []; this.interactives = []; this.floaters = [];
    this.roseAssets = roseAssets();
    this.buildScenes(); this.buildStars(); this.buildKeepsakes(); this.buildFinalParticles();
    this.makePath(); this.resize();
    this.onResize = () => this.resize(); this.onVisibility = () => this.visibility();
    this.onContextLost = (event) => { event.preventDefault(); this.failed = true; this.stop(); this.onUnavailable(); };
    window.addEventListener('resize', this.onResize); document.addEventListener('visibilitychange', this.onVisibility);
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.lastFrame = 0; this.lowFrames = 0; this.frame = this.frame.bind(this); this.raf = requestAnimationFrame(this.frame);
  }

  buildScenes() {
    CONTENT.scenes.forEach((entry, index) => {
      const group = new THREE.Group(); group.position.z = -index * SCENE_SPACING;
      const centralGlow = glow(this.texture, CONTENT.colors.pink, 9, 0.2); centralGlow.position.z = -1; group.add(centralGlow); group.userData.light = centralGlow;
      this.scene.add(group); this.groups.push(group); this.interactives.push([]);
      if (entry.id === 'invitation') {
        this.heroCrystal = crystal(1.28); this.heroCrystal.rotation.set(0.12, 0.4, -0.14); group.add(this.heroCrystal);
        this.heroGlow = glow(this.texture, CONTENT.colors.pink, 3, 0.4); group.add(this.heroGlow);
        [2.2, 2.75].forEach((r, i) => { const orbit = ring(r, i ? CONTENT.colors.gold : CONTENT.colors.pink); orbit.rotation.set(1.1 + i * 0.3, 0.3, -0.35); group.add(orbit); });
        this.addOrbitDust(group, 130);
      }
      if (entry.id === 'meeting') {
        this.crossroads = crossroads(this.texture); group.add(this.crossroads);
        this.interactives[index].push(this.crossroads);
        this.addPetals(group, this.mobile ? 8 : 12);
      }
      if (entry.id === 'distance') {
        [-1.65, 0, 1.65].forEach((x, i) => {
          const gem = crystal(0.52); gem.position.set(x, i === 1 ? 0.55 : -0.1, 0);
          group.add(gem); this.interactives[index].push(gem); this.floaters.push(gem);
          const gemGlow = glow(this.texture, CONTENT.colors.pink, 2.4, 0.2);
          gemGlow.position.copy(gem.position); group.add(gemGlow);
        });
      }
      if (entry.id === 'garden') {
        [-1.9, 0, 1.9].forEach((x, i) => {
          const bloom = flower(this.roseAssets, i === 1 ? CONTENT.garden.ivoryColor : CONTENT.garden.roseColor, 0.95);
          bloom.position.set(x, i === 1 ? 0.3 : -0.1, i === 1 ? 0 : -0.25); bloom.rotation.z = i === 1 ? 0.02 : x * -0.035;
          bloom.userData.restPosition = bloom.position.clone();
          bloom.userData.flightMaterials = [];
          bloom.traverse((object) => {
            if (!object.material) return;
            object.material = object.material.clone(); object.material.transparent = true;
            bloom.userData.flightMaterials.push(object.material);
          });
          group.add(bloom); this.interactives[index].push(bloom);
        });
        group.add(backgroundRoses(this.roseAssets, this.mobile ? 10 : 14));
        for (let i = 0; i < 8; i++) { const lantern = glow(this.texture, CONTENT.colors.gold, 0.6, 0.7); lantern.position.set(Math.cos(i) * 3, -0.5 + Math.sin(i) * 0.2, -2 + Math.sin(i) * 2); group.add(lantern); }
        this.addPetals(group, this.mobile ? 16 : 32);
        [-2, 0, 2].forEach((x) => { const mist = glow(this.texture, CONTENT.colors.pearl, 5, 0.055); mist.position.set(x, -1.9, -1.3); mist.scale.y = 0.8; group.add(mist); });
      }
      if (entry.id === 'time') {
        const face = new THREE.Group(); group.add(face); this.clockFace = face;
        [1.75, 2.15, 2.6].forEach((r, i) => { const hoop = ring(r, i === 1 ? CONTENT.colors.pearl : CONTENT.colors.gold, 0.013); face.add(hoop); });
        const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.12, 0.025), new THREE.MeshBasicMaterial({ color: CONTENT.colors.gold }), 12);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; this.matrix.position.set(Math.sin(a) * 1.94, Math.cos(a) * 1.94, 0); this.matrix.rotation.set(0, 0, -a); this.matrix.scale.set(1, 1, 1); this.matrix.updateMatrix(); ticks.setMatrixAt(i, this.matrix.matrix); } face.add(ticks); this.clockTicks = ticks;
        this.clockHands = [1.3, 0.9].map((length, i) => { const pivot = new THREE.Group(); const hand = new THREE.Mesh(new THREE.BoxGeometry(0.025, length, 0.025), new THREE.MeshBasicMaterial({ color: i ? CONTENT.colors.pink : CONTENT.colors.pearl })); hand.position.y = length / 2; pivot.add(hand); face.add(pivot); return pivot; });
      }
      if (entry.id === 'gift') {
        this.gift = giftBox(this.texture); this.giftSwarm = giftHearts(this.mobile, this.reduced);
        this.gift.add(this.giftSwarm); group.add(this.gift); this.addPetals(group, 36); this.interactives[index].push(this.gift);
        this.giftMessage = heartMessage(entry.celebration); this.giftSwarm.add(this.giftMessage);
      }
      if (entry.id === 'closing') { this.closingHalo = glow(this.texture, CONTENT.colors.gold, 10, 0.35); group.add(this.closingHalo); }
    });
  }

  addOrbitDust(group, count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { const a = i / count * Math.PI * 2; const r = 2 + Math.random() * 0.9; positions.set([Math.cos(a) * r, Math.sin(a) * r * 0.45 - 0.4, Math.sin(a) * r * 0.5], i * 3); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: CONTENT.colors.gold, size: 0.045, map: this.texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); group.add(points); this.orbitDust = points;
  }
  addPetals(group, count) {
    const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), material(CONTENT.colors.blush, { transparent: true, opacity: 0.28, roughness: 0.45 }), count);
    const data = Array.from({ length: count }, () => ({ x: (Math.random() - 0.5) * 9, y: Math.random() * 6 - 2, z: (Math.random() - 0.5) * 7, phase: Math.random() * 6 }));
    petals.userData.data = data; group.add(petals);
    this.petals ??= []; this.petals.push(petals);
  }
  buildStars() {
    const count = this.reduced ? 120 : this.mobile ? 420 : 1000;
    const pos = new Float32Array(count * 3); const colors = new Float32Array(count * 3);
    const pink = new THREE.Color(CONTENT.colors.pink), gold = new THREE.Color(CONTENT.colors.gold), pearl = new THREE.Color(CONTENT.colors.pearl);
    for (let i = 0; i < count; i++) { pos.set([(Math.random() - 0.5) * 65, (Math.random() - 0.5) * 36, -Math.random() * 190 + 10], i * 3); const col = i % 5 === 0 ? pink : i % 3 === 0 ? gold : pearl; colors.set([col.r, col.g, col.b], i * 3); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: this.mobile ? 0.15 : 0.2, map: this.texture, transparent: true, opacity: 0.95, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false })); this.scene.add(this.stars);
  }
  buildKeepsakes() { this.keepsakes = Array.from({ length: 3 }, () => { const gem = crystal(0.14); this.scene.add(gem); return gem; }); }
  buildFinalParticles() {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 384;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `italic 88px ${DISPLAY_FONT}`; ctx.fillText('Happy Birthday,', 512, 140);
    const name = text(CONTENT.recipientName); ctx.font = `58px ${DISPLAY_FONT}`; while (ctx.measureText(name).width > 950) { const size = parseInt(ctx.font) || 58; ctx.font = `${size - 2}px ${DISPLAY_FONT}`; }
    ctx.fillText(name, 512, 235);
    const pixels = ctx.getImageData(0, 0, 1024, 384).data; const samples = [];
    for (let y = 0; y < 384; y += 4) for (let x = 0; x < 1024; x += 4) if (pixels[(y * 1024 + x) * 4 + 3] > 100) samples.push([(x - 512) / 140, (190 - y) / 140, 0]);
    const count = Math.min(samples.length, this.mobile ? 1700 : 3200);
    this.finalTargets = new Float32Array(count * 3); this.heartTargets = new Float32Array(count * 3); this.finalStart = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.finalTargets.set(samples[Math.floor(i / count * samples.length)], i * 3);
      const a = i / count * Math.PI * 2, r = 0.92 + Math.random() * 0.08;
      this.heartTargets.set([16 * Math.sin(a) ** 3 * 0.13 * r, (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.13 * r, (Math.random() - 0.5) * 0.4], i * 3);
      this.finalStart.set([(Math.random() - 0.5) * 11, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 3], i * 3);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(this.finalStart.slice(), 3));
    this.finalParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: CONTENT.colors.blush, size: 0.036, map: this.texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); this.groups[6].add(this.finalParticles); this.heartTime = null;
    const shape = new THREE.Shape();
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; const x = 16 * Math.sin(a) ** 3 * 0.13, y = (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.13; if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y); }
    this.heart = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.08, bevelSegments: 1, steps: 1 }), material(CONTENT.colors.pink, { transparent: true, opacity: 0, flatShading: true, metalness: 0.5 }));
    this.groups[6].add(this.heart);
  }
  makePath() {
    this.path = new THREE.CatmullRomCurve3(this.groups.map((_, index) => new THREE.Vector3(0, this.mobile ? 1.8 : 0.25, -index * SCENE_SPACING + (this.mobile ? 16.5 : 13))));
  }
  resize() {
    const wasMobile = this.mobile; this.mobile = innerWidth < 760;
    this.scene.fog.near = this.mobile ? 24 : 22; this.scene.fog.far = this.mobile ? 46 : 43;
    this.renderer.setSize(innerWidth, innerHeight); this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    this.giftSwarm.material.uniforms.uScale.value = innerHeight * this.renderer.getPixelRatio() * 1.35;
    this.giftSwarm.scale.setScalar(this.mobile ? 0.85 : 1); this.giftSwarm.position.y = this.mobile ? -0.55 : 0;
    this.giftSwarm.material.uniforms.uDirection.value = this.mobile ? -1 : 1;
    this.giftMessage.userData.resize(this.mobile);
    if (this.mobile) this.limitGiftHearts(CONTENT.giftHearts.mobileCount);
    this.groups.forEach((group) => { group.position.x = this.mobile ? 0 : Math.min(3.6, this.camera.aspect * 2.3); group.position.y = this.mobile ? 1.8 + 1575 / innerHeight : 0.5; group.scale.setScalar(this.mobile ? THREE.MathUtils.clamp(555 / innerHeight, 0.58, 0.82) : 1); });
    const road = journeyRoad(this.groups, this.mobile);
    if (this.road) {
      disposeRoad(this.road); this.road.clear();
      this.road.add(...road.children.slice()); this.road.userData = road.userData;
    } else { this.road = road; this.scene.add(this.road); }
    setCrossroadsGround(this.crossroads, this.mobile ? (1.35 - this.groups[1].position.y) / this.groups[1].scale.y : -1.85);
    if (wasMobile !== this.mobile) this.makePath();
    if (!this.transition) this.placeCamera(this.active / 6);
  }
  placeCamera(t) {
    this.path.getPoint(Math.max(0, Math.min(1, t)), this.temp); this.camera.position.copy(this.temp);
    this.look.set(0, this.mobile ? 1.8 : 0.25, this.temp.z - 13); this.camera.lookAt(this.look);
  }
  navigate(from, to) { this.active = to; this.transition = { from: from / 6, to: to / 6, start: performance.now() }; this.closingStart = this.time; }
  discover(index) {
    const object = this.interactives[this.active][index];
    if (!object) return;
    object.userData.discovered = true;
    if (this.active === 1) {
      this.crossroads.userData.revealedAt = this.time;
      if (!this.reduced) { this.meetingEnd = this.time + 3.3; this.journey.busy = true; }
    }
    if (this.active === 2) { object.userData.flightStart = this.time; object.userData.flightFrom = object.position.clone(); }
    if (this.active === 3) { object.userData.bloom = 1; object.userData.flightStart = this.time; }
  }
  setDistanceAnchors(anchors) { this.distanceAnchors = anchors; }
  flowerAnchor(index) {
    const flower = this.interactives[3][index];
    if (!flower) return null;
    this.wishAnchor ??= new THREE.Vector3();
    // Keep the words above the bloom's original position as it falls on mobile.
    this.wishAnchor.copy(flower.userData.restPosition); this.wishAnchor.y += 0.8;
    this.groups[3].localToWorld(this.wishAnchor); this.wishAnchor.project(this.camera);
    return { x: (this.wishAnchor.x + 1) * innerWidth / 2, y: (1 - this.wishAnchor.y) * innerHeight / 2 };
  }
  hit(clientX, clientY) {
    if (this.transition) return null;
    this.pointer.set(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const roots = this.interactives[this.active]; const hits = this.raycaster.intersectObjects(roots, true);
    if (!hits.length) return null;
    let object = hits[0].object; while (object && !roots.includes(object)) object = object.parent;
    return roots.indexOf(object);
  }
  openGift() { this.giftStart = performance.now(); }
  keep() { this.heartTime = this.time; }
  reset() {
    this.active = 0; this.transition = null; this.heartTime = null; this.giftStart = null; this.meetingEnd = null;
    this.interactives.flat().forEach((object) => { object.userData.discovered = false; object.userData.flightStart = null; if (object.userData.rose) { object.userData.bloom = 0; updateRose(object, 0, 0); } object.visible = true; });
    this.gift.userData.opening = 0; this.renderer.domElement.style.opacity = '1'; this.placeCamera(0);
  }
  frame(now) {
    if (document.hidden) return;
    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, 0.05) : 0; this.lastFrame = now; this.time += delta;
    if (delta > 0.033 && !this.transition) this.lowFrames++; else this.lowFrames = Math.max(0, this.lowFrames - 1);
    if (this.active === 5 && delta > 0.033) this.slowGiftFrames = (this.slowGiftFrames ?? 0) + 1;
    else this.slowGiftFrames = 0;
    if (this.slowGiftFrames >= 10) { this.limitGiftHearts(Math.max(CONTENT.giftHearts.mobileCount, Math.floor(this.giftCount / 2))); this.slowGiftFrames = 0; }
    if (this.lowFrames > 120 && this.renderer.getPixelRatio() > 1) { this.renderer.setPixelRatio(1); this.lowFrames = 0; }
    if (this.transition) {
      const duration = this.reduced ? 150 : CONTENT.timing.camera;
      const p = THREE.MathUtils.clamp((now - this.transition.start) / duration, 0, 1), eased = p * p * p * (10 - 15 * p + 6 * p * p);
      this.placeCamera(THREE.MathUtils.lerp(this.transition.from, this.transition.to, eased));
      if (p === 1) {
        this.transition = null; this.renderer.domElement.style.opacity = '1'; this.journey.busy = false;
        // Begin the encounter on arrival, once per journey, without a tap.
        if (this.active === 1 && !this.journey.unlocked) this.journey.discover(0);
        this.journey.notify();
      }
    }
    this.animateObjects(delta);
    if (this.meetingEnd != null && (this.time >= this.meetingEnd || this.reduced)) {
      this.meetingEnd = null; this.journey.busy = false; this.journey.notify();
    }
    this.renderer.render(this.scene, this.camera); this.raf = requestAnimationFrame(this.frame);
  }
  get giftCount() { return Math.min(this.giftSwarm.geometry.drawRange.count, this.giftSwarm.geometry.attributes.position.count); }
  limitGiftHearts(limit) {
    const count = Math.min(this.giftCount, limit);
    this.giftSwarm.geometry.setDrawRange(0, count);
    this.giftSwarm.material.uniforms.uDensity.value = Math.min(1, 30000 / count);
  }
  animateObjects(delta) {
    const t = this.reduced ? 0 : this.time;
    this.groups.forEach((group, i) => {
      group.visible = i === this.active || (i === this.active + 1 && this.active !== 1) || Boolean(this.transition && i === Math.round(this.transition.from * 6));
    });
    this.heroCrystal.rotation.y = 0.25 + Math.sin(t * 0.35) * 0.18; this.heroCrystal.position.y = Math.sin(t * 0.7) * 0.12;
    const intro = this.reduced ? 1 : Math.min(1, this.time / 2); this.heroCrystal.scale.setScalar(1.28 * (0.03 + intro * 0.97));
    this.heroCrystal.position.z = 0;
    this.orbitDust.rotation.y = t * 0.06;
    updateCrossroads(this.crossroads, this.road, this.time, Boolean(this.journey.visited[1].size), this.reduced, this.mobile);
    this.floaters.forEach((gem, i) => {
      gem.rotation.y = Math.sin(t * 0.4 + i) * 0.28;
      gem.visible = true;
      if (!this.journey.visited[2].has(i)) {
        gem.position.set([-1.65, 0, 1.65][i], (i === 1 ? 0.55 : -0.1) + Math.sin(t + i) * 0.12, 0);
        gem.rotation.z = 0;
        gem.scale.setScalar(0.52); return;
      }
      const anchor = this.distanceAnchors[i];
      if (!anchor || this.active !== 2 || this.transition) return;
      const group = this.groups[2];
      this.distanceTarget.set(anchor.x * 2 - 1, 1 - anchor.y * 2, 0.5).unproject(this.camera);
      this.distanceDirection.copy(this.distanceTarget).sub(this.camera.position).normalize();
      const distance = (group.position.z - this.camera.position.z) / this.distanceDirection.z;
      this.distanceTarget.copy(this.camera.position).addScaledVector(this.distanceDirection, distance);
      group.worldToLocal(this.distanceTarget);
      const progress = this.reduced ? 1 : Math.min(1, Math.max(0, (this.time - (gem.userData.flightStart ?? this.time)) / 0.95));
      const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      gem.position.lerpVectors(gem.userData.flightFrom || this.distanceTarget, this.distanceTarget, eased);
      if (this.mobile) gem.position.y = THREE.MathUtils.lerp((gem.userData.flightFrom || this.distanceTarget).y, this.distanceTarget.y, 1 - (1 - progress) ** 3);
      else gem.position.y += Math.sin(progress * Math.PI) * 0.7;
      const dockScale = (this.mobile ? 0.25 : 0.16);
      gem.scale.setScalar(THREE.MathUtils.lerp(0.52, dockScale, eased));
      gem.rotation.z = Math.sin(progress * Math.PI) * -0.35;
    });
    this.petals.forEach((mesh) => {
      if (!mesh.parent.visible) return;
      mesh.userData.data.forEach((p, i) => { this.matrix.position.set(p.x + Math.sin(t * 0.2 + p.phase) * 0.3, ((p.y + 2 - t * 0.08) % 6 + 6) % 6 - 2, p.z); this.matrix.rotation.set(p.phase + t * 0.1, p.phase, t * 0.15); this.matrix.scale.set(0.65, 1.8, 0.35); this.matrix.updateMatrix(); mesh.setMatrixAt(i, this.matrix.matrix); }); mesh.instanceMatrix.needsUpdate = true;
    });
    if (this.groups[3].visible) this.groups[3].children.forEach((object) => {
      if (!object.userData.rose) return;
      const openness = THREE.MathUtils.damp(object.userData.openness, object.userData.bloom ? 1 : 0, this.reduced ? 60 : 3, delta);
      updateRose(object, openness, t);
      const flight = this.mobile && object.userData.bloom ? this.reduced ? 1 : THREE.MathUtils.clamp((this.time - (object.userData.flightStart ?? this.time)) / 1.4, 0, 1) : 0;
      const fall = 1 - (1 - flight) ** 3;
      object.position.copy(object.userData.restPosition); object.position.y -= fall * 2.1;
      object.scale.setScalar(0.95 * (1 - fall * 0.35));
      object.userData.flightMaterials.forEach((mat) => { mat.opacity = (1 - flight) ** 2; });
      object.visible = flight < 1;
    });
    this.groups[3].userData.light.material.opacity = 0.2 + this.journey.visited[3].size * 0.08;
    this.clockHands.forEach((hand, i) => { hand.rotation.z = -t * (i ? 0.04 : 0.14) - i; });
    if (this.active === 4) {
      const p = this.reduced ? 1 : Math.min(1, (this.time - this.closingStart) / 7);
      this.clockFace.rotation.y = p * 0.14; this.clockFace.scale.setScalar(1 + p * 0.22);
      this.clockHands.forEach((hand) => { hand.scale.setScalar(Math.max(0.01, 1 - Math.max(0, p - 0.6) * 2.5)); });
      this.clockTicks.visible = p < 0.99;
    }
    this.keepsakes.forEach((gem, i) => {
      gem.visible = this.journey.visited[2].has(i) && this.active >= 3 && this.active < 6;
      if (this.active === 4) { const a = t * 0.22 + i * Math.PI * 2 / 3; const merge = this.reduced ? 1 : Math.min(1, Math.max(0, (this.time - this.closingStart - 3) / 3)); gem.position.set(this.groups[4].position.x + Math.cos(a) * (1.4 - merge * 1.1), this.groups[4].position.y + Math.sin(a) * (1.4 - merge * 1.1), this.groups[4].position.z + 0.25); }
      else { gem.position.set(this.camera.position.x + (this.mobile ? 1.5 : 4.7) + Math.sin(t * 0.35 + i * 2) * 0.28, this.camera.position.y + (this.mobile ? 3 : -0.3) + i * 0.4, this.camera.position.z - 10); }
      gem.rotation.y = 0.18 + Math.sin(t * 0.35 + i) * 0.2;
    });
    const data = this.gift.userData;
    if (this.giftStart != null) data.opening = this.reduced ? 1 : Math.min(1, (performance.now() - this.giftStart) / CONTENT.timing.reveal);
    const p = data.opening;
    const lidProgress = THREE.MathUtils.smoothstep(p, 0.03, 0.4);
    data.ribbon.scale.setScalar(Math.max(0.01, 1 - THREE.MathUtils.smoothstep(p, 0, 0.3))); data.ribbon.rotation.y = p * 0.6;
    data.lid.position.y = 0.02 + lidProgress * 2.6; data.lid.rotation.z = lidProgress * -0.4;
    data.lid.children[0].material.opacity = 1 - THREE.MathUtils.smoothstep(p, 0.35, 0.52);
    data.box.material.opacity = 1 - THREE.MathUtils.smoothstep(p, 0.7, 0.88);
    data.lid.visible = p < 0.52; data.box.visible = p < 0.88;
    data.light.material.opacity = p * 0.22;
    this.giftSwarm.visible = p > 0;
    this.giftSwarm.material.uniforms.uProgress.value = p;
    this.giftSwarm.material.uniforms.uTime.value = t;
    const messageVisible = ['revealed', 'handoff'].includes(this.journey.gift);
    this.giftMessage.visible = messageVisible;
    const messageFade = this.reduced ? 1 : THREE.MathUtils.smoothstep((performance.now() - (this.giftStart ?? performance.now()) - CONTENT.timing.reveal) / 800, 0, 1);
    this.giftMessage.material.opacity = messageVisible ? messageFade : 0;
    this.updateFinal();
  }
  updateFinal() {
    if (this.active !== 6) return;
    const array = this.finalParticles.geometry.attributes.position.array;
    const assemble = this.reduced ? 1 : Math.min(1, (this.time - this.closingStart) / 3);
    const elapsed = this.heartTime == null ? null : this.time - this.heartTime;
    const hold = CONTENT.timing.heartHold / 1000, dissolve = CONTENT.timing.heartDissolve / 1000;
    for (let i = 0; i < array.length; i += 3) {
      for (let j = 0; j < 3; j++) {
        let target = THREE.MathUtils.lerp(this.finalStart[i + j], this.finalTargets[i + j], assemble);
        if (elapsed != null) {
          target = THREE.MathUtils.lerp(this.finalTargets[i + j], this.heartTargets[i + j], Math.min(1, elapsed / (this.reduced ? 0.1 : 1)));
          if (elapsed > 1 + hold) { const d = Math.min(1, (elapsed - 1 - hold) / dissolve); target += (j === 1 ? this.mobile ? -5 : 5 : this.finalStart[i + j] * 0.5) * d; }
        }
        array[i + j] = target;
      }
    }
    this.finalParticles.material.opacity = elapsed == null || elapsed < 1 + hold ? 1 : Math.max(0, 1 - (elapsed - 1 - hold) / dissolve);
    this.heart.visible = elapsed != null && elapsed < 1 + hold + dissolve;
    this.heart.material.opacity = elapsed == null ? 0 : Math.min(0.28, elapsed * 0.28) * (elapsed < 1 + hold ? 1 : Math.max(0, 1 - (elapsed - 1 - hold) / dissolve));
    this.finalParticles.geometry.attributes.position.needsUpdate = true;
  }
  visibility() { if (this.failed) return; if (document.hidden) this.stop(); else { this.lastFrame = 0; this.raf = requestAnimationFrame(this.frame); } }
  stop() { cancelAnimationFrame(this.raf); }
  dispose() {
    this.stop(); window.removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVisibility);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    const geometries = new Set(), materials = new Set();
    this.scene.traverse((object) => { if (object.geometry) geometries.add(object.geometry); if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((mat) => materials.add(mat)); });
    const textures = new Set([this.texture]); materials.forEach((mat) => { if (mat.map) textures.add(mat.map); });
    geometries.forEach((geo) => geo.dispose()); materials.forEach((mat) => mat.dispose()); textures.forEach((texture) => texture.dispose()); this.environment.dispose(); this.renderer.dispose();
  }
}
