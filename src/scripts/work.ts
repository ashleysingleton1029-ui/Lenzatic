import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const animate = document.documentElement.classList.contains('js');

// ---------- Running timecode in the header ----------
const pad = (n: number) => String(n).padStart(2, '0');
const tcSlots = Array.from(document.querySelectorAll<HTMLElement>('[data-timecode] > span'));
const start = performance.now();
gsap.ticker.add(() => {
  const frames = Math.floor(((performance.now() - start) / 1000) * 24);
  const tc = `${pad(Math.floor(frames / 86400))}:${pad(Math.floor(frames / 1440) % 60)}:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`;
  tcSlots.forEach((el, k) => {
    if (el.textContent !== tc[k]) el.textContent = tc[k];
  });
});

if (!animate) {
  gsap.set('[data-intro-up]', { opacity: 1 });
} else {
  // ---------- Header + heading slide up ----------
  gsap.fromTo(
    '[data-intro-up]',
    { yPercent: 120, opacity: 1 },
    { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.1 },
  );

  // ---------- Strips wipe in from the right as they come into view ----------
  gsap.set('[data-strip-label]', { yPercent: 110 });
  ScrollTrigger.batch('[data-strip]', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', stagger: 0.12 });
      gsap.to(
        batch.map((el) => el.querySelector('[data-strip-label]')),
        { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.7 },
      );
    },
  });

  // ---------- Slow parallax drift inside each strip ----------
  document.querySelectorAll<HTMLElement>('[data-strip]').forEach((strip) => {
    const img = strip.querySelector('[data-parallax]');
    if (!img) return;
    gsap.fromTo(
      img,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: 'none',
        scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  // Hovering a strip changes its height, which moves everything below it;
  // re-measure scroll positions once it settles.
  let refreshTimer: number | undefined;
  document.querySelectorAll('[data-strip]').forEach((strip) =>
    strip.addEventListener('transitionend', (e) => {
      if ((e as TransitionEvent).propertyName !== 'height') return;
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    }),
  );
}
