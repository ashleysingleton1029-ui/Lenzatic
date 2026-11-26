import { gsap } from 'gsap';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const animate = document.documentElement.classList.contains('js');
const frames: { alt: string; src: string }[] = (window as any).__galleryFrames ?? [];
const pad = (n: number) => String(n).padStart(2, '0');
const wrap = (v: number, max: number) => ((v % max) + max) % max;

// ---------- Header timecode ----------
const tcSlots = $$('[data-timecode] > span');
const startedAt = performance.now();
gsap.ticker.add(() => {
  const f = Math.floor(((performance.now() - startedAt) / 1000) * 24);
  const tc = `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  tcSlots.forEach((el, k) => {
    if (el.textContent !== tc[k]) el.textContent = tc[k];
  });
});

// ---------- Film strip ----------
const film = $('[data-film]')!;
const track = $('[data-film-track]')!;
let loopH = 1; // height of one full pass through the frames
let offset = 0; // how far the strip has travelled, 0..loopH
let velocity = 0; // extra motion from the wheel / a flick
let speed = 0; // current auto speed (eases toward its target)
const BASE_SPEED = window.innerWidth < 768 ? 22 : 30; // px per second
let overFilm = false;
let target: number | null = null; // set while the ruler is steering

const measure = () => {
  loopH = Math.max(1, track.scrollHeight / 2);
};
measure();
window.addEventListener('resize', measure);
$$('img', track).forEach((img) => img.addEventListener('load', measure, { once: true }));

film.addEventListener('pointerenter', (e) => {
  if (e.pointerType === 'mouse') overFilm = true;
});
film.addEventListener('pointerleave', () => (overFilm = false));

// Wheel anywhere on the page moves the strip, like scrolling it.
window.addEventListener(
  'wheel',
  (e) => {
    if (!$('[data-viewer]')!.hidden) return;
    velocity += e.deltaY * 0.9;
  },
  { passive: true },
);

// Touch: drag the strip directly.
let dragY: number | null = null;
film.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return;
  dragY = e.clientY;
});
window.addEventListener('pointermove', (e) => {
  if (dragY === null) return;
  offset = wrap(offset - (e.clientY - dragY), loopH);
  velocity = -(e.clientY - dragY) * 8;
  dragY = e.clientY;
});
window.addEventListener('pointerup', () => (dragY = null));

// ---------- Measuring ruler ----------
const ruler = $('[data-ruler]')!;
const ticks = $$('.ruler-tick', ruler);
const windowBand = $('[data-ruler-window]')!;
const cursor = $('[data-ruler-cursor]')!;
const digitCols = $$('[data-digit-col]', ruler);
const zoom = { z: 0 }; // 0 = moves with the film, 1 = whole strip fits the ruler
const PAD = 48; // top/bottom inset when zoomed out
let rulerH = ruler.clientHeight;
window.addEventListener('resize', () => (rulerH = ruler.clientHeight));
let readout = -1;

const pctFromY = (y: number) => Math.min(1, Math.max(0, (y - PAD) / (rulerH - PAD * 2)));

function showReadout(pct: number) {
  const n = Math.round(pct * 100);
  if (n === readout) return;
  readout = n;
  const s = String(n).padStart(3, '0');
  digitCols.forEach((col, k) => (col.style.transform = `translateY(${-Number(s[k]) * 1.2}em)`));
  ruler.setAttribute('aria-valuenow', String(n));
}

function zoomTo(z: number) {
  gsap.to(zoom, { z, duration: 0.6, ease: 'expo.out', overwrite: true });
  gsap.to([windowBand, cursor], { opacity: z, duration: 0.3, overwrite: true });
}

let rulerActive = false;
function steer(clientY: number, jump = false) {
  const r = ruler.getBoundingClientRect();
  const y = clientY - r.top;
  const pct = pctFromY(y);
  cursor.style.transform = `translateY(${y}px)`;
  showReadout(pct);
  target = pct * loopH;
  if (jump) offset = target;
}

ruler.addEventListener('pointerenter', (e) => {
  rulerActive = true;
  zoomTo(1);
  steer(e.clientY);
});
ruler.addEventListener('pointermove', (e) => {
  if (rulerActive) steer(e.clientY);
});
ruler.addEventListener('pointerdown', (e) => {
  rulerActive = true;
  ruler.setPointerCapture(e.pointerId);
  zoomTo(1);
  steer(e.clientY, true); // click jumps straight there
});
const release = (e: PointerEvent) => {
  if (e.type === 'pointerup' && e.pointerType === 'mouse') return; // mouse: stay active until it leaves
  rulerActive = false;
  target = null;
  zoomTo(0);
};
ruler.addEventListener('pointerleave', release);
ruler.addEventListener('pointerup', release);
ruler.addEventListener('pointercancel', release);

// Keyboard: arrows step 1%, Page Up/Down step 10%.
ruler.addEventListener('keydown', (e) => {
  const step = { ArrowDown: 0.01, ArrowUp: -0.01, PageDown: 0.1, PageUp: -0.1 }[e.key];
  if (step === undefined) return;
  e.preventDefault();
  offset = wrap(offset + step * loopH, loopH);
});

function drawRuler() {
  const z = zoom.z;
  const span = rulerH - PAD * 2;
  const spacing = loopH / 100;
  const pct = offset / loopH;
  for (let i = 0; i < ticks.length; i++) {
    // At rest: ticks travel with the film (one tick per 1% of the strip).
    let idle = i * spacing - offset;
    idle = wrap(idle + spacing * 2, loopH) - spacing * 2;
    // Zoomed out: 0–100 laid out down the full height.
    const overview = PAD + (i / 100) * span;
    const y = idle + (overview - idle) * z;
    ticks[i].style.transform = `translateY(${y}px)`;
  }
  const band = Math.min(span, (film.clientHeight / loopH) * span);
  windowBand.style.transform = `translateY(${PAD + pct * span}px)`;
  windowBand.style.height = `${band}px`;
  if (!rulerActive) showReadout(pct);
}

// ---------- Main loop ----------
gsap.ticker.add((_t, deltaMs) => {
  const dt = Math.min(0.05, deltaMs / 1000);
  if (target !== null) {
    // Glide toward the point under the ruler cursor, the short way round.
    let d = target - offset;
    if (d > loopH / 2) d -= loopH;
    if (d < -loopH / 2) d += loopH;
    offset = wrap(offset + d * Math.min(1, dt * 7), loopH);
    velocity = 0;
  } else if (dragY === null) {
    const want = animate && !overFilm ? BASE_SPEED : 0;
    speed += (want - speed) * Math.min(1, dt * 3);
    offset = wrap(offset + (speed + velocity) * dt, loopH);
    velocity *= Math.pow(0.04, dt); // wheel momentum dies away
  }
  track.style.transform = `translate3d(0, ${-offset}px, 0)`;
  drawRuler();
});

// ---------- Full-screen viewer ----------
const viewer = $('[data-viewer]')!;
const viewerImg = $<HTMLImageElement>('[data-viewer-img]')!;
const viewerCount = $('[data-viewer-count]')!;
let current = 0;
let opener: HTMLElement | null = null;

function show(i: number) {
  current = wrap(i, frames.length);
  viewerImg.src = frames[current].src;
  viewerImg.alt = frames[current].alt;
  viewerCount.textContent = `${pad(current + 1)} / ${pad(frames.length)}`;
}
function openViewer(i: number, from: HTMLElement) {
  opener = from;
  show(i);
  viewer.hidden = false;
  if (animate) gsap.fromTo(viewer, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  $('[data-viewer-close]', viewer)?.focus();
}
function closeViewer() {
  viewer.hidden = true;
  opener?.focus();
}

$$('.film-frame', track).forEach((btn) =>
  btn.addEventListener('click', () => openViewer(Number(btn.dataset.frame), btn)),
);
$('[data-viewer-close]', viewer)?.addEventListener('click', closeViewer);
$('[data-viewer-step="prev"]', viewer)?.addEventListener('click', () => show(current - 1));
$('[data-viewer-step="next"]', viewer)?.addEventListener('click', () => show(current + 1));
viewer.addEventListener('click', (e) => {
  if (e.target === viewer) closeViewer();
});
window.addEventListener('keydown', (e) => {
  if (viewer.hidden) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});
let swipeX: number | null = null;
viewer.addEventListener('pointerdown', (e) => (swipeX = e.clientX));
viewer.addEventListener('pointerup', (e) => {
  if (swipeX === null) return;
  const dx = e.clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
});

// ---------- Intro ----------
if (!animate) {
  gsap.set('[data-intro-up]', { opacity: 1 });
} else {
  gsap.from('[data-hero] img', { scale: 1.08, opacity: 0, duration: 2.2, ease: 'power3.out' });
  gsap.fromTo('[data-intro-up]', { yPercent: 120, opacity: 1 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.2 });
  gsap.from(film, { yPercent: 8, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.3 });
  gsap.from(ruler, { opacity: 0, duration: 1.2, delay: 0.6 });
}
