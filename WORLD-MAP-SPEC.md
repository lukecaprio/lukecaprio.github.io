# lukecaprio.com — Direction B world map

Status: sample shell on `prototype/direction-b-shell`, based on `prototype/miami-pixel-hero`.
Source of truth: Luke's Direction B brief. Smooth illustrated neon Miami is the primary art language; small sprite accents are optional. Keep the static GitHub Pages architecture and CNAME intact.

## Global architecture

Nav: **Home · About · Projects · Writing · Bizzy · Contact**.
Home uses `#/bay` (`#/home` alias). Projects uses `#/projects` (`#/work` alias). Résumé is in Contact, never in the top nav. Bizzy enters `#/bizzy`, whose website/app CTAs open the real site. No Scene/List toggle in this pass.

The nav is persistent. Each page presents its complete content or its clear selection surface on arrival. Documents use one natural page scroll container. Keyboard users get visible focus, meaningful names, and normal links; mobile users get responsive typography and large targets.

## Home landmarks

Exactly five large, visibly named portals:

| Landmark | Destination |
| --- | --- |
| Green Bizzy bar | `#/bizzy` |
| About apartment / house | `#/about` |
| Computer | `#/projects` |
| Bookshelf | `#/writing` |
| Mailbox | `#/contact` |

No featured project clutter. Hover/focus gently raises or illuminates the landmark while its name remains visible. Background: Biscayne Bay sunset, illustrated skyline, water shimmer, palms, promenade, and restrained parallax.

## Transitions

- Home → landmark: zoom toward the actual object center, then enter its world.
- Desktop folder / shelf book → item: push from the selected object.
- Back → Home / parent: pull back, revealing the relevant landmark or folder.
- Target duration: 400–700ms (current total 560ms).
- Reduced motion: short fades (current total 180ms), no zoom or ambient loops.
- Cold deep links land directly in the world. Hash history, browser Back/Forward, aliases, and Escape → Home remain functional.
- New navigation cancels old transitions and stale paper loads.

## Worlds

**Projects** — full-screen glass computer desktop with three labeled project icons: Digits, ECG, Metro. Project routes remain `#/work/digits`, `#/work/ecg`, `#/work/metro`.

**Writing** — lived-in wood/neon bookcase with three books: Digits paper, Le faux noble, La ville intelligente. A separate Bizzy build-log shelf is empty / coming soon. No Bizzy 5.0 article.

**About** — clean Miami apartment: existing headshot, desk, decorative poster, window over the bay. Full existing bio, education, experience, and skills visible on arrival and scrollable. No secondary bio gate or invented biography.

**Bizzy** — green nighttime venue atmosphere with a short campus-deals/nightlife/events marketplace explainer for students and organizers. Existing lead-engineer role copy only. Website and app-access CTAs link to `https://bizzyu.com/`; use a store URL only when verified. Imagined venue art is not a claim that Bizzy owns a physical Miami bar.

**Contact** — mailbox/desk motif, email, résumé PDF, existing GitHub and LinkedIn. All destinations visible and clickable.

## Item worlds and native papers

- Digits: smooth pattern lab; project overview and existing metrics immediately followed by the full native HTML paper. Dedicated `#/writing/digits` is reader-first. Both include all three real figures extracted from the PDF, GitHub, and Download PDF.
- ECG: clinical night/cardiac signal lab shell, existing overview + GitHub. No paper invented.
- Metro: hospital night wing shell, existing overview + GitHub/demo. No paper invented.
- Faux noble: baroque salon/comedy-stage accent in the Direction B system; full French text + original PDF.
- Ville intelligente: Paris night/circuit accent; full French text + original PDF.

Only `docs/digits-paper.txt`, `docs/faux-noble-paper.txt`, and `docs/ville-intelligente-paper.txt` supply paper prose. Preserve wording, titles, authorship, dates, sections, references, and captions; fix PDF line wrapping and split words only. Do not replace full papers with paraphrases or iframes. French papers have `lang="fr"`. Their PDFs have no embedded figures; do not invent charts. See `assets/paper-figures/README.md` for extracted Digits figure provenance.

## Delivery scope

Commit and push the new shell branch. PR description must identify this as a shell pass, with per-world interiors to be refined after Luke's exact world briefs. No merge to main, DNS changes, or invented product claims. See `SHELL.md` for route contracts, implementation, preview, and regression checks.
