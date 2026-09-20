import './styles.css';
import { CONTENT, text } from './content.js';
import { Journey } from './utils/journey.js';
import { Sound } from './utils/audio.js';
import { World } from './scene/world.js';
import { Reader, readingPages } from './utils/reading.js';
import { FlowerWish } from './utils/flower-wish.js';
import { loadFonts } from './utils/fonts.js';

const icons = {
  heart: '<svg viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M16 34C12 30 3 23 3 15a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 8-9 15-13 19Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5Z" stroke="currentColor" stroke-linejoin="round"/><path d="M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" stroke="currentColor" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  flower: '<svg viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M16 26v12m0-9c-8 0-11-5-11-5 7-2 11 5 11 5Zm0-4c-13 0-15-9-11-12 4-3 9 3 11 12Zm0 0C3 16 7 5 11 6c4 0 5 9 5 19Zm0 0C11 9 15 2 19 6c4 4 1 13-3 19Zm0 0c3-15 10-17 12-12 3 6-5 12-12 12Z" stroke="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4 10-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};
const escape = (value) => text(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const paragraphs = (items) => items.map((item) => `<p>${escape(item)}</p>`).join('');
const journey = new Journey(); const sound = new Sound();
const reader = new Reader(); const mobileMedia = matchMedia('(max-width: 759px)');
let suppressTapUntil = 0;
let lastReadingFrame;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let world; let fallback = false; let saving = false; let touchStart; let generation = 0;
const timers = new Set();
const schedule = (callback, delay) => { const token = generation; const timer = setTimeout(() => { timers.delete(timer); if (generation === token) callback(); }, delay); timers.add(timer); };

Object.entries(CONTENT.colors).forEach(([key, value]) => document.documentElement.style.setProperty(`--${key}`, value));
document.title = text(CONTENT.documentTitle);
document.querySelector('#app').innerHTML = `
  <canvas id="world" aria-hidden="true"></canvas>
  <div class="atmosphere" aria-hidden="true"></div>
  <div class="loading" id="loading" role="status">${icons.heart}<span>${escape(CONTENT.ui.loading)}</span></div>
  <div class="experience" id="experience">
    <header class="header">
      <a class="brand" href="#" aria-label="${escape(CONTENT.brand)}">${icons.heart}<span>${escape(CONTENT.brand)}</span></a>
      <span class="edition"><span class="tiny-star">${icons.heart}</span>${escape(CONTENT.edition)}</span>
    </header>
    <main class="main" id="main" tabindex="0" aria-label="${escape(CONTENT.ui.tapHint)}">
      <div class="sr-only" id="gift-celebration" role="status" hidden></div>
      <div class="visual-caption"><span class="caption-line" aria-hidden="true"></span><p id="caption" aria-hidden="true"></p><div id="keepsakes" class="keepsake-indicator" aria-hidden="true"></div></div>
      <div class="visual-messages" id="visual-messages" hidden></div>
      <article class="story" id="story" aria-labelledby="scene-title">
        <div class="dedication" id="dedication"></div>
        <div class="birthday-mark" id="birthday-mark" aria-label="">
          <span aria-hidden="true"></span><time id="birthday-date"></time><span aria-hidden="true"></span>
        </div>
        <h1 id="scene-title" tabindex="-1"></h1>
        <div class="story-copy" id="copy"></div>
        <div class="reading-progress" id="reading-progress" aria-label="${escape(CONTENT.ui.readingProgress)}"></div>
        <div class="discoveries" id="discoveries"></div>
        <div class="handoff" id="handoff" role="status"></div>
        <p class="signature" id="signature"></p>
        <div class="story-meta"><span class="meta-spark">${icons.heart}</span><span id="hint"></span></div>
      </article>
    </main>
    <footer class="footer">
      <div class="journey-heading"><span class="navigation-hint">${escape(CONTENT.ui.keyboard)}</span></div>
      <nav aria-label="${escape(CONTENT.ui.progress)}"><ol class="progress" id="progress"></ol></nav>
      <div class="footer-note"><span>${escape(CONTENT.ui.footer)}</span><span>${icons.heart}</span><span>${escape(CONTENT.ui.duration)}</span></div>
    </footer>
  </div>
  <div class="flower-wish" id="flower-wish" hidden aria-hidden="true"><canvas></canvas><p></p></div>
  <section class="fallback" id="fallback" hidden aria-label="${escape(CONTENT.ui.closingLabel)}"></section>
  <div class="sr-only" id="announcement" role="status" aria-live="polite"></div>
`;
const $ = (selector) => document.querySelector(selector);
const flowerWish = new FlowerWish($('#flower-wish'));

function updateSound() {
  $('#experience').dataset.sound = !sound.available ? 'unavailable' : sound.on ? 'playing' : 'off';
}

function render({ focus = false } = {}) {
  const scene = journey.scene; const intro = journey.index === 0; const closing = scene.id === 'closing'; const gift = scene.id === 'gift';
  const mobile = mobileMedia.matches;
  const rightMessages = scene.id === 'distance' && !mobile;
  const discoveries = $('#discoveries');
  const discoveryHome = rightMessages ? $('#visual-messages') : $('#story');
  if (discoveries.parentElement !== discoveryHome) {
    if (rightMessages) discoveryHome.append(discoveries);
    else discoveryHome.insertBefore(discoveries, $('#handoff'));
  }
  $('#visual-messages').hidden = !rightMessages;
  $('#experience').dataset.scene = scene.id;
  document.body.dataset.scene = scene.id;
  $('#dedication').textContent = text(CONTENT.ui.dedication); $('#dedication').hidden = !intro;
  const showBirthday = Boolean(CONTENT.birthday) && (intro || closing);
  const birthday = String(CONTENT.birthday).replace(/\s*[/.\-]\s*/g, ' · ');
  $('#birthday-date').textContent = birthday;
  $('#birthday-mark').hidden = !showBirthday;
  $('#birthday-mark').setAttribute('aria-label', showBirthday ? `Ngày sinh nhật ${CONTENT.birthday}` : '');
  if (closing) {
    const finalTitle = text(CONTENT.finalTitle); const finalName = text(CONTENT.recipientName);
    const nameAt = finalTitle.toLocaleLowerCase('vi').lastIndexOf(finalName.toLocaleLowerCase('vi'));
    $('#scene-title').innerHTML = nameAt > 0
      ? `<span class="closing-wish">${escape(finalTitle.slice(0, nameAt).trim())}</span><span class="closing-name">${escape(finalTitle.slice(nameAt).trim())}</span>`
      : `<span class="closing-wish">${escape(finalTitle)}</span>`;
  } else {
    // Keep the wording and artistic line breaks identical on desktop and mobile.
    const title = intro && CONTENT.openingTitle !== CONTENT.scenes[0].title
      ? CONTENT.openingTitle
      : scene.mobileTitle || scene.title;
    $('#scene-title').innerHTML = escape(title).split('\n').map((line, i) => `<span${i === 1 ? ' class="italic"' : ''}>${line}</span>`).join('');
  }
  let copy = closing ? CONTENT.finalMessage.split('\n\n') : gift && journey.gift !== 'closed' && journey.gift !== 'opening' ? scene.revealedParagraphs : scene.paragraphs;
  const revealedIndex = reader.reveals.get(journey.index);
  if (mobile && revealedIndex !== undefined) copy = [scene.interactions[revealedIndex]];
  const postGift = gift && ['revealed', 'handoff'].includes(journey.gift);
  if (mobile && gift && journey.gift === 'handoff') copy = [...scene.revealedParagraphs, scene.handoff];
  const key = `${journey.index}:${postGift ? 'opened' : revealedIndex ?? 'base'}`;
  const page = reader.select(key, readingPages(copy));
  $('#copy').innerHTML = paragraphs(mobile ? [page] : copy);
  $('#copy').hidden = mobile && scene.id === 'distance' && journey.discoveries.size > 0;
  $('#copy').classList.toggle('sr-only', mobile && scene.id === 'garden' && revealedIndex !== undefined);
  const readingFrame = `${key}:${reader.index}`;
  if (mobile && !motion.matches && lastReadingFrame !== readingFrame) $('#copy').animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
  lastReadingFrame = readingFrame;
  $('#reading-progress').hidden = !mobile || reader.pages.length < 2;
  $('#reading-progress').innerHTML = reader.pages.map((_, index) => `<span${index === reader.index ? ' class="active" aria-current="true"' : ''}></span>`).join('');
  $('#discoveries').innerHTML = (scene.interactions || []).map((message, i) => {
    const discovered = journey.discoveries.has(i); const icon = scene.id === 'garden' ? icons.flower : icons.heart;
    return `<div class="discovery${discovered ? ' is-discovered' : ''}"${discovered ? '' : ' hidden'}><span class="discovery-marker" data-discovery="${i}" aria-hidden="true">${icon}</span>${discovered && (!mobile || scene.id === 'distance') ? `<p${i === revealedIndex ? ' class="reveal-message"' : ''}>${escape(message)}</p>` : ''}</div>`;
  }).join('');
  $('#discoveries').classList.toggle('has-reveals', journey.discoveries.size > 0);
  $('#discoveries').hidden = mobile && scene.id === 'meeting';
  $('#discoveries').classList.toggle('sr-only', scene.id === 'garden');
  $('#handoff').textContent = gift && journey.gift === 'handoff' ? text(scene.handoff) : closing && journey.kept ? text(CONTENT.ui.saved) : '';
  $('#handoff').hidden = !$('#handoff').textContent || (mobile && gift);
  $('#signature').textContent = closing ? text(CONTENT.finalSignature) : ''; $('#signature').hidden = !closing || (mobile && reader.more);
  let buttonLabel = intro ? CONTENT.ui.start : CONTENT.ui.next;
  if (gift && journey.gift === 'closed') buttonLabel = CONTENT.ui.openGift;
  if (gift && ['opening', 'revealed'].includes(journey.gift)) buttonLabel = CONTENT.ui.giftOpening;
  if (closing) buttonLabel = journey.kept ? CONTENT.ui.replay : saving ? CONTENT.ui.saving : CONTENT.ui.save;
  if (scene.id === 'meeting' && journey.busy) buttonLabel = CONTENT.ui.meetingProgress;
  if (mobile && !journey.busy && !saving) buttonLabel = reader.more ? CONTENT.ui.tapContinue : intro ? CONTENT.ui.tapStart : gift && journey.gift === 'closed' ? CONTENT.ui.tapGift : !journey.unlocked ? CONTENT.ui.tapExplore : buttonLabel;
  $('#experience').setAttribute('aria-busy', String(journey.busy || saving));
  $('#experience').dataset.action = text(buttonLabel);
  $('#main').setAttribute('aria-label', `${text(buttonLabel)}. ${text(CONTENT.ui.keyboard)}`);
  const needsInteraction = scene.interactions && !journey.unlocked;
  $('#hint').textContent = text(intro ? CONTENT.ui.duration : needsInteraction ? `${CONTENT.ui.explore} · ${journey.discoveries.size}/${scene.interactions.length}` : closing ? CONTENT.ui.scroll : innerWidth < 760 ? CONTENT.ui.swipe : CONTENT.ui.complete);
  if (mobile) $('#hint').textContent = text(!reader.more && needsInteraction ? CONTENT.ui.tapExplore : CONTENT.ui.tapHint);
  if (!mobile) $('#hint').textContent = text(intro ? CONTENT.ui.tapStart : needsInteraction ? CONTENT.ui.tapExplore : CONTENT.ui.tapHint);
  if (closing || gift) $('#hint').textContent = text(buttonLabel);
  if (scene.id === 'meeting' && journey.busy) $('#hint').textContent = text(CONTENT.ui.meetingProgress);
  $('#caption').innerHTML = `${escape(scene.caption)}<br><em>${escape(scene.captionItalic)}</em>`;
  $('#gift-celebration').textContent = gift ? text(scene.celebration) : '';
  $('#gift-celebration').hidden = !gift || ['closed', 'opening'].includes(journey.gift);
  $('#keepsakes').innerHTML = journey.index > 2 && journey.index < 6 ? [...journey.visited[2]].map(() => icons.heart).join('') : '';
  $('#keepsakes').title = text(CONTENT.ui.keepsakes);
  $('#progress').innerHTML = CONTENT.scenes.map((item, index) => `<li class="${index === journey.index ? 'current' : index < journey.index ? 'visited' : ''}" aria-label="${escape(item.label)}"${index === journey.index ? ' aria-current="step"' : ''}><span class="progress-track"></span></li>`).join('');
  updateSound();
  if (focus) { $('#scene-title').focus({ preventScroll: true }); $('#story').scrollTop = 0; $('#main').scrollTop = 0; window.scrollTo({ top: 0, behavior: 'instant' }); }
  syncDistanceAnchors();
  if (scene.id === 'garden' && revealedIndex !== undefined && !journey.busy && !fallback) {
    flowerWish.show(text(scene.interactions[revealedIndex]), () => world?.flowerAnchor(revealedIndex), motion.matches);
  } else flowerWish.hide();
}

function syncDistanceAnchors() {
  if (journey.scene.id !== 'distance') return;
  world?.setDistanceAnchors([...document.querySelectorAll('[data-discovery]')].map((button) => {
    const box = button.getBoundingClientRect();
    return { x: (box.left + box.width / 2) / innerWidth, y: (box.top + box.height / 2) / innerHeight };
  }));
}

function showFallback() {
  if (fallback) return; fallback = true; journey.busy = false;
  flowerWish.hide();
  $('#world').hidden = true; $('#experience').hidden = true; $('#loading').hidden = true;
  const section = $('#fallback'); section.hidden = false;
  section.innerHTML = `<div class="fallback-brand">${icons.heart}${escape(CONTENT.brand)}</div><p class="fallback-notice">${escape(CONTENT.ui.fallback)}</p>${CONTENT.scenes.map((scene, index) => `<article><h2>${escape(index === 0 ? CONTENT.openingTitle : index === 6 ? CONTENT.finalTitle : scene.title)}</h2>${paragraphs(index === 6 ? CONTENT.finalMessage.split('\n\n') : scene.paragraphs)}${paragraphs(scene.interactions || [])}${scene.celebration ? `<h3>${escape(scene.celebration)}</h3>` : ''}${paragraphs(scene.revealedParagraphs || [])}${scene.handoff ? `<p class="handoff">${escape(scene.handoff)}</p>` : ''}</article>`).join('')}<p class="signature">${escape(CONTENT.finalSignature)}</p><a href="#app" id="fallback-replay">${escape(CONTENT.ui.replay)}</a>`;
  $('#fallback-replay').addEventListener('click', () => window.scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' }));
}

async function next() {
  if (journey.busy || saving || fallback) return;
  if (journey.index === 0 && !sound.started) { void sound.start().then(updateSound); }
  if (journey.scene.id === 'gift' && journey.gift === 'closed') {
    journey.gift = 'opening'; journey.busy = true; world?.openGift(); render();
    schedule(() => { journey.gift = 'revealed'; render(); }, motion.matches ? 300 : CONTENT.timing.reveal);
    schedule(() => {
      journey.gift = 'handoff'; journey.busy = false;
      reader.positions.set(`${journey.index}:opened`, readingPages([...journey.scene.revealedParagraphs, journey.scene.handoff]).length - 1);
      render(); $('#announcement').textContent = text(journey.scene.handoff);
    }, (motion.matches ? 300 : CONTENT.timing.reveal) + CONTENT.timing.handoff);
    return;
  }
  if (journey.scene.id === 'closing') {
    if (journey.kept) { restart(); return; }
    saving = true; journey.busy = true; world?.keep(); render();
    schedule(() => { saving = false; journey.busy = false; journey.kept = true; render(); }, 1000 + CONTENT.timing.heartHold + CONTENT.timing.heartDissolve);
    return;
  }
  journey.navigate(1);
}
function restart() {
  generation++; timers.forEach(clearTimeout); timers.clear(); saving = false; reader.reset(); world?.reset(); journey.reset(); render({ focus: true });
}
function advance(hitIndex = null) {
  if (fallback || saving) return;
  if (journey.scene.id === 'distance' && !journey.busy && !journey.unlocked) {
    journey.discover(journey.scene.interactions.findIndex((_, index) => !journey.discoveries.has(index)));
    return;
  }
  if (mobileMedia.matches && reader.more && (!journey.busy || (journey.scene.id === 'gift' && journey.gift === 'revealed'))) {
    reader.move(1); render(); return;
  }
  if (journey.busy) return;
  const messages = journey.scene.interactions || [];
  if (!journey.unlocked && messages.length) {
    const index = hitIndex != null && hitIndex >= 0 && !journey.discoveries.has(hitIndex) ? hitIndex : messages.findIndex((_, i) => !journey.discoveries.has(i));
    journey.discover(index); return;
  }
  void next();
}
function previous() {
  if (journey.busy || saving) return;
  if (mobileMedia.matches && reader.move(-1)) render(); else journey.navigate(-1);
}
journey.addEventListener('navigate', ({ detail }) => {
  journey.busy = true; world?.navigate(detail.from, detail.to); render({ focus: true });
  if (!world) { journey.busy = false; render(); }
});
journey.addEventListener('update', () => render());
journey.addEventListener('discover', ({ detail }) => {
  // The automatic encounter keeps the mobile introduction in its reading order.
  if (journey.scene.id !== 'meeting') reader.reveals.set(journey.index, detail.index);
  world?.discover(detail.index); $('#announcement').textContent = text(journey.scene.interactions[detail.index]);
});
$('.brand').addEventListener('click', (event) => { event.preventDefault(); if (!journey.busy && !saving) restart(); });
function onKey(event) {
  if (fallback || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (['ArrowRight', 'Enter', ' '].includes(event.key) && !event.target.closest('a')) { event.preventDefault(); if (!event.repeat) advance(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
}
document.addEventListener('keydown', onKey);
function onTouchStart(event) {
  if (fallback || event.target.closest('button, a')) return;
  const touch = event.changedTouches[0]; touchStart = { x: touch.clientX, y: touch.clientY, scroll: scrollY + $('#main').scrollTop + $('#story').scrollTop };
}
function onTouchEnd(event) {
  if (!touchStart || fallback) return;
  const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.x, dy = touch.clientY - touchStart.y;
  const scrolled = Math.abs(scrollY + $('#main').scrollTop + $('#story').scrollTop - touchStart.scroll) > 8;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.3) { suppressTapUntil = performance.now() + 400; if (dx < 0) advance(); else previous(); }
  else if (dy < -85 && Math.abs(dy) > Math.abs(dx) * 1.3 && !scrolled) { suppressTapUntil = performance.now() + 400; advance(); }
  else if (Math.abs(dx) > 12 || Math.abs(dy) > 12 || scrolled) suppressTapUntil = performance.now() + 400;
  touchStart = null;
}
document.addEventListener('touchstart', onTouchStart, { passive: true }); document.addEventListener('touchend', onTouchEnd, { passive: true });
function onTap(event) {
  const fromControl = event.composedPath().some((node) => node instanceof Element && node.matches('button,a,header,footer,input,textarea,select'));
  if (fallback || performance.now() < suppressTapUntil || fromControl || getSelection()?.type === 'Range') return;
  advance(world?.hit(event.clientX, event.clientY));
}
document.addEventListener('click', onTap);
function onMobileChange() { render(); }
mobileMedia.addEventListener('change', onMobileChange);
window.addEventListener('resize', syncDistanceAnchors);
document.addEventListener('scroll', syncDistanceAnchors, { passive: true, capture: true });
function onVisibility() { if (document.hidden) sound.suspend(); else sound.resume(); }
document.addEventListener('visibilitychange', onVisibility);
function onMotion() { if (world) { world.reduced = motion.matches; if (motion.matches) world.limitGiftHearts(CONTENT.giftHearts.reducedCount); world.lastFrame = 0; } render(); }
motion.addEventListener('change', onMotion);
window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  world?.dispose(); sound.dispose(); flowerWish.dispose(); generation++; timers.forEach(clearTimeout);
  window.removeEventListener('resize', syncDistanceAnchors); document.removeEventListener('scroll', syncDistanceAnchors, true);
  document.removeEventListener('keydown', onKey); document.removeEventListener('click', onTap); mobileMedia.removeEventListener('change', onMobileChange); document.removeEventListener('touchstart', onTouchStart); document.removeEventListener('touchend', onTouchEnd); document.removeEventListener('visibilitychange', onVisibility); motion.removeEventListener('change', onMotion);
}, { once: true });

journey.busy = true; render();
await loadFonts();
journey.busy = false; render();
try { world = new World($('#world'), journey, motion.matches, showFallback); } catch { showFallback(); }
requestAnimationFrame(() => { $('#loading').classList.add('loaded'); schedule(() => { $('#loading').hidden = true; }, motion.matches ? 0 : 600); });
