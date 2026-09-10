/* Direction B browser contract: static routes, transitions, complete native prose, mobile reading. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.SHELL_BASE_URL || "http://127.0.0.1:3000";
const shots = process.env.SHELL_QA_DIR;
let checks = 0;
const check = (value, message) => {
  assert.ok(value, message);
  checks++;
};
const normalize = (t) => t.replace(/[\s\-\u00ad]/g, "").toLowerCase();
const paperSources = {
  "/work/digits": "digits",
  "/writing/digits": "digits",
  "/writing/faux-noble": "faux-noble",
  "/writing/ville-intelligente": "ville-intelligente",
};
const routes = [
  "/bay",
  "/projects",
  "/writing",
  "/about",
  "/bizzy",
  "/contact",
  "/work/digits",
  "/work/ecg",
  "/work/metro",
  "/writing/digits",
  "/writing/faux-noble",
  "/writing/ville-intelligente",
];
async function ready(page, route) {
  await page.waitForFunction(
    (r) =>
      document.querySelector("#scene-layer")?.dataset.ready === r &&
      !document.querySelector("#scene-layer").getAnimations().length,
    route,
  );
}
async function go(page, route, canonical = route) {
  await page.goto(base + "/#" + route);
  await ready(page, canonical);
}
async function screenshot(page, name) {
  if (shots) {
    fs.mkdirSync(shots, { recursive: true });
    await page.screenshot({ path: path.join(shots, name + ".png") });
  }
}
async function scrollInside(page) {
  const area = page.locator("#world-content");
  await area.evaluate((e) => (e.scrollTop = 0));
  const box = await page
    .locator(".native-paper, .about-document, .bookcase, .computer-frame")
    .first()
    .boundingBox();
  await page.mouse.move(
    Math.min(box.x + box.width / 2, 370),
    Math.min(Math.max(box.y + 100, 400), 700),
  );
  await page.mouse.wheel(0, 800);
  await page.waitForFunction(
    () => document.querySelector("#world-content").scrollTop > 0,
  );
  check(
    await area.evaluate((e) => e.scrollTop > 0),
    "Wheel scrolls while pointer is inside the content",
  );
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
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("pageerror", (e) => errors.push(e.message));
    await go(page, "/bay");
    check(
      (await page.locator("#view-switch, [data-view], #list-view").count()) ===
        0,
      "Scene/List UI and hidden duplicate documents are gone",
    );
    const nav = await page.locator(".island-nav").elementHandle();
    const labels = await page.locator(".island-nav a").evaluateAll((els) =>
      els.map((el) => {
        const copy = el.cloneNode(true);
        copy.querySelectorAll("[aria-hidden]").forEach((e) => e.remove());
        return copy.textContent.trim();
      }),
    );
    check(
      JSON.stringify(labels) ===
        JSON.stringify([
          "Home",
          "About",
          "Projects",
          "Writing",
          "Bizzy",
          "Contact",
        ]),
      "Exact six-item nav",
    );
    check(
      (await page.locator(".hub-landmarks [data-portal]").count()) === 5,
      "Exactly five Home landmarks",
    );
    await page.locator('.island-nav [data-world="projects"]').focus();
    check(
      await page
        .locator('.island-nav [data-world="projects"]')
        .evaluate((el) =>
          getComputedStyle(el, "::after").content.includes("Projects"),
        ),
      "Keyboard focus names the destination",
    );
    await page.keyboard.press("Enter");
    await ready(page, "/projects");
    check(
      await page
        .locator("#route-title")
        .evaluate((el) => el === document.activeElement),
      "Keyboard navigation focuses the new page heading",
    );
    await page.keyboard.press("Escape");
    await ready(page, "/bay");
    for (const dest of ["bizzy", "about", "projects", "writing", "contact"]) {
      await go(page, "/bay");
      const portal = page.locator(`.hub-landmarks [href="#/${dest}"]`);
      check(
        await portal.locator(".landmark-label").isVisible(),
        dest + " has a persistent label",
      );
      const box = await portal.boundingBox();
      check(box.width >= 44 && box.height >= 44, dest + " large hit target");
      await portal.click();
      await page.waitForFunction(
        () => document.querySelector("#scene-layer").getAnimations().length > 0,
      );
      check(
        await page
          .locator("#scene-layer")
          .evaluate(
            (e) =>
              e.dataset.transition === "push" &&
              e.dataset.transitionOrigin !== "50% 55%",
          ),
        dest + " zoom uses landmark origin",
      );
      await ready(page, "/" + dest);
      check(
        await nav.evaluate((e) => e === document.querySelector(".island-nav")),
        "Navigation persists",
      );
      await page.locator("#back-to-bay").click();
      await ready(page, "/bay");
      check(
        (await page.locator("#scene-layer").getAttribute("data-transition")) ===
          "pull",
        "Return pulls back into Home",
      );
    }
    // Real history through a project folder, then back and forward.
    await page.locator(".hub-projects").click();
    await ready(page, "/projects");
    await page.locator('.project-folder[href="#/work/digits"]').click();
    await ready(page, "/work/digits");
    await page.goBack();
    await ready(page, "/projects");
    await page.goForward();
    await ready(page, "/work/digits");
    checks++;
    await page.keyboard.press("Escape");
    await ready(page, "/bay");
    checks++;
    for (const route of routes) {
      await go(page, route);
      await page.reload();
      await ready(page, route);
      check(
        (await page.locator("h1").count()) === 1,
        route + " has one heading on cold load",
      );
      check(
        (await page.locator('.island-nav a[aria-current="page"]').count()) ===
          1,
        route + " active nav",
      );
      check(
        await page
          .locator("#world-content")
          .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
        route + " no horizontal overflow",
      );
      check(
        (await page
          .locator("iframe, object, .reader-placeholder, [data-view]")
          .count()) === 0,
        route + " no iframe, stub gate, or toggle",
      );
      if (paperSources[route]) {
        const expected = fs
          .readFileSync(
            path.join(
              __dirname,
              "../docs/" + paperSources[route] + "-paper.txt",
            ),
            "utf8",
          )
          .split("\n")
          .map((t) => t.replace(/\f/g, "").trim())
          .filter((t) => t && !/^Caprio\s+\d+$/.test(t));
        const actual = normalize(
          await page.locator(".native-paper").innerText(),
        );
        const missing = expected.filter(
          (line) => !actual.includes(normalize(line)),
        );
        check(
          missing.length === 0,
          route +
            " preserves every source line: " +
            missing.slice(0, 3).join(" / "),
        );
        check(
          (await page.locator(".native-paper").getAttribute("lang")) ===
            (route.endsWith("digits") ? "en" : "fr"),
          route + " paper language",
        );
        const download = page.locator(".paper-toolbar a[download]");
        check(await download.isVisible(), route + " visible download");
        const response = await page.request.get(
          new URL(await download.getAttribute("href"), base).href,
        );
        check(
          response.ok() &&
            (response.headers()["content-type"] || "").includes("pdf"),
          route + " PDF serves",
        );
        const figures = page.locator(".paper-figure img");
        check(
          (await figures.count()) === (route.endsWith("digits") ? 3 : 0),
          route + " exact source figure count",
        );
        for (const img of await figures.all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate((e) => e.decode());
          check(
            await img.evaluate((e) => e.naturalWidth > 500),
            "Actual PDF figure loads at useful resolution",
          );
        }
        await scrollInside(page);
      }
      if (route === "/projects")
        check(
          (await page.locator(".computer-frame .project-folder").count()) === 3,
          "Desktop exposes all three folders",
        );
      if (route === "/writing") {
        check(
          (await page.locator(".bookcase .book").count()) === 3,
          "Writing has three research books",
        );
        check(
          (await page.locator(".empty-shelf a").count()) === 0,
          "Bizzy shelf stays empty",
        );
      }
      if (route === "/bizzy") {
        const actions = page.locator(".bizzy-copy .actions a");
        check((await actions.count()) === 2, "Bizzy website and app CTAs");
        check(
          await actions.evaluateAll((els) =>
            els.every(
              (e) =>
                e.href === "https://bizzyu.com/" &&
                e.target === "_blank" &&
                e.rel.includes("noopener"),
            ),
          ),
          "Bizzy CTAs use real site with safe new tabs",
        );
      }
      if (["/work/ecg", "/work/metro"].includes(route)) {
        check(
          (await page.locator(".project-shell-note").count()) === 1,
          "Overview shell without paper claims",
        );
        check(
          (await page.locator(".native-paper, a[download]").count()) === 0,
          "No invented project paper",
        );
        check(
          (await page.locator('.item-hero a[href*="github.com"]').count()) ===
            1,
          "Project source link",
        );
      }
      if (route === "/about") {
        check(
          await page
            .locator(".portrait img")
            .evaluate((e) => e.complete && e.naturalWidth > 0),
          "About headshot loads",
        );
        check(
          (await page.locator(".experience").count()) === 3,
          "All existing experience entries",
        );
        check(
          (await page.locator(".about-document").innerText()).includes(
            "May 2026",
          ),
          "About graduation preserved",
        );
        await scrollInside(page);
      }
      if (route === "/contact")
        check(
          (await page.locator('a[download][data-object="resume"]').count()) ===
            1,
          "Contact keeps résumé",
        );
      await page.locator("#world-content").evaluate((e) => (e.scrollTop = 0));
      await screenshot(page, "desktop" + route.replaceAll("/", "-"));
    }
    for (const [alias, canonical] of [
      ["/home", "/bay"],
      ["/work", "/projects"],
      ["/work/digits/paper", "/writing/digits"],
      ["/work/ecg/paper", "/work/ecg"],
      ["/work/metro/paper", "/work/metro"],
      ["/contact?focus=resume", "/contact"],
    ]) {
      await go(page, alias, canonical);
      checks++;
    }
    await go(page, "/not-found");
    check(
      await page.locator(".missing-world").isVisible(),
      "Unknown routes have a real way home",
    );
    await go(page, "/bay");
    await page.locator("#motion-toggle").click();
    let frozen = await page.locator("canvas").evaluate((e) => e.toDataURL());
    await page.waitForTimeout(150);
    check(
      frozen === (await page.locator("canvas").evaluate((e) => e.toDataURL())),
      "Pause freezes canvas",
    );
    await page.locator("#motion-toggle").click();
    await page.waitForTimeout(150);
    check(
      frozen !== (await page.locator("canvas").evaluate((e) => e.toDataURL())),
      "Resume restores ambience",
    );
    // Latest route wins even if a paper source is still loading.
    const race = await context.newPage();
    await race.route("**/docs/digits-paper.txt", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await r.continue();
    });
    await go(race, "/bay");
    await race.evaluate(() => {
      location.hash = "/work/digits";
    });
    await race.waitForTimeout(320);
    await race.evaluate(() => {
      location.hash = "/contact";
    });
    await ready(race, "/contact");
    await race.waitForTimeout(500);
    check(
      (await race.locator("#scene-layer").getAttribute("data-route")) ===
        "/contact",
      "Slow paper cannot overwrite newer route",
    );
    await race.close();
    // Source failures are explicit, downloadable, and retryable.
    const failed = await context.newPage();
    await failed.route("**/docs/digits-paper.txt", (r) => r.abort());
    await go(failed, "/writing/digits");
    check(
      await failed.locator(".paper-error").isVisible(),
      "Source failure displays a fallback",
    );
    check(
      (await failed.locator("a[download]").count()) >= 1,
      "Download survives source failure",
    );
    await failed.unroute("**/docs/digits-paper.txt");
    await failed.locator("[data-retry]").click();
    await failed.waitForSelector(".paper-source-body");
    check(
      (await failed.locator(".paper-error").count()) === 0,
      "Source can be retried",
    );
    await failed.close();
    // Mobile touch layout, reading and large destinations.
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of routes) {
      await go(page, route);
      check(
        await page
          .locator("#world-content")
          .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
        "390px " + route + " no overflow",
      );
      check(
        await page
          .locator(".island-nav")
          .evaluate((e) => e.getBoundingClientRect().right <= innerWidth),
        "390px nav fits",
      );
      if (paperSources[route] || route === "/about") await scrollInside(page);
      if (route === "/bay") {
        for (const a of await page.locator("[data-portal]").all()) {
          const r = await a.boundingBox();
          check(r.width >= 44 && r.height >= 44, "390px large portal");
        }
        check(
          await page.locator(".hub-contact").isVisible(),
          "All mobile landmarks visible",
        );
      }
      await page.locator("#world-content").evaluate((e) => (e.scrollTop = 0));
      await screenshot(page, "mobile" + route.replaceAll("/", "-"));
    }
    await page.setViewportSize({ width: 320, height: 740 });
    await go(page, "/bay");
    check(
      await page
        .locator("#world-content")
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      "320px Home fits",
    );
    const motion = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const rp = await motion.newPage();
    await go(rp, "/bay");
    frozen = await rp.locator("canvas").evaluate((e) => e.toDataURL());
    await rp.waitForTimeout(120);
    check(
      frozen === (await rp.locator("canvas").evaluate((e) => e.toDataURL())),
      "Reduced motion freezes ambient canvas",
    );
    await rp.locator(".hub-projects").click();
    await ready(rp, "/projects");
    check(
      (await rp.locator("#scene-layer").getAttribute("data-transition")) ===
        "fade",
      "Reduced motion uses short fade",
    );
    await motion.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const np = await nojs.newPage();
    await np.goto(base);
    check(
      (await np.locator("noscript a").count()) >= 10,
      "Static no-JS source inventory",
    );
    await nojs.close();
    check(
      errors.length === 0,
      "No browser runtime errors: " + errors.join("; "),
    );
    check(
      fs.readFileSync(path.join(__dirname, "../CNAME"), "utf8").trim() ===
        "lukecaprio.com",
      "CNAME preserved",
    );
    console.log(
      `PASS: ${checks} Direction B checks — routes, camera transitions, complete source prose/figures, failure recovery, desktop/mobile, and reduced motion.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
