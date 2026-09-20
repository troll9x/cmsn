import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { CONTENT, text } from '../src/content.js';

const server = await createServer({ server: { host: '127.0.0.1', port: 5178, strictPort: true } });
await server.listen();
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'msedge', headless: true });
const errors = [];
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; console.log(`✓ ${message}`); }
async function settle(page, scene, enabled = true) {
  await page.waitForFunction((value) => document.querySelector('#experience').dataset.scene === value, scene);
  await page.waitForFunction(() => document.querySelector('#experience').getAttribute('aria-busy') === 'false');
}
async function noOverflow(page, label) { check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: không tràn ngang`); }
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.on('pageerror', (error) => errors.push(error.message));
  const requests = [];
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('http://127.0.0.1:5178');
  await page.locator('#loading').waitFor({ state: 'hidden' });
  check(await page.locator('#world').isVisible(), 'WebGL khởi tạo');
  check((await page.locator('#scene-title').innerText()).replace(/\s+/g, ' ').trim() === text(CONTENT.scenes[0].mobileTitle).replace(/\s+/g, ' ').trim(), 'Desktop dùng cùng tiêu đề với mobile');
  check(await page.evaluate(() => {
    const faces = [...document.fonts].filter(face => face.family.replaceAll('"', '') === 'Lora' || face.family.replaceAll('"', '') === 'Be Vietnam Pro');
    return faces.length === 4 && faces.every(face => face.status === 'loaded');
  }), 'Đủ font tiếng Việt thường, nghiêng và nội dung trước khi dựng hiệu ứng chữ');
  check(await page.locator('button, [role="button"]').count() === 0, 'Giao diện desktop không còn button');
  await noOverflow(page, 'Desktop');
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.mouse.click(700, 160); await settle(page, 'meeting', false);
  check((await page.locator('.is-discovered').count()) === 1, 'Cuộc gặp tự bắt đầu khi vào cảnh, không cần click');
  check((await page.locator('#scene-title').textContent()).includes(CONTENT.scenes[1].label), 'Cảnh gặp gỡ mang tên Định mệnh');
  await page.locator('#main').focus();
  await page.keyboard.press('ArrowRight'); await settle(page, 'distance', false);
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(700, 160);
    check(await page.locator('.is-discovered p').last().textContent() === CONTENT.scenes[2].interactions[i], `Chạm màn hình ${i + 1}: hiện đúng câu theo thứ tự`);
    check(await page.locator('.is-discovered p').count() === i + 1, 'Giữ lại các câu đã mở');
    if (i < 2) check(await page.locator('#experience').getAttribute('data-scene') === 'distance', `Trái tim ${i + 1}: giữ cảnh để mở đủ ba câu`);
  }
  await page.screenshot({ path: 'test-results/distance-desktop.png', fullPage: true });
  await page.keyboard.press('ArrowRight'); await settle(page, 'garden', false);
  check((await page.locator('#keepsakes svg').count()) === 3, 'Ba pha lê tiếp tục đi cùng qua các cảnh');
  for (let i = 0; i < 3; i++) await page.mouse.click(700, 160);
  check((await page.locator('.is-discovered').count()) === 3, 'Ba bông hoa nở, lời chúc hiển thị đầy đủ');
  check(await page.locator('#flower-wish').isVisible() && (await page.locator('#flower-wish p').textContent()).replace(/\s+/g, ' ') === text(CONTENT.scenes[3].interactions[2]), 'Giảm chuyển động: lời chúc trên hoa hiển thị ngay');
  await page.screenshot({ path: 'test-results/garden-desktop.png', fullPage: true });
  await page.mouse.click(700, 160); await settle(page, 'time');
  await page.keyboard.press('ArrowLeft'); await settle(page, 'garden');
  check((await page.locator('.is-discovered').count()) === 3, 'Quay lại giữ trạng thái các hoa');
  await page.mouse.click(700, 160); await settle(page, 'time');
  await page.mouse.click(700, 160); await settle(page, 'gift');
  await page.mouse.click(700, 160);
  check(await page.locator('#experience').getAttribute('aria-busy') === 'true', 'Khóa thao tác trong lúc mở quà');
  check(await page.locator('#gift-celebration').isHidden(), 'Chưa hiện chữ trước khi trái tim tụ lại');
  await page.waitForFunction(() => document.querySelector('#copy').textContent.includes('lý do để mỉm cười'));
  check(await page.locator('#handoff').isHidden(), 'Có khoảng dừng trước khi hiện lời hẹn');
  check(await page.locator('#gift-celebration').textContent() === 'CHÚC MỪNG SINH NHẬT' && await page.locator('#gift-celebration').isVisible(), 'Trái tim đã tụ: hiện đúng chữ CHÚC MỪNG SINH NHẬT');
  await page.waitForFunction(() => !document.querySelector('#handoff').hidden, null, { timeout: 12000 });
  check((await page.locator('#handoff').textContent()).includes('tối nay'), 'Hiển thị lời hẹn cho buổi tối');
  check(!(await page.locator('#experience').textContent()).toLocaleLowerCase('vi').includes('món quà'), 'Nội dung hiển thị không nhắc đến món quà');
  await page.screenshot({ path: 'test-results/gift-desktop.png', fullPage: true });
  await page.mouse.click(700, 160); await settle(page, 'closing');
  check((await page.locator('#copy p').count()) === 4, 'Lời chúc cuối đủ bốn đoạn');
  check(await page.locator('#birthday-date').textContent() === CONTENT.birthday.replace('/', ' · '), 'Ngày sinh nhật nổi bật ở cảnh kết');
  check(await page.locator('.closing-name').evaluate((name) => parseFloat(getComputedStyle(name).fontSize) > parseFloat(getComputedStyle(document.querySelector('.closing-wish')).fontSize)), 'Tên người nhận là điểm nhấn lớn nhất của lời chúc cuối');
  await page.mouse.click(700, 160);
  await page.keyboard.press('ArrowLeft');
  check(await page.locator('#experience').getAttribute('data-scene') === 'closing', 'Không rời cảnh khi đoạn kết trái tim đang chạy');
  await page.waitForFunction(() => document.querySelector('#experience').dataset.action.includes('Xem lại'), null, { timeout: 10000 });
  check(await page.locator('#handoff').isVisible(), 'Trái tim tan, hiện nút xem lại');
  await page.mouse.click(700, 160); await settle(page, 'invitation');
  await page.mouse.click(700, 160); await settle(page, 'meeting', false);
  check((await page.locator('.is-discovered').count()) === 1, 'Xem lại tự bắt đầu cuộc gặp mới');
  check(!requests.some((url) => url.includes('background.mp3')), 'Không có yêu cầu nhạc nền khi chưa cấu hình');

  const mobile = await browser.newContext({ ...{ viewport: { width: 428, height: 926 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, reducedMotion: 'reduce' });
  const phone = await mobile.newPage(); phone.on('pageerror', (error) => errors.push(error.message));
  phone.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await phone.goto('http://127.0.0.1:5178'); await phone.locator('#loading').waitFor({ state: 'hidden' });
  await noOverflow(phone, 'iPhone 12 Pro Max'); await phone.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  check(await phone.locator('button, [role="button"]').count() === 0, 'Giao diện điện thoại không còn button');
  check(await phone.locator('#copy p').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16), 'Nội dung mobile ít nhất 16px');
  check(await phone.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'Mobile gọn trong một màn hình');
  check(await phone.locator('#copy p').count() === 1, 'Mobile chỉ hiển thị một đoạn ngắn mỗi lượt');
  const tap = async () => { await phone.waitForFunction(() => document.querySelector('#experience').getAttribute('aria-busy') === 'false'); await phone.touchscreen.tap(90, 160); await phone.waitForTimeout(180); };
  const tapTo = async (scene) => {
    for (let attempt = 0; attempt < 20 && await phone.locator('#experience').getAttribute('data-scene') !== scene; attempt++) await tap();
    await settle(phone, scene);
  };
  await tapTo('meeting'); check(true, 'Chạm vùng trống để bắt đầu, không cần nút next');
  check(await phone.locator('.is-discovered').count() === 1, 'Mobile tự gặp nhau trước khi chạm thêm');
  const firstMeetingCopy = await phone.locator('#copy').textContent();
  await tap(); check(await phone.locator('#experience').getAttribute('data-scene') === 'meeting' && await phone.locator('#copy').textContent() !== firstMeetingCopy, 'Một chạm đọc đoạn tiếp theo, không bỏ qua lời dẫn');
  await tap(); check(await phone.locator('#experience').getAttribute('data-scene') === 'distance', 'Đọc xong lời dẫn thì chạm để đi tiếp, không cần mở cuộc gặp');
  await tapTo('distance');
  const cdp = await mobile.newCDPSession(phone);
  const firstDistanceCopy = await phone.locator('#copy').textContent();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 350, y: 170 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: 170 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await phone.waitForTimeout(450);
  check(await phone.locator('#copy').textContent() !== firstDistanceCopy && await phone.locator('.is-discovered').count() === 1, 'Vuốt trái mở đúng trái tim đầu tiên, không kích hoạt hai lần');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 210, y: 280 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 210, y: 170 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await phone.waitForTimeout(450);
  check(await phone.locator('.is-discovered').count() === 2, 'Vuốt lên mở trái tim thứ hai');
  await phone.touchscreen.tap(90, 160); await phone.waitForTimeout(180);
  check((await phone.locator('.is-discovered p').allTextContents()).join('|') === CONTENT.scenes[2].interactions.join('|'), 'Ba lần chạm/vuốt hiện đủ ba câu trên điện thoại');
  await noOverflow(phone, 'Ba câu cạnh trái tim trên điện thoại');
  await phone.screenshot({ path: 'test-results/distance-mobile.png', fullPage: true });
  await tapTo('garden');
  check(await phone.locator('#keepsakes svg').count() === 3, 'Một chạm thu đủ ba pha lê trước cảnh khu vườn');
  for (let attempt = 0; attempt < 10 && await phone.locator('.is-discovered').count() < 3; attempt++) await tap();
  check(await phone.locator('.is-discovered').count() === 3, 'Một chạm lần lượt mở đủ ba bông hoa');
  check(await phone.locator('#copy p').count() === 1, 'Không dồn ba lời chúc hoa trên mobile');
  await noOverflow(phone, 'Lời chúc dài trên mobile'); await phone.screenshot({ path: 'test-results/garden-mobile.png', fullPage: true });
  await phone.setViewportSize({ width: 360, height: 667 });
  check(await phone.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'Lời chúc trên điện thoại nhỏ vẫn vừa một màn hình');
  await phone.screenshot({ path: 'test-results/mobile-small.png', fullPage: true });
  await phone.setViewportSize({ width: 428, height: 926 });
  await tapTo('time'); await tapTo('gift');
  await tap(); await phone.locator('#gift-celebration').waitFor({ state: 'visible' });
  check(await phone.locator('#gift-celebration').textContent() === CONTENT.scenes[5].celebration, 'Một chạm vùng trống mở bất ngờ và hiện lời chúc');
  await phone.waitForFunction(() => document.querySelector('#experience').getAttribute('aria-busy') === 'false');
  check((await phone.locator('#copy').textContent()).includes('lý do để mỉm cười'), 'Mobile giữ lại lời chúc đầu tiên sau hiệu ứng');
  await tap();
  check((await phone.locator('#copy').textContent()).includes('tối nay'), 'Mobile đọc lời mời đi date theo đúng thứ tự');
  await tap();
  check((await phone.locator('#copy').textContent()).includes('hẹn em nhé'), 'Mobile hiện câu hẹn cuối trước khi chuyển cảnh');
  await phone.screenshot({ path: 'test-results/gift-hearts-mobile.png', fullPage: true });
  await tapTo('closing');
  check(await phone.locator('#birthday-date').evaluate((date) => parseFloat(getComputedStyle(date).fontSize) >= 20), 'Ngày sinh nhật trên mobile đủ lớn để đọc rõ');
  const finalPages = [];
  for (let attempt = 0; attempt < 15; attempt++) {
    finalPages.push(await phone.locator('#copy').textContent());
    if (await phone.locator('#experience').getAttribute('data-action') === CONTENT.ui.save) break;
    await tap();
  }
  check(finalPages.join(' ').replace(/\s+/g, ' ').trim() === text(CONTENT.finalMessage).replace(/\s+/g, ' ').trim(), 'Phân trang giữ nguyên toàn bộ lời nhắn cuối');
  await phone.screenshot({ path: 'test-results/closing-mobile.png', fullPage: true });
  await tap(); await phone.waitForFunction(() => document.querySelector('#experience').dataset.action === 'Xem lại hành trình');
  await tapTo('invitation'); check(true, 'Đi hết hành trình và xem lại chỉ bằng chạm vùng trống');
  await phone.setViewportSize({ width: 926, height: 428 }); await noOverflow(phone, 'Xoay ngang');
  await phone.setViewportSize({ width: 360, height: 667 }); await noOverflow(phone, 'Điện thoại nhỏ');

  // Observe real screen positions with motion enabled, after the reduced-motion flow.
  await phone.setViewportSize({ width: 428, height: 926 });
  await phone.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/scene/world.js')).name;
    const { World } = await import(url), animate = World.prototype.animateObjects;
    window.heartFall = []; window.roseFall = [];
    World.prototype.animateObjects = function (delta) {
      animate.call(this, delta); window.mobileEffectWorld = this;
      const screenY = (object) => { const point = object.getWorldPosition(object.position.clone()).project(this.camera); return (1 - point.y) * innerHeight / 2; };
      if (this.active === 2 && this.journey.visited[2].has(0)) window.heartFall.push(screenY(this.floaters[0]));
      if (this.active === 3 && this.interactives[3][0].userData.bloom) {
        const rose = this.interactives[3][0]; window.roseFall.push({ y: screenY(rose), opacity: rose.userData.flightMaterials[0].opacity });
      }
    };
  });
  await tapTo('distance');
  await phone.emulateMedia({ reducedMotion: 'no-preference' });
  await phone.waitForFunction(() => window.mobileEffectWorld && !window.mobileEffectWorld.reduced);
  await tap(); await phone.waitForTimeout(1000);
  check(await phone.evaluate(() => heartFall.length > 5 && heartFall.at(-1) > heartFall[0] + 100 && heartFall.every((y, i) => !i || y >= heartFall[i - 1] - 0.5)), 'Mobile: the tapped heart flies downward without an upward arc');
  await phone.screenshot({ path: 'test-results/mobile-heart-down.png' });
  await phone.emulateMedia({ reducedMotion: 'reduce' }); await tapTo('garden');
  await phone.emulateMedia({ reducedMotion: 'no-preference' });
  for (let attempt = 0; attempt < 8 && await phone.locator('.is-discovered').count() === 0; attempt++) await tap();
  await phone.waitForTimeout(1450);
  check(await phone.evaluate(() => roseFall.length > 5 && roseFall.at(-1).y > roseFall[0].y + 50 && roseFall.at(-1).opacity === 0), 'Mobile: the opened rose falls downward and fades out');
  check(await phone.locator('.is-discovered').count() === 1 && await phone.locator('#copy').textContent() !== '', 'The flower wish stays readable after the falling animation');
  await phone.waitForFunction(() => document.querySelector('#flower-wish').dataset.phase === 'settled');
  check(await phone.locator('#flower-wish p').evaluate(el => getComputedStyle(el).opacity === '1'), 'Mobile particle wish resolves into readable text');
  await tap(); await phone.waitForTimeout(200);
  check(await phone.locator('#flower-wish').evaluate(el => el.dataset.phase === 'blurring' && parseFloat(getComputedStyle(el).filter.replace('blur(', '')) > 0 && Number(getComputedStyle(el).opacity) < 1), 'Next mobile flower progressively blurs the previous wish');
  await phone.waitForFunction(() => document.querySelector('#flower-wish').dataset.phase === 'settled');
  await phone.screenshot({ path: 'test-results/mobile-rose-down.png' });

  const fallbackContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await fallbackContext.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return String(type).includes('webgl') ? null : original.call(this, type, ...args); };
  });
  const flat = await fallbackContext.newPage(); flat.on('pageerror', (error) => errors.push(error.message));
  await flat.goto('http://127.0.0.1:5178'); await flat.locator('#fallback').waitFor({ state: 'visible' });
  check((await flat.locator('#fallback article').count()) === 7, 'Fallback HTML có đủ 7 cảnh');
  check((await flat.locator('#fallback').textContent()).includes('luôn được trân trọng'), 'Fallback giữ đầy đủ lời chúc cuối');
  check((await flat.locator('#fallback').textContent()).includes('CHÚC MỪNG SINH NHẬT'), 'Fallback giữ lời chúc sinh nhật mới');
  await noOverflow(flat, 'Fallback');
  await flat.locator('#fallback-replay').click(); await flat.waitForFunction(() => scrollY < 5); check(true, 'Xem lại bản HTML');

  const missingContext = await browser.newContext({ reducedMotion: 'reduce' });
  const missing = await missingContext.newPage(); missing.on('pageerror', (error) => errors.push(error.message));
  await missing.route('**/src/content.js', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('audio: { enabled: false', 'audio: { enabled: true') });
  });
  let audioRequests = 0; missing.on('request', (request) => { if (request.url().includes('background.mp3')) audioRequests++; });
  await missing.goto('http://127.0.0.1:5178'); await missing.locator('#loading').waitFor({ state: 'hidden' });
  check(audioRequests === 0, 'Không tải nhạc trước thao tác bắt đầu');
  await missing.mouse.click(700, 160); await settle(missing, 'meeting', false);
  await missing.waitForFunction(() => document.querySelector('#experience').dataset.sound === 'unavailable');
  check(audioRequests === 1 && await missing.locator('button').count() === 0, 'Bật nhạc nhưng thiếu MP3: thử một lần và chuyển sang im lặng');

  const normalContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const normal = await normalContext.newPage(); normal.on('pageerror', (error) => errors.push(error.message));
  normal.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await normal.goto('http://127.0.0.1:5178'); await normal.locator('#loading').waitFor({ state: 'hidden' });
  await normal.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/scene/world.js')).name;
    const { World } = await import(url); const placeCamera = World.prototype.placeCamera;
    const hit = World.prototype.hit;
    World.prototype.hit = function (x, y) { window.lastWorldHit = hit.call(this, x, y); return window.lastWorldHit; };
    window.cameraTrace = [];
    World.prototype.placeCamera = function (progress) {
      placeCamera.call(this, progress);
      window.testWorld = this; window.firstRoad ??= this.road;
      window.cameraTrace.push({ scene: this.active, z: this.camera.position.z, moving: Boolean(this.transition), opacity: Number(this.renderer.domElement.style.opacity || 1), continuousRoad: this.road === window.firstRoad && this.road.visible && this.road.parent === this.scene });
    };
  });
  await normal.mouse.click(700, 160);
  await normal.waitForFunction(() => window.testWorld?.active === 1 && !window.testWorld.transition && window.testWorld.journey.busy);
  check(true, 'Chuyển camera với chuyển động thường hoàn tất');
  await normal.screenshot({ path: 'test-results/crossroads-desktop.png' });
  check(await normal.evaluate(() => {
    const { boy, girl, heart } = window.testWorld.crossroads.userData;
    return !heart.visible && boy.position.distanceTo(girl.position) > 2;
  }), 'The boy and girl start on separate branches, without a heart');
  check((await normal.locator('.is-discovered').count()) === 1, 'The encounter starts automatically on arrival');
  const initialSeparation = await normal.evaluate(() => {
    const { boy, girl } = window.testWorld.crossroads.userData;
    return boy.position.distanceTo(girl.position);
  });
  const girlPoint = await normal.evaluate(() => {
    const world = window.testWorld, girl = world.crossroads.userData.girl;
    const point = girl.getWorldPosition(girl.position.clone());
    point.y += girl.scale.y * world.groups[1].scale.y * 0.5;
    point.project(world.camera);
    return { x: (point.x + 1) * innerWidth / 2, y: (1 - point.y) * innerHeight / 2 };
  });
  await normal.mouse.click(girlPoint.x, girlPoint.y);
  await normal.waitForTimeout(100);
  check((await normal.locator('.is-discovered').count()) === 1 && await normal.locator('#experience').getAttribute('data-scene') === 'meeting', 'Chạm trong lúc hai người đang gặp nhau không bỏ qua cảnh');
  check(await normal.evaluate(() => window.lastWorldHit === 0 && window.testWorld.crossroads.userData.boy.isSprite && window.testWorld.crossroads.userData.girl.isSprite), 'Raycaster still recognizes the 2D characters during the automatic encounter');
  check(await normal.evaluate(() => window.testWorld.journey.busy && !window.testWorld.crossroads.userData.heart.visible), 'Wait for the encounter before showing the heart or advancing');
  await normal.waitForTimeout(300);
  check(await normal.evaluate((distance) => {
    const { boy, girl } = window.testWorld.crossroads.userData;
    return boy.position.distanceTo(girl.position) < distance - 0.05;
  }, initialSeparation), 'The two characters walk toward each other automatically');
  check(await normal.evaluate(() => {
    const world = window.testWorld, road = world.road.userData;
    return road.curve.getPoint(0).z > world.groups[0].position.z
      && road.curve.getPoint(1).z < world.groups[6].position.z
      && world.groups.every((group, index) => {
        const anchor = group.localToWorld(group.position.clone().set(0, index === 1 ? -1.85 : -2.05, index === 1 ? 0.8 : 0));
        return road.pointAtZ(anchor.z).distanceTo(anchor) < 0.001;
      });
  }), 'One continuous road passes through every stage and the crossroads junction');
  await settle(normal, 'meeting', false);
  check(await normal.evaluate(() => {
    const { boy, girl, heart } = window.testWorld.crossroads.userData;
    return heart.visible && heart.scale.x > 0.42 && boy.position.distanceTo(girl.position) < 1.1;
  }), 'The heart appears above the couple after they meet at the junction');
  await normal.screenshot({ path: 'test-results/crossroads-revealed.png' });
  await normal.mouse.click(700, 160); await settle(normal, 'distance', false);
  check(await normal.evaluate(() => {
    const trace = window.cameraTrace.filter(sample => sample.scene === 1 || sample.scene === 2);
    return trace.some(sample => sample.scene === 1) && trace.some(sample => sample.scene === 2)
      && trace.every((sample, index) => !index || sample.z <= trace[index - 1].z + 0.00001)
      && trace.at(-1).z < trace.find(sample => sample.scene === 2).z;
  }), 'Camera đi tới liên tục qua cảnh 1 → 2 → 3, không lùi lại');
  await normal.mouse.click(700, 160); await normal.waitForTimeout(400);
  await normal.screenshot({ path: 'test-results/distance-heart-flight.png', fullPage: true });
  await normal.keyboard.press('ArrowRight'); await normal.keyboard.press('ArrowRight');
  check(await normal.locator('.is-discovered p').count() === 3, 'Bàn phím mở các trái tim theo cùng thứ tự chạm màn hình');
  // The flight lasts 950 ms; leave frame-scheduling margin before measuring the final dock.
  await normal.waitForTimeout(1400);
  check(await normal.evaluate(() => {
    const markers = [...document.querySelectorAll('#discoveries [data-discovery]')];
    return markers.every((marker, i) => {
      const bounds = marker.getBoundingClientRect();
      const point = window.testWorld.floaters[i].getWorldPosition(window.testWorld.floaters[i].position.clone()).project(window.testWorld.camera);
      const x = (point.x + 1) * innerWidth / 2, y = (1 - point.y) * innerHeight / 2;
      return x > innerWidth / 2 && Math.abs(x - bounds.left - bounds.width / 2) < 2 && Math.abs(y - bounds.top - bounds.height / 2) < 2;
    });
  }), 'Desktop hearts dock beside their text on the right');
  await normal.screenshot({ path: 'test-results/distance-hearts-right.png', fullPage: true, animations: 'disabled' });
  await normal.mouse.click(700, 160); await settle(normal, 'garden', false);
  for (let i = 0; i < 3; i++) {
    const previousWish = await normal.locator('#flower-wish p').textContent();
    await normal.mouse.click(700, 160); await normal.waitForTimeout(200);
    if (i === 0) {
      check(await normal.locator('#flower-wish').evaluate(el => {
        const canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d');
        return el.dataset.phase === 'gathering' && ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((value, index) => index % 4 === 3 && value > 0) && Number(getComputedStyle(el.querySelector('p')).opacity) === 0;
      }), 'The wish begins as real particles before the solid text appears');
      await normal.waitForTimeout(700);
      await normal.screenshot({ path: 'test-results/flower-wish-particles.png', animations: 'disabled' });
    } else {
      check(await normal.locator('#flower-wish').evaluate(el => el.dataset.phase === 'blurring' && getComputedStyle(el).filter !== 'none' && Number(getComputedStyle(el).opacity) < 1) && await normal.locator('#flower-wish p').textContent() === previousWish, 'The old wish blurs before being replaced');
    }
    await normal.waitForFunction(() => document.querySelector('#flower-wish').dataset.phase === 'settled');
    check((await normal.locator('#flower-wish p').textContent()).replace(/\s+/g, ' ') === text(CONTENT.scenes[3].interactions[i]), 'Particles resolve into the correct full wish');
    check(await normal.evaluate(index => {
      const box = document.querySelector('#flower-wish').getBoundingClientRect();
      const anchor = window.testWorld.flowerAnchor(index);
      return box.bottom < anchor.y && box.left >= innerWidth * 0.53 - 1 && box.right <= innerWidth + 1;
    }, i), 'The wish sits above its bloom in the right visual area');
  }
  await normal.screenshot({ path: 'test-results/flower-wish-desktop.png', animations: 'disabled' });
  await normal.mouse.click(700, 160); await settle(normal, 'time');
  await normal.mouse.click(700, 160); await settle(normal, 'gift');
  await normal.mouse.click(700, 160);
  await normal.waitForTimeout(3500);
  check(await normal.locator('#gift-celebration').isHidden(), 'Chuyển động thường: đang bay ra, chưa hiện chữ');
  await normal.screenshot({ path: 'test-results/gift-hearts-burst.png', fullPage: true });
  await normal.locator('#gift-celebration').waitFor({ state: 'visible', timeout: 15000 });
  await normal.waitForTimeout(1000);
  await normal.screenshot({ path: 'test-results/gift-hearts-assembled.png', fullPage: true });
  await normal.waitForFunction(() => document.querySelector('#experience').getAttribute('aria-busy') === 'false', null, { timeout: 12000 });
  await normal.mouse.click(700, 160); await settle(normal, 'closing');
  check(await normal.evaluate(() => {
    const trace = window.cameraTrace.filter(sample => sample.moving);
    return [1, 2, 3, 4, 5, 6].every(scene => trace.some(sample => sample.scene === scene))
      && trace.every((sample, index) => !index || sample.z <= trace[index - 1].z + 0.00001);
  }), 'Camera luôn tiến sâu từ cảnh đầu tới cảnh cuối qua đủ bảy cảnh');
  check(await normal.evaluate(() => window.cameraTrace.filter(sample => sample.moving).every(sample => sample.opacity >= 0.99)), 'Chuyển cảnh giữ hình ảnh liên tục, không làm mờ toàn màn hình');
  check(await normal.evaluate(() => window.cameraTrace.filter(sample => sample.moving).every(sample => sample.continuousRoad)), 'The same road stays visible through all six forward transitions');
  await normal.screenshot({ path: 'test-results/journey-end-desktop.png', fullPage: true, animations: 'disabled' });
  await normal.keyboard.press('ArrowLeft'); await settle(normal, 'gift');
  await normal.setViewportSize({ width: 428, height: 926 });
  await noOverflow(normal, 'Cảnh trái tim sinh nhật trên mobile');
  await normal.screenshot({ path: 'test-results/gift-hearts-mobile.png', fullPage: true });
  await normal.locator('.brand').click(); await settle(normal, 'invitation');
  await normal.mouse.click(90, 160);
  await normal.waitForFunction(() => window.testWorld?.active === 1 && !window.testWorld.transition && window.testWorld.journey.busy);
  check(await normal.evaluate(() => {
    const { boy, girl, heart } = window.testWorld.crossroads.userData;
    return window.testWorld.mobile && !heart.visible && boy.position.distanceTo(girl.position) > 2;
  }), 'Replaying on mobile restarts the automatic encounter from separate paths');
  await settle(normal, 'meeting');
  check(await normal.evaluate(() => {
    const { boy, girl, heart } = window.testWorld.crossroads.userData;
    return heart.visible && boy.position.distanceTo(girl.position) < 1.1;
  }), 'Mobile characters meet and reveal the heart without a second tap');
  check(await normal.locator('#copy').textContent() === text(CONTENT.scenes[1].paragraphs[0]).replace(/\s+/g, ' ').trim(), 'Automatic meeting preserves the first mobile reading paragraph');
  await normal.screenshot({ path: 'test-results/destiny-mobile.png', animations: 'disabled' });
  check(errors.length === 0, `Không có lỗi runtime hoặc asset: ${errors.join('; ')}`);
  console.log(`\n${checks} kiểm tra thành công. Ảnh kiểm tra: test-results/`);
} finally { await browser.close(); await server.close(); }
