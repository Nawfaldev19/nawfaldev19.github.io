# nawfaldev19.github.io

Portfolio of Nawfal Imran, Senior Full Stack Developer (Lahore, UTC+5). One page, drawn like an engineering sheet, with three working figures:

- **FIG. 1** – a React Flow graph that restyles the page (theme, accent, motion, density).
- **FIG. 2** – the same graph on two renderers, FPS measured on your device.
- **FIG. 3** – the seat-map builder's DOM → SVG → Canvas generations.

## Stack

Vite, React 19, TypeScript, Zustand, React Flow (`@xyflow/react`), Konva. Fraunces and JetBrains Mono via Fontsource. The figures are lazy-loaded behind static SVG posters, so the first load stays small.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview
```

## Layout

| Path | What |
|---|---|
| `src/sections/` | Page sections (S.00–S.06, footer title block) |
| `src/components/` | Header, clock, settings tray, figure frame, SVG drawings |
| `src/content/site.ts` | Copy, links and numbers |
| `src/store/settings.ts` | Shared settings store (theme, accent, motion, density) |
| `src/styles/` | `tokens.css` (design tokens) and `global.css` |
| `src/fig1`, `src/fig2`, `src/fig3` | The three interactive figures |

Settings persist in `localStorage` (`nf-settings`). An inline script in `index.html` applies them before first paint; keep it in sync with `applyToDocument()` in the store.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages (set Pages source to "GitHub Actions"). The workflow stamps `VITE_BUILD_DATE`, shown as REV in the footer.

## Before launch

- Export `public/og.svg` to `public/og.png` (1200×630).
- Replace the photo placeholder in `src/sections/Hero.tsx`.
- Add the CV button once a public CV PDF exists.
- Optional: add the Cloudflare Web Analytics token in `index.html`.
