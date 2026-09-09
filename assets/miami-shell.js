/* Static hash router. One shell, one renderer, one route inventory. */
(() => {
  "use strict";
  const { worlds, items, resume } = window.MiamiMap;
  const biography = window.MiamiBiography;
  const stage = document.getElementById("scene-stage");
  const content = document.getElementById("world-content");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 380px), (max-height: 660px)");
  const paperPaths = {
    "/work/digits": "docs/digits-paper.txt",
    "/writing/digits": "docs/digits-paper.txt",
    "/writing/faux-noble": "docs/faux-noble-paper.txt",
    "/writing/ville-intelligente": "docs/ville-intelligente-paper.txt",
  };
  const paperCache = new Map();
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

  async function loadPaper(path) {
    if (!paperCache.has(path)) {
      paperCache.set(path, fetch(paperPaths[path]).then((response) => {
        if (!response.ok) throw new Error(`Paper source unavailable: ${path}`);
        return response.text();
      }));
    }
    return paperCache.get(path);
  }

  const paperHeadings = {
    "/work/digits": new Set(["Introduction", "Literature Review", "K-Means Clustering", "K-Nearest Neighbor Classifier (KNN)", "Methodology", "Introduction to Methodology", "Data Collection", "Data Preprocessing with K-Means", "Training KNN", "Results", "Model Performance", "Discussion", "Limitations", "Improvements and Future Research", "Conclusion", "Implications", "References"]),
    "/writing/digits": new Set(["Introduction", "Literature Review", "K-Means Clustering", "K-Nearest Neighbor Classifier (KNN)", "Methodology", "Introduction to Methodology", "Data Collection", "Data Preprocessing with K-Means", "Training KNN", "Results", "Model Performance", "Discussion", "Limitations", "Improvements and Future Research", "Conclusion", "Implications", "References"]),
    "/writing/faux-noble": new Set([]),
    "/writing/ville-intelligente": new Set(["Introduction", "Avantages de l’intelligence artificielle à Paris", "Problèmes de surveillance éthique", "Responsabilité publique", "Participation citoyenne et transparence", "Réflexions et implications globales", "Conclusion"]),
  };

  function paperHtml(item, source, path) {
    const lines = source.replace(/\r/g, "").split("\n");
    const compactLines = lines.map((line) => ({ raw: line, text: line.replace(/\f/g, "").trim() }));
    const authorIndex = compactLines.findIndex(({ text }) => text === "Luke Caprio");
    const title = (authorIndex > 0 ? compactLines.slice(0, authorIndex).map(({ text }) => text).filter((text) => text && !/^Caprio\s+\d+$/.test(text)).join(" ") : item.title).replace(/\s+/g, " ").trim();
    const dateMatch = source.match(/(?:May\s+7th,\s+2024|December\s+3rd,\s+2025|4\s+mai\s+2025)/i);
    const date = dateMatch ? dateMatch[0] : item.year || "";
    const headings = paperHeadings[path] || new Set();
    const nodes = [];
    let paragraph = [];
    let skipFigure = false;
    const flush = () => {
      if (!paragraph.length) return;
      const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
      if (text) nodes.push(`<p>${escape(text)}</p>`);
      paragraph = [];
    };
    for (let i = authorIndex + 1; i < compactLines.length; i++) {
      const { raw, text } = compactLines[i];
      if (!text || /^Caprio\s+\d+$/.test(text)) continue;
      if (/^(University of Miami|Université de Miami|May\s+7th,\s+2024|December\s+3rd,\s+2025|4\s+mai\s+2025)$/i.test(text)) continue;
      if (skipFigure) {
        if (headings.has(text)) skipFigure = false;
        else continue;
      }
      if (/^Figure\s+\d+$/i.test(text)) {
        flush();
        nodes.push(`<p class="paper-figure-note">Figure available in the downloaded PDF.</p>`);
        skipFigure = true;
        continue;
      }
      if (headings.has(text)) {
        flush();
        nodes.push(`<h2>${escape(text)}</h2>`);
        continue;
      }
      const indent = raw.replace(/\S.*$/, "").length;
      if (paragraph.length && indent >= 4) flush();
      const previous = paragraph[paragraph.length - 1] || "";
      if (previous.endsWith("-")) paragraph[paragraph.length - 1] = previous.slice(0, -1) + text;
      else paragraph.push(text);
    }
    flush();
    return `<header class="paper-source-header"><p class="digits-kicker">${escape(item.kind.toUpperCase())} · ${escape(item.language)}${item.year ? ` · ${escape(item.year)}` : ""}</p><h2 class="paper-source-title">${escape(title || item.title)}</h2><p class="paper-source-author">Luke Caprio · ${escape(date)}</p></header><div class="paper-source-body">${nodes.join("")}</div>`;
  }

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

  function digitsActions(item, paper = false) {
    const links = [];
    if (!paper) links.push(anchor("#/writing/digits", "Read the paper →", 'class="action"'));
    if (item.pdf) links.push(anchor(item.pdf, "Download PDF ↓", 'class="action" download'));
    if (item.github) links.push(anchor(item.github, "GitHub ↗", 'class="action"'));
    if (paper) links.push(anchor("#/work/digits", "Back to project →", 'class="action"'));
    return `<div class="item-actions digits-actions">${links.join("")}</div>`;
  }

  function projectOverviewMarkup(item) {
    const home = worlds[item.home];
    const pdf = item.pdf ? anchor(item.pdf, "Download PDF ↓", 'class="action" download') : "";
    const demo = item.demo ? anchor(item.demo, "Watch demo ↗", 'class="action"') : "";
    return `<article class="panel item-stub project-overview" aria-labelledby="route-title"><a class="item-back" href="#/work?focus=${route.path.split("/").pop()}">← Back to Projects</a><div class="reader-meta"><span>${escape(item.kind)} · ${escape(item.language)}${item.year ? " · " + escape(item.year) : ""}</span><span class="card-kicker">PROJECT OVERVIEW</span></div><h1 id="route-title" tabindex="-1"${item.language === "FR" ? ' lang="fr"' : ""}>${escape(item.title)}</h1><p class="item-description">${escape(item.description)}</p>${tags(item.tags)}<div class="item-actions">${pdf}${item.github ? anchor(item.github, "GitHub ↗", 'class="action"') : ""}${demo}</div><section class="project-overview-note" aria-labelledby="overview-heading"><span class="reader-star" aria-hidden="true">✦</span><h2 id="overview-heading">Overview</h2><p>This project page keeps the published description and source links together so you can jump directly to the repository or demo.</p></section><p class="reader-end">MIAMI / ${escape(home.caption.toUpperCase())}</p></article>`;
  }

  function paperSection(item, source, path, suffix = "") {
    return `<section class="native-paper-section" aria-labelledby="native-paper-heading${suffix}"><div class="native-paper-heading"><div><p class="digits-section-label">FULL PAPER</p><h2 id="native-paper-heading${suffix}">Read the complete paper</h2><p>The full source text is presented below, with the original PDF available to download.</p></div>${item.pdf ? anchor(item.pdf, "Download PDF ↓", 'class="action" download') : ""}</div><article class="native-paper" lang="${item.language === "FR" ? "fr" : "en"}">${paperHtml(item, source, path)}</article></section>`;
  }

  function digitsMachine() {
    const tiles = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
    return `<div class="digits-machine" aria-hidden="true"><div class="digits-machine-top"><span>MNIST / PATTERN LAB</span><i></i></div><div class="digits-tile-grid">${tiles.map((digit, i) => `<span class="digits-tile tile-${i % 4}">${digit}</span>`).join("")}</div><div class="digits-orbit orbit-one"></div><div class="digits-orbit orbit-two"></div><div class="digits-machine-base"><b></b><b></b><b></b></div></div>`;
  }

  function digitsProjectMarkup(item, list = false, source = "") {
    const id = list ? "digits-list" : "route";
    return `<section id="${list ? "list-view" : "scene-view"}" class="digits-${list ? "list" : "scene"}" aria-label="Digits project ${list ? "reading view" : "arcade scene"}"><article class="digits-document digits-item ${list ? "digits-list-document" : "digits-scene-document"}" data-item-world="digits" data-rich-item="true" aria-labelledby="${id}-title" tabindex="-1">
      <a class="item-back" href="#/work?focus=digits">← Back to Projects</a>
      <div class="digits-hero"><div class="digits-copy"><p class="digits-kicker">01 / PATTERN LAB · PROJECT</p><h1 id="${id}-title" tabindex="-1">${escape(item.title)}</h1><p class="item-description">${escape(item.description)}</p>${tags(item.tags)}${digitsActions(item)}</div>${digitsMachine()}</div>
      <section class="digits-section"><p class="digits-section-label">PROJECT NOTE</p><h2>Cluster first. Classify second.</h2><p>The project pairs K-Means clustering with K-Nearest Neighbors to recognize handwritten digits. K-Means turns a large labeled training set into representative centroids; KNN then classifies each test image by its nearest example.</p></section>
      <section class="digits-metrics" aria-label="Reported results"><div><strong>90</strong><span>representative images</span></div><div><strong>0.72s</strong><span>prediction time</span></div><div><strong>92.33%</strong><span>test accuracy</span></div></section>
      ${paperSection(item, source, "/work/digits", list ? "-list" : "")}
      <section class="digits-section digits-next"><p class="digits-section-label">SOURCE LINKS</p><h2>Keep exploring</h2><p>Open the dedicated reader or source materials directly.</p><div class="item-actions">${anchor("#/writing/digits", "Open reader →", 'class="action"')}${anchor(item.pdf, "Download PDF ↓", 'class="action" download')}${anchor(item.github, "GitHub ↗", 'class="action"')}</div></section>
      <footer class="reader-end">MIAMI / DIGITS ARCADE</footer>
    </article></section>`;
  }

  function digitsPaperMarkup(item, list = false, source = "") {
    const id = list ? "digits-paper-list" : "route";
    return `<section id="${list ? "list-view" : "scene-view"}" class="digits-${list ? "list" : "scene"}" aria-label="Digits paper ${list ? "reading view" : "arcade scene"}"><article class="digits-document digits-item ${list ? "digits-list-document" : "digits-scene-document"}" data-item-world="digits" data-rich-item="true" aria-labelledby="${id}-title" tabindex="-1">
      <a class="item-back" href="#/work/digits">← Back to project</a>
      <header class="digits-paper-header"><p class="digits-kicker">02 / RESEARCH READER · 2024</p><h1 id="${id}-title" tabindex="-1">${escape(item.title)}</h1><p class="item-description">${escape(item.description)}</p>${tags(item.tags)}${digitsActions(item, true)}</header>
      ${paperSection(item, source, "/writing/digits", list ? "-list" : "")}
      <footer class="reader-end">LUKE CAPRIO / UNIVERSITY OF MIAMI · 2024</footer>
    </article></section>`;
  }

  function frenchPaperMarkup(item, list = false, source = "") {
    const id = list ? "french-list" : "route";
    const theme = item.short === "Le faux noble" ? "salon" : "paris";
    return `<section id="${list ? "list-view" : "scene-view"}" class="paper-world paper-${theme}-${list ? "list" : "scene"}" aria-label="${escape(item.title)}"><article class="paper-document paper-${theme}-document ${list ? "paper-list-document" : "paper-scene-document"}" data-rich-item="true" aria-labelledby="${id}-title" tabindex="-1"><a class="item-back" href="#/writing?focus=${escape(route.path.split("/").pop())}">← Back to Writing</a><header class="paper-hero"><p class="digits-kicker">${escape(item.kind.toUpperCase())} · ${escape(item.language)}${item.year ? ` · ${escape(item.year)}` : ""}</p><h1 id="${id}-title" tabindex="-1" lang="fr">${escape(item.title)}</h1><p class="item-description">${escape(item.description)}</p>${tags(item.tags)}<div class="item-actions">${item.pdf ? anchor(item.pdf, "Download PDF ↓", 'class="action" download') : ""}</div></header>${paperSection(item, source, route.path, list ? "-list" : "")}<footer class="reader-end">LUKE CAPRIO / ${escape(item.language === "FR" ? "FRANÇAIS" : "WRITING")}</footer></article></section>`;
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
      return `<aside class="cross-list"><span class="card-kicker">ALSO IN PROJECTS · 2024 · EN</span><h2>${anchor("#/writing/digits", items["/writing/digits"].title)}</h2><p>The Digits project and its paper share one home on the project desktop.</p><div class="card-actions">${anchor("#/writing/digits", "Read here →")}${anchor(items["/writing/digits"].pdf, "Download PDF ↓", "download")}${anchor(items["/writing/digits"].github, "GitHub ↗")}</div></aside>`;
    if (world === "contact")
      return `<p class="list-footnote">You can also find me on ${anchor("https://linkedin.com/in/lukecaprio", "LinkedIn ↗")}.</p>`;
    if (world === "bizzy")
      return `<aside class="cross-list bizzy-list-blurb"><span class="card-kicker">THE GREEN ROOM</span><p>A campus deals and events marketplace for students and organizers.</p><div class="card-actions">${anchor("https://bizzyu.com/", "Visit Bizzy ↗")}</div></aside>`;
    return "";
  }

  function worldMarkup(world) {
    if (world === "about") return aboutContent();
    if (world === "writing") return writingContent();
    const w = worlds[world];
    return `<header class="world-intro"><p class="hero-eyebrow">${escape(w.eyebrow)}</p><h1 id="route-title" tabindex="-1">${escape(w.title)}${world === "bay" ? '<span class="title-spark" aria-hidden="true">✦</span>' : ""}</h1><p class="hero-hook">${escape(w.description)}</p><p class="hero-note">${escape(w.note)}</p></header><section id="scene-view" aria-label="${escape(w.caption)} scene"><div class="world-hotspots">${w.objects.map(hotspot).join("")}</div></section><section id="list-view" class="panel world-list" aria-label="${escape(w.title)} list" hidden><div class="list-grid">${w.objects.map(listCard).join("")}</div>${worldSupplement(world)}</section>`;
  }

  function writingContent() {
    const w = worlds.writing;
    return `<header class="world-intro"><p class="hero-eyebrow">${escape(w.eyebrow)}</p><h1 id="route-title" tabindex="-1">${escape(w.title)}</h1><p class="hero-hook">${escape(w.description)}</p><p class="hero-note">${escape(w.note)}</p></header><section id="scene-view" class="writing-scene" aria-label="Bayside bookcase scene"><div class="world-hotspots">${w.objects.map(hotspot).join("")}</div></section><section id="list-view" class="panel world-list writing-list" aria-label="Writing shelves" hidden><div class="writing-shelves"><section><p class="card-kicker">RESEARCH / PAPERS</p><div class="list-grid">${w.objects.map(listCard).join("")}</div></section><section class="empty-shelf"><p class="card-kicker">BIZZY BUILD LOG</p><h2>Coming soon</h2><p>No build-log article is published yet.</p></section></div></section>`;
  }

  function itemMarkup(item, source = "") {
    if (route.path === "/work/digits") return digitsProjectMarkup(item, false, source) + digitsProjectMarkup(item, true, source);
    if (route.path === "/writing/digits") return digitsPaperMarkup(item, false, source) + digitsPaperMarkup(item, true, source);
    if (route.path === "/writing/faux-noble" || route.path === "/writing/ville-intelligente") return frenchPaperMarkup(item, false, source) + frenchPaperMarkup(item, true, source);
    if (item.home === "work") return projectOverviewMarkup(item);
    const home = worlds[item.home];
    return `<article class="panel item-stub" aria-labelledby="route-title"><a class="item-back" href="#/${item.home}?focus=${route.path.split("/").pop()}">← Back to ${escape(home.title)}</a><div class="reader-meta"><span>${escape(item.kind)} · ${escape(item.language)}${item.year ? " · " + escape(item.year) : ""}</span><span class="stub-badge">Custom UI coming</span></div><h1 id="route-title" tabindex="-1"${item.language === "FR" ? ' lang="fr"' : ""}>${escape(item.title)}</h1><p class="item-description">${escape(item.description)}</p>${tags(item.tags)}${itemActions(item)}<section class="reader-placeholder" aria-labelledby="reader-heading"><span class="reader-star" aria-hidden="true">✦</span><h2 id="reader-heading">Read here</h2><p>This is the on-site home for this ${item.kind.toLowerCase()}. Its custom reading experience is coming next.</p><p>${item.pdf ? "The original PDF is available above." : "No PDF has been published for this project. The source repository is available above."}</p></section><p class="reader-end">MIAMI / ${escape(home.caption.toUpperCase())}</p></article>`;
  }

  function applyView({ focus = false } = {}) {
    const isItem = Boolean(route.item || route.missing);
    const richItem = Boolean(route.item && content.querySelector("[data-rich-item]"));
    stage.dataset.view = isItem && !richItem ? "reader" : mode;
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
        String((!isItem || richItem) && b.dataset.view === mode),
      ),
    );
    window.MiamiScene?.setMode(isItem && !richItem ? "reader" : mode);
    document.getElementById("scene-hint").innerHTML = isItem
      ? richItem
        ? "Explore the lab. <kbd>Esc</kbd> returns to the bay."
        : "A place for this story. <kbd>Esc</kbd> returns to the bay."
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

  async function mount(next, moveFocus, token) {
    route = next;
    const source = route.item && paperPaths[route.path] ? await loadPaper(route.path).catch(() => "") : "";
    if (token !== generation) return;
    stage.dataset.world = route.world;
    stage.dataset.route = route.path;
    stage.dataset.hash = route.hash;
    stage.dataset.item = String(Boolean(route.item));
    stage.dataset.itemPath = route.item ? route.path : "";
    content.innerHTML = route.missing
      ? `<section class="panel item-stub"><p class="card-kicker">OFF THE MAP</p><h1 id="route-title" tabindex="-1">This place isn’t on the map.</h1><p>Head back to the bay and choose a world.</p>${anchor("#/bay", "Back to bay →", 'class="action"')}</section>`
      : route.item
        ? itemMarkup(route.item, source)
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
    window.MiamiScene?.setWorld(route.world, route.item ? route.path : null);
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
    await mount(next, !initial, id);
    if (id !== generation) return;
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
      const richItem = Boolean(route?.item && content.querySelector("[data-rich-item]"));
      if ((route.item || route.missing) && !richItem) {
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
