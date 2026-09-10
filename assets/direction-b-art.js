/* Direction B: resolution-independent illustration and a restrained ambient canvas. */
(() => {
  let svgCount = 0;
  const svg = (body, box = "0 0 240 200") =>
    `<svg viewBox="${box}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#9cc1da"/><stop offset="1" stop-color="#25384e"/></linearGradient><linearGradient id="screen" x2="1" y2="1"><stop stop-color="#172a49"/><stop offset=".5" stop-color="#49677f"/><stop offset="1" stop-color="#d78e9f"/></linearGradient><linearGradient id="wood" x2="0" y2="1"><stop stop-color="#795247"/><stop offset="1" stop-color="#342c36"/></linearGradient></defs>${body}</svg>`;
  const art = {
    computer: `<ellipse cx="120" cy="178" rx="104" ry="11" fill="#091524" opacity=".3"/><path d="M22 144H218L231 161H9Z" fill="#bda198"/><path d="M25 163V196M213 163V196" stroke="#493c46" stroke-width="9"/><rect x="38" y="31" width="162" height="111" rx="9" fill="#233247" stroke="#bad7e2" stroke-width="2"/><rect x="46" y="39" width="146" height="90" rx="4" fill="url(#screen)"/><path d="M47 107Q105 60 192 98V128H47" fill="#66cecc" opacity=".4"/><circle cx="163" cy="66" r="16" fill="#ffe1c2" opacity=".8"/><path d="M108 143V152H137V143" fill="#758a9a"/><path d="M85 154H155" stroke="#c4d5dc" stroke-width="4"/><rect x="62" y="149" width="34" height="5" rx="2" fill="#64778a"/><path d="M203 117H222V140H203Z" fill="#e4c0aa"/><path d="M222 120Q238 127 222 135" stroke="#e4c0aa" stroke-width="3"/><path d="M207 111Q212 103 207 96" stroke="#d9ccc6" opacity=".5"/>`,
    about: `<ellipse cx="120" cy="187" rx="110" ry="9" fill="#091524" opacity=".35"/><path d="M29 79L55 44H185L211 79" fill="#a88c8c"/><path d="M33 78H207V172H33Z" fill="#dbb4a7"/><path d="M28 77H212" stroke="#f4c9b1" stroke-width="8"/><rect x="133" y="101" width="50" height="52" rx="2" fill="#f7c58f" stroke="#6d555b" stroke-width="6"/><path d="M157 78V150M131 127H184" stroke="#765c61" stroke-width="3"/><path d="M134 104L145 150M181 104L171 150" stroke="#fff0d8" stroke-width="9" opacity=".5"/><rect x="64" y="94" width="42" height="78" rx="20" fill="#4b5666"/><path d="M70 119a15 15 0 0 1 30 0" fill="#e9bd86"/><circle cx="98" cy="140" r="2" fill="#fbdcb0"/><path d="M50 173H118L127 187H40Z" fill="#96878b"/><path d="M120 181L120 174M145 181L145 168M170 181L170 174M194 181L194 168" stroke="#3b474b" stroke-width="5"/><path d="M115 174Q132 148 150 172Q172 151 204 172V186H115Z" fill="#456963"/><rect x="43" y="110" width="8" height="13" rx="3" fill="#ffe5a4"/>`,
    bizzy: `<ellipse cx="120" cy="183" rx="111" ry="11" fill="#061c18" opacity=".4"/><path d="M21 67H218V173H21Z" fill="#173b37"/><path d="M218 67L233 82V172L218 173" fill="#092a28"/><rect x="30" y="49" width="178" height="35" rx="4" fill="#102926" stroke="#a5f0a2" stroke-width="2"/><text x="119" y="75" text-anchor="middle" font-size="29" font-family="sans-serif" font-weight="800" font-style="italic" fill="#b4fb99">Bizzy</text><path d="M15 88H223" stroke="#a8fcab" stroke-width="5"/><path d="M24 94H217L208 110H31Z" fill="#296156"/><path d="M44 96L49 109M78 96L81 109M111 96V109M146 96L143 109M181 96L176 109" stroke="#9dce8a" stroke-width="13"/><rect x="41" y="119" width="43" height="40" rx="2" fill="#102827" stroke="#689e78"/><rect x="146" y="119" width="43" height="40" rx="2" fill="#102827" stroke="#689e78"/><path d="M96 173V119Q114 102 132 119V173" fill="#b5e5ac"/><path d="M104 173V126H124V173" fill="#32635a"/><path d="M7 174H230L238 184H2Z" fill="#447261"/><path d="M48 127V151M59 131V151M70 124V151M155 128V151M166 123V151M178 133V151" stroke="#79d590" stroke-width="3"/>`,
    writing: `<ellipse cx="120" cy="188" rx="88" ry="9" fill="#091524" opacity=".3"/><rect x="44" y="30" width="155" height="153" rx="4" fill="url(#wood)" stroke="#bf9780" stroke-width="3"/><rect x="56" y="42" width="131" height="128" fill="#292934"/><path d="M49 104H194M49 174H194" stroke="#b28c73" stroke-width="8"/><path d="M58 56H70V99H58ZM75 64H87V99H75Z" fill="#95c4bf"/><path d="M96 48H110V99H96ZM117 59H132V99H117Z" fill="#cc9b99"/><path d="M142 53L156 50L170 98L156 102Z" fill="#d6b678"/><path d="M170 63H182V99H170Z" fill="#63839e"/><path d="M65 132H103V143H65ZM62 145H108V155H62ZM66 157H111V168H66Z" fill="#baadb8"/><rect x="133" y="143" width="34" height="25" rx="5" fill="#d6a689"/><path d="M151 145V117Q127 123 130 111Q147 109 151 130Q160 107 172 114Q172 127 151 135" fill="#819c7e"/><path d="M48 31H194" stroke="#f6b7d5" stroke-width="3"/><path d="M51 183V196M187 183V196" stroke="#53414b" stroke-width="7"/>`,
    contact: `<ellipse cx="125" cy="187" rx="75" ry="8" fill="#091524" opacity=".3"/><path d="M111 116H124V186H111Z" fill="#7a6977"/><path d="M66 117V70Q66 43 92 43H150Q178 43 178 70V117Z" fill="#a7c7c6"/><path d="M66 117V70Q66 43 92 43Q119 43 119 70V117Z" fill="#77949f"/><rect x="70" y="91" width="39" height="4" rx="2" fill="#253c51"/><path d="M150 82V28H178V47H154" fill="#f0aab8"/><path d="M75 93L95 63L112 98Z" fill="#f4d9c6"/><path d="M75 93L97 89L95 63" stroke="#c5998f"/><path d="M76 119H180" stroke="#d1dfd7" stroke-width="3"/><path d="M149 180Q136 154 144 143Q161 156 155 183M156 184Q162 150 181 155Q182 171 156 184" fill="#5d8d7b"/>`,
  };
  art.digits = `<rect x="27" y="29" width="186" height="146" rx="16" fill="#253449" stroke="#88bfcf"/><path d="M27 60H213" stroke="#6b8eab"/><circle cx="43" cy="45" r="4" fill="#d19dac"/><circle cx="57" cy="45" r="4" fill="#e6c794"/><circle cx="71" cy="45" r="4" fill="#8ec4bb"/>${[3, 7, 2, 8, 1, 0].map((n, i) => `<rect x="${44 + (i % 3) * 52}" y="${75 + Math.floor(i / 3) * 43}" width="43" height="36" rx="5" fill="#426277"/><text x="${65 + (i % 3) * 52}" y="${103 + Math.floor(i / 3) * 43}" text-anchor="middle" fill="${i % 2 ? "#efb2c5" : "#a4ebdf"}" font-size="28" font-family="serif" font-style="italic">${n}</text>`).join("")}`;
  art.ecg = `<rect x="22" y="35" width="197" height="132" rx="15" fill="#152f38" stroke="#789f9f"/><path d="M35 53H205V143H35Z" fill="#0c252c"/><path d="M35 76H205M35 98H205M35 120H205M65 53V143M95 53V143M125 53V143M155 53V143M185 53V143" stroke="#29484d"/><path d="M36 105H73L83 93L96 119L109 66L120 129L130 105H170L180 93L192 105H205" stroke="#9fdfb3" stroke-width="3" stroke-linejoin="round"/><circle cx="193" cy="155" r="4" fill="#98d9bb"/>`;
  art.metro = `<path d="M39 52H201V177H39Z" fill="#42596c" stroke="#a6c2cc"/><rect x="53" y="71" width="134" height="88" rx="6" fill="#182f46"/><path d="M92 161V91H147V161" fill="#a8bdc4"/><path d="M119 92V159" stroke="#405a70"/><path d="M66 83V142M174 83V142" stroke="#aad8d4" stroke-width="3"/><path d="M109 32H132V42H143V60H132V72H109V60H97V42H109Z" fill="#addccf"/>`;
  window.DirectionArt = {
    icon: (type) => {
      const id = ++svgCount;
      return svg(art[type] || art.computer).replace(
        /(glass|screen|wood)(?=[\"\)])/g,
        (name) => name + id,
      );
    },
  };

  const canvas = document.getElementById("miami-scene");
  const ctx = canvas.getContext("2d", { alpha: false });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let w = 0,
    h = 0,
    world = "bay",
    clock = 0,
    raf = 0,
    last = 0,
    paused = false,
    px = 0,
    py = 0;
  function rect(x, y, ww, hh, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, ww, hh);
  }
  function line(points, color, width = 1) {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function glow(x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function ellipse(x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function sky() {
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.73);
    g.addColorStop(0, "#1a314f");
    g.addColorStop(0.34, "#826780");
    g.addColorStop(0.64, "#eea4b0");
    g.addColorStop(1, "#f7c6af");
    rect(0, 0, w, h, g);
    glow(w * 0.71, h * 0.42, w * 0.3, "#efbcaa55");
    ellipse(
      w * (w < 600 ? 0.8 : 0.73),
      h * (w < 600 ? 0.46 : 0.44),
      h * (w < 600 ? 0.06 : 0.085),
      h * (w < 600 ? 0.06 : 0.085),
      "#ffe5be",
    );
    for (let i = 0; i < 6; i++) {
      const x = ((i * 0.22 * w + clock * 2) % (w * 1.3)) - 0.15 * w;
      const y = h * (0.16 + (i % 3) * 0.1);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.10, y);
      ctx.bezierCurveTo(x - w * 0.065, y - 4, x - w * 0.055, y - 15, x, y - 10);
      ctx.bezierCurveTo(x + w * 0.025, y - 23, x + w * 0.07, y - 9, x + w * 0.105, y);
      ctx.quadraticCurveTo(x, y + 7, x - w * 0.10, y);
      ctx.fillStyle = i % 2 ? "#f6c4bd25" : "#c598b130";
      ctx.fill();
      line([[x - w * 0.075, y + 1], [x + w * 0.075, y + 1]], "#ffd9c524", 1);
    }
  }
  function skyline(base, scale = 1) {
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 32; i++) {
        const seed = Math.sin(i * 41.7 + layer * 9) * 0.5 + 0.5;
        const bw = w / 36;
        const x = (i * w) / 29 - bw + layer * 11;
        const bh = (25 + seed * 110) * scale;
        rect(x, base - bh, bw, bh, layer ? "#526076" : "#8b8196");
        rect(x + 4, base - bh - 6, bw - 8, 6, layer ? "#77748a" : "#aea0ac");
        if (i % 4 === 0)
          line(
            [
              [x + bw / 2, base - bh],
              [x + bw / 2, base - bh - 18],
            ],
            "#a6a0af",
            1,
          );
        for (let row = 0; row < bh / 13 - 1; row++) {
          for (let col = 0; col < 3; col++) {
            if ((i + row + col) % 4)
              rect(
                x + 5 + col * bw * 0.24,
                base - bh + 8 + row * 13,
                2.5,
                4,
                (row + col + i) % 3 ? "#d7c2b34d" : "#a6e0d087",
              );
          }
        }
      }
    }
  }
  function bay() {
    sky();
    const base = h * 0.52;
    ctx.save();
    ctx.translate(px * 4, py * 2);
    skyline(base, w < 600 ? 0.5 : 0.85);
    ctx.restore();
    const g = ctx.createLinearGradient(0, base, 0, h);
    g.addColorStop(0, "#718599");
    g.addColorStop(0.5, "#4e7988");
    g.addColorStop(1, "#233d55");
    rect(0, base, w, h - base, g);
    for (let i = 0; i < 95; i++) {
      const y = base + (i / 95) ** 1.55 * h * 0.4;
      const seed = Math.sin(i * 47.3);
      const x = (seed * 0.5 + 0.5) * w + Math.sin(clock * 0.3 + i) * 10;
      line(
        [
          [x, y],
          [x + 12 + (y - base) * 0.16, y],
        ],
        i % 4 ? "#b2d3cd20" : "#f1c2b860",
        0.8,
      );
      const band = (y - base) * 0.34;
      line(
        [
          [w * 0.73 - band + seed * 12, y],
          [w * 0.73 + band + seed * 12, y],
        ],
        "#fbd4b926",
        1.3,
      );
    }
    // Water continues beneath every landing; only the very near bank breaks the bay.
    for (let i = 0; i < 32; i++) {
      const y = h * (0.73 + i / 32 * 0.27);
      const x = (Math.sin(i * 23.4) * 0.5 + 0.5) * w;
      line([[x, y], [x + 22 + i * 1.8, y + Math.sin(clock + i) * 1.1]],
        i % 3 ? "#8ccecb25" : "#efbdb540", 1.3);
    }
    // Small irregular shoreline corners anchor the palms without a shelf across the scene.
    for (const side of [0, 1]) {
      ctx.save();
      ctx.translate(side ? w : 0, h);
      ctx.scale(side ? -1 : 1, 1);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.095);
      ctx.bezierCurveTo(w * 0.035, -h * 0.065, w * 0.08, -h * 0.03, w * 0.16, 0);
      ctx.lineTo(0, 0);
      ctx.fillStyle = "#34484f";
      ctx.fill();
      ellipse(w * 0.028, -h * 0.025, w * 0.025, h * 0.012, "#738786");
      ctx.restore();
    }
    palm(w * 0.02, h * 0.7, w < 600 ? 0.6 : 1, -0.45);
    palm(w * 0.985, h * 0.69, w < 600 ? 0.55 : 0.95, 0.4);
  }
  function palm(x, y, s, lean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.quadraticCurveTo(lean * 80, 40, 0, -105);
    ctx.strokeStyle = "#263b4b";
    ctx.lineWidth = 10;
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.sin(clock * 0.3) * 0.035,
        dx = Math.cos(a) * 140,
        dy = Math.sin(a) * 65;
      ctx.beginPath();
      ctx.moveTo(0, -105);
      ctx.quadraticCurveTo(dx * 0.5, -135 + dy * 0.4, dx, -80 + dy);
      ctx.quadraticCurveTo(dx * 0.6, -105 + dy * 0.45, 0, -105);
      ctx.fillStyle = i % 2 ? "#29484d" : "#355d5c";
      ctx.fill();
      for (let j = 1; j < 7; j++) {
        const f = j / 7;
        line(
          [
            [dx * f, -105 + dy * f - 20 * Math.sin(f * Math.PI)],
            [dx * f - 16 * Math.cos(a + 1), -105 + dy * f + 13],
          ],
          "#2f5356",
          2,
        );
      }
    }
    ctx.restore();
  }
  function room() {
    const palettes = {
      about: ["#30354b", "#716573"],
      writing: ["#262a40", "#4d3545"],
      bizzy: ["#102a2b", "#193b36"],
      contact: ["#26364c", "#506979"],
      ecg: ["#0c2631", "#26484e"],
      metro: ["#182c45", "#4c657a"],
      digits: ["#17253d", "#494362"],
      salon: ["#34283d", "#634151"],
      paris: ["#172c45", "#485570"],
      projects: ["#23314b", "#4c506b"],
    };
    const p = palettes[world] || palettes.about;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, p[0]);
    g.addColorStop(1, p[1]);
    rect(0, 0, w, h, g);
    glow(
      w * 0.8,
      h * 0.3,
      w * 0.45,
      world === "bizzy" ? "#67d78c20" : "#d1a0bf25",
    );
    const floor = h * 0.8;
    rect(0, floor, w, h - floor, "#111e3044");
    for (let i = 0; i < 8; i++)
      line(
        [
          [w * 0.5, floor],
          [(i * w) / 6, h],
        ],
        "#a9a2b016",
      );
    line(
      [
        [0, floor],
        [w, floor],
      ],
      "#ccbca51c",
    );
    if (["about", "contact", "writing"].includes(world)) {
      const x = w * 0.68,
        y = h * 0.18,
        ww = w * 0.27,
        hh = h * 0.52;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, ww, hh, ww / 2);
      ctx.clip();
      sky();
      skyline(y + hh * 0.7, 0.5);
      rect(x, y + hh * 0.7, ww, hh * 0.3, "#648a94");
      for (let i = 0; i < 16; i++)
        line(
          [
            [x + Math.sin(i * 9) * ww + ww / 2, y + hh * 0.73 + i * 8],
            [x + ww * 0.65, y + hh * 0.73 + i * 8],
          ],
          "#e2c1b52c",
        );
      ctx.restore();
      ctx.beginPath();
      ctx.roundRect(x, y, ww, hh, ww / 2);
      ctx.strokeStyle = "#bac0bd44";
      ctx.lineWidth = 8;
      ctx.stroke();
      line(
        [
          [x + ww / 2, y],
          [x + ww / 2, y + hh],
        ],
        "#293348",
        5,
      );
      line(
        [
          [x, y + hh * 0.57],
          [x + ww, y + hh * 0.57],
        ],
        "#293348",
        5,
      );
      rect(x - 10, y + hh, w * 0.29, 8, "#a1979277");
    }
    if (world === "bizzy") {
      for (let i = 0; i < 8; i++) {
        rect((w * (i + 0.4)) / 8, h * 0.23, 2, h * 0.54, "#8beeaa25");
        glow((w * (i + 0.4)) / 8, h * 0.23, 38, "#8feeaa20");
      }
      ellipse(w * 0.72, h * 0.26, 50, 50, "#83bb9a22");
    }
    if (world === "ecg") {
      for (let y = 0; y < h; y += 36)
        line(
          [
            [0, y],
            [w, y],
          ],
          "#9bd5c307",
        );
      for (let x = 0; x < w; x += 36)
        line(
          [
            [x, 0],
            [x, h],
          ],
          "#9bd5c307",
        );
      const pts = [];
      for (let x = 0; x < w; x += 3) {
        const a = (x + clock * 25) % 220;
        const pulse =
          a > 80 && a < 110
            ? Math.sin(((a - 80) / 30) * Math.PI * 2) * 70
            : Math.sin(x * 0.08) * 2;
        pts.push([x, h * 0.68 + pulse]);
      }
      line(pts, "#7fdbbe55", 2);
    }
    if (world === "metro") {
      for (let i = 0; i < 5; i++) {
        const x = w * (0.6 + i * 0.09);
        rect(x, h * 0.2, w * 0.06, h * 0.54, "#a1c6d713");
        rect(x + 4, h * 0.21, 3, h * 0.5, "#a1e6e53a");
      }
      glow(w * 0.86, h * 0.22, 90, "#b6d9e32a");
    }
    if (world === "digits" || world === "projects") {
      for (let i = 0; i < 30; i++) {
        const x = (Math.sin(i * 7) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 11) * 0.5 + 0.5) * h;
        ellipse(
          x + Math.sin(clock * 0.2 + i) * 8,
          y + Math.cos(clock * 0.2 + i) * 7,
          2 + (i % 4),
          2 + (i % 4),
          i % 2 ? "#96e0d429" : "#ecb2cf26",
        );
      }
    }
    if (world === "salon") {
      for (const x of [0, w * 0.9]) {
        const g = ctx.createLinearGradient(x, 0, x + w * 0.1, 0);
        g.addColorStop(0, "#482636");
        g.addColorStop(0.5, "#71495a");
        g.addColorStop(1, "#36263a");
        rect(x, 0, w * 0.1, h, g);
      }
      line(
        [
          [w * 0.12, h * 0.17],
          [w * 0.88, h * 0.17],
        ],
        "#c5a17455",
        2,
      );
    }
    if (world === "paris") {
      const x = w * 0.85,
        b = h * 0.85;
      line(
        [
          [x - 65, b],
          [x, b - h * 0.45],
          [x + 65, b],
        ],
        "#b3bfba55",
        4,
      );
      line(
        [
          [x - 36, b - h * 0.18],
          [x + 36, b - h * 0.18],
        ],
        "#b3bfba55",
        3,
      );
      for (let i = 0; i < 7; i++)
        line(
          [
            [w * 0.68 + i * 20, h * 0.15],
            [w * 0.68 + i * 20, h * 0.3 + i * 20],
            [w * 0.96, h * 0.3 + i * 20],
          ],
          "#87d8d51a",
        );
    }
  }
  function draw() {
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    world === "bay" ? bay() : room();
  }
  function tick(now) {
    raf = 0;
    if (!paused && !reduced.matches && !document.hidden) {
      clock += Math.min((now - last) / 1000 || 0, 0.05);
      last = now;
      draw();
      raf = requestAnimationFrame(tick);
    }
  }
  function start() {
    cancelAnimationFrame(raf);
    last = performance.now();
    draw();
    if (!paused && !reduced.matches && !document.hidden)
      raf = requestAnimationFrame(tick);
  }
  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener("visibilitychange", start);
  reduced.addEventListener("change", start);
  document.addEventListener(
    "pointermove",
    (e) => {
      if (!reduced.matches && !paused) {
        px = e.clientX / Math.max(w, 1) - 0.5;
        py = e.clientY / Math.max(h, 1) - 0.5;
      }
    },
    { passive: true },
  );
  window.DirectionScene = {
    setWorld(value) {
      world = value;
      start();
    },
    setPaused(value) {
      paused = value;
      start();
    },
    get paused() {
      return paused;
    },
  };
  resize();
  start();
})();
