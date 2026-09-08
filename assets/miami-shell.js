/* Static hash router. One shell, one renderer, one route inventory. */
(() => {
  "use strict";
  const { worlds, items, resume } = window.MiamiMap;
  const biography = window.MiamiBiography;
  const stage = document.getElementById("scene-stage");
  const content = document.getElementById("world-content");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 380px), (max-height: 660px)");
  let mode = reduced.matches || compact.matches ? "list" : "scene";
  let route,
    generation = 0,
    animation,
    lastOrigin = "50% 60%";
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const external = (href) =>
    /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "";
  const anchor = (href, label, attrs = "") =>
    `<a href="${escape(href)}"${external(href)} ${attrs}>${escape(label)}</a>`;
  const tags = (values) =>
    `<div class="tags">${values.map((t) => `<span>${escape(t)}</span>`).join("")}</div>`;

  function parseHash() {
    let raw;
    try {
      raw = decodeURI(location.hash.slice(1));
    } catch {
      raw = "/not-found";
    }
    if (!raw || raw === "/") raw = "/bay";
    if (!raw.startsWith("/")) raw = "/" + raw;
    const [pathname, query = ""] = raw.split("?");
    let path = pathname.replace(/\/$/, "");
    const aliases = {
      "/projects": "/work",
      "/top": "/bay",
      "/experience": "/about",
      "/education": "/about",
      "/skills": "/about",
      "/work/ecg/paper": "/work/ecg",
      "/work/metro/paper": "/work/metro",
      "/work/digits/paper": "/writing/digits",
    };
    path = aliases[path] || path;
    const focus = new URLSearchParams(query).get("focus");
    const item = items[path];
    const world = item ? item.home : path.slice(1);
    return {
      path,
      focus,
      item,
      world: worlds[world] ? world : "bay",
      missing: !item && !worlds[world],
      hash: "#" + path + (query ? "?" + query : ""),
    };
  }

  function itemActions(item) {
    const pdf = item.pdf
      ? anchor(item.pdf, "Download PDF ↓", 'class="action" download')
      : '<span class="unavailable-action" aria-label="Download PDF unavailable: no PDF is published">Download PDF <small>Not published</small></span>';
    return `<div class="item-actions"><span class="read-mode">Read here</span>${pdf}${item.github ? anchor(item.github, "GitHub ↗", 'class="action"') : ""}${item.demo ? anchor(item.demo, "Watch demo ↗", 'class="action"') : ""}${item.paper ? anchor("#" + item.paper, "Read the paper →", 'class="action"') : ""}</div>`;
  }

  function hotspot(o) {
    const label = o.label.replace(/ [↗↓]$/, "") + (o.pdf ? " — download PDF" : /^https?:/.test(o.href) ? " (opens in a new tab)" : "");
    return `<a class="hotspot" aria-label="${escape(label)}" data-object="${escape(o.id)}" data-place="${escape(o.id)}" data-prop="${escape(o.prop)}" data-scale="${o.scale || 1}" style="--x:${o.position[0]}%;--y:${o.position[1]}%;--mobile-x:${o.mobile[0]}%;--mobile-y:${o.mobile[1]}%" href="${escape(o.href)}"${external(o.href)}${o.pdf ? " download" : ""}></a>`;
  }

  function listCard(o) {
    const item = o.item && items[o.item];
    const title = item?.title || o.label.replace(/ [↗↓]$/, "");
    const heading = anchor(o.href, title, o.pdf ? "download" : "");
    return `<article class="list-card" data-list-object="${escape(o.id)}"><span class="card-kicker">${escape(item ? item.kind + " · " + item.language : worlds[route.world].caption)}</span><h2${item?.language === "FR" ? ' lang="fr"' : ""}>${heading}</h2><p>${escape(o.description)}</p>${item ? tags(item.tags) : ""}${item ? `<div class="card-actions">${anchor(o.href, "Read here →")}${item.pdf ? anchor(item.pdf, "Download PDF ↓", "download") : ""}${item.github ? anchor(item.github, "GitHub ↗") : ""}</div>` : ""}</article>`;
  }

  function aboutDocument(list = false) {
    const ed = biography.education;
    const id = list ? ' id="about-bio"' : "";
    const heading = list ? '<h1 id="about-name" class="about-name">Luke Caprio</h1>' : '<h1 id="route-title" tabindex="-1">Luke Caprio</h1>';
    return `<article${id} class="about-page ${list ? "about-list-document" : "about-scene-document"}" aria-labelledby="${list ? "about-name" : "route-title"}" tabindex="-1">
      <div class="about-hero">
        <figure class="about-portrait"><img src="assets/headshot.jpg" alt="Luke Caprio" width="1280" height="1600" fetchpriority="high"><figcaption>MIAMI, FLORIDA</figcaption></figure>
        <header class="about-identity"><p class="about-eyebrow">ABOUT / THE PORCH</p>${heading}<p class="about-role">Software Engineer · Miami</p></header>
        <div class="about-lead"><p>${escape(biography.bio[0])}</p></div>
      </div>
      <section class="about-section"><h2>Bio</h2>${biography.bio.slice(1).map(p=>`<p>${escape(p)}</p>`).join("")}</section>
      <section class="about-section"><h2>Education</h2><h3>${escape(ed.school)}</h3><p>${escape(ed.degree)}<br>${escape(ed.minor)}</p><p class="about-meta">${escape(ed.graduated)} · ${escape(ed.gpa)} GPA</p><ul>${ed.honors.map(h=>`<li>${escape(h)}</li>`).join("")}</ul></section>
      <section class="about-section"><h2>Experience</h2>${biography.experience.map(e=>`<section class="experience-entry"><header><h3>${escape(e.company)}</h3><p class="about-meta">${escape(e.dates)}</p></header><p class="experience-role">${escape(e.role)}</p><ul>${e.details.map(d=>`<li>${escape(d)}</li>`).join("")}</ul></section>`).join("")}</section>
      <section class="about-section"><h2>Skills</h2><div class="about-skills">${Object.entries(biography.skills).map(([group,skills])=>`<section><h3>${escape(group)}</h3><ul>${skills.map(skill=>`<li>${escape(skill)}</li>`).join("")}</ul></section>`).join("")}</div></section>
      <footer class="about-end"><span>SEE YOU AROUND THE BAY.</span>${anchor("#/contact","Say hello →")}</footer>
    </article>`;
  }

  function aboutContent() {
    return `<section id="scene-view" class="about-scene" aria-label="The Porch animated scene">${aboutDocument()}</section><section id="list-view" class="world-list about-list" aria-label="About list" hidden>${aboutDocument(true)}</section>`;
  }

  function worldSupplement(world) {
    if (world === "writing")
      return `<aside class="cross-list"><span class="card-kicker">ALSO IN WORK · 2024 · EN</span><h2>${anchor("#/writing/digits", items["/writing/digits"].title)}</h2><p>The Digits project and its paper share one home at the research dock.</p><div class="card-actions">${anchor("#/writing/digits", "Read here →")}${anchor(items["/writing/digits"].pdf, "Download PDF ↓", "download")}${anchor(items["/writing/digits"].github, "GitHub ↗")}</div></aside>`;
    if (world === "contact")
      return `<p class="list-footnote">You can also find me on ${anchor("https://linkedin.com/in/lukecaprio", "LinkedIn ↗")}.</p>`;
    return "";
  }

  function worldMarkup(world) {
    if (world === "about") return aboutContent();
    const w = worlds[world];
    const aside = world === "bizzy"
      ? `<aside class="scene-note bizzy-note"><p>A campus deals and events marketplace for students and organizers.</p><a class="text-link" href="https://bizzyu.com/">Visit Bizzy ↗</a></aside>`
      : "";
    const sign = world === "bizzy"
      ? `<div class="bizzy-scene-sign" aria-hidden="true"><img src="assets/bizzy-logo-pixel.png" alt="" /></div>`
      : "";
    return `<header class="world-intro"><p class="hero-eyebrow">${escape(w.eyebrow)}</p><h1 id="route-title" tabindex="-1">${escape(w.title)}${world === "bay" ? '<span class="title-spark" aria-hidden="true">✦</span>' : ""}</h1><p class="hero-hook">${escape(w.description)}</p><p class="hero-note">${escape(w.note)}</p></header><section id="scene-view" aria-label="${escape(w.caption)} scene">${sign}<div class="world-hotspots">${w.objects.map(hotspot).join("")}</div>${aside}</section><section id="list-view" class="panel world-list" aria-label="${escape(w.title)} list" hidden><div class="list-grid">${w.objects.map(listCard).join("")}</div>${worldSupplement(world)}</section>`;
  }

  function itemMarkup(item) {
    const home = worlds[item.home];
    return `<article class="panel item-stub" aria-labelledby="route-title"><a class="item-back" href="#/${item.home}?focus=${route.path.split("/").pop()}">← Back to ${escape(home.title)}</a><div class="reader-meta"><span>${escape(item.kind)} · ${escape(item.language)}${item.year ? " · " + escape(item.year) : ""}</span><span class="stub-badge">Custom UI coming</span></div><h1 id="route-title" tabindex="-1"${item.language === "FR" ? ' lang="fr"' : ""}>${escape(item.title)}</h1><p class="item-description">${escape(item.description)}</p>${tags(item.tags)}${itemActions(item)}<section class="reader-placeholder" aria-labelledby="reader-heading"><span class="reader-star" aria-hidden="true">✦</span><h2 id="reader-heading">Read here</h2><p>This is the on-site home for this ${item.kind.toLowerCase()}. Its custom reading experience is coming next.</p><p>${item.pdf ? "The original PDF is available above." : "No PDF has been published for this project. The source repository is available above."}</p></section><p class="reader-end">BISCAYNE BAY / ${escape(home.caption.toUpperCase())}</p></article>`;
  }

  function applyView({ focus = false } = {}) {
    const isItem = Boolean(route.item || route.missing);
    stage.dataset.view = isItem ? "reader" : mode;
    document
      .getElementById("view-switch")
      .setAttribute(
        "aria-label",
        isItem ? worlds[route.world].title + " world view" : "World view",
      );
    content
      .querySelector("#scene-view")
      ?.toggleAttribute("hidden", mode !== "scene");
    content
      .querySelector("#list-view")
      ?.toggleAttribute("hidden", mode !== "list");
    document
      .querySelectorAll("button[data-view]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(!isItem && b.dataset.view === mode),
        ),
      );
    window.MiamiScene?.setMode(isItem ? "reader" : mode);
    document.getElementById("scene-hint").innerHTML = isItem
      ? "A place for this story. <kbd>Esc</kbd> returns to the bay."
      : route.world === "about"
        ? "Make yourself at home. <kbd>Esc</kbd> returns to the bay."
      : mode === "list"
        ? "Same destinations, at a glance. <kbd>Esc</kbd> returns to the bay."
        : "Choose a place to explore. <kbd>Esc</kbd> returns to the bay.";
    if (focus)
      content.querySelector("#route-title")?.focus({ preventScroll: true });
  }

  function focusDiscoverable() {
    if (!route.focus || route.item) return false;
    const selector = mode === "scene" ? "[data-object]" : "[data-list-object]";
    const target = [...content.querySelectorAll(selector)].find(
      (el) => (el.dataset.object || el.dataset.listObject) === route.focus,
    );
    if (!target) return false;
    if (mode === "list") target.classList.add("is-highlighted");
    else window.MiamiScene?.highlight(route.focus);
    const focusable = target.matches("a,button")
      ? target
      : target.querySelector("a,button");
    focusable?.focus({ preventScroll: true });
    if (mode === "list")
      target.scrollIntoView({ block: "nearest", behavior: "instant" });
    return true;
  }

  function mount(next, moveFocus) {
    route = next;
    stage.dataset.world = route.world;
    stage.dataset.route = route.path;
    stage.dataset.hash = route.hash;
    stage.dataset.item = String(Boolean(route.item));
    content.innerHTML = route.missing
      ? `<section class="panel item-stub"><p class="card-kicker">OFF THE MAP</p><h1 id="route-title" tabindex="-1">This place isn’t on the map.</h1><p>Head back to the bay and choose a world.</p>${anchor("#/bay", "Back to bay →", 'class="action"')}</section>`
      : route.item
        ? itemMarkup(route.item)
        : worldMarkup(route.world);
    document.title =
      route.world === "bay" && !route.missing
        ? "Luke Caprio | Software Engineer · Miami"
        : `${route.missing ? "Off the map" : route.item?.title || worlds[route.world].title} | Luke Caprio`;
    document.getElementById("place-name").textContent =
      worlds[route.world].caption;
    document.querySelectorAll(".island-nav [data-world]").forEach((a) => {
      const active =
        a.dataset.world ===
        (route.world === "contact" && route.focus === "resume"
          ? "resume"
          : route.world);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const back = document.getElementById("back-to-bay");
    back.setAttribute(
      "aria-current",
      route.world === "bay" && !route.missing ? "page" : "false",
    );
    window.MiamiScene?.setWorld(route.world);
    applyView();
    document.getElementById("route-status").textContent = route.missing
      ? "Unknown location"
      : `${route.item?.title || worlds[route.world].caption}${route.item ? "" : ", " + mode + " view"}`;
    if (!focusDiscoverable() && moveFocus)
      content.querySelector("#route-title")?.focus({ preventScroll: true });
  }

  async function navigate(initial = false) {
    const next = parseHash();
    if (location.hash !== next.hash) history.replaceState(null, "", next.hash);
    const id = ++generation;
    animation?.cancel();
    const motion =
      !initial &&
      !reduced.matches &&
      !stage.classList.contains("scene-paused") &&
      typeof stage.animate === "function";
    stage.style.transformOrigin = lastOrigin;
    if (motion) {
      animation = stage.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.035)" },
        ],
        { duration: 150, easing: "ease-in", fill: "forwards" },
      );
      try {
        await animation.finished;
      } catch {
        return;
      }
    }
    if (id !== generation) return;
    mount(next, !initial);
    animation?.cancel();
    if (motion) {
      animation = stage.animate(
        [
          { opacity: 0, transform: "scale(.985)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 230, easing: "ease-out" },
      );
      try {
        await animation.finished;
      } catch {
        /* A more recent navigation owns the stage. */
      }
    }
    if (id === generation) animation = null;
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#/"]');
    if (link) {
      const bounds = link.getBoundingClientRect();
      lastOrigin = `${bounds.x + bounds.width / 2}px ${bounds.y + bounds.height / 2}px`;
      if (link.hash === location.hash) {
        e.preventDefault();
        focusDiscoverable();
      }
    }
    if (e.target.closest(".skip-link")) {
      e.preventDefault();
      content.focus({ preventScroll: true });
    }
    const view = e.target.closest("button[data-view]");
    if (view) {
      mode = view.dataset.view;
      if (route.item || route.missing) {
        location.hash = "/" + route.world;
      } else {
        applyView();
        document.getElementById("route-status").textContent =
          `${worlds[route.world].caption}, ${mode} view`;
        focusDiscoverable();
      }
    }
  });
  // Highlight the sprite itself, including when motion is paused. No tooltip chrome.
  content.addEventListener("pointerover", e => {
    const object = e.target.closest(".hotspot");
    if (object) window.MiamiScene?.highlight(object.dataset.object);
  });
  content.addEventListener("pointerout", e => {
    if (e.target.closest(".hotspot") && !e.relatedTarget?.closest?.(".hotspot")) {
      window.MiamiScene?.highlight(document.activeElement?.dataset.object || null);
    }
  });
  content.addEventListener("focusin", e => window.MiamiScene?.highlight(e.target.closest(".hotspot")?.dataset.object || null));
  content.addEventListener("focusout", e => {
    const hovered = content.querySelector(".hotspot:hover");
    window.MiamiScene?.highlight(e.relatedTarget?.dataset.object || hovered?.dataset.object || null);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !e.isComposing) {
      e.preventDefault();
      if (location.hash !== "#/bay") location.hash = "/bay";
    }
  });
  window.addEventListener("hashchange", () => navigate());
  reduced.addEventListener("change", () => {
    animation?.cancel();
    navigate(true);
  });
  navigate(true);
})();
