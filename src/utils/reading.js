import { text } from '../content.js';

// Keep every sentence, but give each tap only a small amount to read.
export function readingPages(paragraphs, limit = 170) {
  return paragraphs.flatMap((paragraph) => {
    const words = text(paragraph).replace(/\s+/g, ' ').trim().split(' ');
    const pages = []; let line = '';
    for (const word of words) {
      if (line && line.length + word.length + 1 > limit) { pages.push(line); line = ''; }
      line += (line ? ' ' : '') + word;
    }
    if (line) pages.push(line);
    return pages;
  });
}

export class Reader {
  constructor() { this.positions = new Map(); this.reveals = new Map(); }
  select(key, pages) {
    this.key = key; this.pages = pages;
    this.index = Math.min(this.positions.get(key) ?? 0, Math.max(0, pages.length - 1));
    return pages[this.index] ?? '';
  }
  get more() { return this.index < this.pages.length - 1; }
  move(direction) {
    const index = Math.max(0, Math.min(this.pages.length - 1, this.index + direction));
    if (index === this.index) return false;
    this.positions.set(this.key, index); this.index = index; return true;
  }
  reset() { this.positions.clear(); this.reveals.clear(); }
}
