# lukecaprio.com — World Map & Transition Spec
**Status:** implemented prototype (branch `prototype/miami-pixel-hero`)
**Aesthetic:** 16-bit / Pokémon-adjacent Miami Vice — pink sunset, teal water, neon accents  
**Rule:** one continuous pixel world language. No return to the old dark long-scroll portfolio.

---

## 1. Product model

| Layer | Role |
| --- | --- |
| **Hub** | Current Biscayne Bay hero. Home base. |
| **Worlds** | Full-viewport rooms you *enter* (Projects, About, Writing, Bizzy, Contact). Same art style as hub. |
| **Discoverables** | Clickable scene objects inside a world (a laptop, a paper, a booth). |
| **Fallback list** | Always-available readable list/grid of the same destinations — never puzzle-gated. |
| **Chrome** | Island top nav + optional “Show as list” + Back to bay. Persistent across worlds. |

**Kill list (once worlds cover them):** old `#about` … `#contact` dark sections, leftover `.m-*` portfolio CSS/JS that only served that layout. Keep real content (copy, links, PDFs, project URLs) — relocate into worlds + lists.

---

## 1b. Discovery rules (locked)

### One home per thing
- Each project, paper, or writing piece has **exactly one** large primary hotspot in its home world.
- Do **not** duplicate the same item as multiple scene objects in the same world (no boat + arcade + bench all for one paper).
- **Exception — Featured:** optional items may also appear as a **single large hub pin** on Biscayne Bay for shortcut access. Featured = hub + home world (two places max). Non-featured = home world only.
- Hub always keeps **one door per world** (e.g. one Projects dock, one Bookshop, one Bizzy venue) — those are world entrances, not per-item duplicates.

### Hit targets
- Hotspots are **large** — easy tap/click (generous padding, big pixel props, fat labels). Prefer fewer, bigger targets over many tiny sparks.


### Unique item pages
- Every project and paper has its own full-screen route with a themed scene and readable List view.
- ECG and Metro are overview-only until a source paper exists. Digits and the three known papers use complete native HTML sourced from checked-in extraction text, with the original PDFs retained as downloads.
- Item routes keep large actions for on-site reading, Download PDF, GitHub or demo when available, and a back link to the parent world.

### Native readers (Projects + Writing)
- Papers and write-ups are **read on-site** in a pixel-styled reader route (`#/writing/digits`, `#/work/ecg/paper`, etc.). Visitor does **not** have to leave or download to read.
- Reader chrome always offers:
  - **Read here** (default)
  - **Download PDF**
  - **GitHub** (when a repo exists)
  - Close / back to world
- Convert existing PDFs into web-native content (HTML/Markdown rendered in the reader). Keep the PDF file as the downloadable twin.
- Applies to **project papers** and **Writing** pieces alike.

### Featured hub pins (optional)
- Config-driven list (e.g. in world config): which projects/papers are `featured: true`.
- Featured pin on Hub deep-links into the item’s native reader **or** into its world with focus — prefer: enter world with focus, one more click to reader if the object is the story; or open reader directly if the pin *is* that paper. Default: **Hub featured pin → native reader** for papers; **→ Projects world with focus** for multi-link projects (then reader/GitHub from there).
- Start with **zero or one** featured until content feels crowded; Luke opts in per item later.

---

## 2. Global navigation

### Island nav (always visible)
`Home (logo)` · `About` · `Projects` · `Writing` · `Bizzy` · `Contact`

- Logo / “Home” → Hub
- Projects → Projects world (the `#/work` alias remains supported)
- Résumé is reachable from Contact and the résumé action in the shell; it is not a top-level island item.

### Hub scene hotspots
**World doors (exactly one each):**

| Hub object | Goes to |
| --- | --- |
| Bizzy venue (one place — merge booth into venue or make booth the single Bizzy door) | **Bizzy** world |
| Projects dock / laptop (one) | **Projects** world |
| Bookshop (one) | **Writing** world |
| Mailbox (one) | **Contact** world |
| Noticeboard | **Contact** (résumé) — or fold résumé into Contact’s single noticeboard |
| About cue / porch light (add if missing) | **About** world |

**Featured pins (optional, 0–N):** large single pins for opted-in projects/papers only. Not every project lives on the Hub.

### Keyboard / a11y
- Tab order: skip link → island nav → world content / hotspots → fallback list → motion control
- Esc or “Back to bay” returns to Hub
- `prefers-reduced-motion`: instant cut, no pan/zoom; motion toggle respected

---

## 3. URL scheme (shareable + back-button)

Static-friendly hash routes (no server rewrite required for Pages):

| URL | Screen |
| --- | --- |
| `/` or `#/` or `#bay` | Hub |
| `#/about` | About world |
| `#/work` or `#/projects` | Projects world |
| `#/writing` | Writing world |
| `#/bizzy` | Bizzy world |
| `#/contact` | Contact world |
| `#/work/ecg` etc. | Optional deep link: open Projects + select discoverable |

Query or hash fragment for highlight: `#/work?focus=metro` is fine if simpler than nested paths.

**History:** each world enter pushes state; Back returns through stack to Hub.

---

## 4. Transitions

### Default (motion OK)
1. Click nav or hub object  
2. Brief **focus zoom** toward the object (200–400ms)  
3. **Crossfade / wipe** into destination world canvas (300–500ms)  
4. Destination world idle loop starts; caption + fallback list available  

### Reduced motion
Instant swap; no zoom.

### Feel target
Akira-style “door” without losing FPS. Cap canvas work; reuse shared renderer/palette.

### Shared stage
One shell: chrome stays mounted; only the stage (canvas + world hotspots + world fallback) swaps. Avoid full page reloads.

---

## 5. World map

### 5.0 Hub — “Biscayne Bay”
**Already built.** Pink sunset bay, skyline, palms, Bizzy venue/booth, ten sparks.  
**Change for this IA:**  
- Remove per-project hub sparks unless `featured`; keep one Projects door; featured pins optional  
- Remove infinite scroll into old sections; Hub is a single viewport (+ tiny “more” only if needed)  
- Scroll cue becomes “Enter About” or disappears in favor of nav/hotspots  

---

### 5.1 Projects world — “The Pixel Desktop”
**Metaphor:** a full-screen CRT computer desktop with a Miami-night wallpaper and chunky project icons.
**Enter from:** Projects nav, Projects desktop door, or a direct project route.

**Discoverables — one large object per project**

| Object | Project | On interact |
| --- | --- | --- |
| ECG desktop icon | Deep Learning ECG | Project overview + GitHub |
| Metro desktop icon | Metro Health | Project overview + GitHub + demo |
| Digits desktop icon | K-Means + KNN digits | Full project page, native paper reader, GitHub + Download PDF |
| (Future) | New projects | One new large object each |

Digits research paper lives with the Digits project object (not a second bench object), while Writing offers a direct reader link without adding a duplicate Projects object.

**Fallback list:** cards — title, one-liner, tags, **Open project**, GitHub, demo or Download PDF when available.

**UI chrome in-world:** title “Projects”, Back to bay, “Scene | List”.

---

### 5.2 About world — “The Porch”
**Metaphor:** Brickell/Naples porch at dusk — piano, headphones/DJ crate, UM banner, basketball on the grass.  
**Content beats (discoverables):**  
- Portrait placeholder → headshot later  
- Piano → music interest blurb  
- DJ crate → same  
- UM pennant → education (Math+CS, honors) — facts only from live site  
- Bizzy jersey/keycard on table → soft link into Bizzy world  
- “Currently” chalkboard → role line (Lead engineer at Bizzy…)  

**Fallback:** short bio prose + education/skills chips (port existing About/Education/Skills copy).

---

### 5.3 Writing world — “Bayside Bookshop”
**Metaphor:** a full-screen open-air pixel bookcase / zine rack. Scene has one readable book per research piece plus an intentionally empty Bizzy build-log shelf.
**Discoverables:** **one large book/zine per piece** (no duplicate racks).

| Piece | On interact |
| --- | --- |
| Efficient Digit Recognition… | **Native reader** (HTML from `docs/digits-paper.txt`) + Download PDF (+ GitHub) |
| Le faux noble… (FR) | Native reader (HTML from `docs/faux-noble-paper.txt`) + Download PDF |
| La ville intelligente… (FR) | Native reader (HTML from `docs/ville-intelligente-paper.txt`) + Download PDF |
| (Future weekly posts) | Custom immersive article pages — stub “New issues soon” |

Digits keeps its project icon in Projects while the Writing bookcase offers a direct reader link for research readers; there is no duplicate project object in the Projects desktop.

**Fallback:** chronological list with language tags + Read / Download.

---

### 5.4 Bizzy destination — “The Green Room”
Bizzy is an external destination, reached directly from the green hub venue and island nav at `https://bizzyu.com/`. The hub prop supplies nightlife atmosphere and a clear Bizzy label without pretending to be a real Brickell club or inventing product claims. A legacy `#/bizzy` hash may remain as a compatibility route, but it is not the primary action.

---

### 5.5 Contact world — “Shore Desk”
**Metaphor:** mailbox + noticeboard + payphone / neon “SAY HI”.  
**Discoverables:**  
- Mailbox → `mailto:lukecaprio1@gmail.com`  
- Noticeboard → résumé PDF  
- Optional GitHub sign → github.com/lukecaprio  
- Coordinates plaque → fun, non-essential  

**Fallback:** contact list (Email, Résumé, GitHub).

---

## 6. Fallback pattern (every world)

```
[ Stage: canvas + hotspots ]
[ Toggle: Scene | List ]   // List default on reduced-motion or tiny screens if needed
[ List: accessible links matching discoverables ]
```

- List is not a failure state — it’s first-class.  
- Mobile: consider **List first** with “Explore scene” secondary if taps feel cramped.  
- Empty states only for future shelves, never for core résumé/contact.

---

## 7. Content inventory (source of truth)

Reuse from current site / PROTOTYPE.md — do not invent:

- Role, bio, education, skills  
- Projects: ECG, Metro Health, Digits (+ paper PDF)  
- Writing: 3 pieces (1 EN research, 2 FR)  
- Résumé PDF path  
- Email, GitHub, Bizzy URL (`bizzyu.com` — confirm anytime)  

Weekly Substack-like custom article UIs = **phase 2** (Writing world gets a “New issues” shelf only for now).

**PDF → native:** the three existing papers are rendered from checked-in `docs/*-paper.txt` sources as on-site readers; their PDFs remain downloadable twins.

---

## 8. Technical sketch (still static Pages)

- Keep branch `prototype/miami-pixel-hero`  
- Shell: `index.html` + shared `miami-hero.css` + router/world controller JS  
- Per world: `worlds/*.js` scene drawers + hotspot layouts **or** one engine with world configs  
- `--x/--y` (or world-local coords) remain single source for object + link alignment  
- No app server; hash router; `CNAME` untouched  
- Tear out old section markup after worlds pass content parity checklist  

---

## 9. Build order

1. **Spec lock** ← shipped
2. **Shell + router + transitions** (shipped)
3. **Projects desktop** + fallback list + hub retarget (shipped)
4. **About** → **Writing** → **Contact** → **Bizzy**  
5. Delete old dark sections  
6. Mobile QA / reduced-motion QA  
7. Merge PR when Hub + Projects + Contact are solid (minimum lovable); rest can follow in same PR or swift follow-ups  

**Minimum lovable merge:** Hub + Projects + Contact + list fallbacks + old sections removed or hidden.

---

## 10. Success criteria

- Visitor never needs the old scroll page to find Work / About / Writing / Contact / Bizzy  
- Every destination reachable in ≤2 clicks from Hub (nav or scene)  
- Every destination also in a fallback list  
- Feels like one game-world, not a marketing site with pixel wallpaper
- Papers readable on-site; PDF download and GitHub remain optional exits
- One large target per item; featured hub pins are opt-in only  
- Still a static GitHub Pages site with intact custom domain  

---

## 11. Open nits (non-blocking)

- Exact résumé behavior: world-first vs direct PDF from nav  
- Mobile default: Scene vs List  
- Deep-link syntax (`#/work?focus=ecg` vs `#/work/ecg`)  
- Confirm `bizzyu.com` forever  
