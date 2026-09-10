# Direction B — Miami shell pass

Branch: `prototype/direction-b-shell`, based on `prototype/miami-pixel-hero`.

This sample replaces the active chunky pixel shell with resolution-independent Miami illustration, editorial type, and a glass island nav. The Home art pass now uses smaller, hand-drawn anime-style waterfront vignettes: a boardwalk PC, lived-in apartment, real Bizzy storefront mark, bookcase, and mailbox. The original prototype renderer remains in the repository but is not loaded by this entry point. Interiors are shell-level compositions to refine after Luke's individual world briefs.

## Preview

```sh
cd ~/Developer/lukecaprio.github.io
git switch prototype/direction-b-shell
python3 -m http.server 3000 --bind 127.0.0.1
```

Open `http://127.0.0.1:3000/#/bay`. There is no build step, server-side router, or new browser dependency. The CNAME, Pages configuration, original PDFs, and DNS are unchanged.

## Explore

The persistent nav is **Home · About · Projects · Writing · Bizzy · Contact**. There is no Scene/List switch; each page directly presents its destinations or complete content. Résumé is in Contact. All Home landmarks have visible names, keyboard focus states, and large targets.

| Home landmark | Destination |
| --- | --- |
| Green Bizzy venue | `#/bizzy` — short explainer, website and app-access CTAs |
| About apartment | `#/about` — headshot, full biography, education, experience, skills |
| Computer | `#/projects` — Digits, ECG, Metro desktop icons |
| Bookshelf | `#/writing` — three research books and empty Bizzy build-log shelf |
| Mailbox | `#/contact` — email, résumé, GitHub, LinkedIn |

Entering from a landmark or nav uses that object's position for a 560ms camera push and arrival. Back to bay and parent links pull back; cold hash loads land directly. Reduced motion uses a 180ms fade with no camera transform or ambient motion. A Pause motion button also stops canvas and CSS ambience. Tab, Enter, browser Back/Forward, and Escape work across routes.

## Papers and source fidelity

Digits project and reader, Le faux noble, and La ville intelligente render complete native HTML from `docs/*-paper.txt`. Only extraction line wrapping, page headers, and split-word artifacts are cleaned up. Text is not summarized or rewritten. Original title, author, date, sections, references, and figure captions remain.

Digits' three actual embedded PDF images are included inline: MNIST examples, zero clusters, and the confusion matrix. Clicking a figure opens its full-resolution image. The French PDFs contain no embedded images, so no figures or charts were invented. Every reader keeps a prominent Download PDF action; Digits retains GitHub and its project/reader cross-links.

ECG and Metro are themed overview shells with their existing descriptions and GitHub links; Metro also retains the demo. They do not claim to have full papers. Bizzy contains approved marketplace/role copy only. Both Bizzy CTAs use `https://bizzyu.com/`; no store URL was found in the repository. No Bizzy 5.0 article is built.

See `SHELL.md` for implementation and verification, `WORLD-MAP-SPEC.md` for the current IA, and `ITEM-THEMES.md` for item themes.
