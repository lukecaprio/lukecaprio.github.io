# Direction B shell

Branch: `prototype/direction-b-shell` (from `prototype/miami-pixel-hero`). This is a sample shell pass; per-world interiors may be refined after Luke's world briefs.

## Active source map

- `index.html`: persistent Home / About / Projects / Writing / Bizzy / Contact nav, Back to bay, motion pause, canvas, one scroll container, and no-JavaScript source links. No Scene/List UI or top-nav résumé.
- `assets/direction-b-shell.js`: hash parsing, native semantic page templates, paper fetching and rendering, cancellable camera transitions, focus management, and failure recovery.
- `assets/direction-b-art.js`: smooth SVG landmark/project illustrations and high-DPI canvas ambience. No external illustration dependency. Canvas DPR is capped at 1.5; hidden tabs, reduced motion, and user pause stop the loop.
- `assets/direction-b.css`: glass navigation, editorial typography, responsive rooms/readers, visible landmark labels, keyboard affordances, and reduced-motion states.
- `assets/miami-content.js`: existing factual biography, education, experience, skills, and project/PDF/source links. Legacy world coordinates remain for the prior renderer.
- `docs/*-paper.txt`: original extraction text, retained unchanged. Paragraph rendering removes repeated page headers and repairs line wrapping. No summary substitute.
- `assets/paper-figures/`: three PNGs extracted unchanged from the Digits PDF. See the figure README for provenance.
- `assets/miami-shell.js`, `assets/miami-scene.js`, `assets/miami-hero.css`: retained original prototype implementation; not loaded by Direction B.
- `tests/shell.smoke.cjs`: current Direction B browser checks. Playwright is a development tool, not a shipped dependency.

## Route and action map

| Route | Screen / actions |
| --- | --- |
| `#/bay` | Full-screen illustrated Miami bay; five labeled landmark portals |
| `#/home`, `#/`, `#bay`, `#top` | Home aliases |
| `#/projects` | Computer desktop with Digits, ECG, Metro icons |
| `#/work` | Alias of `#/projects`; project item URLs retain `/work/` |
| `#/work/digits` | Pattern lab overview, reported metrics, full HTML paper, three actual PDF figures, GitHub, Download PDF |
| `#/writing/digits` | Same full paper and figures, reader-first; Download PDF, GitHub, Back to project |
| `#/work/ecg` | Cardiac signal lab overview + existing GitHub |
| `#/work/metro` | Hospital night wing overview + existing GitHub + demo |
| `#/writing` | Wood-and-neon bookshelf: three research books; empty Bizzy build-log shelf |
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

Latest local Chrome run: **180 checks passed**, including fresh reloads of every route and keyboard Enter/Escape navigation. All 21 French PDF pages were visually reviewed and contain text only. The three extracted Digits figures were reviewed at their native resolutions and in the mobile reader.
