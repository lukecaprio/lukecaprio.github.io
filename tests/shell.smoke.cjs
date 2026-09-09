/* Run with Playwright available to Node; see SHELL.md. No application dependency. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.SHELL_BASE_URL || "http://127.0.0.1:3000/";
const output = process.env.SHELL_QA_DIR;
const worlds = ["bay", "about", "work", "writing", "bizzy", "contact"];
const routes = [
  "/work/ecg",
  "/work/metro",
  "/work/digits",
  "/writing/digits",
  "/writing/faux-noble",
  "/writing/ville-intelligente",
];
const expected = {
  bay: 5,
  about: 0,
  work: 3,
  writing: 2,
  bizzy: 1,
  contact: 3,
};
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks++;
}
async function ready(page, route) {
  await page.waitForFunction(
    (route) =>
      document.querySelector("#scene-stage")?.dataset.route === route &&
      document.querySelector("#scene-stage")?.dataset.hash === location.hash,
    route,
  );
  await page.waitForFunction(
    () => document.querySelector("#scene-stage").getAnimations().length === 0,
  );
}
async function go(page, route) {
  await page.goto(base + "#" + route, { waitUntil: "domcontentloaded" });
  await ready(page, route);
}
async function shot(page, name) {
  if (output) {
    fs.mkdirSync(output, { recursive: true });
    await page.screenshot({ path: path.join(output, name + ".png") });
  }
}
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.SHELL_BROWSER_CHANNEL
      ? { channel: process.env.SHELL_BROWSER_CHANNEL }
      : {}),
  });
  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      hasTouch: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", (e) => errors.push(e.message));
    await go(page, "/bay");
    const nav = await page.locator(".island-nav").elementHandle();
    check(
      (await page.locator(".hotspot").count()) === 5,
      "Bay has exactly five doors",
    );
    const navDestinations = await page
      .locator(".island-nav a[data-destination]")
      .evaluateAll((els) => els.map((el) => [el.dataset.world, el.dataset.destination, el.getAttribute("aria-label")]));
    check(
      navDestinations.length === 7 && navDestinations.every(([, destination, label]) => destination && label),
      "Island nav names every destination",
    );
    check(
      await page.locator('.island-nav [data-world="bizzy"]').evaluate((el) => el.href === "https://bizzyu.com/" && el.target === "_blank" && el.rel.includes("noopener")),
      "Island nav Bizzy opens the external site",
    );
      await page.locator('.island-nav a[data-world="work"]').hover();
    check(
      await page.locator('.island-nav a[data-world="work"]').evaluate((el) => getComputedStyle(el, "::after").content.includes("Projects")),
      "Island nav reveals Projects destination on hover",
    );
    check(
      (await page.locator('.hotspot[href^="#/work/"]').count()) === 0,
      "No project item clutter on Hub",
    );
    check(
      (await page.locator('.hotspot[href="https://bizzyu.com/"]').count()) === 1,
      "One Bizzy door",
    );
    await shot(page, "bay-desktop");
    // Real forward/back history, not just direct URL changes.
    await page.locator('.hotspot[href="#/work"]').click();
    await ready(page, "/work");
    await page.locator('.hotspot[href="#/work/ecg"]').click();
    await ready(page, "/work/ecg");
    await page.goBack();
    await ready(page, "/work");
    await page.goBack();
    await ready(page, "/bay");
    await page.goForward();
    await ready(page, "/work");
    check(true, "Back/Forward traverses Bay → Projects → item");
    await page.locator('.hotspot[href="#/work/digits"]').click();
    await ready(page, "/work/digits");
    await page.keyboard.press("Escape");
    await ready(page, "/bay");
    check(
      await nav.evaluate((el) => el === document.querySelector(".island-nav")),
      "Shell nav remains mounted",
    );
    check((await page.locator("canvas").count()) === 1, "One shared canvas");
    check(await page.locator("#scene-stage").getAttribute("aria-pressed") === null, "Stage is not mistaken for a view button");
    // Paused animation also removes route transitions.
    await page.locator("#motion-toggle").click();
    const frozen = await page.locator("canvas").evaluate((c) => c.toDataURL());
    await page.waitForTimeout(180);
    check(
      frozen === (await page.locator("canvas").evaluate((c) => c.toDataURL())),
      "Pause freezes pixels",
    );
    const workDoor = page.locator('.hotspot[href="#/work"]');
    await workDoor.hover();
    check(frozen !== await page.locator("canvas").evaluate(c => c.toDataURL()), "Hover highlights the object even while paused");
    check(await workDoor.evaluate(el => el.childElementCount === 0 && getComputedStyle(el).backgroundColor === "rgba(0, 0, 0, 0)"), "Hover target stays empty and transparent");
    await page.mouse.move(0, 0);
    check(frozen === await page.locator("canvas").evaluate(c => c.toDataURL()), "Object highlight clears without leaving overlays");
    await workDoor.focus();
    check(frozen !== await page.locator("canvas").evaluate(c => c.toDataURL()), "Keyboard focus highlights the object");
    for (const world of worlds) {
      if (world === "bizzy") await go(page, "/bizzy");
      else await page.locator(`.island-nav [data-world="${world}"]`).click();
      await ready(page, "/" + world);
      check(
        (await page.locator(".hotspot").count()) === expected[world],
        world + " scene object count",
      );
      check(
        (await page.locator("#route-title").count()) === 1,
        world + " has one page heading",
      );
      if (world === "bizzy")
        check(await page.locator('.hotspot[href="https://bizzyu.com/"]').count() === 1, "Bizzy scene keeps one factual CTA");
      const sceneLinks = await page
        .locator(".hotspot")
        .evaluateAll((els) =>
          els.map((e) => [e.dataset.object, e.getAttribute("href")]),
        );
      if (world === "about") {
        check(await page.locator("#scene-view.about-scene").isVisible(), "About Scene is its own porch world");
        check(await page.locator(".about-sections").count() === 0, "About has no jump-link row");
        check(await page.locator(".about-scene-document .about-portrait img").count() === 1, "About Scene includes headshot");
      }
      await page.locator('button[data-view="list"]').click();
      if (world === "about") {
        check(await page.locator("#about-bio").isVisible(), "About is embedded in List");
      } else {
        check(await page.locator("#list-view").isVisible(), world + " list is visible");
        check(!(await page.locator("#scene-view").isVisible()), world + " scene is hidden in list mode");
        if (world === "bizzy") {
          check(
            (await page.locator('[data-list-object="bizzy-club"] p').textContent()).includes("campus deals and events marketplace"),
            "Bizzy list keeps the factual blurb",
          );
          check(await page.locator('.bizzy-list-blurb a[href="https://bizzyu.com/"]').count() === 1, "Bizzy list keeps its CTA");
        }
      }
      check(await page.locator(".hotspot-label, .door-glow, [role=tooltip]").count() === 0, world + " has no hotspot overlay chrome");
      check(await page.locator(".hotspot").evaluateAll(els => els.every(el => el.getAttribute("aria-label")?.trim())), world + " hotspots have accessible names");
      for (const [id, href] of sceneLinks) {
        const card = page.locator(`[data-list-object="${id}"]`);
        check((await card.count()) === 1, world + " matching list entry " + id);
        if (href)
          check(
            (await card.locator("h2 a").getAttribute("href")) === href,
            "Scene/list same destination " + id,
          );
      }
      await page.locator('button[data-view="scene"]').click();
    }
    // Every door really enters its world.
    for (const world of worlds.filter((w) => w !== "bay" && w !== "bizzy")) {
      await go(page, "/bay");
      await page.locator('.hotspot[href="#/' + world + '"]').click();
      await ready(page, "/" + world);
      check(true, "Hub door → " + world);
    }
    await go(page, "/bay");
    check(
      await page.locator('.hotspot[data-object="bizzy"]').evaluate((el) => el.href === "https://bizzyu.com/" && el.target === "_blank" && el.rel.includes("noopener")),
      "Hub Bizzy door opens the external site",
    );
    for (const route of routes) {
      await go(page, route);
      const digits = route === "/work/digits" || route === "/writing/digits";
      const project = route === "/work/ecg" || route === "/work/metro";
      if (digits) {
        check(await page.locator(".digits-item").count() === 2, route + " has Scene and List documents");
        check(await page.locator(".stub-badge, .reader-placeholder").count() === 0, route + " is no longer a placeholder");
        check(await page.locator(".digits-pdf-viewer").count() === 2, route + " embeds the full PDF in Scene and List");
        check((await page.locator(".digits-pdf-viewer").first().getAttribute("data")).includes("KNNKMEANSFINALPAPER.pdf"), route + " PDF viewer points at the published paper");
      } else if (project) {
        check(await page.locator(".project-overview").count() === 1, route + " has a project overview");
        check(await page.locator(".stub-badge, .reader-placeholder").count() === 0, route + " has no fake paper gate");
      } else {
        check(
          (await page.locator(".stub-badge").textContent()) ===
            "Custom UI coming",
          route + " is explicitly a stub",
        );
        check(
          (await page.locator(".reader-placeholder h2").innerText()) ===
            "Read here",
          route + " on-site read placeholder",
        );
      }
      await page.locator(".item-description:visible").click();
      check(await page.locator("#scene-stage").getAttribute("data-route") === route, "Ordinary item content clicks do not switch world views");
      const parent =
        route === "/writing/digits" || route.startsWith("/work/")
          ? "work"
          : "writing";
      check(
        (await page.locator(".item-back:visible").getAttribute("href")).startsWith(
          "#/" + parent,
        ),
        route + " has correct home",
      );
      if (["/work/ecg", "/work/metro"].includes(route))
        check(
          (await page.locator(".unavailable-action, a[download]").count()) === 0,
          route + " does not fabricate a PDF",
        );
      else {
        const pdf = await page
          .locator(".item-actions a[download]:visible")
          .first()
          .getAttribute("href");
        const response = await page.request.get(new URL(pdf, base).href);
        check(response.ok(), route + " PDF returns 200");
        check(
          (response.headers()["content-type"] || "").includes("pdf"),
          route + " download is a PDF",
        );
      }
      if (route.startsWith("/work/") || route === "/writing/digits")
        check(
            (await page
            .locator('.item-actions a[href*="github.com"]:visible')
            .count()) >= 1,
          route + " GitHub exists",
        );
      if (digits) {
        check(await page.locator('.digits-actions a[href="#/writing/digits"], .digits-actions a[href="#/work/digits"]').count() >= 1, route + " has internal cross-link");
        await page.locator('button[data-view="scene"]').click();
        check(await page.locator("#scene-view").evaluate((el) => el.scrollHeight > el.clientHeight), route + " Scene scrolls");
        await page.locator('button[data-view="list"]').click();
        check(await page.locator("#list-view").isVisible(), route + " List view is available");
        check(await page.locator("#list-view").evaluate((el) => el.scrollHeight > el.clientHeight), route + " List scrolls");
      }
      await page.locator(".item-back:visible").click();
      await ready(page, route === "/writing/digits" ? "/work/digits" : "/" + parent);
    }
    await go(page, "/writing");
    check(
      (await page.locator('.hotspot[href="#/writing/digits"]').count()) === 0,
      "Digits paper has no duplicate Bookshop prop",
    );
    await page.locator('button[data-view="list"]').click();
    check(
      (await page.locator('.cross-list a[href="#/writing/digits"]').count()) >
        0,
      "Writing list cross-links Digits",
    );
    await page.locator('.island-nav [data-world="resume"]').click();
    await ready(page, "/contact");
    check(
      await page
        .locator('[data-list-object="resume"]')
        .evaluate((el) => el.contains(document.activeElement)),
      "Résumé nav focuses list noticeboard",
    );
    await page.locator('button[data-view="scene"]').click();
    check(
      await page
        .locator('[data-object="resume"]')
        .evaluate((el) => el === document.activeElement),
      "Résumé focus survives Scene switch",
    );
    await go(page, "/work/digits");
    await shot(page, "item-desktop");
    await go(page, "/writing");
    await shot(page, "writing-desktop");
    await go(page, "/about");
    await shot(page, "about-desktop");
    check(await page.locator("[data-show-list], [data-focus-bio]").count() === 0, "About has no second-click gate");
    check(await page.locator(".about-scene-document .about-portrait img").evaluate(img => img.complete && img.naturalWidth > 0 && img.getAttribute("src") === "assets/headshot.jpg"), "Provided headshot loads immediately");
    check(await page.locator(".about-scene-document details").count() === 0, "Experience is expanded on arrival");
    check(await page.locator(".about-scene-document .about-section").count() === 4, "Bio, education, experience and skills are embedded");
    check(await page.locator(".about-sections, .about-links").count() === 0, "About has no jump or link dump chrome");
    check(await page.locator('.about-scene-document .about-end a[href="#/contact"]').count() === 1, "About keeps one quiet contact link");
    check(await page.locator(".about-scene-document").innerText().then((t) => t.includes("University of Miami") && t.includes("May 2026") && t.includes("Retentive Labs") && t.includes("Outlier") && t.includes("piano") && t.includes("DJ") && t.includes("basketball")), "About uses the sharper current bio");
    await page.locator('button[data-view="list"]').click();
    check(await page.locator("#about-bio").isVisible(), "About List immediately shows biography");
    check(await page.locator(".about-list-document .about-section").count() === 4, "About List keeps every section");
    check(await page.locator(".about-list-document").innerText().then((t) => t.includes("University of Miami") && t.includes("Retentive Labs") && t.includes("Python")), "Education, experience and skills migrated");
    await page.locator('button[data-view="scene"]').click();
    // Safe unknown route, canonical aliases and rapid navigation during a transition.
    await go(page, "/missing");
    check(
      (await page.locator("#route-title").innerText()) ===
        "This place isn’t on the map.",
      "Unknown route has a way home",
    );
    await page.goto(base + "#/projects");
    await ready(page, "/work");
    check(page.url().endsWith("#/work"), "Legacy route normalizes");
    await page.locator("#motion-toggle").click();
    await page.evaluate(() => {
      location.hash = "/about";
      setTimeout(() => {
        location.hash = "/contact";
      }, 40);
    });
    await ready(page, "/contact");
    check(
      (await page.locator("h1").innerText()) === "Contact",
      "Rapid navigation settles on latest route",
    );
    // Mobile scene targets and touch-style navigation.
    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, "/bay");
    await page.locator('button[data-view="scene"]').click();
    await shot(page, "bay-mobile");
    for (const world of worlds) {
      await go(page, "/" + world);
      const boxes = await page.locator(".hotspot").evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return {
            id: e.dataset.object,
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
          };
        }),
      );
      for (const r of boxes)
        check(
          r.w >= 44 && r.h >= 44 && r.x >= 0 && r.x + r.w <= 390,
          world + " large visible target " + r.id,
        );
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i],
            b = boxes[j];
          check(
            !(
              a.x < b.x + b.w &&
              a.x + a.w > b.x &&
              a.y < b.y + b.h &&
              a.y + a.h > b.y
            ),
            world + " targets do not overlap",
          );
        }
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        world + " no horizontal overflow",
      );
    }
    await go(page, "/work");
    await page
      .locator('.hotspot[href="#/work/metro"]')
      .tap({ force: true })
      .catch(() => page.locator('.hotspot[href="#/work/metro"]').click());
    await ready(page, "/work/metro");
    await shot(page, "item-mobile");
    await go(page, "/about");
    await shot(page, "about-mobile");
    check(await page.locator(".about-scene-document img").isVisible(), "Mobile About shows headshot on arrival");
    check(await page.locator(".about-scene-document").evaluate(el => el.scrollWidth <= el.clientWidth), "Mobile About content fits its frame");
    check(await page.locator(".about-scene").evaluate(el => el.scrollHeight > el.clientHeight), "Mobile About Scene has a natural scroll column");
    check(await page.locator(".about-scene").evaluate(el => { el.scrollTop = 260; return el.scrollTop > 0; }), "Mobile About Scene scrolls inside the world");
    const aboutText = await page.locator(".about-scene-document").textContent();
    await page.locator('button[data-view="list"]').click();
    check(await page.locator(".about-list-document").textContent() === aboutText, "About List has the same complete content");
    check(await page.locator(".about-list").evaluate(el => el.scrollHeight > el.clientHeight), "Mobile About List has a natural scroll column");
    await shot(page, "about-list-mobile");
    await go(page, "/work/digits");
    await page.locator('button[data-view="scene"]').click();
    check(await page.locator(".digits-scene").evaluate(el => el.scrollHeight > el.clientHeight), "Mobile Digits Scene scrolls inside the world");
    check(await page.locator(".digits-scene-document").evaluate(el => el.scrollWidth <= el.clientWidth), "Mobile Digits Scene fits its frame");
    await page.locator('button[data-view="list"]').click();
    check(await page.locator(".digits-list").evaluate(el => el.scrollHeight > el.clientHeight), "Mobile Digits List scrolls inside the world");
    check(await page.locator(".digits-list-document").evaluate(el => el.scrollWidth <= el.clientWidth), "Mobile Digits List fits its frame");
    // Reduced motion starts in List and never zooms, including after explicit Scene choice.
    const quiet = await browser.newContext({
      viewport: { width: 320, height: 568 },
      reducedMotion: "reduce",
    });
    const reducedPage = await quiet.newPage();
    reducedPage.on("pageerror", (e) => errors.push(e.message));
    await go(reducedPage, "/bay");
    check(
      await reducedPage.locator("#list-view").isVisible(),
      "Reduced-motion default is List",
    );
    check(
      (await reducedPage
        .locator("#motion-toggle")
        .getAttribute("aria-pressed")) === "true",
      "Reduced-motion starts paused",
    );
    await reducedPage.locator('button[data-view="scene"]').click();
    await reducedPage.waitForTimeout(100);
    const still = await reducedPage
      .locator("canvas")
      .evaluate((c) => c.toDataURL());
    await reducedPage.waitForTimeout(150);
    check(
      still ===
        (await reducedPage.locator("canvas").evaluate((c) => c.toDataURL())),
      "Reduced-motion Scene remains still",
    );
    await reducedPage.locator('.island-nav [data-world="work"]').click();
    await ready(reducedPage, "/work");
    check(
      await reducedPage
        .locator("#scene-stage")
        .evaluate((el) => el.getAnimations().length === 0),
      "Reduced-motion route has no transition",
    );
    await reducedPage.locator('button[data-view="list"]').click();
    await shot(reducedPage, "tiny-list");
    check(
      await reducedPage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Tiny screen fits",
    );
    // All native links still available if scripts are disabled.
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJs.newPage();
    await plain.goto(base);
    check(
      (await plain.locator(".no-script a").count()) === 9,
      "No-JS direct destinations remain",
    );
    check(
      errors.length === 0,
      "No browser runtime errors: " + errors.join("; "),
    );
    console.log(
      `PASS: ${checks} shell checks, desktop/mobile history, all routes/doors/items, list parity, reduced motion and downloads.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
