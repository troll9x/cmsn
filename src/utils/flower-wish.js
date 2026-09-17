import { CONTENT } from '../content.js';
import { DISPLAY_FONT, BODY_FONT } from './fonts.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smooth = (t) => t * t * (3 - 2 * t);

// Rasterize the real sentence so the particles include Vietnamese diacritics.
// Only animate while gathering or blurring; the finished text is ordinary HTML.
export class FlowerWish {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector('canvas');
    this.label = root.querySelector('p');
    this.ctx = this.canvas.getContext('2d');
    this.mask = document.createElement('canvas');
    this.maskCtx = this.mask.getContext('2d', { willReadFrequently: true });
    this.frame = this.frame.bind(this);
    this.onResize = () => {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = requestAnimationFrame(() => {
        if (!this.current) return;
        this.layout();
        if (this.phase === 'settled') this.finish();
      });
    };
    window.addEventListener('resize', this.onResize);
  }

  show(message, anchor, reduced) {
    const next = { message, anchor, reduced: reduced || !this.ctx || !this.maskCtx };
    if (this.pending?.message === message || (!this.pending && this.current?.message === message)) {
      if (this.current && next.reduced && this.phase !== 'settled') { this.pending = null; this.current = next; this.layout(); this.finish(); }
      return;
    }
    if (!this.current || next.reduced) { this.begin(next); return; }
    this.pending = next;
    if (this.phase !== 'blurring') {
      this.phase = 'blurring'; this.elapsed = 0;
      this.root.dataset.phase = this.phase;
    }
    this.play();
  }

  begin(next) {
    this.current = next; this.pending = null;
    this.phase = 'gathering'; this.elapsed = 0;
    this.root.hidden = false; this.root.dataset.phase = this.phase;
    this.root.style.opacity = '1'; this.root.style.filter = 'none';
    this.layout();
    if (next.reduced) this.finish();
    else { this.label.style.opacity = '0'; this.canvas.style.opacity = '1'; this.play(); }
  }

  layout() {
    const mobile = innerWidth < 760;
    this.width = Math.min(mobile ? 350 : 420, mobile ? innerWidth - 44 : innerWidth * 0.44 - 32);
    const fontSize = mobile ? 17 : 20, lineHeight = mobile ? 26 : 31;
    const font = `${fontSize}px ${mobile ? BODY_FONT : DISPLAY_FONT}`;
    this.label.style.font = font; this.label.style.lineHeight = `${lineHeight}px`;
    this.mask.width = Math.ceil(this.width);
    const ctx = this.maskCtx;
    if (ctx) ctx.font = font;
    const lines = []; let line = '';
    for (const word of this.current.message.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && (ctx ? ctx.measureText(next).width : next.length * fontSize * 0.55) > this.width - 12) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    this.height = lines.length * lineHeight + 12;
    this.label.textContent = lines.join('\n');
    this.root.style.width = `${this.width}px`; this.root.style.height = `${this.height}px`;
    const anchor = this.current.anchor() ?? { x: innerWidth * (mobile ? 0.5 : 0.75), y: innerHeight * 0.48 };
    const minX = mobile ? 22 : innerWidth * 0.53;
    const left = clamp(anchor.x - this.width / 2, minX, innerWidth - this.width - 22);
    const top = clamp(anchor.y - this.height - 28, mobile ? 78 : 125, innerHeight - this.height - 100);
    this.root.style.left = `${left}px`; this.root.style.top = `${top}px`;
    const origin = { x: anchor.x - left, y: anchor.y - top };
    this.ratio = Math.min(devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.ceil(this.width * this.ratio);
    this.canvas.height = Math.ceil((this.height + 110) * this.ratio);
    this.canvas.style.width = `${this.width}px`; this.canvas.style.height = `${this.height + 110}px`;
    if (!ctx) return;
    this.mask.height = this.height;
    ctx.font = font; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((value, i) => ctx.fillText(value, this.width / 2, 6 + lineHeight * (i + 0.5)));
    const pixels = ctx.getImageData(0, 0, this.mask.width, this.mask.height).data;
    const points = [];
    for (let y = 0; y < this.mask.height; y += 2) {
      for (let x = 0; x < this.mask.width; x += 2) {
        if (pixels[(y * this.mask.width + x) * 4 + 3] > 85) points.push({ x, y });
      }
    }
    const count = Math.min(points.length, mobile ? 2200 : 3600);
    this.particles = Array.from({ length: count }, (_, i) => {
      const target = points[Math.floor(i * points.length / count)];
      return { ...target, fromX: origin.x + (Math.random() - 0.5) * 50, fromY: origin.y + (Math.random() - 0.5) * 26, delay: Math.random() * 240, arc: (Math.random() - 0.5) * 85 };
    });
    this.draw(0);
  }

  draw(elapsed) {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height + 110);
    ctx.fillStyle = CONTENT.colors.blush; ctx.beginPath();
    for (const point of this.particles ?? []) {
      const t = clamp((elapsed - 160 - point.delay) / 1100, 0, 1), ease = smooth(t);
      const x = point.fromX + (point.x - point.fromX) * ease + Math.sin(t * Math.PI) * point.arc;
      const y = point.fromY + (point.y - point.fromY) * ease;
      ctx.rect(x, y, 1.35, 1.35);
    }
    ctx.fill();
  }

  play() {
    if (!this.raf) { this.lastFrame = 0; this.raf = requestAnimationFrame(this.frame); }
  }

  frame(now) {
    this.raf = null;
    if (!this.current) return;
    this.elapsed += this.lastFrame ? Math.min(now - this.lastFrame, 50) : 0;
    this.lastFrame = now;
    if (this.phase === 'blurring') {
      const t = clamp(this.elapsed / 520, 0, 1);
      this.root.style.filter = `blur(${smooth(t) * 9}px)`;
      this.root.style.opacity = String(1 - smooth(t));
      if (t === 1) { this.begin(this.pending); return; }
    } else {
      this.draw(this.elapsed);
      const opacity = smooth(clamp((this.elapsed - 1320) / 300, 0, 1));
      this.label.style.opacity = String(opacity); this.canvas.style.opacity = String(1 - opacity);
      if (this.elapsed >= 1620) { this.finish(); return; }
    }
    this.raf = requestAnimationFrame(this.frame);
  }

  finish() {
    cancelAnimationFrame(this.raf); this.raf = null;
    this.phase = 'settled'; this.root.dataset.phase = this.phase;
    this.root.style.filter = 'none'; this.root.style.opacity = '1';
    this.label.style.opacity = '1'; this.canvas.style.opacity = '0';
  }

  hide() {
    cancelAnimationFrame(this.raf); this.raf = null;
    cancelAnimationFrame(this.resizeFrame);
    this.current = null; this.pending = null; this.root.hidden = true;
  }

  dispose() { this.hide(); window.removeEventListener('resize', this.onResize); }
}
