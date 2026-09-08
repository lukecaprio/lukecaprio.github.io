# lukecaprio.com — World Map & Transition Spec
**Status:** planning (branch `prototype/miami-pixel-hero`)  
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


### Unique item pages (phase after shell)
- Every project and every paper/writing piece eventually gets its **own custom immersive UI** (not one shared reader skin forever).
- Shell ships **route slots + stub pages** for each known item so navigation works end-to-end.
- Luke and Astra will redesign each stub **one by one** later (content, layout, motion).
- Stubs must still expose: on-site read (placeholder body OK), Download PDF, GitHub when applicable, back to world.

### Native readers (Projects + Writing)
- Papers and write-ups are **read on-site** in a pixel-styled reader overlay/route (`#/writing/digits`, `#/work/ecg/paper`, etc.). Visitor does **not** have to leave or download to read.
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
`Bay (logo)` · `About` · `Work` · `Writing` · `Bizzy` · `Résumé` · `Contact`

- Logo / “Bay” → Hub
- Work → Projects world
- Résumé can deep-link PDF *or* open Contact world focused on the noticeboard (prefer: open Contact world + highlight résumé discoverable; PDF still one click)

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

### 5.1 Projects world — “The Dock / Arcade”
**Metaphor:** waterfront workshop + mini arcade + research pier.  
**Enter from:** Work nav, Projects laptop, or focused project sparks.

**Discoverables — one large object per project**

| Object | Project | On interact |
| --- | --- | --- |
| Research boat / ECG console | Deep Learning ECG | Open **project detail / native paper reader** (if paper) + actions: GitHub, Download PDF |
| Health tower neon | Metro Health | Project detail (GitHub, demo if any) |
| Arcade cabinet | K-Means + KNN digits | Native reader for the paper + GitHub + Download PDF |
| (Future) | New projects | One new large object each |

Digits research paper lives with the Digits project object (not a second bench object), unless moved to Writing only — **pick one home**. Default home: **Projects** (it’s a project paper); Writing world can list it in fallback with “also in Work” without a second scene prop.

**Fallback list:** cards — title, one-liner, tags, **Read**, GitHub, Download PDF.

**UI chrome in-world:** title “Work”, Back to bay, “Show as list”.

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
**Metaphor:** open-air bookshop / zine rack.  
**Discoverables:** **one large book/zine per piece** (no duplicate racks).

| Piece | On interact |
| --- | --- |
| Efficient Digit Recognition… | **Native reader** (HTML from PDF) + Download PDF (+ GitHub if tied to project) |
| Le faux noble… (FR) | Native reader + Download PDF |
| La ville intelligente… (FR) | Native reader + Download PDF |
| (Future weekly posts) | Custom immersive article pages — stub “New issues soon” |

If Digits paper’s **home** is Projects, Writing fallback still links it, but the Bookshop scene does not also place a physical copy (avoids two homes). If Luke prefers Writing as home for that paper, remove it as a separate Projects prop and feature from Writing only.

**Fallback:** chronological list with language tags + Read / Download.

---

### 5.4 Bizzy world — “The Venue”
**Metaphor:** nightlife / campus-deals venue floor — marquee, ticket booth, dance floor glow, promoter stand.  
**Hard rule:** places & mood only. **No invented features, metrics, campuses, or product claims.** Pull any factual line from live site / BizzyBot later.

**Discoverables:**  
- Marquee → `https://bizzyu.com/`  
- Ticket booth → same (or “Get tickets” external)  
- “Lead engineer” backstage pass → About world focus  
- Optional “What Bizzy is” placard with **only** approved one-liner from current site  

**Fallback:** 2–3 sentence approved blurb + single CTA to bizzyu.com.

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

**PDF → native:** treat converting the three existing papers (+ any project write-ups) into on-site readers as part of Projects/Writing build, not a later nice-to-have.

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

1. **Spec lock** ← you are here  
2. **Shell + router + transitions** (Hub stays; stub empty worlds)  
3. **Projects world** + fallback list + hub retarget  
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
