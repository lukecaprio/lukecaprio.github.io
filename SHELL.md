# World-map shell

This implements the navigation phase of `WORLD-MAP-SPEC.md`, with the Projects desktop and Digits reader now shipped as the first finished item surface.

## Shared shell

`index.html` mounts the island nav, Back to bay, Scene | List, one canvas stage, the current route content, and motion control. Only the route content and renderer’s world inventory change on navigation. Chrome and canvas remain mounted.

The hub has **five doors**, one each for About, Projects, Writing, Bizzy, and Contact. Résumé is folded into Contact. There are no featured items. No ticket-booth duplicate, project boat, arcade, or paper spark remains on the hub.

| World | Primary objects | List content |
| --- | --- | --- |
| Bay | Projects desktop door, bookshop, neon-green Bizzy venue, porch, mailbox | Bizzy opens externally; the other four enter worlds |
| About | Dedicated animated blue-hour porch world with integrated headshot/profile | Clean stacked biography, education, experience, and skills; quiet contact footer |
| Projects | Pixel computer desktop with ECG, Metro, and Digits icons | The same three projects, with source actions as available |
| Writing | One book for each French piece | Both books; a clearly marked “also in Projects” Digits-paper cross-link |
| Bizzy | Direct external `bizzyu.com` destination; green club art remains on the hub | External site only; `#/bizzy` is retained as an unused legacy stub |
| Contact | Email mailbox, résumé board, GitHub sign | Email, résumé, GitHub, plus the existing LinkedIn link |

Bizzy art is an imaginative green room/nightclub place on the Bay hub, not a claim that Bizzy owns a physical Miami venue. The hub object and island-nav item open `https://bizzyu.com/` directly in a new tab; the legacy `#/bizzy` stub remains available only for old links.

The Bay hub’s green Bizzy bar carries a processed nearest-neighbor pixel mark at hub scale. The About house is enlarged and labeled `ABOUT`, with a small idle Luke sprite beside the porch; the house remains the sole About hit target.

## Routes

| Route | Result / home |
| --- | --- |
| `#/bay` | Bay hub |
| `#/about` | About porch |
| `#/work` | Projects / digital computer desktop |
| `#/writing` | Bayside bookshop |
| `#/bizzy` | Legacy Bizzy stub (the hub and island nav open `https://bizzyu.com/` directly) |
| `#/contact` | Contact / shore desk |
| `#/contact?focus=resume` | Contact with résumé highlighted and keyboard-focused |
| `#/work/ecg` | ECG project overview; back to Projects |
| `#/work/metro` | Metro Health project overview; back to Projects |
| `#/work/digits` | Standalone Digits arcade project world with the full paper below; back to Projects |
| `#/writing/digits` | Standalone Digits paper reader with Abstract, Introduction, Method, Results, and Conclusion; home/back link is Projects |
| `#/writing/faux-noble` | Molière essay stub; back to Writing |
| `#/writing/ville-intelligente` | Paris / AI paper stub; back to Writing |

Empty hash, `#/`, `#bay`, and old bare world hashes normalize without adding history entries. `#/projects` aliases `#/work` while Projects is the canonical display name. `#top` aliases Bay; old `#experience`, `#education`, and `#skills` alias About. `#/work/digits/paper` aliases the Digits paper route; ECG/Metro `/paper` aliases open their existing project overviews without inventing PDFs. Unknown or malformed routes display an “off the map” page with a working return link.

Normal internal anchor navigation uses browser hash history. Browser Back/Forward traverses world/item routes; item back links always return to the correct home, even on a direct deep link. Escape pushes a return to Bay. A navigation generation counter cancels superseded transitions, so rapid navigation cannot mount a stale destination.

Scene | List selection lasts while this page remains open and carries between worlds. Projects uses a full-screen computer desktop in Scene and clean cards in List. Digits keeps Scene and List on its standalone project or paper world; other project and paper routes keep their focused overview/stub page. There is no storage or backend. Initial reduced-motion and compact-screen visits default to List; the visitor can still choose Scene.

Hotspots use large transparent anchors with `aria-label` text and a subtle canvas-object glow. The shell does not render floating hover/focus pills or tooltip cards over the pixel artwork. About is a complete route on arrival: Scene enters a separate animated blue-hour porch world with the full profile integrated into the architecture, while List presents the same information as clean stacked sections. Both views use one scroll container so wheel, trackpad, and touch scrolling continue through the full story. Its lead copy states the May 2026 graduation and current end-to-end Bizzy role in a concise professional voice.

Island nav links carry explicit accessible names plus a small Miami-pixel destination subtitle on hover and keyboard focus: Bay / Home, About, Projects, Writing, Bizzy, Résumé (PDF), and Contact.

## Known item actions

Every item has its own title, source actions, and home-world back link. Digits now has a dedicated arcade project world and reader; ECG and Metro have focused project overviews, while the French papers keep their clearly marked stub frame until their individual art passes. Available sources:

| Item | PDF | Other links |
| --- | --- | --- |
| ECG | Not published on the prior site; unavailable state, not a fake link | `https://github.com/lukecaprio/Deep-Learning-Based-ECG-Signal-Classification` |
| Metro Health | Not published on the prior site; unavailable state, not a fake link | `https://github.com/lukecaprio/metrohealth`; demo `https://youtu.be/a2-lpVSoVdc` |
| Digits project + paper | `docs/KNNKMEANSFINALPAPER.pdf?v=20250126`; on-site reader at `#/writing/digits` | `https://github.com/lukecaprio/Efficient-Digit-Recognition-Using-K-Means-Clustering-and-KNN` |
| Le faux noble | `papers/Le%20Bourgeois%20gentilhomme.pdf` | No existing repository |
| La ville intelligente | `papers/La%20ville%20intelligent.pdf` | No existing repository |

Résumé: `assets/LukeCaprioResume2026.pdf`. Email: `mailto:lukecaprio1@gmail.com`. GitHub profile: `https://github.com/lukecaprio`. LinkedIn: `https://linkedin.com/in/lukecaprio`.

Local PDF actions use the HTML `download` attribute. External sites open a new tab with `rel="noopener"`. No paper is forced open externally to reach its stub. Without JavaScript, a direct-link inventory exposes the existing repositories, three PDFs, Bizzy, résumé, and email.

## Source map / next phases

- `assets/miami-content.js`: verified biography migrated from the previous page, world inventory, object positions, titles, summaries, item routes, source URLs. **Single source** for scene doors and fallback list cards.
- `assets/miami-shell.js`: route parsing, aliases, cancellable transitions, focus management, list rendering, item stubs, and the dedicated Digits project/paper documents.
- `assets/miami-scene.js`: original cached canvas renderer plus shared world props and a separate animated Digits arcade layer. `MiamiScene.setWorld()` accepts an optional item path; `setMode()` suspends rendering in List views.
- `assets/miami-hero.css`: persistent chrome, scene layout, large target boxes, readable lists, stub frame, neon Digits world, responsive/reduced-motion states. No old `.m-*` layout remains.
- `tests/shell.smoke.cjs`: browser regression checks using Playwright; no application dependency added.

To add a later item: register its metadata and route in `MiamiMap.items`, add exactly one object to its home world, and give it a prop plus desktop/mobile coordinates. Both Scene and List inherit the same destination. Digits is intentionally one Projects desktop icon for the project/paper pair; its separate paper route does not add another scene object.

The renderer keeps the sky/skyline/shore palette and original motion, caches static layers, and caps frames at 30 fps. It suspends on hidden tabs, offscreen stages, List views, and readers. A short 150 ms focus zoom out plus 230 ms crossfade in connects routes. Reduced motion or the pause button makes routing instant.

## Verification

Start the same static server as in `PROTOTYPE.md`. With Playwright available to Node:

```sh
node tests/shell.smoke.cjs
```

The test runner accepts:

- `SHELL_BASE_URL` (default `http://127.0.0.1:3000/`)
- `PLAYWRIGHT_MODULE` (optional absolute path to an existing Playwright installation)
- `SHELL_BROWSER_CHANNEL=chrome` (use installed Chrome instead of Playwright Chromium)
- `SHELL_QA_DIR` (optional directory for desktop/mobile review screenshots)

The completed desktop/mobile Chrome run passed **208 checks**. Coverage includes normal Back/Forward, Escape, direct item URLs, all internal nav destinations, direct external Bizzy nav and hub links, every hub door, scene/list parity, one-home rules, parent back links, correct local PDF responses, résumé focus, complete About content/headshot/link coverage, sharp current bio copy, no hotspot overlay chrome, object hover/focus behavior, visible island-nav destinations, the green Bizzy hub venue and lit facade, its processed pixel mark, the unclipped About sign and Luke sprite, factual list blurb, standalone About Scene/List content and scroll columns, standalone Digits Scene/List project and paper documents with in-page sections and mobile scroll columns, unknown/alias routes, rapid navigation, pause/reduced motion, large mobile targets, horizontal overflow, no-JavaScript fallback, and browser runtime errors.

JavaScript syntax, Git whitespace, unchanged CNAME, and static asset serving are checked separately. Desktop and mobile screenshots are reviewed for the shell and representative worlds/items. These are browser viewport checks, not physical-device performance profiling.

`CNAME`, DNS, Pages configuration, package dependencies, and `main` remain unchanged. The original résumé and paper files remain byte-for-byte intact.
