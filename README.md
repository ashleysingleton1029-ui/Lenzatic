# Lenzatic

Cinematography portfolio of Roberto Lee Cortes — [lenzatic.com](https://lenzatic.com).

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com) and [GSAP](https://gsap.com), hosted on [Vercel](https://vercel.com). Every push to `main` goes live on lenzatic.com; other branches get a preview link.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Where things live

- `src/pages/index.astro`: the Coming Soon page (copy and contact details at the top)
- `src/scripts/landing.ts`: all animations (preloader, letterbox reveal, parallax)
- `src/styles/global.css`: brand colors, fonts, film grain
- `public/images/`: hero photo and logo

## Brand palette

| Token | Hex | From the photo |
|---|---|---|
| ink | `#0b0e12` | deep shadow |
| night | `#16202a` | dusk sky |
| steel | `#2f4a5b` | sky blue |
| haze | `#607a86` | distant haze |
| mist | `#d6dfe0` | logo grey |
| sand | `#d9c7a3` | desert floor |
| ochre | `#d29a3f` | golden brush (accent) |
| rust | `#8a4f16` | rusted posts |
