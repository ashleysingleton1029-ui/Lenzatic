import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
const animate = document.documentElement.classList.contains('js');

// Header timecode
const pad = (n: number) => String(n).padStart(2, '0');
const tcSlots = Array.from(document.querySelectorAll<HTMLElement>('[data-timecode] > span'));
const t0 = performance.now();
gsap.ticker.add(() => {
  const f = Math.floor(((performance.now() - t0) / 1000) * 24);
  const tc = `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  tcSlots.forEach((el, k) => {
    if (el.textContent !== tc[k]) el.textContent = tc[k];
  });
});

const line = $('[data-line]');
const status = $('[data-status]');
const pct = $('[data-pct]');
const signal = $('[data-signal]');
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\|<>-_=+';

if (!animate) {
  gsap.set('[data-intro-up]', { opacity: 1 });
  line.textContent = 'Coming Soon';
  status.textContent = 'Coming soon';
  signal.style.width = '100%';
  pct.textContent = '100';
} else {
  gsap.fromTo('[data-intro-up]', { yPercent: 120, opacity: 1 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.1 });

  const counter = { v: 0 };
  const setPct = () => (pct.textContent = String(Math.round(counter.v)).padStart(3, '0'));

  // Slow, endless breathing of the backdrop + a scan line sweeping down
  gsap.fromTo('[data-orig-bg]', { scale: 1.12 }, { scale: 1.02, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.fromTo('[data-orig-scan]', { yPercent: -100, top: '0%' }, { top: '100%', duration: 5.5, ease: 'none', repeat: -1 });

  line.textContent = '';
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('[data-hud]', { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.06 }, 0.2)
    .fromTo('[data-kicker]', { opacity: 0, letterSpacing: '1.2em' }, { opacity: 1, letterSpacing: '0.5em', duration: 1.6 }, 0.3)
    .fromTo('[data-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0.4)
    // 1. "Awaiting its debut" decodes in, letter by letter
    .call(() => { status.textContent = 'Receiving'; }, [], 0.6)
    .to(line, { duration: 2.2, scrambleText: { text: 'Awaiting Its Debut', chars: GLYPHS, revealDelay: 0.4, speed: 0.5 }, ease: 'none' }, 0.6)
    .to(counter, { v: 62, duration: 2.6, ease: 'power2.out', onUpdate: setPct }, 0.6)
    .to(signal, { width: '62%', duration: 2.6, ease: 'power2.out' }, 0.6)
    .call(() => { status.textContent = 'Standby'; })
    // hold
    .to({}, { duration: 1.8 })
    // 2. Transition: glitch, collapse, scramble into "Coming Soon"
    .to(line, { skewX: -12, x: -6, duration: 0.06, repeat: 5, yoyo: true, ease: 'none' })
    .to(line, { filter: 'blur(6px)', opacity: 0.35, letterSpacing: '0.6em', duration: 0.45, ease: 'power3.in' }, '<0.15')
    .call(() => { status.textContent = 'Decoding'; })
    .to(line, { duration: 1.6, scrambleText: { text: 'Coming Soon', chars: GLYPHS, revealDelay: 0.3, speed: 0.6 }, ease: 'none' })
    .to(line, { filter: 'blur(0px)', opacity: 1, letterSpacing: '0.18em', skewX: 0, x: 0, duration: 1.4 }, '<')
    .to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: setPct }, '<')
    .to(signal, { width: '100%', duration: 1.6, ease: 'power2.inOut' }, '<')
    .fromTo(line, { textShadow: '0 0 0px rgba(190,146,64,0)' }, { textShadow: '0 0 28px rgba(190,146,64,0.55)', duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.out' })
    .call(() => { status.textContent = 'Coming soon'; });
}
