import * as THREE from 'three';
import { CONTENT, text } from '../content.js';

// A camera-facing message belongs to the heart, sharing its position and scale.
export function heartMessage(message) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const context = canvas.getContext('2d');
  context.font = '600 136px Arial, Helvetica, sans-serif';
  const lines = [];
  for (const paragraph of text(message).split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > 890) { lines.push(line); line = word; }
      else line = candidate;
    }
    if (line) lines.push(line);
  }
  const fontSize = Math.min(136, 360 / Math.max(1, lines.length));
  context.font = `600 ${fontSize}px Arial, Helvetica, sans-serif`;
  const widest = Math.max(1, ...lines.map(line => context.measureText(line).width));
  if (widest > 890) context.font = `600 ${fontSize * 890 / widest}px Arial, Helvetica, sans-serif`;
  const shade = context.createRadialGradient(512, 256, 40, 512, 256, 470);
  shade.addColorStop(0, '#10091499'); shade.addColorStop(0.65, '#10091455'); shade.addColorStop(1, '#10091400');
  context.save(); context.translate(512, 256); context.scale(1, 0.55); context.translate(-512, -256);
  context.fillStyle = shade; context.fillRect(0, -256, 1024, 1024); context.restore();
  context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = CONTENT.colors.text;
  context.shadowColor = '#100914'; context.shadowBlur = 12;
  const lineHeight = Math.min(160, 380 / Math.max(1, lines.length));
  lines.forEach((line, index) => context.fillText(line, 512, 256 + (index - (lines.length - 1) / 2) * lineHeight));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 });
  const messageSprite = new THREE.Sprite(material);
  messageSprite.position.set(0, 0.85, 0.6); messageSprite.scale.set(3.25, 1.625, 1);
  messageSprite.renderOrder = 30; messageSprite.visible = false;
  return messageSprite;
}
