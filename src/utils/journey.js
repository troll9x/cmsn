import { CONTENT } from '../content.js';

export class Journey extends EventTarget {
  constructor() {
    super();
    this.index = 0;
    this.visited = CONTENT.scenes.map(() => new Set());
    this.busy = false;
    this.gift = 'closed';
    this.kept = false;
  }
  get scene() { return CONTENT.scenes[this.index]; }
  get discoveries() { return this.visited[this.index]; }
  get unlocked() {
    if (this.scene.id === 'gift') return this.gift === 'handoff';
    return this.discoveries.size >= (this.scene.interactions?.length ?? 0);
  }
  notify(type = 'update', detail = {}) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  discover(index) {
    if (this.busy || !this.scene.interactions?.[index] || this.discoveries.has(index)) return;
    this.discoveries.add(index);
    this.notify('discover', { index });
    this.notify();
  }
  navigate(direction) {
    if (this.busy || (direction > 0 && !this.unlocked)) return false;
    const index = Math.max(0, Math.min(CONTENT.scenes.length - 1, this.index + direction));
    if (index === this.index) return false;
    const from = this.index;
    this.index = index;
    this.notify('navigate', { from, to: index });
    return true;
  }
  reset() {
    this.index = 0;
    this.visited.forEach((set) => set.clear());
    this.gift = 'closed'; this.kept = false; this.busy = false;
    this.notify('restart');
  }
}
