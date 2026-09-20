import { CONTENT } from '../content.js';

export class Sound {
  constructor() { this.available = CONTENT.audio.enabled; this.on = false; this.started = false; }
  async start() {
    if (!this.available) return;
    if (!this.audio) {
      // A single request, only after a gesture. No polling or repeated missing-file errors.
      try {
        const response = await fetch(import.meta.env.BASE_URL + CONTENT.audio.src);
        if (!response.ok || !(response.headers.get('content-type') || '').startsWith('audio/')) throw new Error('unavailable');
        this.url = URL.createObjectURL(await response.blob());
        this.audio = new Audio(this.url); this.audio.loop = true; this.audio.volume = CONTENT.audio.volume;
      } catch { this.available = false; return; }
    }
    try { await this.audio.play(); this.on = true; this.started = true; } catch { this.on = false; }
  }
  async toggle() {
    if (!this.started) return;
    if (this.on) { this.audio?.pause(); this.on = false; } else await this.start();
  }
  suspend() { this.audio?.pause(); }
  resume() { if (this.on) this.audio?.play().catch(() => { this.on = false; }); }
  dispose() { this.audio?.pause(); if (this.url) URL.revokeObjectURL(this.url); }
}
