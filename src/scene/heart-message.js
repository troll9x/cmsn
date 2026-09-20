import * as THREE from 'three';
import { CONTENT, text } from '../content.js';
import { DISPLAY_FONT, BODY_FONT, loadFonts } from '../utils/fonts.js';

// A transparent, camera-facing greeting stays inside the particle heart.
export function heartMessage(message) {
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 900;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(0, 0.85, 0.6); sprite.scale.set(3.55, 2.6625, 1);
  sprite.renderOrder = 30; sprite.visible = false;
  let mobile = innerWidth < 760;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const shade = ctx.createRadialGradient(600, 420, 35, 600, 420, 500);
    shade.addColorStop(0, '#100914b8'); shade.addColorStop(0.48, '#10091478'); shade.addColorStop(0.78, '#10091428'); shade.addColorStop(1, '#10091400');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, 1200, 900);
    ctx.shadowColor = '#100914ee'; ctx.shadowBlur = 22;
    const fit = (value, size, family, y, color, maxWidth = 1000, style = '') => {
      ctx.font = `${style}${size}px ${family}`;
      const width = ctx.measureText(value).width;
      if (width > maxWidth) ctx.font = `${style}${size * maxWidth / width}px ${family}`;
      ctx.fillStyle = color; ctx.fillText(value, 600, y);
    };
    const value = text(message).trim();
    if (/^chúc\s+mừng\s+sinh\s+nhật$/iu.test(value)) {
      fit('Chúc mừng', mobile ? 132 : 112, DISPLAY_FONT, 205, CONTENT.colors.pearl);
      fit('sinh nhật', mobile ? 260 : 225, DISPLAY_FONT, 370, CONTENT.colors.pearl, 1030, 'italic ');
    } else if (/^happy\s+birthday[!.]?$/iu.test(value)) {
      fit('Happy', mobile ? 136 : 116, DISPLAY_FONT, 205, CONTENT.colors.pearl);
      fit('Birthday', mobile ? 260 : 225, DISPLAY_FONT, 370, CONTENT.colors.pearl, 1030, 'italic ');
    } else {
      const words = value.split(/\s+/), lines = []; let line = '';
      ctx.font = `110px ${DISPLAY_FONT}`;
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > 980) { lines.push(line); line = word; }
        else line = candidate;
      }
      if (line) lines.push(line);
      const height = Math.min(130, 340 / Math.max(1, lines.length));
      lines.forEach((line, index) => fit(line, height * 0.85, DISPLAY_FONT, 330 + (index - (lines.length - 1) / 2) * height, CONTENT.colors.pearl));
    }
    ctx.shadowColor = '#f4a7c388'; ctx.shadowBlur = 26;
    fit(text(CONTENT.recipientName), mobile ? 184 : 164, DISPLAY_FONT, 570, CONTENT.colors.blush, 880, '600 ');
    if (CONTENT.birthday) {
      const birthday = text(CONTENT.birthday).replace(/\s*[/.-]\s*/g, ' · ');
      ctx.shadowColor = '#e8c98d66'; ctx.shadowBlur = 16;
      ctx.strokeStyle = `${CONTENT.colors.gold}aa`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(390, 700); ctx.lineTo(492, 700); ctx.moveTo(708, 700); ctx.lineTo(810, 700); ctx.stroke();
      fit(birthday, mobile ? 80 : 72, BODY_FONT, 700, CONTENT.colors.gold, 430, '500 ');
    }
    texture.needsUpdate = true;
  }

  // Render immediately with a fallback, then redraw with the bundled font.
  draw();
  sprite.userData.resize = (isMobile) => {
    sprite.scale.set(isMobile ? 4.15 : 3.55, isMobile ? 3.1125 : 2.6625, 1);
    if (mobile !== isMobile) { mobile = isMobile; draw(); }
  };
  loadFonts().then(draw).catch(() => {});
  return sprite;
}
