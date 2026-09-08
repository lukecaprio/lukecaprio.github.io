# World-map shell

This implements the navigation phase of `WORLD-MAP-SPEC.md`. The current brief limits delivery to stub worlds and item route slots: no final custom page art, PDF-to-HTML conversion, weekly articles, or new headshot.

## Shared shell

`index.html` mounts the island nav, Back to bay, Scene | List, one canvas stage, the current route content, and motion control. Only the route content and renderer’s world inventory change on navigation. Chrome and canvas remain mounted.

The hub has **five doors**, one each for About, Work, Writing, Bizzy, and Contact. Résumé is folded into Contact. There are no featured items. No ticket-booth duplicate, project boat, arcade, or paper spark remains on the hub.

| World | Primary objects | List content |
| --- | --- | --- |
| Bay | Work dock, bookshop, Bizzy venue, porch, mailbox | The same five worlds |
| About | Complete embedded profile with the supplied headshot | Original biography, education, experience, skills; résumé, Contact, Bizzy, GitHub, LinkedIn links |
| Work | ECG boat/console, Metro tower, Digits arcade | The same three projects, with read/repository/PDF actions as available |
| Writing | One book for each French piece | Both books; a clearly marked “also in Work” Digits-paper cross-link |
| Bizzy | One venue entrance with the `bizzyu.com` CTA | The same CTA and existing-site description |
| Contact | Email mailbox, résumé board, GitHub sign | Email, résumé, GitHub, plus the existing LinkedIn link |

Bizzy art is an imaginative place, not a claim that Bizzy owns a physical Miami venue. Its only in-world CTA is `https://bizzyu.com/`.

## Routes

| Route | Result / home |
| --- | --- |
| `#/bay` | Bay hub |
| `#/about` | About porch |
| `#/work` | Work / research dock |
| `#/writing` | Bayside bookshop |
| `#/bizzy` | Bizzy venue |
| `#/contact` | Contact / shore desk |
| `#/contact?focus=resume` | Contact with résumé highlighted and keyboard-focused |
| `#/work/ecg` | ECG project stub; back to Work |
| `#/work/metro` | Metro Health project stub; back to Work |
| `#/work/digits` | Digits project stub; back to Work; also links to the paper route |
| `#/writing/digits` | Digits paper stub; home and back link are Work |
| `#/writing/faux-noble` | Molière essay stub; back to Writing |
| `#/writing/ville-intelligente` | Paris / AI paper stub; back to Writing |

Empty hash, `#/`, `#bay`, and old bare world hashes normalize without adding history entries. `#/projects` aliases Work. `#top` aliases Bay; old `#experience`, `#education`, and `#skills` alias About. `#/work/digits/paper` aliases the Digits paper route; ECG/Metro `/paper` aliases open their existing project stubs without inventing PDFs. Unknown or malformed routes display an “off the map” page with a working return link.

Normal internal anchor navigation uses browser hash history. Browser Back/Forward traverses world/item routes; item back links always return to the correct home, even on a direct deep link. Escape pushes a return to Bay. A navigation generation counter cancels superseded transitions, so rapid navigation cannot mount a stale destination.

Scene | List selection lasts while this page remains open and carries between worlds. On an item, choosing Scene or List returns to its home in that view. There is no storage or backend. Initial reduced-motion and compact-screen visits default to List; the visitor can still choose Scene.

Hotspots use large transparent anchors with `aria-label` text and a subtle canvas-object glow. The shell does not render floating hover/focus pills or tooltip cards over the pixel artwork. About is a complete route on arrival; the same full profile content stays embedded when Scene/List is changed, with section-jump controls for Bio, Education, Experience, and Skills. Its lead copy states the May 2026 graduation and current end-to-end Bizzy role in a concise professional voice.

Island nav links carry explicit accessible names plus a small Miami-pixel destination subtitle on hover and keyboard focus: Bay / Home, About, Work / Projects, Writing, Bizzy, Résumé (PDF), and Contact.

## Known item actions

Every item has its own title, on-site **Read here** placeholder, “Custom UI coming” frame, and home-world back link. Available sources:

| Item | PDF | Other links |
| --- | --- | --- |
| ECG | Not published on the prior site; unavailable state, not a fake link | `https://github.com/lukecaprio/Deep-Learning-Based-ECG-Signal-Classification` |
| Metro Health | Not published on the prior site; unavailable state, not a fake link | `https://github.com/lukecaprio/metrohealth`; demo `https://youtu.be/a2-lpVSoVdc` |
| Digits project + paper | `docs/KNNKMEANSFINALPAPER.pdf?v=20250126` | `https://github.com/lukecaprio/Efficient-Digit-Recognition-Using-K-Means-Clustering-and-KNN` |
| Le faux noble | `papers/Le%20Bourgeois%20gentilhomme.pdf` | No existing repository |
| La ville intelligente | `papers/La%20ville%20intelligent.pdf` | No existing repository |

Résumé: `assets/LukeCaprioResume2026.pdf`. Email: `mailto:lukecaprio1@gmail.com`. GitHub profile: `https://github.com/lukecaprio`. LinkedIn: `https://linkedin.com/in/lukecaprio`.

Local PDF actions use the HTML `download` attribute. External sites open a new tab with `rel="noopener"`. No paper is forced open externally to reach its stub. Without JavaScript, a direct-link inventory exposes the existing repositories, three PDFs, Bizzy, résumé, and email.

## Source map / next phases

- `assets/miami-content.js`: verified biography migrated from the previous page, world inventory, object positions, titles, summaries, item routes, source URLs. **Single source** for scene doors and fallback list cards.
- `assets/miami-shell.js`: route parsing, aliases, cancellable transitions, focus management, list rendering, and the shared *temporary* item stub. Each known item has a route slot that can be replaced individually later; preserve its source actions and back link.
- `assets/miami-scene.js`: original cached canvas renderer plus shared world props. `MiamiScene.setWorld()` updates the inventory; `setMode()` suspends rendering in List/reader views.
- `assets/miami-hero.css`: persistent chrome, scene layout, large target boxes, readable lists, stub frame, responsive/reduced-motion states. No old `.m-*` layout remains.
- `tests/shell.smoke.cjs`: browser regression checks using Playwright; no application dependency added.

To add a later item: register its metadata and route in `MiamiMap.items`, add exactly one object to its home world, and give it a prop plus desktop/mobile coordinates. Both Scene and List inherit the same destination. Digits is intentionally one Work arcade object for the project/paper pair; its separate paper route does not add another scene object.

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

The completed desktop/mobile Chrome run passed **188 checks**. Coverage includes normal Back/Forward, Escape, direct item URLs, all nav destinations, every hub door, scene/list parity, one-home rules, parent back links, correct local PDF responses, résumé focus, complete About content/headshot/link coverage, sharp current bio copy, no hotspot overlay chrome, object hover/focus behavior, visible island-nav destinations, unknown/alias routes, rapid navigation, pause/reduced motion, large mobile targets, horizontal overflow, no-JavaScript fallback, and browser runtime errors.

JavaScript syntax, Git whitespace, unchanged CNAME, and static asset serving are checked separately. Desktop and mobile screenshots are reviewed for the shell and representative worlds/items. These are browser viewport checks, not physical-device performance profiling.

`CNAME`, DNS, Pages configuration, package dependencies, and `main` remain unchanged. The original résumé and paper files remain byte-for-byte intact.
