# Miami pixel world-map shell

Branch: `prototype/miami-pixel-hero`

The original animated bay now opens a static, hash-routed app shell. The island nav stays in place while visitors enter About, Work, Writing, Bizzy, and Contact. The bay has exactly five large world doors, no per-project sparks, and one Bizzy entrance.

This phase is **shell only**: every known project and paper has an on-site stub marked “Custom UI coming.” Existing PDFs, repositories, the Metro demo, résumé, and contact destinations remain available. Final item art and PDF-to-HTML reading experiences come later.

## Preview

```sh
cd ~/Developer/lukecaprio.github.io
git switch prototype/miami-pixel-hero
python3 -m http.server 3000 --bind 127.0.0.1
```

Open <http://127.0.0.1:3000/#/bay>. The existing `npm start` also works. No build, backend, runtime library, or new application dependency is required.

## Explore

- Use the nav or any bay door to enter a world.
- **Scene | List** shows the same destinations in either form. On an item page, these buttons return to its home world in the selected view.
- Every Work object and Bookshop book opens its own route. The Digits paper has its home in Work; Writing cross-links it in List only.
- **Back to bay** and **Escape** return to the hub. Item pages also have a back-to-world link. Browser Back/Forward and direct hash links work normally.
- **Résumé** in the nav opens Contact and focuses its résumé object/list entry; the PDF is one click away.
- Reduced motion starts in List with animation paused; compact screens also default to List. Visitors can explicitly choose Scene. Transitions are instant while motion is paused or reduced motion is enabled.

## Hub doors

| Object | Route |
| --- | --- |
| Project dock | `#/work` |
| Bayside bookshop | `#/writing` |
| Bizzy venue | `#/bizzy` |
| About porch | `#/about` |
| Mailbox | `#/contact` |

The existing `CNAME` and Pages configuration are unchanged. The old dark scroll layout and its `.m-*` styles/hover script have been removed. About’s List holds the migrated biography, education, skills, and experience. Existing assets and PDFs are retained.

See [SHELL.md](SHELL.md) for routes, destination URLs, architectural decisions, verification, and extension points. [WORLD-MAP-SPEC.md](WORLD-MAP-SPEC.md) remains the world-map source of truth; the explicit shell-only brief defers its final readers and custom item interfaces.
