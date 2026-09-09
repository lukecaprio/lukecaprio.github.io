# Miami pixel world-map shell

Branch: `prototype/miami-pixel-hero`

The original animated bay now opens a static, hash-routed app shell. The island nav stays in place while visitors enter About, Projects, Writing, and Contact; Bizzy is a direct external destination. The bay has exactly five large world doors, no per-project sparks, and a neon-green Bizzy entrance. Bizzy art is an imaginative club/bar facade on the hub, while its object and nav item open `https://bizzyu.com/` directly.

Hotspots use large transparent hit targets with accessible names and a restrained glow on the in-world canvas object; hover and focus no longer place floating label pills over the artwork. About opens directly as a complete standalone porch world with its own animated blue-hour canvas, supplied headshot, sharper current bio, education, experience, skills, and a quiet footer contact link. Scene keeps the profile integrated into the world; List presents the same full content as clean stacked sections, each using a single natural scroll container. Island-nav hover/focus subtitles name each destination without adding hotspot overlays.

This phase is **shell plus the Projects desktop and finished item readers**: ECG and Metro have focused overview worlds, Digits has a standalone arcade project page with the complete paper rendered as native HTML below its overview, and both French papers have full native HTML readers in themed salon/Paris worlds. Existing PDFs, repositories, the Metro demo, résumé, and contact destinations remain available.

## Preview

```sh
cd ~/Developer/lukecaprio.github.io
git switch prototype/miami-pixel-hero
python3 -m http.server 3000 --bind 127.0.0.1
```

Open <http://127.0.0.1:3000/#/bay>. The existing `npm start` also works. No build, backend, runtime library, or new application dependency is required.

## Explore

- Use the nav or any bay door to enter a world.
- **Scene | List** shows the same destinations in either form. Projects uses a full-screen computer desktop in Scene and clean cards in List. Writing uses a pixel bookcase with three research books and an intentionally empty Bizzy build-log shelf.
- Every Projects object and book opens its own route. Digits keeps one Projects desktop icon while its paper is also reachable from the Writing shelf and list.
- **Back to bay** and **Escape** return to the hub. Item pages also have a back-to-world link. Browser Back/Forward and direct hash links work normally.
- Résumé is available from the Contact world as a clearly labeled action; the PDF is one click away.
- Digits opens a dark neon arcade world at `#/work/digits`; its project and paper routes render the complete checked-in `docs/digits-paper.txt` source as readable HTML with prominent Download PDF and GitHub actions. Both views scroll inside their own content column on mobile and desktop.
- French writing routes render the complete checked-in `docs/faux-noble-paper.txt` and `docs/ville-intelligente-paper.txt` sources as native HTML, with the original PDFs retained as downloads.
- Reduced motion starts in List with animation paused; compact screens also default to List. Visitors can explicitly choose Scene. Transitions are instant while motion is paused or reduced motion is enabled.

## Hub doors

| Object | Route |
| --- | --- |
| Projects desktop | `#/work` |
| Bayside bookshop | `#/writing` |
| Bizzy venue | `https://bizzyu.com/` (opens externally) |
| About porch | `#/about` |
| Mailbox | `#/contact` |

The existing `CNAME` and Pages configuration are unchanged. The old dark scroll layout and its `.m-*` styles/hover script have been removed. About’s List holds the migrated biography, education, skills, and experience. Existing assets and PDFs are retained.

Hub polish keeps the Bizzy bar green and readable with a nearest-neighbor pixel mark, moves the About sign clear of the roof, and adds a small idle Luke sprite beside the house. The sprite is decorative; the house remains the `#/about` target.

See [SHELL.md](SHELL.md) for routes, destination URLs, architectural decisions, verification, and extension points. [WORLD-MAP-SPEC.md](WORLD-MAP-SPEC.md) remains the world-map source of truth for the static shell and native readers.
