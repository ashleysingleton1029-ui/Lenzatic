import { gsap } from 'gsap';

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

// ---- Running SMPTE-style timecode (24 fps) ----
const pad = (n: number) => String(n).padStart(2, '0');
const toTimecode = (seconds: number) => {
  const frames = Math.floor(seconds * 24);
  const f = frames % 24;
  const s = Math.floor(frames / 24) % 60;
  const m = Math.floor(frames / 1440) % 60;
  const h = Math.floor(frames / 86400);
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
};

const timecode = $('[data-timecode]');
const start = performance.now();
const tick = () => {
  if (timecode) timecode.textContent = toTimecode((performance.now() - start) / 1000);
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

const animate = document.documentElement.classList.contains('js');

if (animate) {
  const heroImg = $<HTMLImageElement>('[data-hero-media] img');
  const imageReady = new Promise<void>((resolve) => {
    if (!heroImg || heroImg.complete) return resolve();
    heroImg.addEventListener('load', () => resolve(), { once: true });
    heroImg.addEventListener('error', () => resolve(), { once: true });
    setTimeout(resolve, 4000); // never hold the page hostage
  });

  // ---- Preloader ----
  const loaderTc = $('[data-loader-tc]');
  const counter = { t: 0 };

  gsap.set('[data-hero-media]', { scale: 1.25 });
  gsap.set('[data-char]', { yPercent: 110 });
  gsap.set('[data-rule]', { scaleX: 0 });
  gsap.set('[data-corner]', { scale: 0.4 });

  const intro = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  intro
    .from('[data-loader-logo]', { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power3.inOut' })
    .to('[data-loader-bar]', { scaleX: 1, duration: 1.6 }, 0.2)
    .to(
      counter,
      {
        t: 2,
        duration: 1.6,
        ease: 'none',
        onUpdate: () => {
          if (loaderTc) loaderTc.textContent = toTimecode(counter.t);
        },
      },
      0.2,
    )
    .fromTo(
      '[data-loader-sheen]',
      { backgroundPosition: '-60% 0' },
      { backgroundPosition: '160% 0', duration: 1.2, ease: 'power1.inOut' },
      0.6,
    );

  intro.then(() => imageReady).then(() => {
    const reveal = gsap.timeline({ defaults: { ease: 'expo.out' } });
    reveal
      .to('[data-loader-content]', { autoAlpha: 0, y: -12, duration: 0.5, ease: 'power2.in' })
      .to('[data-shutter="top"]', { yPercent: -100, duration: 1.4, ease: 'power4.inOut' }, '-=0.1')
      .to('[data-shutter="bottom"]', { yPercent: 100, duration: 1.4, ease: 'power4.inOut' }, '<')
      .to('[data-hero-media]', { scale: 1.08, duration: 2.4, ease: 'power3.out' }, '<')
      .set('#preloader', { display: 'none' })
      .to('[data-corner]', { autoAlpha: 1, scale: 1, duration: 1, stagger: 0.06 }, '-=1.4')
      .to('[data-hero-logo]', { autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, '<')
      .fromTo('header [data-reveal]:not([data-hero-logo])', { y: -10 }, { autoAlpha: 1, y: 0, duration: 1 }, '<0.1')
      .to('[data-char]', { yPercent: 0, duration: 1.3, stagger: 0.045 }, '<0.1')
      .fromTo('section [data-reveal]', { y: 24 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.12 }, '<0.2')
      .to('[data-rule]', { scaleX: 1, duration: 1 }, '<0.2')
      .to('main > [data-reveal]', { autoAlpha: 1, duration: 1 }, '<0.3')
      // Slow, continuous push-in like a dolly move
      .to('[data-hero-media]', { scale: 1, duration: 18, ease: 'sine.out' }, '-=1.2');
  });

  // ---- Subtle parallax on the hero image, for mouse/trackpad users ----
  if (window.matchMedia('(pointer: fine)').matches) {
    const xTo = gsap.quickTo('[data-hero-media]', 'x', { duration: 1.2, ease: 'power3.out' });
    const yTo = gsap.quickTo('[data-hero-media]', 'y', { duration: 1.2, ease: 'power3.out' });
    const frameX = gsap.quickTo('[data-frame]', 'x', { duration: 1.4, ease: 'power3.out' });
    const frameY = gsap.quickTo('[data-frame]', 'y', { duration: 1.4, ease: 'power3.out' });

    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo(nx * -24);
      yTo(ny * -16);
      frameX(nx * 6);
      frameY(ny * 4);
    });

    // Magnetic call-to-action button
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.25);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => {
        mx(0);
        my(0);
      });
    });
  }
}
