import { gsap } from 'gsap';
// @ts-expect-error: plain JS helper, no type declarations
import { horizontalLoop } from './horizontalLoop.js';

type HlsModule = typeof import('hls.js');

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const animate = document.documentElement.classList.contains('js');
const clips = $$('[data-clip]');
const videos = clips.map((c) => $<HTMLVideoElement>('video', c)!);
const posters = clips.map((c) => $<HTMLImageElement>('[data-poster]', c)!);
const titles = videos.map((v) => (v.getAttribute('aria-label') || '').replace(/ reel$/, ''));
const count = clips.length;
const pad = (n: number) => String(n).padStart(2, '0');

// ---------- Video loading (Cloudflare Stream HLS) ----------
let hlsLib: Promise<HlsModule['default'] | null> | null = null;
const getHls = () =>
  (hlsLib ??= import('hls.js').then((m) => (m.default.isSupported() ? m.default : null)).catch(() => null));

const loaded = new Set<number>();
async function load(i: number) {
  if (loaded.has(i)) return;
  loaded.add(i);
  const video = videos[i];
  const src = video.dataset.src!;
  video.addEventListener('playing', () => (posters[i].style.opacity = '0'), { once: true });
  const Hls = await getHls();
  if (Hls) {
    const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 12 });
    hls.loadSource(src);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src; // Safari plays HLS natively
  }
}

async function play(i: number) {
  await load(i);
  videos[i].play().catch(() => {
    /* autoplay blocked (e.g. low-power mode): the poster stays up */
  });
}

// ---------- Rolling text ----------
// Rolls `el` to `text`. Does nothing when the text is unchanged, so a repeated
// title (e.g. two "Motorsports" clips) stays still and only the counter moves.
function roll(el: Element | null, text: string, dir: number, delay = 0) {
  if (!el) return;
  // If a previous roll is still running, drop anything already on its way out.
  Array.from(el.children).slice(0, -1).forEach((c) => {
    gsap.killTweensOf(c);
    c.remove();
  });
  const old = el.lastElementChild as HTMLElement | null;
  if (old?.textContent === text) return;
  const next = document.createElement('span');
  next.className = 'block';
  next.textContent = text;
  if (!animate || !old) {
    el.replaceChildren(next);
    return;
  }
  gsap.killTweensOf(old);
  next.style.position = 'absolute';
  next.style.inset = '0';
  el.appendChild(next);
  const opts = { duration: 1, ease: 'expo.inOut', delay };
  gsap.to(old, { yPercent: -100 * dir, ...opts, onComplete: () => old.remove() });
  gsap.fromTo(next, { yPercent: 100 * dir }, {
    yPercent: 0,
    ...opts,
    onComplete: () => {
      next.style.position = '';
      next.style.inset = '';
    },
  });
}

// Counter: each digit rolls on its own, so 03 → 04 only moves the "4".
const counterDigits = $$('[data-digit]');
const rollCounter = (n: number, dir: number) =>
  [...pad(n)].forEach((d, k) => roll(counterDigits[k], d, dir));

// ---------- Clip switching ----------
const titleEl = $('[data-roll="title"]');
const ticks = $$('[data-dial-item]');
let current = 0;
let renderOrder = 1;
let clipStartedAt = performance.now();
let advancing = false;

function markTicks(i: number) {
  ticks.forEach((item) => item.toggleAttribute('aria-current', Number(item.dataset.dialItem) === i));
}

// The tick (and number) passing through the middle of the dial grows tall and
// bright; neighbours shrink and dim as they move away from the center.
const tickParts = ticks.map((item) => ({
  item,
  tick: $('[data-tick]', item)!,
  num: $('[data-num]', item)!,
}));
const dialBox = $('[data-dial]');
function shapeTicks() {
  if (!dialBox) return;
  const box = dialBox.getBoundingClientRect();
  const mid = box.left + box.width / 2;
  for (const { item, tick, num } of tickParts) {
    const r = item.getBoundingClientRect();
    const near = Math.max(0, 1 - Math.abs(r.left + r.width / 2 - mid) / (r.width * 0.6));
    const ease = near * near * (3 - 2 * near); // smoothstep
    tick.style.transform = `scaleY(${0.3 + 0.7 * ease})`;
    num.style.opacity = String(0.4 + 0.6 * ease);
  }
}
gsap.ticker.add(shapeTicks);

function select(next: number) {
  if (next === current) return;
  const prev = current;
  const forward = (next - prev + count) % count;
  const dir = forward <= count / 2 ? 1 : -1;
  current = next;
  clipStartedAt = performance.now();
  advancing = false;
  if (videos[next].readyState > 0) videos[next].currentTime = 0;

  markTicks(next);
  rollCounter(next + 1, dir);
  roll(titleEl, titles[next], dir, 0.1);
  play(next);

  const incoming = clips[next];
  const outgoing = clips[prev];
  incoming.style.zIndex = String(++renderOrder);
  const wipe = { duration: animate ? 1.5 : 0, ease: 'expo.inOut' };

  // Forward: the new clip enters from the right, the same way the dial travels.
  gsap.fromTo(
    incoming,
    { clipPath: dir === 1 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ...wipe },
  );
  gsap.fromTo(
    outgoing,
    { clipPath: 'inset(0% 0% 0% 0%)' },
    {
      clipPath: dir === 1 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)',
      ...wipe,
      onComplete: () => {
        if (current !== prev) videos[prev].pause();
      },
    },
  );
}

// After a drag, the clip changes once the dial has settled for half a second.
let settleTimer: number | undefined;
const selectSoon = (i: number) => {
  clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => select(i), 500);
};

// ---------- Dial ----------
const dialItems = $$('[data-dial-item]');
let driving = false; // true while the reel itself is moving the dial
const loop = horizontalLoop(dialItems, {
  center: true,
  speed: window.innerWidth < 768 ? 0.5 : 1,
  repeat: -1,
  draggable: true,
  paused: true,
  onChange: (_el: HTMLElement, index: number) => {
    if (!driving) selectSoon(index % count);
  },
});

// With a 2-clip reel the dial holds each clip twice; aim for the nearest copy.
const slotFor = (i: number) => (dialItems.length > count ? i + count : i);
const spin = { duration: 0.8, ease: 'power1.inOut' };
let freeAt = 0; // the reel leaves the dial alone until this time (ms)

const goTo = (i: number, duration = spin.duration) => {
  const target = (i + count) % count;
  freeAt = performance.now() + duration * 1000 + 50;
  driving = true;
  loop.toIndex(slotFor(target), {
    duration,
    ease: spin.ease,
    onComplete: () => (driving = false),
  });
  if (duration === 0) driving = false;
  select(target);
};
// Start the dial centered on clip 01.
loop.toIndex(slotFor(0), { duration: 0 });

dialItems.forEach((item) => {
  const choose = () => goTo(Number(item.dataset.dialItem));
  item.addEventListener('click', choose);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose();
    }
  });
});
$('[data-step="prev"]')?.addEventListener('click', () => goTo(current - 1));
$('[data-step="next"]')?.addEventListener('click', () => goTo(current + 1));

// ---------- Auto-rotate ----------
// The dial glides at a steady pace while each clip plays, so the next number
// reaches the center just as the clip ends and the next one wipes in.
// Off for visitors who ask for reduced motion. Space pauses / resumes.
let autoPlay = animate;
let started = false;
let holding = false;
const LEAD = 0.45; // start the wipe just before the clip ends

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === ' ' && e.target === document.body) {
    e.preventDefault();
    autoPlay = !autoPlay;
    if (autoPlay) {
      clipStartedAt = performance.now() - (videos[current].currentTime || 0) * 1000;
      play(current);
    } else videos[current].pause();
  }
});

// Hold off while someone is dragging the dial, and until their pick has landed.
const dialEl = $('[data-dial]');
dialEl?.addEventListener('pointerdown', () => {
  holding = true;
  driving = false; // a grab cancels any spin in progress
});
window.addEventListener('pointerup', () => {
  if (!holding) return;
  holding = false;
  freeAt = performance.now() + 1600; // throw + settle + 500ms pick delay
});

function driveDial(progress: number) {
  const from = loop.times[slotFor(current)];
  let to = loop.times[slotFor((current + 1) % count)];
  if (to <= from) to += loop.duration();
  driving = true;
  loop.time(gsap.utils.wrap(0, loop.duration(), from + (to - from) * progress));
  driving = false;
}

gsap.ticker.add(() => {
  const v = videos[current];
  const length = Number.isFinite(v.duration) && v.duration > 1 ? v.duration : 5;
  const playing = !v.paused && v.readyState > 2;
  const t = playing ? v.currentTime : (performance.now() - clipStartedAt) / 1000;
  const progress = Math.min(1, Math.max(0, t / (length - LEAD)));
  const now = performance.now();
  if (!started || !autoPlay || holding || document.hidden || now < freeAt) return;
  driveDial(progress);
  if (progress >= 1 && !advancing) {
    advancing = true;
    goTo(current + 1, 0); // the dial is already there; just switch the clip
  }
});

// ---------- Timecode (follows the playing clip) ----------
const tcSlots = $$('[data-timecode] > span');
const toTimecode = (sec: number) => {
  const frames = Math.floor(sec * 24);
  return `${pad(Math.floor(frames / 86400))}:${pad(Math.floor(frames / 1440) % 60)}:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`;
};
gsap.ticker.add(() => {
  const tc = toTimecode(videos[current].currentTime || 0);
  tcSlots.forEach((el, k) => {
    if (el.textContent !== tc[k]) el.textContent = tc[k];
  });
});

// ---------- Start ----------
markTicks(0);
const firstPlay = play(0);
// Warm up the other clips once the first one is rolling.
videos[0].addEventListener('playing', () => clips.forEach((_c, i) => i && load(i)), { once: true });

if (!animate) {
  gsap.set('[data-intro-up]', { opacity: 1 });
  started = true;
} else {
  const loaderTc = $('[data-loader-tc]');
  const counter = { t: 0 };
  gsap.set('[data-clips]', { scale: 1.15 });

  const intro = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  intro
    .from('[data-loader-logo]', { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power3.inOut' })
    .to('[data-loader-bar]', { scaleX: 1, duration: 1.4 }, 0.2)
    .to(counter, {
      t: 2,
      duration: 1.4,
      ease: 'none',
      onUpdate: () => {
        if (loaderTc) loaderTc.textContent = toTimecode(counter.t);
      },
    }, 0.2)
    .fromTo('[data-loader-sheen]', { backgroundPosition: '-60% 0' }, { backgroundPosition: '160% 0', duration: 1.2, ease: 'power1.inOut' }, 0.5);

  const ready = Promise.race([
    new Promise<void>((r) => videos[0].addEventListener('playing', () => r(), { once: true })),
    new Promise<void>((r) => posters[0].complete ? r() : posters[0].addEventListener('load', () => r(), { once: true })),
    new Promise<void>((r) => setTimeout(r, 4000)),
  ]);

  Promise.all([intro.then(), ready, firstPlay]).then(() => {
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to('[data-loader-content]', { autoAlpha: 0, y: -12, duration: 0.5, ease: 'power2.in' })
      .to('[data-shutter="top"]', { yPercent: -100, duration: 1.4, ease: 'power4.inOut' }, '-=0.1')
      .to('[data-shutter="bottom"]', { yPercent: 100, duration: 1.4, ease: 'power4.inOut' }, '<')
      .to('[data-clips]', { scale: 1, duration: 2.4, ease: 'power3.out' }, '<')
      .set('#preloader', { display: 'none' })
      .fromTo('[data-intro-up]', { yPercent: 120, opacity: 1 }, { yPercent: 0, duration: 1, stagger: 0.12 }, '-=1.4')
      .fromTo('[data-mark]', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.4 }, '<0.2')
      .add(() => {
        started = true;
        clipStartedAt = performance.now();
        if (videos[0].readyState > 0) videos[0].currentTime = 0;
      }, '-=0.6');
  });
}
