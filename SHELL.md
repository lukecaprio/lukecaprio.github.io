# Direction B shell

Branch: `prototype/direction-b-shell` (from `prototype/miami-pixel-hero`). This is a sample shell pass; per-world interiors may be refined after Luke's world briefs.

## Active source map

- `index.html`: persistent Home / About / Projects / Writing / Bizzy / Contact nav, Back to bay, motion pause, canvas, one scroll container, and no-JavaScript source links. No Scene/List UI or top-nav résumé.
- `assets/direction-b-shell.js`: hash parsing, native semantic page templates, paper fetching and rendering, cancellable camera transitions, focus management, and failure recovery.
- `assets/direction-b-art.js`: high-DPI canvas ambience for water shimmer, skyline, rooms, and soft world motion. `assets/hub-illustrations.js` composes five new painted Home assets from `assets/home-art/`, with separate logo, lamp, wet-edge, and reflection layers. Home uses the matching bay painting with animated water-strip refraction; the code backdrop remains a loading fallback and supplies interior ambience. No external illustration dependency. Canvas DPR is capped at 1.5; hidden tabs, reduced motion, and user pause stop the loop.
- `assets/direction-b.css`: glass navigation, editorial typography, responsive rooms/readers, hover/focus landmark labels (always visible on mobile), keyboard affordances, and reduced-motion states.
- `assets/miami-content.js`: existing factual biography, education, experience, skills, and project/PDF/source links. Legacy world coordinates remain for the prior renderer.
- `docs/*-paper.txt`: original extraction text, retained unchanged. Paragraph rendering removes repeated page headers and repairs line wrapping. No summary substitute.
- `assets/paper-figures/`: three PNGs extracted unchanged from the Digits PDF. See the figure README for provenance.
- `assets/bizzy-logo-source.png`: original supplied logo, cropped by an SVG viewport at its native aspect ratio; no raster regeneration or blur. Outer landmark effects never resize the nested sign.
- `assets/miami-shell.js`, `assets/miami-scene.js`, `assets/miami-hero.css`: retained original prototype implementation; not loaded by Direction B.
- `tests/shell.smoke.cjs`: current Direction B browser checks. Playwright is a development tool, not a shipped dependency.

## Route and action map

| Route | Screen / actions |
| --- | --- |
| `#/bay` | Full-screen illustrated Miami bay; five landmark portals with accessible names |
| `#/home`, `#/`, `#bay`, `#top` | Home aliases |
| `#/projects` | Computer desktop with Digits, ECG, Metro icons |
| `#/work` | Alias of `#/projects`; project item URLs retain `/work/` |
| `#/work/digits` | Pattern lab overview, reported metrics, full HTML paper, three actual PDF figures, GitHub, Download PDF |
| `#/writing/digits` | Same full paper and figures, reader-first; Download PDF, GitHub, Back to project |
| `#/work/ecg` | Cardiac signal lab overview + existing GitHub |
| `#/work/metro` | Hospital night wing overview + existing GitHub + demo |
| `#/writing` | Wood-and-neon bookshelf: three research books |
| `#/writing/faux-noble` | Full French HTML essay and references; salon accent; PDF download |
| `#/writing/ville-intelligente` | Full French HTML paper and references; Paris/circuit accent; PDF download |
| `#/about` | Apartment with headshot, desk, bay window, decorative poster, complete existing About content |
| `#/bizzy` | Green venue explainer; website and Get the app both open `https://bizzyu.com/` in safe new tabs |
| `#/contact` | `mailto:lukecaprio1@gmail.com`, `assets/LukeCaprioResume2026.pdf`, GitHub, LinkedIn |
| `#/contact?focus=resume` | Contact with résumé keyboard-focused |

Old `/work/digits/paper` redirects to `/writing/digits`; ECG/Metro `/paper` aliases return their overview. Old About section hashes enter About. Unknown/malformed routes show a return-home link. There is no Bizzy 5.0 article route.

PDF/source URLs:
- Digits: `docs/KNNKMEANSFINALPAPER.pdf?v=20250126`, native source `docs/digits-paper.txt`.
- Faux noble: `papers/Le%20Bourgeois%20gentilhomme.pdf`, native source `docs/faux-noble-paper.txt`.
- Ville intelligente: `papers/La%20ville%20intelligent.pdf`, native source `docs/ville-intelligente-paper.txt`.
- ECG: `https://github.com/lukecaprio/Deep-Learning-Based-ECG-Signal-Classification`.
- Metro: `https://github.com/lukecaprio/metrohealth`; demo `https://youtu.be/a2-lpVSoVdc`.
- Digits: `https://github.com/lukecaprio/Efficient-Digit-Recognition-Using-K-Means-Clustering-and-KNN`.

## Navigation, motion, and reading

The nav stays mounted outside the animated stage. A Home portal or corresponding nav link provides the destination object's center to the camera. Outgoing push plus arrival lasts 560ms total. Back to Home / parent uses a pullback. Reduced motion replaces transforms with a 180ms fade. Cold loads do not animate through Home.

Navigation generations cancel superseded animations and prevent slow paper requests from mounting stale content. Paper requests are cached by source file. A failure displays a retry action and keeps the PDF download; it never labels an empty body as a loaded paper.

`#world-content` is the sole page scroll container, including when the pointer or touch starts over a document. There are no hidden duplicate Scene/List copies. The nav remains fixed while the full About story or a long paper scrolls. Source figures scale to the reading width and link to the original extracted image. French articles use `lang="fr"`.

## Verification

```sh
PLAYWRIGHT_MODULE=/tmp/luke-miami-qa/node_modules/playwright \
SHELL_BROWSER_CHANNEL=chrome \
node tests/shell.smoke.cjs
```

Use `SHELL_BASE_URL` for another preview URL and `SHELL_QA_DIR` to capture desktop/mobile screenshots. `PLAYWRIGHT_MODULE` and the Chrome channel are local conveniences, not application requirements.

The suite checks the exact nav, five visible Home portals, landmark camera origins, browser history, Escape, aliases, direct loads, all project/book routes, full source-line fidelity for every paper, real figures, PDF responses, Bizzy actions, résumé, source failure/retry, navigation races, natural scrolling, 390px layouts, 320px Home, reduced motion, pause/resume, no-JS links, and browser runtime errors. CNAME and JavaScript syntax are also checked. Visual review covers desktop/mobile Home, Projects, Writing, About, Bizzy, and representative paper/figure layouts. These are browser viewport checks, not physical-device profiling.

Latest local Chrome run: **188 checks passed**, including fresh reloads of every route and keyboard Enter/Escape navigation. The Home art pass was reviewed at desktop and 390px mobile sizes. All 21 French PDF pages were visually reviewed and contain text only. The three extracted Digits figures were reviewed at their native resolutions and in the mobile reader.

## Quiet waterfront pass

Home keeps the name and one role line. Station subtitles, introductory kickers, helper slogans, and duplicate project descriptions are removed throughout the shell; factual About content, paper prose, source metadata, and actions remain. Water now continues beneath the five small timber landings, with pilings, wet reflections, and gentle ripples instead of a full-width promenade. The apartment has a terracotta roof, wraparound veranda, external stairs, bicycle and bougainvillea. Projects has a wide working desk, chair, cables, headphones, lamp, plant, and mooring ropes. Existing pause and reduced-motion controls cover the new water animation.

## Full Home art redraw

All five former geometric Home illustrations have been replaced, not resized: curved green Art Deco venue, seafoam veranda apartment, open boardwalk workstation, crooked walnut bookshelf with brass lamp, and cobalt mailbox garden. Each is an independent transparent WebP with its own silhouette and painted material detail. The scene uses six generated paintings, encoded as WebP (~2.1 MiB total), with code retaining the original sharp Bizzy mark and all animation. No generated branding is used. See `assets/home-art/PROMPTS.md` for the generation prompts and provenance.

Desktop uses varied column widths and depths; mobile keeps two rows with visible station names. Wet-edge masks soften piling bases into continuous water, and reflected image layers move subtly. Pause/reduced-motion stop both CSS lighting/reflections and canvas water movement. Hash routes, 560ms transitions, interior content, native papers, and Pages configuration are unchanged.
