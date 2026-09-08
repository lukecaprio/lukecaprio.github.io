# Miami pixel hero prototype

Branch: `prototype/miami-pixel-hero`

A new homepage opening scene for Luke Caprio: a pink-sunset Miami bay, layered Brickell-inspired skyline, palm-lined shore, a Bizzy waterfront venue and ticket booth, and ten navigable discoveries. The existing About, Experience, Projects, Writing, Skills, Education, Contact, and footer content remains below the hero.

## Preview

From the repository root:

```sh
git switch prototype/miami-pixel-hero
python3 -m http.server 3000 --bind 127.0.0.1
```

Open <http://127.0.0.1:3000>. The existing `npm start` command is also available. No compilation, new application dependencies, API keys, or backend are needed. Stop the local server with Ctrl+C.

The branch is a reviewable prototype. `CNAME` remains exactly `lukecaprio.com`; domain and Pages configuration are unchanged. This branch must be reviewed and merged separately before replacing the production homepage.

## Explore the world

Four primary destinations show labels immediately. The other sparks reveal labels on hover or keyboard focus. Every hotspot is a normal HTML anchor: click or tap once to follow it, use Tab and Enter with a keyboard, or use the floating navigation. External and PDF links open a new tab; email opens the visitor's mail client.

| Scene location | Destination | URL |
| --- | --- | --- |
| Bizzy waterfront venue marquee | Bizzy | `https://bizzyu.com/` |
| Bizzy ticket booth | Bizzy | `https://bizzyu.com/` |
| Laptop on the project dock | Luke's GitHub projects | `https://github.com/lukecaprio` |
| Bayside bookshop | Existing writing section | `#writing` |
| Shore noticeboard | Existing résumé PDF | `assets/LukeCaprioResume2026.pdf` |
| Beach mailbox | Email Luke | `mailto:lukecaprio1@gmail.com` |
| Research boat | ECG classification project | `https://github.com/lukecaprio/Deep-Learning-Based-ECG-Signal-Classification` |
| Illuminated city health tower | Metro Health project | `https://github.com/lukecaprio/metrohealth` |
| Beach arcade | Digit recognition project | `https://github.com/lukecaprio/Efficient-Digit-Recognition-Using-K-Means-Clustering-and-KNN` |
| Open paper on the reading bench | K-means / KNN paper | `docs/KNNKMEANSFINALPAPER.pdf?v=20250126` |

Floating navigation: About → `#about`; Work → `#projects`; Writing → `#writing`; Résumé → `assets/LukeCaprioResume2026.pdf`; Contact → `mailto:lukecaprio1@gmail.com`. The scroll cue leads to `#about`.

All destinations come from the previous homepage; the contact address also matches the brief. The Bizzy venue and booth are imaginative scene representations, not claims about physical Bizzy-owned locations or additional product features.

## Implementation

- `index.html`: new hero and navigation, ten semantic links, accessible labels, skip link, motion button, and metadata. Existing portfolio content below the hero is retained.
- `assets/miami-hero.css`: overlay layout, pixel scaling, focus/hover states, hotspot positions, and mobile arrangement.
- `assets/miami-scene.js`: original Canvas 2D pixel art. The sky, skyline, and foreground are cached once per resize. Water, reflections, clouds, birds, boat, and palm fronds animate independently, capped at 30 fps.
- CSS custom properties `--x` and `--y` on each `[data-place]` anchor are the single source of truth for both link position and scene object placement. Change those coordinates to move an object and its link together.
- Canvas backing dimensions follow the viewport's aspect ratio to keep pixels square. Mobile uses a separate arrangement at 600px and below, keeping every destination in the scene.
- The pause button stops both canvas and CSS motion. `prefers-reduced-motion` starts the scene paused. Canvas rendering also suspends while the tab is hidden or the hero is outside the viewport.
- Canvas is decorative and hidden from assistive technology. Navigation and hotspot links remain available without JavaScript, with a CSS sunset backdrop and explanatory text. The existing Google Fonts stylesheet is reused, with local font fallbacks.

## Validation

Performed for this prototype:

- JavaScript syntax and Git whitespace checks.
- Direct native-canvas renders at desktop and mobile aspect ratios, with visual inspection of the generated artwork.
- Renderer behavior checks: successive animation frames differ; pause freezes pixels; resume restarts scheduling; reduced motion starts paused; hidden-tab and offscreen states cancel animation scheduling.
- Parsed all ten hotspot URLs and checked local destinations and anchor targets.
- Live-site link audit: Bizzy, the three project repositories, the résumé, and all three existing writing PDFs returned HTTP 200.
- Confirmed `CNAME` and the existing page content from the About section onward match the original revision.
- Local homepage and new assets served successfully over HTTP.

Browser interaction testing and physical-device performance profiling have not been performed. Before merging, review the local page in a desktop and mobile browser: check nav layout, Tab/Enter through the sparks, tap destinations, pause/resume, and reduced-motion behavior. PDF/external-link popups and mailto handling depend on browser settings and installed apps.

## Scope

Hero prototype only. No blog system, new headshot, portfolio rewrite, DNS changes, fabricated credentials, employers, dates, metrics, or Bizzy product claims. The transition into the existing portfolio is deliberately retained for a later design pass.
