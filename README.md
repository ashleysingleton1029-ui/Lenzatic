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

- `src/pages/index.astro`: home page with the full-screen video reel and dial
- `src/data/reel.ts`: the reel clips (Cloudflare Stream ids and titles), in dial order
- `src/scripts/home.ts`: reel behaviour (clip wipes, dial, video loading, intro)
- `src/scripts/horizontalLoop.js`: the draggable, endlessly looping dial
- `src/pages/work.astro` + `src/scripts/work.ts`: Work page of stacked cinematic strips
- `src/data/work.ts`: the Work strips (titles, image crop focus), top to bottom; images live in `public/images/work/`
- `src/pages/work/[slug].astro` + `src/scripts/gallery.ts`: gallery pages (hero, moving film strip, measuring ruler, full-screen viewer)
- `src/data/galleries.ts`: gallery content; images in `public/images/<gallery>/` (`hero.*`, then `01-960.webp` + `01.webp`, `02-…` in strip order)
- `src/components/Header.astro`: top bar shared by every page
- `public/images/lenzatic-mark.svg`: gold center mark (`lenzatic-mark-light.svg` is the grey version)
- `public/fonts/Salena.woff2`: Salena display font (see the licence note below)
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

## Font licence: Salena

A commercial licence for Salena has been purchased. The file in `public/fonts/` is still the demo
build, whose digits 0–5 are watermarked, so numbers fall back to Jost. To use Salena's own numbers,
convert the licensed font file to `public/fonts/Salena.woff2` and remove the `unicode-range` line in
`src/styles/global.css`.
