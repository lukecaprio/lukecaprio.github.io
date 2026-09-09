/* An original, procedural pixel scene. No renderer, image downloads, or build step.
 * Art is cached in layers; only water, clouds, boats and fronds redraw at 30 fps.
 * MiamiMap owns world objects and coordinates for both artwork and HTML links. */
(() => {
  "use strict";
  const canvas = document.getElementById("miami-scene");
  const hero = document.querySelector(".miami-hero");
  const toggle = document.getElementById("motion-toggle");
  if (!canvas || !hero || !toggle) return;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 600px)");
  let W,
    H,
    horizon,
    shore,
    points,
    sky,
    city,
    land,
    frame = 0;
  let paused = reduced.matches,
    visible = true,
    elapsed = 0,
    last = 0;
  let highlighted = null, highlightLayer = null;
  let currentWorld = "bay",
    currentItem = null,
    mode = "scene";
  let pointer = 0,
    drift = 0;
  let bizzyLogoCanvas = null;
  const bizzyLogoImage = new Image();
  bizzyLogoImage.onload = () => {
    const logo = document.createElement("canvas");
    logo.width = bizzyLogoImage.naturalWidth;
    logo.height = bizzyLogoImage.naturalHeight;
    const brush = logo.getContext("2d");
    brush.drawImage(bizzyLogoImage, 0, 0);
    const pixels = brush.getImageData(0, 0, logo.width, logo.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
      if (r < 52 && g < 52 && b < 52) pixels.data[i + 3] = 0;
    }
    brush.putImageData(pixels, 0, 0);
    bizzyLogoCanvas = logo;
    if (W) resize();
  };
  bizzyLogoImage.src = "assets/bizzy-logo-pixel.png";
  const random = (seed) => {
    let n = seed;
    return () => {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
  };
  function rect(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
  }
  function poly(c, coords, color) {
    c.fillStyle = color;
    c.beginPath();
    coords.forEach(([x, y], i) =>
      i
        ? c.lineTo(Math.round(x), Math.round(y))
        : c.moveTo(Math.round(x), Math.round(y)),
    );
    c.closePath();
    c.fill();
  }
  function line(c, x, y, ex, ey, color, width = 1) {
    // Bresenham keeps every contour pixel-crisp.
    x = Math.round(x);
    y = Math.round(y);
    ex = Math.round(ex);
    ey = Math.round(ey);
    let dx = Math.abs(ex - x),
      dy = -Math.abs(ey - y),
      sx = x < ex ? 1 : -1,
      sy = y < ey ? 1 : -1,
      err = dx + dy;
    for (let i = 0; i < 4000; i++) {
      rect(c, x, y, width, width, color);
      if (x === ex && y === ey) break;
      const e = err * 2;
      if (e >= dy) {
        err += dy;
        x += sx;
      }
      if (e <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  function ellipse(c, x, y, rx, ry, color) {
    for (let yy = -ry; yy <= ry; yy++) {
      const xx = Math.sqrt(1 - (yy * yy) / (ry * ry)) * rx;
      rect(c, x - xx, y + yy, xx * 2, 1, color);
    }
  }
  function makeLayer(draw) {
    const el = document.createElement("canvas");
    el.width = W;
    el.height = H;
    draw(el.getContext("2d"));
    return el;
  }
  function mix(a, b, t) {
    const rgb = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const aa = rgb(a),
      bb = rgb(b);
    return (
      "#" +
      aa
        .map((v, i) =>
          Math.round(v + (bb[i] - v) * t)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }
  // Tiny bitmap lettering is painted into actual buildings; UI text stays in HTML.
  const glyphs = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    I: ["111", "010", "010", "010", "010", "010", "111"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    " ": ["000", "000", "000", "000", "000", "000", "000"],
  };
  function letters(c, text, x, y, color, size = 1) {
    for (const char of text) {
      const rows = glyphs[char] || glyphs[" "];
      rows.forEach((row, yy) =>
        [...row].forEach((p, xx) => {
          if (p === "1")
            rect(c, x + xx * size, y + yy * size, size, size, color);
        }),
      );
      x += (rows[0].length + 1) * size;
    }
  }
  function drawBizzyLogo(c, x, y, w, h) {
    if (!bizzyLogoCanvas) return;
    c.save();
    c.imageSmoothingEnabled = false;
    c.drawImage(bizzyLogoCanvas, x, y, w, h);
    c.restore();
  }
  function skyLayer(c) {
    const stops = [
      [0, "#49375f"],
      [0.22, "#935782"],
      [0.5, "#e584a6"],
      [0.8, "#ffb2ad"],
      [1, "#ffd0a5"],
    ];
    for (let y = 0; y < horizon; y += 2) {
      const p = y / horizon;
      let i = 1;
      while (i < stops.length - 1 && p > stops[i][0]) i++;
      rect(
        c,
        0,
        y,
        W,
        2,
        mix(
          stops[i - 1][1],
          stops[i][1],
          (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]),
        ),
      );
    }
    const sx = W * (mobile.matches ? 0.57 : 0.62),
      sy = horizon - 39,
      r = mobile.matches ? 38 : 49;
    for (let i = 5; i > 0; i--) {
      c.globalAlpha = 0.025;
      ellipse(c, sx, sy, r + i * 14, r + i * 11, "#fff1b0");
    }
    c.globalAlpha = 1;
    for (let y = -r; y <= r; y++) {
      if (y > 7 && (y + 3) % 9 < 3) continue;
      const half = Math.sqrt(r * r - y * y);
      rect(
        c,
        sx - half,
        sy + y,
        half * 2,
        1,
        mix("#fff5c5", "#ffa68e", (y + r) / (2 * r)),
      );
    }
    const rng = random(38);
    for (let i = 0; i < 75; i++) {
      const x = rng() * W,
        y = rng() * horizon * 0.5;
      c.globalAlpha = 0.12 + rng() * 0.36;
      rect(c, x, y, 1, 1, "#ffe3c2");
      if (i % 12 === 0) {
        rect(c, x - 1, y, 3, 1, "#ffd9cb");
        rect(c, x, y - 1, 1, 3, "#ffd9cb");
      }
    }
    c.globalAlpha = 1;
    // A narrow, hazy island at the far edge of the bay.
    for (let x = 0; x < W; x += 4) {
      rect(c, x, horizon - 5 - rng() * 4, 5, 12, "#af7f9d");
    }
  }
  function building(c, x, base, w, h, tone, rng, detail = true) {
    const y = base - h;
    rect(c, x, y, w, h, tone);
    rect(c, x + w - 5, y, 5, h, "#413958");
    rect(c, x, y, w, 2, "#d195a6");
    if (h > 55) {
      rect(c, x + 3, y - 3, w - 6, 3, tone);
      rect(c, x + 7, y - 6, w - 14, 3, tone);
      if (rng() > 0.6) rect(c, x + w * 0.6, y - 17, 1, 12, "#6c5473");
    }
    if (detail) {
      for (let yy = y + 6; yy < base - 3; yy += 7) {
        rect(c, x + 2, yy, w - 8, 1, "#ac88a043");
        for (let xx = x + 4; xx < x + w - 7; xx += 5) {
          const n = rng();
          rect(
            c,
            xx,
            yy + 2,
            2,
            3,
            n > 0.83
              ? "#ffdab0"
              : n > 0.57
                ? "#b4cbb9"
                : n > 0.3
                  ? "#8dc4cb"
                  : "#715478",
          );
        }
      }
      rect(c, x + 1, y + 3, 1, h - 3, "#bc91ac");
    }
  }
  function cityLayer(c) {
    const rng = random(927),
      base = horizon + 5;
    // Three independently colored depth planes and rooftop silhouettes.
    for (let x = -10; x < W; ) {
      let w = 9 + rng() * 18,
        h = 12 + rng() * 48;
      building(c, x, base - 4, w, h, "#ba88a4", rng, false);
      x += w + 3;
    }
    for (let x = -10; x < W; ) {
      let w = 14 + rng() * 19,
        h = 15 + rng() * 66;
      if (x > W * 0.42 && x < W * 0.69) h *= 0.48;
      building(c, x, base, w, h, "#8b7195", rng);
      x += w + 5;
    }
    for (let x = 8; x < W; ) {
      let w = 15 + rng() * 26,
        h = 28 + rng() * 76;
      if (x > W * 0.4 && x < W * 0.67) {
        x += 70;
        continue;
      }
      building(c, x, base + 4, w, h, "#615674", rng);
      x += w + 14 + rng() * 30;
    }
    // Brickell-style glass crown and illuminated vertical edges.
    const x = W * 0.8 - 13,
      y = horizon - 80,
      b = base + 6;
    rect(c, x, y, 27, b - y, "#424560");
    rect(c, x + 4, y - 8, 19, 8, "#605773");
    rect(c, x + 8, y - 14, 11, 6, "#7c6684");
    for (let i = 2; i < 26; i += 5) {
      rect(c, x + i, y + 3, 1, b - y - 3, "#a0c6ca");
      for (let j = y + 7; j < b; j += 8) rect(c, x + i + 1, j, 2, 2, "#d8aabd");
    }

    rect(c, 0, base + 5, W, 3, "#474968");
    rect(c, 0, base + 8, W, 2, "#b58baf");
    for (let xx = 0; xx < W; xx += 13) {
      rect(c, xx, base + 7, 2, 1, "#ffe3b0");
    }
  }
  function cloud(c, x, y, w, tone) {
    // Stepped silhouettes, thin peach under-light, and separate wisps.
    poly(
      c,
      [
        [x, y],
        [x + 8, y],
        [x + 8, y - 3],
        [x + 18, y - 3],
        [x + 18, y - 6],
        [x + w * 0.4, y - 6],
        [x + w * 0.4, y - 4],
        [x + w * 0.66, y - 4],
        [x + w * 0.66, y - 1],
        [x + w - 8, y - 1],
        [x + w - 8, y + 2],
        [x + w, y + 2],
        [x + w, y + 5],
        [x, y + 5],
      ],
      tone,
    );
    rect(c, x + 9, y + 5, w - 15, 1, "#fbb5c1");
    rect(c, x - 13, y + 9, w * 0.5, 1, tone);
    rect(c, x + w * 0.65, y + 8, w * 0.5, 2, tone);
  }
  function aboutScene(c, t) {
    // A separate porch at blue hour: darker, quieter, and built from its own layers.
    const stops = [[0, "#172541"], [0.35, "#354b67"], [0.7, "#805475"], [1, "#c77b86"]];
    for (let y = 0; y < H; y += 2) {
      const p = y / H;
      let i = 1;
      while (i < stops.length - 1 && p > stops[i][0]) i++;
      rect(c, 0, y, W, 2, mix(stops[i - 1][1], stops[i][1], (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    }
    const rng = random(712);
    for (let i = 0; i < 100; i++) {
      const x = rng() * W, y = rng() * H * 0.58;
      c.globalAlpha = 0.18 + rng() * 0.48;
      rect(c, x, y, i % 9 === 0 ? 2 : 1, i % 9 === 0 ? 2 : 1, "#d9e7d7");
    }
    c.globalAlpha = 1;
    const moonX = W * 0.78, moonY = H * 0.23;
    ellipse(c, moonX, moonY, mobile.matches ? 23 : 34, mobile.matches ? 23 : 34, "#ffd6c3");
    ellipse(c, moonX - 7, moonY - 4, mobile.matches ? 20 : 30, mobile.matches ? 20 : 30, "#e7b0bb55");
    const base = H * 0.66;
    for (let x = 0; x < W; x += 28) {
      const h = 18 + ((x * 17) % 43);
      rect(c, x, base - h, 21, h, "#243449");
      rect(c, x + 4, base - h + 8, 3, 2, "#d3a4ae88");
      rect(c, x + 12, base - h + 17, 3, 2, "#d3a4ae55");
    }
    for (const px of [W * 0.08, W * 0.91]) {
      const sway = Math.sin(t * 0.9 + px) * 4;
      line(c, px, base + 20, px + sway, base - 105, "#1c3b49", 4);
      for (let i = 0; i < 6; i++) {
        const ang = -2.9 + i * 1.12 + Math.sin(t + i) * 0.025;
        line(c, px + sway, base - 100, px + sway + Math.cos(ang) * 28, base - 100 + Math.sin(ang) * 21, "#22494d", 4);
      }
    }
    poly(c, [[0, H * 0.73], [W, H * 0.69], [W, H], [0, H]], "#1c2837");
    for (let y = H * 0.76; y < H; y += 13) line(c, 0, y, W, y - 5, "#344152", 2);
    const railY = H * 0.78;
    rect(c, 0, railY, W, 8, "#b27683");
    rect(c, 0, railY + 8, W, 3, "#533c58");
    for (let x = 24; x < W; x += mobile.matches ? 52 : 78) {
      rect(c, x, railY - 4, 7, H * 0.22, "#68475d");
      rect(c, x + 2, railY - 1, 3, H * 0.19, "#d08d92");
    }
    line(c, 0, H * 0.49, W, H * 0.46, "#3b3a55", 2);
    for (let i = 0; i < 13; i++) {
      const x = (i / 12) * W, y = H * 0.49 - (i / 12) * H * 0.03;
      c.globalAlpha = 0.55 + Math.sin(t * 2 + i) * 0.25;
      ellipse(c, x, y + 4, 4, 4, i % 3 ? "#ffbd9b" : "#9dffe0");
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 9; i++) {
      const x = ((i * 137 + t * (8 + i)) % (W + 30)) - 15,
        y = H * (0.42 + (i % 4) * 0.055) + Math.sin(t * 1.7 + i) * 7;
      c.globalAlpha = 0.35 + Math.sin(t * 2.4 + i) * 0.18;
      rect(c, x, y, 3, 3, "#b7ffcf");
    }
    c.globalAlpha = 1;
  }

  function digitsScene(c, t) {
    // A separate night arcade world for the Digits project and paper reader.
    const stops = [[0, "#090d24"], [0.38, "#171442"], [0.72, "#351348"], [1, "#100c23"]];
    for (let y = 0; y < H; y += 2) {
      const p = y / H;
      let i = 1;
      while (i < stops.length - 1 && p > stops[i][0]) i++;
      rect(c, 0, y, W, 2, mix(stops[i - 1][1], stops[i][1], (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    }
    const rng = random(1771);
    for (let i = 0; i < 90; i++) {
      const x = rng() * W, y = rng() * H * 0.58;
      rect(c, x, y, i % 8 === 0 ? 2 : 1, i % 8 === 0 ? 2 : 1, i % 3 ? "#8df7ef88" : "#ff75ce99");
    }
    // Neon horizon and perspective grid.
    const vanY = H * 0.61;
    line(c, 0, vanY, W, vanY, "#ff66c8", 2);
    for (let i = 1; i < 9; i++) {
      const y = vanY + Math.pow(i / 9, 1.65) * H * 0.42;
      line(c, 0, y, W, y, i % 2 ? "#5ee8e455" : "#ff64c866", 1);
    }
    for (let i = -8; i <= 8; i++) {
      const bx = W / 2 + i * W * 0.085;
      line(c, W / 2, vanY, bx, H, "#4de7df55", 1);
    }
    // Floating clustering orbs and their links.
    const nodes = [
      [W * 0.17, H * 0.34, 16, "#ff6fc8"], [W * 0.31, H * 0.47, 11, "#6af2e4"],
      [W * 0.52, H * 0.31, 20, "#ff9bdd"], [W * 0.7, H * 0.46, 13, "#66e8df"],
      [W * 0.84, H * 0.3, 17, "#ff74c8"],
    ];
    nodes.forEach(([x, y, r, color], i) => {
      const bob = Math.sin(t * 1.1 + i * 1.7) * 5;
      nodes.slice(i + 1).forEach(([nx, ny]) => {
        if (Math.abs(nx - x) < W * 0.4) line(c, x, y + bob, nx, ny + Math.sin(t + i) * 4, color + "55", 1);
      });
      ellipse(c, x, y + bob, r + 5, r + 5, color + "18");
      ellipse(c, x, y + bob, r, r, color + "66");
      ellipse(c, x, y + bob, r * 0.52, r * 0.52, color);
    });
    // A row of dark cabinets anchors the lab without competing with the HTML reader.
    const cabinetY = H * 0.72;
    for (let i = 0; i < 5; i++) {
      const x = W * 0.08 + i * W * 0.2;
      rect(c, x, cabinetY, W * 0.12, H * 0.21, "#10152c");
      rect(c, x + 5, cabinetY + 6, W * 0.12 - 10, H * 0.13, i % 2 ? "#18294a" : "#271742");
      rect(c, x + 9, cabinetY + 13, W * 0.12 - 18, 2, i % 2 ? "#5ef1e5" : "#ff64c8");
      letters(c, String(i + 1), x + W * 0.055, cabinetY + 34, i % 2 ? "#6af2e4" : "#ff83d2", 2);
      rect(c, x + 8, cabinetY + H * 0.17, W * 0.12 - 16, 3, "#52305c");
    }
    for (let i = 0; i < 16; i++) {
      const x = ((i * 97 + t * (8 + i % 3) * 2) % (W + 80)) - 40;
      const y = H * (0.16 + (i % 5) * 0.09);
      rect(c, x, y, 2 + (i % 3), 1, i % 2 ? "#ff6fc8aa" : "#6af2e4aa");
    }
    rect(c, 0, H - 10, W, 10, "#080a19");
  }

  function projectIcon(c, object, t) {
    const p = points[object.id];
    if (!p) return;
    const size = mobile.matches ? 58 : 72;
    const x = p.x - size / 2, y = p.y - size / 2;
    const active = highlighted === object.id;
    const accent = object.id === "ecg" ? "#78f1d2" : object.id === "metro" ? "#8cc7ff" : "#ff78ce";
    if (active) {
      c.globalAlpha = 0.22 + Math.sin(t * 3) * 0.08;
      rect(c, x - 10, y - 10, size + 20, size + 20, accent);
      c.globalAlpha = 1;
    }
    // Folder-like desktop icon with a tiny project-specific screen.
    rect(c, x + 4, y + 5, size - 8, size - 6, "#090c1d");
    rect(c, x + 8, y + 9, size - 16, size - 23, accent + "44");
    rect(c, x + 8, y + 9, size - 16, 3, accent);
    if (object.id === "ecg") {
      for (let i = 0; i < 4; i++) line(c, x + 12 + i * 7, y + 26, x + 16 + i * 7, y + 20 - (i % 2) * 5, accent, 2);
    } else if (object.id === "metro") {
      rect(c, x + 19, y + 18, size - 38, size - 38, "#8cc7ff33");
      line(c, x + size / 2, y + 20, x + size / 2, y + size - 16, accent, 2);
      line(c, x + 20, y + size / 2, x + size - 20, y + size / 2, accent, 2);
    } else {
      letters(c, "8", x + size * 0.38, y + 17, accent, 3);
    }
    rect(c, x + 11, y + size - 14, size - 22, 3, "#f4e6ff66");
    rect(c, x + 14, y + size - 8, size - 28, 2, accent);
    const label = object.id === "ecg" ? "ECG" : object.id === "metro" ? "METRO" : "DIGITS";
    c.font = `${mobile.matches ? 10 : 12}px "JetBrains Mono", monospace`;
    c.textAlign = "center";
    c.fillStyle = active ? "#fff2fa" : "#e8e3ff";
    c.fillText(label, p.x, y + size + 15);
    c.textAlign = "start";
  }

  function projectsDesktop(c, t) {
    const stops = [[0, "#0a1027"], [0.52, "#18234a"], [1, "#090c1b"]];
    for (let y = 0; y < H; y += 2) {
      const p = y / H;
      let i = 1;
      while (i < stops.length - 1 && p > stops[i][0]) i++;
      rect(c, 0, y, W, 2, mix(stops[i - 1][1], stops[i][1], (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    }
    const rng = random(229);
    for (let i = 0; i < 85; i++) rect(c, rng() * W, rng() * H * 0.48, i % 7 ? 1 : 2, 1, i % 3 ? "#7be7df55" : "#ff70c977");
    const bx = W * 0.07, by = H * 0.17, bw = W * 0.86, bh = H * 0.67;
    rect(c, bx + 10, by + 12, bw, bh, "#050713aa");
    rect(c, bx, by, bw, bh, "#323b59");
    rect(c, bx + 8, by + 8, bw - 16, bh - 24, "#111931");
    rect(c, bx + 17, by + 17, bw - 34, bh - 42, "#080e24");
    // Scanlines and a quiet wallpaper glow keep the desktop alive behind the icons.
    for (let y = by + 25; y < by + bh - 32; y += 7) rect(c, bx + 19, y, bw - 38, 1, "#6de8df12");
    ellipse(c, bx + bw * 0.72, by + bh * 0.34, bw * 0.18, bw * 0.18, "#ff57bf12");
    ellipse(c, bx + bw * 0.72, by + bh * 0.34, bw * 0.08, bw * 0.08, "#66e9df22");
    rect(c, bx + 17, by + bh - 27, bw - 34, 19, "#22294a");
    rect(c, bx + 26, by + bh - 23, 15, 11, "#67e7d5");
    rect(c, bx + 50, by + bh - 20, 120, 5, "#596180");
    rect(c, bx + bw - 90, by + bh - 20, 56, 5, "#ff72c866");
    // Pixel cursor drifts a few squares to make the desktop feel live.
    const cursorX = bx + bw * (0.38 + Math.sin(t * 0.32) * 0.08), cursorY = by + bh * (0.25 + Math.sin(t * 0.4) * 0.04);
    line(c, cursorX, cursorY, cursorX, cursorY + 11, "#fff1fb", 2);
    line(c, cursorX, cursorY, cursorX + 8, cursorY + 8, "#fff1fb", 2);
    for (const object of window.MiamiMap.worlds.work.objects) projectIcon(c, object, t);
    rect(c, bx + bw * 0.35, by + bh + 10, bw * 0.3, 6, "#1c2542");
    rect(c, bx + bw * 0.47, by + bh + 16, bw * 0.06, 10, "#2c3655");
  }

  function writingBookcaseScene(c, t) {
    const stops = [[0, "#261c39"], [0.55, "#5a3157"], [1, "#1b172d"]];
    for (let y = 0; y < H; y += 2) {
      const p = y / H;
      let i = 1;
      while (i < stops.length - 1 && p > stops[i][0]) i++;
      rect(c, 0, y, W, 2, mix(stops[i - 1][1], stops[i][1], (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    }
    const shelfLeft = W * 0.09, shelfRight = W * 0.91;
    for (let y = H * 0.31; y < H * 0.86; y += H * 0.18) {
      rect(c, shelfLeft, y, shelfRight - shelfLeft, 8, "#c99378");
      rect(c, shelfLeft, y + 8, shelfRight - shelfLeft, 3, "#4b2849");
      rect(c, shelfLeft - 6, y - H * 0.16, 8, H * 0.18, "#3b2644");
      rect(c, shelfRight - 2, y - H * 0.16, 8, H * 0.18, "#3b2644");
    }
    for (let i = 0; i < 22; i++) {
      const x = shelfLeft + 18 + ((i * 67) % Math.max(80, shelfRight - shelfLeft - 30));
      const y = H * 0.31 + (i % 3) * H * 0.18 - 3;
      rect(c, x, y - 48 - (i % 3) * 7, 11 + (i % 4) * 3, 48 + (i % 3) * 7, ["#d48c9f", "#e2b37f", "#77c4b6", "#9f80c1"][i % 4]);
    }
    for (const object of window.MiamiMap.worlds.writing.objects) {
      const p = points[object.id];
      if (!p) continue;
      const active = highlighted === object.id;
      const color = object.id === "digits-paper" ? "#69e5d2" : object.id === "faux-noble" ? "#f0bd70" : "#ff8bb9";
      const bob = Math.sin(t * 1.2 + p.x * 0.02) * 2;
      const x = p.x - 21, y = p.y - 23 + bob;
      if (active) { c.globalAlpha = 0.2; ellipse(c, p.x, p.y, 38, 30, color); c.globalAlpha = 1; }
      rect(c, x, y, 42, 47, "#20152f");
      rect(c, x + 4, y + 4, 34, 38, color);
      rect(c, x + 8, y + 9, 25, 2, "#fff0d699");
      rect(c, x + 8, y + 16, 19, 2, "#fff0d655");
      rect(c, x + 8, y + 29, 24, 2, "#2d2348aa");
      c.font = "10px \"JetBrains Mono\", monospace";
      c.fillStyle = "#fff5e6";
      c.textAlign = "center";
      c.fillText(object.id === "digits-paper" ? "DIGITS" : object.id === "faux-noble" ? "FR / 01" : "FR / 02", p.x, y + 60);
      c.textAlign = "start";
    }
    rect(c, 0, H * 0.88, W, H * 0.12, "#171327");
    for (let i = 0; i < 7; i++) rect(c, W * 0.18 + i * W * 0.11, H * 0.9, W * 0.07, 2, i % 2 ? "#e2a56f66" : "#72e0d066");
  }

  function paperScene(c, t) {
    const frenchSalon = currentItem === "/writing/faux-noble";
    const stops = frenchSalon ? [[0, "#2a1327"], [0.55, "#6d273d"], [1, "#1b1021"]] : [[0, "#071b33"], [0.52, "#123e5c"], [1, "#101329"]];
    for (let y = 0; y < H; y += 2) {
      const p = y / H; let i = 1;
      while (i < stops.length - 1 && p > stops[i][0]) i++;
      rect(c, 0, y, W, 2, mix(stops[i - 1][1], stops[i][1], (p - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])));
    }
    const rng = random(frenchSalon ? 515 : 626);
    for (let i = 0; i < 90; i++) rect(c, rng() * W, rng() * H * 0.7, i % 9 ? 1 : 2, 1, frenchSalon ? "#f4c77e66" : "#70eee566");
    if (frenchSalon) {
      rect(c, W * 0.08, H * 0.2, W * 0.16, H * 0.72, "#43162f");
      rect(c, W * 0.76, H * 0.2, W * 0.16, H * 0.72, "#43162f");
      for (let x = W * 0.1; x < W * 0.9; x += W * 0.08) line(c, x, H * 0.72, x + Math.sin(t + x) * 5, H * 0.92, "#e6b66c44", 2);
      rect(c, W * 0.2, H * 0.73, W * 0.6, 5, "#d4a366");
    } else {
      line(c, W * 0.12, H * 0.78, W * 0.88, H * 0.2, "#67e6df55", 1);
      line(c, W * 0.2, H * 0.86, W * 0.86, H * 0.28, "#67e6df55", 1);
      for (let i = 0; i < 12; i++) rect(c, W * 0.08 + i * W * 0.08, H * 0.74 - i * H * 0.035, 2, 2, "#66e9df88");
      rect(c, W * 0.1, H * 0.78, W * 0.8, 3, "#5be7df77");
    }
  }
  function water(c, t) {
    for (let y = horizon; y < H; y += 3)
      rect(
        c,
        0,
        y,
        W,
        3,
        mix("#8c95c0", "#155b76", Math.min(1, (y - horizon) / (H * 0.32))),
      );
    const rng = random(331),
      sunX = W * (mobile.matches ? 0.57 : 0.62);
    // Sunset path widens toward the viewer; broken horizontal bands avoid a flat fill.
    for (let y = horizon + 12; y < shore + 35; y += 4) {
      const dy = (y - horizon) / (shore - horizon);
      const width = 18 + dy * 65;
      const wave = Math.sin(y * 0.28 + t * 0.7) * 7;
      rect(
        c,
        sunX - width / 2 + wave,
        y,
        width,
        1 + (y % 3 === 0 ? 1 : 0),
        y % 12 === 0 ? "#ffd1b0" : "#edabb1",
      );
    }
    for (let i = 0; i < 780; i++) {
      const y = horizon + 12 + rng() * (H - horizon),
        depth = (y - horizon) / (H - horizon),
        len = 2 + rng() * (7 + depth * 27);
      const x =
        ((rng() * (W + 40) +
          Math.sin(t * 0.55 + i) * 3 +
          Math.sin(t * 0.17 + i) * depth * 9) %
          (W + 40)) -
        20;
      const n = rng();
      const color =
        n > 0.88
          ? "#eec0d0"
          : n > 0.63
            ? "#8ed9d1"
            : n > 0.35
              ? "#58b8ba"
              : "#398aa3";
      c.globalAlpha = 0.25 + depth * 0.35 + Math.sin(t * 0.65 + i) * 0.1;
      rect(c, x, y, len, depth > 0.5 ? 2 : 1, color);
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 12; i++) {
      const y = shore - 35 + i * 3;
      c.globalAlpha = 0.1 + i * 0.025;
      rect(
        c,
        (points.bizzy?.x || W * 0.17) - 18 + Math.sin(t + i) * 5,
        y,
        38 + Math.sin(i) * 12,
        1,
        i % 2 ? "#ff7eb5" : "#a9f7d7",
      );
    }
    c.globalAlpha = 1;
    // Squared skyscraper reflections soften into the ripples.
    const rr = random(667);
    for (let i = 0; i < 90; i++) {
      const x = rr() * W,
        y = horizon + 11 + rr() * 35;
      rect(c, x + Math.sin(t + y) * 2, y, 2 + rr() * 9, 1, "#d9aac05c");
    }
  }
  function grass(c, x, y, scale = 1, color = "#244a4b") {
    line(c, x, y, x - 6 * scale, y - 9 * scale, color, 2);
    line(c, x, y, x - 2 * scale, y - 14 * scale, color, 2);
    line(c, x, y, x + 4 * scale, y - 12 * scale, color, 2);
    line(c, x, y, x + 9 * scale, y - 6 * scale, color, 2);
  }
  function lamp(c, x, y, h = 35) {
    ellipse(c, x, y - h + 1, 11, 11, "#ffe2a314");
    ellipse(c, x, y - h + 1, 6, 6, "#ffddab20");
    rect(c, x - 1, y - h, 2, h, "#313847");
    rect(c, x - 4, y, 8, 2, "#2e3445");
    rect(c, x - 4, y - h - 7, 8, 2, "#313847");
    rect(c, x - 3, y - h - 5, 6, 7, "#ffcb95");
    rect(c, x - 4, y - h + 2, 8, 2, "#493947");
    rect(c, x - 1, y - h - 10, 2, 3, "#333647");
  }
  function rail(c, x, y, w) {
    line(c, x, y, x + w, y + 2, "#e3b198", 2);
    line(c, x, y + 8, x + w, y + 10, "#785667", 2);
    for (let i = 0; i <= w; i += 23) {
      rect(c, x + i, y, 3, 23, "#593d55");
      rect(c, x + i, y, 1, 21, "#b7887b");
    }
  }
  function venue(c, p) {
    const x = p.x - 54,
      y = p.y + 8;
    ellipse(c, x + 56, y + 80, 78, 10, "#4e394e50");
    poly(
      c,
      [
        [x, y + 6],
        [x + 90, y + 6],
        [x + 103, y + 17],
        [x + 103, y + 74],
        [x, y + 74],
      ],
      "#514561",
    );
    rect(c, x + 4, y + 10, 85, 62, "#cd899b");
    rect(c, x + 7, y + 16, 77, 50, "#99697f");
    rect(c, x + 85, y + 14, 5, 58, "#ffc2ae");
    rect(c, x - 5, y + 5, 99, 5, "#262943");
    rect(c, x - 7, y + 2, 101, 3, "#ffa3cb");
    rect(c, x - 5, y + 10, 99, 2, "#6ef0d2");
    rect(c, x + 17, y - 16, 61, 19, "#362940");
    rect(c, x + 15, y - 18, 65, 2, "#ff90b9");
    rect(c, x + 15, y - 16, 2, 19, "#ff90b9");
    rect(c, x + 78, y - 16, 2, 19, "#ff90b9");
    letters(c, "BIZZY", x + 22, y - 12, "#fff0bc", 1.5);
    rect(c, x + 13, y + 23, 24, 37, "#44354c");
    rect(c, x + 43, y + 23, 24, 37, "#44354c");
    for (const xx of [x + 13, x + 43]) {
      rect(c, xx, y + 23, 24, 2, "#ffa9c5");
      rect(c, xx + 2, y + 25, 20, 24, "#675578");
      rect(c, xx + 5, y + 29, 2, 20, "#84f5d2");
      rect(c, xx + 10, y + 27, 2, 22, "#c5c7c5");
      rect(c, xx + 2, y + 50, 20, 2, "#fa8ec1");
      rect(c, xx + 11, y + 54, 3, 1, "#ffdfad");
    }
    // Canopy, tiled patio, stools and string lights make this a place.
    poly(
      c,
      [
        [x - 4, y + 19],
        [x + 91, y + 19],
        [x + 98, y + 28],
        [x - 10, y + 28],
      ],
      "#31394a",
    );
    for (let i = 0; i < 7; i++)
      poly(
        c,
        [
          [x - 4 + i * 14, y + 19],
          [x + 3 + i * 14, y + 19],
          [x + 5 + i * 14, y + 28],
          [x - 3 + i * 14, y + 28],
        ],
        "#65c3b6",
      );
    rect(c, x - 10, y + 28, 108, 3, "#e8b7a5");
    poly(
      c,
      [
        [x - 9, y + 72],
        [x + 103, y + 72],
        [x + 115, y + 88],
        [x - 21, y + 88],
      ],
      "#a77f83",
    );
    for (let i = 0; i < 5; i++)
      line(c, x - 17, y + 74 + i * 3, x + 109, y + 74 + i * 3, "#6e536557");
    for (let i = 0; i < 6; i++) {
      const xx = x - 12 + i * 23;
      line(c, xx, y + 76, xx + 5, y + 88, "#dfab9957");
    }
    for (const xx of [x - 15, x + 95]) {
      rect(c, xx, y + 53, 3, 24, "#393342");
      rect(c, xx - 7, y + 52, 17, 3, "#dd969e");
      rect(c, xx - 8, y + 47, 19, 5, "#759593");
      rect(c, xx - 6, y + 47, 2, 4, "#91d1b6");
    }
    for (let i = 0; i < 4; i++) {
      const xx = x + 3 + i * 23;
      rect(c, xx, y + 72, 7, 2, "#efaca7");
      rect(c, xx + 1, y + 74, 2, 8, "#3c3549");
      rect(c, xx + 5, y + 74, 2, 8, "#3c3549");
    }
    line(c, x - 11, y + 8, x - 11, y + 62, "#413645", 2);
    line(c, x - 11, y + 10, x + 105, y + 16, "#473647");
    for (let i = 0; i < 9; i++) {
      let xx = x - 9 + i * 14,
        yy = y + 11 + i * 0.7;
      rect(c, xx, yy, 2, 3, i % 2 ? "#a2f4d4" : "#ffd8a7");
    }
  }
  function bizzyClub(c, p, t) {
    const x = p.x - 62,
      y = p.y + 6;
    const pulse = 0.65 + Math.sin(t * 2.2) * 0.2;
    ellipse(c, x + 63, y + 92, 86, 11, "#06110d80");
    poly(c, [[x, y + 8], [x + 116, y + 8], [x + 127, y + 20], [x + 119, y + 87], [x - 8, y + 87], [x - 8, y + 21]], "#08120f");
    rect(c, x - 5, y + 20, 119, 65, "#10251b");
    rect(c, x - 2, y + 23, 113, 58, "#0a1712");
    rect(c, x - 5, y + 14, 119, 7, "#0b2618");
    rect(c, x - 3, y + 14, 115, 3, "#74ff9a");
    rect(c, x + 3, y + 18, 105, 2, "#c2ff74");
    // Green window glow and a single open door keep it readable as a place.
    for (const xx of [x + 8, x + 39, x + 70]) {
      rect(c, xx, y + 28, 21, 30, "#07150f");
      rect(c, xx + 2, y + 30, 17, 25, "#16492e");
      rect(c, xx + 4, y + 34, 3, 17, "#37f47a");
      rect(c, xx + 10, y + 32, 2, 21, "#8bff9a");
      rect(c, xx + 15, y + 36, 2, 15, "#22be62");
    }
    rect(c, x + 95, y + 44, 17, 37, "#020604");
    rect(c, x + 98, y + 48, 2, 29, "#69ff8d");
    rect(c, x + 104, y + 48, 2, 29, "#217a45");
    // Awning, patio and stools give the club a low, inviting silhouette.
    poly(c, [[x - 8, y + 58], [x + 111, y + 58], [x + 122, y + 69], [x - 17, y + 69]], "#0c2117");
    for (let i = 0; i < 8; i++) {
      rect(c, x - 10 + i * 17, y + 61, 10, 5, i % 2 ? "#1bd567" : "#67ff8e");
      rect(c, x - 7 + i * 17, y + 66, 7, 2, "#0b5e35");
    }
    rect(c, x + 13, y + 22, 86, 47, "#06110d");
    rect(c, x + 13, y + 22, 86, 2, "#42f278");
    drawBizzyLogo(c, x + 17, y + 23, 78, 48);
    poly(c, [[x - 16, y + 83], [x + 116, y + 83], [x + 128, y + 94], [x - 27, y + 94]], "#102719");
    for (let i = 0; i < 5; i++) line(c, x - 18, y + 85 + i * 2, x + 119, y + 86 + i * 2, "#27683e55");
    for (const xx of [x + 4, x + 29, x + 54]) {
      rect(c, xx, y + 73, 8, 2, "#b9ff74");
      rect(c, xx + 1, y + 75, 2, 10, "#174a2a");
      rect(c, xx + 5, y + 75, 2, 10, "#174a2a");
    }
    // A pulsing row of pixel lamps echoes the supplied mark's neon green.
    for (let i = 0; i < 9; i++) {
      const xx = x - 6 + i * 15;
      rect(c, xx, y + 12, 3, 3, i % 2 ? "#b9ff74" : "#19df68");
      c.globalAlpha = pulse;
      rect(c, xx - 1, y + 11, 5, 5, "#5eff8b");
      c.globalAlpha = 1;
    }
  }
  function dock(c, p) {
    const x = p.x,
      y = p.y + 14;
    poly(
      c,
      [
        [x - 21, y - 22],
        [x + 20, y - 22],
        [x + 39, shore + 80],
        [x - 48, shore + 80],
      ],
      "#393947",
    );
    poly(
      c,
      [
        [x - 19, y - 23],
        [x + 18, y - 23],
        [x + 33, shore + 73],
        [x - 43, shore + 73],
      ],
      "#a98482",
    );
    for (let yy = y - 21; yy < shore + 73; yy += 5) {
      const f = (yy - y + 23) / (shore + 96 - y);
      line(c, x - 20 - f * 23, yy, x + 19 + f * 14, yy, "#694f67", 1);
    }
    line(c, x - 5, y - 21, x - 15, shore + 73, "#cfa091");
    line(c, x + 8, y - 21, x + 18, shore + 73, "#cfa091");
    for (const [xx, yy] of [
      [x - 23, y - 11],
      [x + 23, y - 11],
      [x - 32, y + 35],
      [x + 28, y + 35],
    ]) {
      rect(c, xx, yy - 8, 4, 21, "#57425b");
      rect(c, xx - 1, yy - 9, 6, 2, "#e7b398");
    }
    line(c, x - 23, y - 14, x - 32, y + 29, "#edbea0");
    line(c, x + 23, y - 14, x + 28, y + 29, "#edbea0");
    rect(c, x - 13, y - 9, 25, 3, "#e4b29b");
    rect(c, x - 11, y - 6, 2, 9, "#533b50");
    rect(c, x + 9, y - 6, 2, 9, "#533b50");
    rect(c, x - 8, y - 22, 17, 12, "#302e48");
    rect(c, x - 6, y - 20, 13, 8, "#7be7cb");
    rect(c, x - 4, y - 18, 5, 1, "#307f83");
    rect(c, x - 4, y - 16, 8, 1, "#307f83");
    rect(c, x - 9, y - 10, 20, 2, "#dcc3ba");
    lamp(c, x + 30, y + 51, 32);
  }
  function bookshop(c, p) {
    const x = p.x - 30,
      y = p.y + 8;
    ellipse(c, x + 34, y + 64, 45, 7, "#4c3b5650");
    rect(c, x, y, 65, 60, "#5d6176");
    rect(c, x + 4, y + 3, 57, 54, "#87b4b2");
    rect(c, x + 6, y + 8, 51, 29, "#394451");
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 12; i++) {
        rect(
          c,
          x + 9 + i * 4,
          y + 12 + row * 13,
          3,
          8,
          ["#e8b097", "#bea0bc", "#96cbbb", "#d78c9f"][i % 4],
        );
      }
      rect(c, x + 6, y + 22 + row * 13, 51, 2, "#e5b6a0");
    }
    poly(
      c,
      [
        [x - 6, y + 2],
        [x + 70, y + 2],
        [x + 64, y - 12],
        [x, y - 12],
      ],
      "#45415c",
    );
    rect(c, x - 6, y + 2, 76, 3, "#eaaab2");
    letters(c, "BOOKS", x + 14, y - 7, "#f6d5b7");
    rect(c, x - 3, y + 40, 71, 4, "#f4c6a9");
    rect(c, x + 9, y + 46, 40, 2, "#b0d9c2");
    rect(c, x + 27, y + 45, 3, 12, "#608082");
    rect(c, x + 4, y + 60, 4, 5, "#3c344c");
    rect(c, x + 57, y + 60, 4, 5, "#3c344c");
  }
  function notice(c, p) {
    const x = p.x - 13,
      y = p.y + 4;
    rect(c, x + 2, y + 4, 3, 34, "#48394c");
    rect(c, x + 23, y + 4, 3, 34, "#48394c");
    rect(c, x - 1, y - 1, 31, 27, "#65516b");
    rect(c, x + 2, y + 2, 25, 21, "#d8a693");
    rect(c, x + 6, y + 5, 13, 16, "#f6dcc1");
    rect(c, x + 9, y + 8, 7, 2, "#7b7a84");
    for (let i = 0; i < 3; i++)
      rect(c, x + 9, y + 12 + i * 2, 7 - i, 1, "#b8a6a8");
    rect(c, x - 3, y - 3, 35, 3, "#f5c3a5");
  }
  function mailbox(c, p) {
    const x = p.x - 8,
      y = p.y + 6;
    rect(c, x + 6, y + 12, 4, 20, "#4c435a");
    rect(c, x - 1, y, 21, 15, "#eb919d");
    rect(c, x + 1, y - 3, 16, 3, "#f5b4aa");
    rect(c, x + 1, y + 3, 12, 8, "#914d75");
    rect(c, x + 3, y + 4, 8, 5, "#f4ddba");
    line(c, x + 3, y + 4, x + 7, y + 7, "#c6959b");
    line(c, x + 11, y + 4, x + 7, y + 7, "#c6959b");
    rect(c, x + 18, y - 5, 2, 13, "#ffc5ae");
    rect(c, x + 19, y - 5, 7, 5, "#98ecd0");
    ellipse(c, x + 9, y + 33, 11, 2, "#4c3c5840");
  }
  function arcade(c, p) {
    const x = p.x - 10,
      y = p.y + 8;
    poly(
      c,
      [
        [x, y],
        [x + 18, y],
        [x + 21, y + 9],
        [x + 18, y + 15],
        [x + 21, y + 35],
        [x - 2, y + 35],
        [x + 1, y + 16],
        [x - 3, y + 11],
      ],
      "#39344d",
    );
    rect(c, x, y + 2, 16, 4, "#f1a1be");
    rect(c, x + 1, y + 8, 14, 11, "#84c7bb");
    rect(c, x + 4, y + 11, 8, 2, "#375477");
    rect(c, x + 9, y + 12, 2, 5, "#375477");
    rect(c, x - 1, y + 21, 20, 3, "#ee93b5");
    rect(c, x + 3, y + 18, 1, 3, "#ffdaa1");
    rect(c, x + 11, y + 21, 3, 1, "#92edc5");
    rect(c, x + 4, y + 26, 8, 5, "#a77c9d");
  }
  function porch(c, p, t) {
    const x = p.x - 52,
      y = p.y + 2;
    poly(
      c,
      [
        [x - 10, y + 60],
        [x + 104, y + 60],
        [x + 118, y + 83],
        [x - 23, y + 83],
      ],
      "#b98d91",
    );
    for (let yy = y + 64; yy < y + 83; yy += 5)
      line(c, x - 20, yy, x + 113, yy, "#795e76");
    rect(c, x, y, 104, 63, "#b28da0");
    rect(c, x + 5, y + 5, 94, 55, "#996d87");
    poly(
      c,
      [
        [x - 13, y + 4],
        [x + 52, y - 28],
        [x + 116, y + 4],
      ],
      "#343747",
    );
    rect(c, x + 3, y - 43, 98, 18, "#30263f");
    rect(c, x + 3, y - 43, 98, 2, "#ffb5c0");
    letters(c, "ABOUT", x + 13, y - 39, "#ffe4b9", 1.15);
    line(c, x - 13, y + 4, x + 52, y - 28, "#ffbcc0", 2);
    line(c, x + 52, y - 28, x + 116, y + 4, "#ffbcc0", 2);
    rect(c, x + 46, y + 16, 25, 47, "#50435e");
    rect(c, x + 49, y + 20, 19, 36, "#78b3b0");
    rect(c, x + 64, y + 41, 2, 2, "#ffe2b4");
    rect(c, x + 12, y + 18, 23, 22, "#383b50");
    rect(c, x + 14, y + 20, 19, 18, "#dcaaa7");
    line(c, x + 23, y + 20, x + 23, y + 38, "#715675", 2);
    rect(c, x + 8, y + 51, 28, 13, "#322e45");
    rect(c, x + 9, y + 52, 26, 5, "#f3dac1");
    for (let i = 0; i < 6; i++)
      rect(c, x + 11 + i * 4, y + 52, 2, 3, "#38314b");
    rect(c, x + 8, y + 3, 4, 66, "#ffc6b0");
    rect(c, x + 95, y + 3, 4, 66, "#ffc6b0");
    poly(
      c,
      [
        [x + 77, y + 13],
        [x + 93, y + 13],
        [x + 77, y + 28],
      ],
      "#62c1a4",
    );
    rect(c, x + 83, y + 16, 2, 5, "#ffd0a7");
    c.globalAlpha = 0.45 + Math.sin(t * 2) * 0.2;
    ellipse(c, x + 110, y + 72, 13, 13, "#ffe2b433");
    c.globalAlpha = 1;
    lamp(c, x + 110, y + 72, 37);
  }
  function lukeSprite(c, x, y, s, t) {
    const bob = Math.sin(t * 2.2) * s;
    y += bob;
    ellipse(c, x, y + 3 * s, 10 * s, 3 * s, "#2d30465c");
    // Small 4-bit portrait cue: curly dark hair, warm skin, teal shirt, simple trousers.
    rect(c, x - 4 * s, y - 28 * s, 8 * s, 9 * s, "#f0bc9e");
    rect(c, x - 6 * s, y - 31 * s, 12 * s, 5 * s, "#1d2130");
    rect(c, x - 7 * s, y - 28 * s, 3 * s, 4 * s, "#282b3b");
    rect(c, x + 4 * s, y - 29 * s, 3 * s, 5 * s, "#282b3b");
    rect(c, x - 6 * s, y - 20 * s, 12 * s, 14 * s, "#4bb8ad");
    rect(c, x - 9 * s, y - 18 * s, 3 * s, 10 * s, "#f0bc9e");
    rect(c, x + 6 * s, y - 18 * s, 3 * s, 10 * s, "#f0bc9e");
    rect(c, x - 5 * s, y - 6 * s, 4 * s, 9 * s, "#30364c");
    rect(c, x + 1 * s, y - 6 * s, 4 * s, 9 * s, "#30364c");
    rect(c, x - 6 * s, y + 2 * s, 6 * s, 2 * s, "#161d2d");
    rect(c, x + 1 * s, y + 2 * s, 6 * s, 2 * s, "#161d2d");
  }
  function tower(c, p) {
    const x = p.x - 24,
      y = p.y + 5;
    rect(c, x, y, 48, 73, "#565576");
    rect(c, x + 5, y - 6, 38, 6, "#8d7c96");
    rect(c, x + 10, y - 12, 28, 6, "#ae8eab");
    for (let i = 0; i < 6; i++) {
      rect(c, x + 4 + i * 7, y + 4, 2, 56, "#89cfc8");
      for (let j = 0; j < 6; j++)
        rect(c, x + 7 + i * 7, y + 8 + j * 8, 2, 3, "#d5aacb");
    }
    rect(c, x + 19, y + 58, 13, 20, "#cdb3b0");
    rect(c, x + 25, y + 59, 1, 18, "#76617e");
    rect(c, x + 18, y + 18, 13, 4, "#c6ffdf");
    rect(c, x + 23, y + 13, 4, 14, "#c6ffdf");
    rect(c, x - 4, y + 78, 56, 4, "#b295a5");
  }
  function book(c, p) {
    const x = p.x - 20,
      y = p.y + 5;
    poly(
      c,
      [
        [x, y],
        [x + 35, y],
        [x + 41, y + 5],
        [x + 41, y + 56],
        [x + 4, y + 56],
        [x, y + 51],
      ],
      "#48394f",
    );
    rect(c, x + 3, y + 3, 35, 49, "#e2b3a6");
    rect(c, x + 6, y + 5, 30, 43, "#a26891");
    rect(c, x + 6, y + 5, 3, 43, "#81527e");
    rect(c, x + 12, y + 13, 18, 2, "#f7d1b2");
    rect(c, x + 12, y + 18, 13, 1, "#f7d1b2");
    rect(c, x + 16, y + 28, 10, 10, "#83c4b2");
    rect(c, x + 19, y + 25, 4, 16, "#a5ebca");
    for (let yy = y + 50; yy < y + 56; yy += 2)
      rect(c, x + 5, yy, 34, 1, "#fae3c5");
    rect(c, x - 4, y + 59, 49, 3, "#ca9c8f");
    rect(c, x + 1, y + 62, 3, 6, "#625166");
    rect(c, x + 37, y + 62, 3, 6, "#625166");
  }
  function sign(c, p) {
    const x = p.x - 19,
      y = p.y + 8;
    rect(c, x + 17, y + 22, 4, 27, "#68516d");
    rect(c, x - 2, y - 2, 42, 28, "#9a839b");
    rect(c, x, y, 38, 24, "#39465a");
    letters(c, "CODE", x + 6, y + 5, "#a8edcf");
    rect(c, x + 8, y + 16, 22, 2, "#eaa9c1");
    rect(c, x + 12, y + 49, 14, 2, "#b39699");
  }
  function drawObject(c, object, t) {
    const point = points[object.id];
    if (object.prop === "dock") {
      dock(c, point);
      return;
    }
    const painters = {
      venue,
      "bizzy-club": bizzyClub,
      bookshop,
      mailbox,
      notice,
      arcade,
      boat,
      porch,
      tower,
      book,
      sign,
    };
    const paint = painters[object.prop];
    if (!paint) return;
    c.save();
    c.translate(Math.round(point.x), Math.round(point.y));
    const scale = object.scale || 1;
    c.scale(scale, scale);
    paint(c, { x: 0, y: 0 }, t);
    c.restore();
  }
  function landLayer(c) {
    const rng = random(214);
    // Foreground shoreline curves into the bay, with foam and a shell-strewn beach.
    const edge = [];
    for (let x = 0; x <= W + 4; x += 4) {
      const y =
        shore +
        Math.sin((x / W) * Math.PI * 2 - 0.9) * 13 +
        Math.sin(x * 0.014) * 4;
      edge.push([x, y]);
    }
    poly(c, [...edge, [W, H], [0, H]], "#dab09e");
    for (let x = 0; x < W; x += 4) {
      const y =
        shore +
        Math.sin((x / W) * Math.PI * 2 - 0.9) * 13 +
        Math.sin(x * 0.014) * 4;
      rect(c, x, y - 4, 4, 3, "#a4c4b9");
      rect(c, x, y - 1, 4, 2, "#eac8b0");
    }
    poly(
      c,
      [
        [0, shore + 55],
        [W * 0.18, shore + 30],
        [W * 0.35, shore + 65],
        [W * 0.54, shore + 60],
        [W * 0.71, shore + 38],
        [W, shore + 59],
        [W, H],
        [0, H],
      ],
      "#c69f99",
    );
    for (let i = 0; i < 1700; i++) {
      const x = rng() * W,
        y = shore + rng() * (H - shore);
      if (y > shore + 20) {
        const n = rng();
        rect(
          c,
          x,
          y,
          1 + rng() * 3,
          1,
          n > 0.6 ? "#e7bba2" : n > 0.2 ? "#bc9695" : "#ae8890",
        );
      }
    }
    const path = mobile.matches
      ? [
          [0, H * 0.79],
          [W * 0.26, H * 0.76],
          [W * 0.63, H * 0.9],
          [W, H * 0.85],
          [W, H],
          [0, H],
        ]
      : [
          [0, H * 0.84],
          [W * 0.21, H * 0.88],
          [W * 0.6, H * 0.91],
          [W, H * 0.82],
          [W, H],
          [0, H],
        ];
    poly(c, path, "#977f88");
    for (let i = 0; i < 200; i++) {
      const x = rng() * W,
        y = H * 0.89 + rng() * H * 0.11;
      rect(c, x, y, 2 + rng() * 6, 1, "#c2a09555");
    }
    // The same world inventory supplies exactly one drawing and target per object.
    for (const object of window.MiamiMap.worlds[currentWorld].objects) {
      if (object.prop !== "boat") drawObject(c, object, 0);
    }
    if (!mobile.matches) {
      rail(c, W * 0.025, shore - 4, W * 0.07);
      rail(c, W * 0.86, shore + 4, W * 0.12);
      lamp(c, W * 0.72, shore + 49, 45);
    }
    for (let i = 0; i < 30; i++) {
      const x = rng() * W,
        y = H * 0.9 + rng() * H * 0.12;
      grass(
        c,
        x,
        y,
        0.4 + rng() * 0.8,
        ["#3e625c", "#35535a", "#587569"][i % 3],
      );
    }
    // Far corners have dark tropical groundcover, with pink rim light.
    poly(
      c,
      [
        [0, H - 36],
        [22, H - 39],
        [34, H - 22],
        [61, H - 23],
        [74, H - 9],
        [115, H],
        [0, H],
      ],
      "#263f47",
    );
    poly(
      c,
      [
        [W - 130, H],
        [W - 97, H - 16],
        [W - 73, H - 17],
        [W - 57, H - 37],
        [W - 41, H - 29],
        [W - 27, H - 48],
        [W, H - 39],
        [W, H],
      ],
      "#263f47",
    );
    for (let i = 0; i < 18; i++) {
      let x = i < 9 ? i * 10 : W - (i - 9) * 11;
      grass(c, x, H - 4 - rng() * 15, 0.9 + rng(), "#2c4d4e");
    }
  }
  function boat(c, p, t) {
    const x = p.x,
      y = p.y + 9 + Math.sin(t * 1.1) * 2.4;
    for (let i = 0; i < 3; i++)
      rect(
        c,
        x - 30 - i * 3 + Math.sin(t + i) * 2,
        y + 15 + i * 4,
        59 + i * 5,
        1,
        "#96cccb60",
      );
    poly(
      c,
      [
        [x - 27, y + 5],
        [x + 31, y + 5],
        [x + 22, y + 15],
        [x - 18, y + 15],
      ],
      "#e9c0b7",
    );
    rect(c, x - 24, y + 6, 49, 2, "#749eb2");
    rect(c, x - 8, y - 5, 26, 10, "#edd6c3");
    rect(c, x - 5, y - 3, 8, 6, "#657494");
    rect(c, x + 6, y - 3, 8, 6, "#657494");
    rect(c, x - 11, y - 7, 31, 2, "#d39bab");
    line(c, x + 5, y - 19, x + 5, y - 8, "#e8c2b8");
    rect(c, x + 7, y - 18, 9, 5, "#7ee2cc");
  }
  function frond(c, x, y, angle, len, t, shade) {
    const wind = Math.sin(t * 0.7 + x * 0.02) * 0.06;
    const endX = x + Math.cos(angle + wind) * len,
      endY = y + Math.sin(angle + wind) * len + len * 0.16;
    for (let i = 0; i < 9; i++) {
      const f = i / 9,
        fx = x + (endX - x) * f,
        fy = y + (endY - y) * f - Math.sin(f * Math.PI) * len * 0.18;
      const nf = (i + 1) / 9,
        nx = x + (endX - x) * nf,
        ny = y + (endY - y) * nf - Math.sin(nf * Math.PI) * len * 0.18;
      line(c, fx, fy, nx, ny, shade, 2);
      const leaf = (1 - f) * len * 0.27 + 3,
        side = Math.cos(angle) < 0 ? -1 : 1;
      poly(
        c,
        [
          [fx - 1, fy],
          [fx + side * leaf * 0.24, fy + leaf * 0.18],
          [fx + side * leaf * 0.42, fy + leaf],
          [fx + side * leaf * 0.08, fy + leaf * 0.68],
        ],
        shade,
      );
      poly(
        c,
        [
          [fx, fy],
          [fx - side * leaf * 0.3, fy + leaf * 0.1],
          [fx - side * leaf * 0.5, fy + leaf * 0.7],
          [fx, fy + leaf * 0.4],
        ],
        shade,
      );
      line(c, fx, fy, fx + side * leaf * 0.35, fy + leaf, shade, 2);
      line(
        c,
        fx + 1,
        fy,
        fx + side * leaf * 0.65,
        fy + leaf * 0.67,
        "#315853",
        1,
      );
    }
  }
  function palm(c, x, base, height, lean, t, small = false) {
    const tx = x + lean,
      ty = base - height;
    for (let i = 0; i < height; i++) {
      const f = i / height,
        xx = x + lean * f * f;
      rect(
        c,
        xx,
        base - i,
        small ? 3 : 6,
        1,
        i % 8 < 2 ? "#b28c83" : "#6d5665",
      );
      rect(c, xx, base - i, 1, 1, "#c99688");
    }
    const len = Math.min(
      mobile.matches ? 86 : 116,
      height * (small ? 0.45 : 0.49),
    );
    for (let i = 0; i < 8; i++)
      frond(
        c,
        tx + 2,
        ty,
        [-3, -2.6, -2.12, -1.4, -0.8, -0.26, 0.15, 3.12][i],
        len * (0.76 + (i % 3) * 0.12),
        t,
        ["#24474a", "#30594f", "#376251"][i % 3],
      );
    rect(c, tx + 1, ty - 1, 5, 6, "#71604f");
    rect(c, tx - 1, ty + 3, 3, 4, "#3d4545");
  }
  function updateHighlight(t) {
    const object = window.MiamiMap.worlds[currentWorld].objects.find(o => o.id === highlighted);
    if (!object) { highlightLayer = null; return; }
    if (!highlightLayer || highlightLayer.width !== W || highlightLayer.height !== H) {
      highlightLayer = document.createElement("canvas");
      highlightLayer.width = W; highlightLayer.height = H;
    }
    const brush = highlightLayer.getContext("2d");
    brush.clearRect(0, 0, W, H);
    drawObject(brush, object, t);
  }
  function render(t) {
    ctx.imageSmoothingEnabled = false;
    if (currentItem === "/work/digits" || currentItem === "/writing/digits") {
      digitsScene(ctx, t);
      return;
    }
    if (currentItem === "/writing/faux-noble" || currentItem === "/writing/ville-intelligente") {
      paperScene(ctx, t);
      return;
    }
    if (currentWorld === "work") {
      projectsDesktop(ctx, t);
      return;
    }
    if (currentWorld === "writing") {
      writingBookcaseScene(ctx, t);
      return;
    }
    if (currentWorld === "about") {
      aboutScene(ctx, t);
      return;
    }
    ctx.drawImage(sky, 0, 0);
    const offset = drift * 2;
    ctx.save();
    ctx.translate(offset, 0);
    cloud(
      ctx,
      ((W * 0.04 + t * 2.4) % (W + 200)) - 95,
      H * 0.2,
      mobile.matches ? 92 : 145,
      "#bc83a0",
    );
    cloud(
      ctx,
      ((W * 0.65 + t * 0.9) % (W + 140)) - 70,
      H * 0.13,
      105,
      "#97678b",
    );
    cloud(
      ctx,
      ((W * 0.79 + t * 1.7) % (W + 190)) - 20,
      H * 0.33,
      150,
      "#ed9cae",
    );
    cloud(
      ctx,
      ((W * 0.25 + t * 0.65) % (W + 180)) - 40,
      H * 0.39,
      110,
      "#e6a0b1",
    );
    ctx.restore();
    water(ctx, t);
    ctx.drawImage(city, 0, 0);
    // Tiny migrating seabirds cross the last band of light.
    for (let i = 0; i < 4; i++) {
      const x = ((W * 0.33 + i * 16 + t * 2.5) % (W + 40)) - 20,
        y = horizon - 28 + Math.sin(i * 2 + t * 0.5) * 3;
      const wing = Math.sin(t * 2 + i) * 2;
      line(ctx, x - 3, y + wing, x, y, "#916b8b");
      line(ctx, x, y, x + 3, y + wing, "#916b8b");
    }
    ctx.drawImage(land, 0, 0);
    const m = mobile.matches;
    for (const object of window.MiamiMap.worlds[currentWorld].objects) {
      if (object.prop === "boat") drawObject(ctx, object, t);
    }
    if (currentWorld === "bay" && points.about) {
      lukeSprite(
        ctx,
        points.about.x + (m ? 58 : 72),
        points.about.y + (m ? 49 : 64),
        m ? 1.4 : 1.8,
        t,
      );
    }
    if (highlightLayer && mode === "scene") {
      if (window.MiamiMap.worlds[currentWorld].objects.find(o => o.id === highlighted)?.prop === "boat") updateHighlight(t);
      ctx.save();ctx.shadowColor = "#b9ffe1";ctx.shadowBlur = 7;
      ctx.drawImage(highlightLayer, 0, 0);ctx.restore();
    }
    palm(
      ctx,
      m ? 18 : W * 0.055,
      H * 0.89,
      m ? H * 0.24 : H * 0.355,
      m ? 10 : 20,
      t,
    );
    palm(
      ctx,
      m ? W - 17 : W * 0.943,
      H * 0.89,
      m ? H * 0.27 : H * 0.395,
      m ? -17 : -28,
      t,
    );
    if (!m) {
      palm(ctx, W * 0.018, H * 0.79, 126, 20, t, true);
      palm(ctx, W * 0.98, H * 0.8, 129, -11, t, true);
      palm(ctx, W * 0.697, H * 0.76, 65, -3, t, true);
    }
    // Shoreline foam gently advances and recedes independently of the art cache.
    for (let i = 0; i < 35; i++) {
      const x = (i * W) / 35,
        y =
          shore +
          Math.sin((x / W) * Math.PI * 2 - 0.9) * 13 +
          Math.sin(x * 0.014) * 4 -
          6 +
          Math.sin(t * 0.8 + i * 0.15) * 2;
      ctx.globalAlpha = 0.25 + Math.sin(t + i * 0.3) * 0.12;
      rect(ctx, x, y, 7 + (i % 9), 1, "#e9dfbf");
    }
    ctx.globalAlpha = 1;
  }
  function resize() {
    const box = hero.getBoundingClientRect();
    W = mobile.matches ? 480 : 960;
    H = Math.round((box.height / box.width) * W);
    canvas.width = W;
    canvas.height = H;
    horizon = H * (mobile.matches ? 0.465 : 0.52);
    shore = H * (mobile.matches ? 0.66 : 0.728);
    points = {};
    for (const object of window.MiamiMap.worlds[currentWorld].objects) {
      const position = mobile.matches ? object.mobile : object.position;
      points[object.id] = {
        x: (position[0] / 100) * W,
        y: (position[1] / 100) * H,
      };
    }
    sky = makeLayer(skyLayer);
    city = makeLayer(cityLayer);
    land = makeLayer(landLayer);
    updateHighlight(elapsed);
    render(elapsed);
  }
  function tick(now) {
    frame = 0;
    if (paused || !visible || document.hidden || mode !== "scene") return;
    if (!last) last = now;
    if (now - last >= 1000 / 30) {
      elapsed += Math.min(now - last, 80) / 1000;
      last = now;
      drift += (pointer - drift) * 0.04;
      render(elapsed);
    }
    frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    hero.classList.toggle("scene-paused", paused);
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute(
      "aria-label",
      paused ? "Play scene animation" : "Pause scene animation",
    );
    toggle.firstElementChild.textContent = paused ? "▷" : "Ⅱ";
    if (!paused && visible && !document.hidden && mode === "scene")
      frame = requestAnimationFrame(tick);
  }
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    paused = !paused;
    syncMotion();
  });
  reduced.addEventListener("change", (e) => {
    paused = e.matches;
    syncMotion();
  });
  document.addEventListener("visibilitychange", syncMotion);
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      syncMotion();
    },
    { threshold: 0 },
  );
  observer.observe(hero);
  hero.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "mouse" && !paused)
        pointer = (e.clientX / hero.clientWidth - 0.5) * 2;
    },
    { passive: true },
  );
  hero.addEventListener(
    "pointerleave",
    () => {
      pointer = 0;
    },
    { passive: true },
  );
  let resizeFrame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }).observe(hero);
  window.MiamiScene = {
    highlight(id) {
      if (highlighted === id) return;
      highlighted = id;
      updateHighlight(elapsed);
      render(elapsed);
    },
    setWorld(world, itemPath = null) {
      if (!window.MiamiMap.worlds[world]) return;
      currentWorld = world;
      currentItem = itemPath;
      highlighted = null; highlightLayer = null;
      resize();
    },
    setMode(nextMode) {
      mode = nextMode;
      if (mode !== "scene") { highlighted = null; highlightLayer = null; render(elapsed); }
      syncMotion();
    },
  };
  resize();
  syncMotion();
})();
