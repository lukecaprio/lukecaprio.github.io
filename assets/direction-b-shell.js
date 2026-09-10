/* Static Direction B shell. Source facts live in miami-content.js; prose in docs/*.txt. */
(() => {
  "use strict";
  const { items, resume, github } = window.MiamiMap;
  const biography = window.MiamiBiography;
  const layer = document.getElementById("scene-layer");
  const content = document.getElementById("world-content");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const art = window.DirectionArt.icon;
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
  const link = (href, label, cls = "action", attrs = "") =>
    `<a class="${cls}" href="${escape(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""} ${attrs}>${label}</a>`;
  const tags = (values) =>
    `<ul class="tags" aria-label="Topics">${values.map((v) => `<li>${escape(v)}</li>`).join("")}</ul>`;
  const paperPaths = {
    "/work/digits": "docs/digits-paper.txt",
    "/writing/digits": "docs/digits-paper.txt",
    "/writing/faux-noble": "docs/faux-noble-paper.txt",
    "/writing/ville-intelligente": "docs/ville-intelligente-paper.txt",
  };
  const headings = new Set([
    "Introduction",
    "Literature Review",
    "K-Means Clustering",
    "K-Nearest Neighbor Classifier (KNN)",
    "Methodology",
    "Introduction to Methodology",
    "Data Collection",
    "Data Preprocessing with K-Means",
    "Training KNN",
    "Results",
    "Model Performance",
    "Discussion",
    "Limitations",
    "Improvements and Future Research",
    "Conclusion",
    "Implications",
    "References",
    "Références",
    "Avantages de l’intelligence artificielle à Paris",
    "Problèmes de surveillance éthique",
    "Responsabilité publique",
    "Participation citoyenne et transparence",
    "Réflexions et implications globales",
  ]);
  const cache = new Map();
  const names = {
    bay: "Home",
    about: "About",
    projects: "Projects",
    writing: "Writing",
    bizzy: "Bizzy",
    contact: "Contact",
  };
  let route,
    generation = 0,
    animations = [],
    clickedOrigin = null;
  function parse(hash = location.hash) {
    let raw;
    try {
      raw = decodeURI(hash.replace(/^#/, ""));
    } catch {
      raw = "/not-found";
    }
    if (!raw || raw === "/") raw = "/bay";
    if (!raw.startsWith("/")) raw = "/" + raw;
    let [path, query = ""] = raw.split("?");
    path = path.replace(/\/$/, "");
    const aliases = {
      "/work": "/projects",
      "/home": "/bay",
      "/top": "/bay",
      "/experience": "/about",
      "/education": "/about",
      "/skills": "/about",
      "/work/digits/paper": "/writing/digits",
      "/work/ecg/paper": "/work/ecg",
      "/work/metro/paper": "/work/metro",
    };
    path = aliases[path] || path;
    const item = items[path];
    const world = item
      ? path.startsWith("/writing/")
        ? "writing"
        : "projects"
      : path.slice(1);
    const theme = item
      ? path.endsWith("/digits")
        ? "digits"
        : path.endsWith("/ecg")
          ? "ecg"
          : path.endsWith("/metro")
            ? "metro"
            : path.endsWith("/faux-noble")
              ? "salon"
              : "paris"
      : world;
    return {
      path,
      query,
      item,
      world,
      theme,
      missing: !item && !names[world],
      hash: "#" + path + (query ? "?" + query : ""),
    };
  }
  async function sourceFor(path) {
    const file = paperPaths[path];
    if (!file) return "";
    if (!cache.has(file))
      cache.set(
        file,
        fetch(file)
          .then((r) => {
            if (!r.ok) throw new Error("Paper unavailable");
            return r.text();
          })
          .catch((e) => {
            cache.delete(file);
            throw e;
          }),
      );
    return cache.get(file);
  }
  // Only unwrap extraction artifacts. Preserve all prose, original figure captions, and references.
  function joinLines(lines) {
    return lines
      .reduce((out, line) => {
        if (!out) return line;
        if (/https?:\/\/\S*$/.test(out)) return out + line; // URLs may wrap across PDF lines.
        if (/(?:K|k|machine|nearest|1|pre|k-means)-$/.test(out))
          return out + line;
        if (/[A-Za-zÀ-ÿ]{3}-$/.test(out)) return out.slice(0, -1) + line;
        return out + " " + line;
      }, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function paperText(source, path) {
    const lines = source
      .replace(/\r/g, "")
      .split("\n")
      .map((raw) => ({ raw, text: raw.replace(/\f/g, "").trim() }));
    const author = lines.findIndex((l) => l.text === "Luke Caprio");
    const title = joinLines(
      lines
        .slice(0, author)
        .map((l) => l.text)
        .filter((t) => t && !/^Caprio\s+\d+$/.test(t)),
    );
    const metadata = [];
    let begin = author + 1;
    while (
      begin < lines.length &&
      (!lines[begin].text ||
        /^(University of Miami|Université de Miami|May\s+7th,\s+2024|December\s+3rd,\s+2025|4\s+mai\s+2025|Caprio\s+\d+)$/.test(
          lines[begin].text,
        ))
    ) {
      const t = lines[begin].text;
      if (t && !/^Caprio/.test(t)) metadata.push(t);
      begin++;
    }
    const nodes = [];
    let para = [],
      references = false,
      blanks = 0;
    const flush = () => {
      if (para.length) nodes.push(`<p>${escape(joinLines(para))}</p>`);
      para = [];
    };
    for (let i = begin; i < lines.length; i++) {
      const { raw, text } = lines[i];
      if (/^Caprio\s+\d+$/.test(text)) continue;
      if (!text) {
        blanks++;
        continue;
      }
      if (/^Figure\s+[123]$/.test(text) && path.endsWith("/digits")) {
        flush();
        const n = Number(text.match(/\d/)[0]);
        const caption = [];
        while (i + 1 < lines.length && !headings.has(lines[i + 1].text)) {
          i++;
          if (lines[i].text && !/^Caprio\s+\d+$/.test(lines[i].text))
            caption.push(lines[i].text);
        }
        const captionTitle = caption.shift() || text;
        const description = joinLines(caption);
        const dimensions = [
          [557, 327],
          [1007, 914],
          [856, 894],
        ][n - 1];
        nodes.push(
          `<figure class="paper-figure"><a href="assets/paper-figures/digits-figure-${n}.png" target="_blank" rel="noopener" aria-label="Open ${escape(text)} at full size"><img src="assets/paper-figures/digits-figure-${n}.png" width="${dimensions[0]}" height="${dimensions[1]}" loading="lazy" alt="${escape(captionTitle)}"></a><figcaption><strong>${escape(text)} · ${escape(captionTitle)}</strong><span>${escape(description)}</span></figcaption></figure>`,
        );
        blanks = 0;
        continue;
      }
      if (headings.has(text)) {
        flush();
        references = /^R[eé]f/.test(text);
        nodes.push(`<h2>${escape(text)}</h2>`);
        blanks = 0;
        continue;
      }
      const indent = raw.search(/\S/);
      if (para.length && (references ? blanks >= 2 && indent < 4 : indent >= 4))
        flush();
      para.push(text);
      blanks = 0;
    }
    flush();
    return `<header class="paper-source-header"><p class="eyebrow">${path.endsWith("/digits") ? "RESEARCH PAPER · 2024" : "ESSAI · FRANÇAIS · 2025"}</p><h2>${escape(title)}</h2><p>Luke Caprio<br>${metadata.map(escape).join(" · ")}</p></header><div class="paper-source-body">${nodes.join("")}</div>`;
  }
  const title = (eyebrow, heading, description = "") =>
    `<header class="page-heading"><p class="eyebrow">${eyebrow}</p><h1 id="route-title" tabindex="-1">${heading}</h1>${description ? `<p class="lead">${description}</p>` : ""}</header>`;
  const destination = (href, label, icon, subtitle = "", className = "") =>
    link(
      href,
      `${window.HubIllustrations(icon)}<span class="landmark-label">${label}<span aria-hidden="true">↗</span></span>${subtitle ? `<small>${subtitle}</small>` : ""}`,
      `landmark ${className}`,
      "data-portal",
    );
  function home() {
    return `<section class="hub">${title("MIAMI, FLORIDA · A LITTLE CORNER OF THE INTERNET", "Luke <em>Caprio.</em>", "Software engineer. End-to-end builder.<br>At home somewhere between math, music, and Miami.")}<p class="hub-invitation"><span></span> A few places to get to know me. Step inside.</p><div class="hub-landmarks" aria-label="Explore the neighborhood">${destination("#/bizzy", "Bizzy", "bizzy", "THE GREEN ROOM", "hub-bizzy")}${destination("#/about", "About", "about", "THE APARTMENT", "hub-about")}${destination("#/projects", "Projects", "computer", "THE BOARDWALK", "hub-projects")}${destination("#/writing", "Writing", "writing", "THE BOOKSHELF", "hub-writing")}${destination("#/contact", "Contact", "contact", "THE MAILBOX", "hub-contact")}</div><div class="hub-coordinate"><span>An evening on Biscayne Bay.</span><span>Stay a little while.</span></div></section>`;
  }
  function projects() {
    return `<section class="projects-world">${title("01 / THE DESKTOP", "Built with <em>curiosity.</em>", "Projects in software, systems, and machine learning.")}<div class="computer-frame"><div class="computer-menubar"><span><i class="status-light"></i> luke / projects</span><span>03 folders</span></div><div class="computer-desktop"><div class="desktop-greeting"><span class="eyebrow">PERSONAL WORKSPACE</span><p>Open something.</p></div><div class="project-folders">${[
      "digits",
      "ecg",
      "metro",
    ]
      .map((slug, i) => {
        const item = items["/work/" + slug];
        return link(
          "#/work/" + slug,
          `<span class="folder-art">${art(slug)}</span><strong>${["Digits", "ECG", "Metro Health"][i]}</strong><span>${["MACHINE LEARNING", "CARDIAC SIGNALS", "FULL-STACK SYSTEM"][i]}</span>`,
          "project-folder",
          "data-portal",
        );
      })
      .join(
        "",
      )}</div><div class="desktop-taskbar"><span>⌘ &nbsp; Selected projects</span><span>PYTHON &nbsp; / &nbsp; TYPESCRIPT</span></div></div><div class="computer-chin"><span>lc.</span></div></div></section>`;
  }
  function writing() {
    const bookPaths = [
      "/writing/digits",
      "/writing/faux-noble",
      "/writing/ville-intelligente",
    ];
    return `<section class="writing-world">${title("02 / THE BOOKSHELF", "Notes from <em>elsewhere.</em>", "Research, French essays, and ideas worth sitting with.")}<div class="bookcase"><div class="shelf-topline"><span>RESEARCH / PAPERS</span><span>VOLUME 01—03</span></div><div class="books">${bookPaths
      .map((path, i) => {
        const item = items[path];
        return link(
          "#" + path,
          `<span class="book-binding"><small>${item.language} / ${item.year}</small><strong>${["Efficient<br>digit recognition", "Le faux<br>noble", "La ville<br>intelligente"][i]}</strong><span class="book-motif" aria-hidden="true">${["0 1<br>7 9", "✧", "╱╲"][i]}</span><span class="book-author">LUKE CAPRIO</span></span><span class="book-caption">${["K-Means + KNN", "Molière, comedy & status", "Intelligence artificielle à Paris"][i]} <span aria-hidden="true">↗</span></span>`,
          "book book-" + i,
          "data-portal",
        );
      })
      .join(
        "",
      )}<div class="shelf-keepsake" aria-hidden="true"><div class="vase"></div><span>READ.<br>THEN READ<br>AGAIN.</span></div></div><div class="empty-shelf"><div><p class="eyebrow">BIZZY BUILD LOG</p><h2>A little space for what’s next.</h2><p>Coming soon.</p></div><span class="stacked-books" aria-hidden="true"><i></i><i></i><i></i></span></div></div></section>`;
  }
  function about() {
    const ed = biography.education;
    return `<section class="about-world"><div class="apartment-details" aria-hidden="true"><div class="wall-poster"><span>AFTER<br>THE<br>SUNSET</span><small>A MIAMI EVENING</small></div><div class="apartment-desk">${art("computer")}</div></div><article class="about-document"><div class="about-hero"><figure class="portrait"><img src="assets/headshot.jpg" width="1280" height="1600" alt="Luke Caprio"><figcaption>MIAMI NOW. NAPLES ROOTS.</figcaption></figure>${title("03 / THE APARTMENT", "A little <em>about me.</em>", "Luke Caprio<br>Software Engineer · Miami")}</div><section class="story-section"><h2>At home in the details.</h2>${biography.bio.map((p) => `<p>${escape(p)}</p>`).join("")}</section><section class="story-section"><p class="eyebrow">EDUCATION</p><h2>${escape(ed.school)}</h2><p>${escape(ed.degree)}<br>${escape(ed.minor)}</p><p class="muted">${escape(ed.graduated)} · ${escape(ed.gpa)} GPA</p><ul>${ed.honors.map((v) => `<li>${escape(v)}</li>`).join("")}</ul></section><section class="story-section"><p class="eyebrow">EXPERIENCE</p>${biography.experience.map((e) => `<section class="experience"><div><h2>${escape(e.company)}</h2><p class="muted">${escape(e.dates)}</p></div><h3>${escape(e.role)}</h3><ul>${e.details.map((d) => `<li>${escape(d)}</li>`).join("")}</ul></section>`).join("")}</section><section class="story-section"><p class="eyebrow">SKILLS</p><div class="skill-groups">${Object.entries(
      biography.skills,
    )
      .map(
        ([name, skills]) =>
          `<section><h3>${escape(name)}</h3>${tags(skills)}</section>`,
      )
      .join(
        "",
      )}</div></section><footer class="document-end">SEE YOU AROUND THE BAY. ${link("#/contact", "Say hello ↗", "text-link")}</footer></article></section>`;
  }
  function bizzy() {
    return `<section class="bizzy-world"><div class="bizzy-copy">${title("04 / THE GREEN ROOM", "A good night<br>starts with <em>Bizzy.</em>", "A campus deals and nightlife/events marketplace for students and organizers.")}<p class="body-copy">I lead engineering at Bizzy, building across the backend, web, and mobile.</p><div class="actions">${link("https://bizzyu.com/", "Explore Bizzy ↗", "action primary")}${link("https://bizzyu.com/", "Get the app ↗")}</div><p class="muted app-note">App access and downloads via bizzyu.com.</p></div><div class="venue-interior" aria-hidden="true"><div class="venue-neon">Bizzy<span>Live College For Less.</span></div><div class="venue-arch"><span class="venue-pendant"></span></div><div class="bar-counter"></div><div class="bar-stools"><i></i><i></i><i></i></div></div></section>`;
  }
  function contact() {
    return `<section class="contact-world"><div>${title("05 / THE MAILBOX", "Leave a <em>note.</em>", "Have something in mind? I’d love to hear it.")}<div class="contact-links">${link("mailto:lukecaprio1@gmail.com", '<span>Email</span><strong>lukecaprio1@gmail.com</strong><b aria-hidden="true">↗</b>', "contact-row")}${link(resume, '<span>Résumé</span><strong>Luke Caprio · PDF</strong><b aria-hidden="true">↓</b>', "contact-row", 'download data-object="resume"')}${link(github, '<span>GitHub</span><strong>lukecaprio</strong><b aria-hidden="true">↗</b>', "contact-row")}${link("https://linkedin.com/in/lukecaprio", '<span>LinkedIn</span><strong>Luke Caprio</strong><b aria-hidden="true">↗</b>', "contact-row")}</div></div><div class="contact-art" aria-hidden="true">${art("contact")}<span>LETTERS FROM ANYWHERE.</span></div></section>`;
  }
  function itemPage(next, source, error) {
    const { item, path, theme } = next;
    const paper = Boolean(paperPaths[path]);
    const reader = path.startsWith("/writing/");
    const back = reader
      ? theme === "digits"
        ? "#/work/digits"
        : "#/writing"
      : "#/projects";
    const backLabel = reader
      ? theme === "digits"
        ? "Back to project"
        : "Back to Writing"
      : "Back to Projects";
    const actions = `<div class="actions">${item.pdf ? link(item.pdf, "Download PDF ↓", "action primary", "download") : ""}${item.github ? link(item.github, "GitHub ↗") : ""}${item.demo ? link(item.demo, "Watch demo ↗") : ""}</div>`;
    const paperBody = paper
      ? `<section class="native-paper" lang="${item.language === "FR" ? "fr" : "en"}"><div class="paper-toolbar"><span>FULL PAPER</span>${link(item.pdf, "Download PDF ↓", "text-link", "download")}</div>${error ? `<div class="paper-error" role="alert"><h2>The paper couldn’t load.</h2><p>Please retry, or download the original PDF above.</p><button class="action" data-retry>Retry loading</button></div>` : paperText(source, path)}</section>`
      : "";
    return `<article class="item-document theme-${theme}${reader ? " reader-first" : ""}" lang="${item.language === "FR" ? "fr" : "en"}">${link(back, "← " + backLabel, "item-back")}<div class="item-hero"><div>${title(`${{ digits: "PATTERN LAB", ecg: "CARDIAC SIGNAL LAB", metro: "HOSPITAL NIGHT WING", salon: "LE SALON", paris: "PARIS / APRÈS LA NUIT" }[theme]} / ${reader ? "PAPER" : "PROJECT"}`, escape(item.title), escape(item.description))}${tags(item.tags)}${actions}</div>${!reader ? `<div class="item-illustration" aria-hidden="true">${art(theme)}</div>` : ""}</div>${!reader && theme === "digits" ? `<div class="metrics" aria-label="Results reported in the paper"><div><strong>90</strong><span>representative images</span></div><div><strong>0.72s</strong><span>prediction time</span></div><div><strong>92.33%</strong><span>test accuracy</span></div></div><p class="paper-entry">The research, from method to results. ${link("#/writing/digits", "Open dedicated reader ↗", "text-link")}</p>` : ""}${!paper ? `<section class="project-shell-note"><span class="eyebrow">PROJECT OVERVIEW</span><h2>${theme === "ecg" ? "Learning from the heartbeat." : "Software for patient care."}</h2><p>${escape(item.description)}</p><p class="muted">Explore the source${item.demo ? " or watch the demo" : ""} above.</p></section>` : paperBody}<footer class="document-end">LUKE CAPRIO ${link(back, "← " + backLabel, "text-link")}</footer></article>`;
  }
  function originFor(next) {
    if (clickedOrigin) {
      const point = clickedOrigin;
      clickedOrigin = null;
      return point;
    }
    const target = content.querySelector(`[data-portal][href="#${next.path}"]`);
    if (target) {
      const b = (
        target.querySelector("svg, .book-binding") || target
      ).getBoundingClientRect();
      return `${b.x + b.width / 2}px ${b.y + b.height / 2}px`;
    }
    return "50% 55%";
  }
  async function animate(frames, duration, id) {
    const a = layer.animate(frames, {
      duration,
      easing: "cubic-bezier(.22,.7,.25,1)",
      fill: "forwards",
    });
    animations.push(a);
    try {
      await a.finished;
    } catch {}
    return id === generation;
  }
  async function navigate(initial = false) {
    const next = parse();
    const id = ++generation;
    animations.forEach((a) => a.cancel());
    animations = [];
    const previous = route;
    const origin = originFor(next);
    const backwards =
      previous && (next.path === "/bay" || (previous.item && !next.item));
    const fadeOnly = reduced.matches || window.DirectionScene.paused;
    const sourcePromise = sourceFor(next.path)
      .then((source) => ({ source }))
      .catch(() => ({ source: "", error: true }));
    layer.style.transformOrigin = origin;
    layer.dataset.transition = initial
      ? "none"
      : fadeOnly
        ? "fade"
        : backwards
          ? "pull"
          : "push";
    layer.dataset.transitionOrigin = origin;
    if (!initial) {
      const ok = await animate(
        fadeOnly
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
              {
                opacity: 0,
                transform: `scale(${backwards ? 0.86 : 2.4})`,
                filter: "blur(3px)",
              },
            ],
        fadeOnly ? 80 : 280,
        id,
      );
      if (!ok) return;
    }
    const result = await sourcePromise;
    if (id !== generation) return;
    route = next;
    if (location.hash !== next.hash) history.replaceState(null, "", next.hash);
    layer.dataset.world = next.world;
    layer.dataset.route = next.path;
    content.innerHTML = next.missing
      ? `<section class="missing-world">${title("OFF THE MAP", "A wrong <em>turn.</em>", "This page isn’t here. The bay is just a step away.")}${link("#/bay", "Back to Home ↗")}</section>`
      : next.item
        ? itemPage(next, result.source, result.error)
        : { bay: home, projects, writing, about, bizzy, contact }[next.world]();
    content.scrollTop = 0;
    window.DirectionScene.setWorld(next.missing ? "bay" : next.theme);
    document.body.dataset.world = next.world;
    document.body.dataset.theme = next.theme;
    document.querySelectorAll(".island-nav a").forEach((a) => {
      if (a.dataset.world === next.world)
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const back = document.getElementById("back-to-bay");
    back.hidden = next.path === "/bay";
    document.title = `${next.item?.title || names[next.world] || "Off the map"} | Luke Caprio`;
    document.getElementById("route-status").textContent =
      next.item?.title || names[next.world] || "Unknown page";
    if (!initial)
      content.querySelector("#route-title")?.focus({ preventScroll: true });
    const focus = new URLSearchParams(next.query).get("focus");
    if (focus) {
      const el =
        content.querySelector(`[data-object="${CSS.escape(focus)}"]`) ||
        content.querySelector(`[href="#/work/${CSS.escape(focus)}"]`);
      el?.focus({ preventScroll: true });
    }
    animations.forEach((a) => a.cancel());
    animations = [];
    if (!initial) {
      // Returning Home lands on the landmark just exited before pulling back.
      const returnPath =
        next.path === "/bay" ? "/" + previous.world : previous.path;
      const entrance = backwards
        ? content.querySelector(`[data-portal][href="#${returnPath}"]`)
        : null;
      if (entrance) {
        const b = entrance.getBoundingClientRect();
        layer.style.transformOrigin = `${b.x + b.width / 2}px ${b.y + b.height / 2}px`;
      }
      await animate(
        fadeOnly
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              {
                opacity: 0,
                transform: `scale(${backwards ? 1.7 : 0.95})`,
                filter: "blur(2px)",
              },
              { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
            ],
        fadeOnly ? 100 : 280,
        id,
      );
    }
    if (id === generation) {
      animations.forEach((a) => a.cancel());
      animations = [];
      layer.dataset.ready = next.path;
    }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (
      a &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey &&
      e.button === 0
    ) {
      const p = parse(a.hash);
      const portal = a.matches("[data-portal]")
        ? a
        : content.querySelector(`[data-portal][href="#${p.path}"]`);
      if (portal) {
        const b = (
          portal.querySelector("svg, .book-binding") || portal
        ).getBoundingClientRect();
        clickedOrigin = `${b.x + b.width / 2}px ${b.y + b.height / 2}px`;
      }
      if (p.hash === location.hash) {
        e.preventDefault();
        clickedOrigin = null;
      }
    }
    if (e.target.closest(".skip-link")) {
      e.preventDefault();
      content.focus();
    }
    if (e.target.closest("[data-retry]")) navigate(true);
    if (e.target.closest("#motion-toggle")) {
      const paused = !window.DirectionScene.paused;
      window.DirectionScene.setPaused(paused);
      document.body.classList.toggle("motion-paused", paused);
      const b = document.getElementById("motion-toggle");
      b.setAttribute("aria-pressed", String(paused));
      b.textContent = paused ? "Resume motion" : "Pause motion";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !e.isComposing && location.hash !== "#/bay") {
      e.preventDefault();
      location.hash = "/bay";
    }
  });
  window.addEventListener("hashchange", () => navigate());
  reduced.addEventListener("change", () => navigate(true));
  navigate(true);
})();
