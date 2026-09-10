/* Independent painted Home stations. Original Bizzy branding stays a separate sharp layer.
   Asset provenance and prompts: home-art/PROMPTS.md. */
(() => {
  let serial = 0;
  const stations = {
    bizzy: { file: "bizzy", color: "#9dff82", lights: [[837, 635, 80, 140]] },
    about: { file: "about", color: "#ffd09c", lights: [[492, 412, 72, 96], [1009, 413, 72, 118], [772, 745, 65, 75]] },
    computer: { file: "projects", color: "#92e5ef", lights: [[512, 380, 112, 68]] },
    writing: { file: "writing", color: "#ffca85", lights: [[784, 359, 99, 90]] },
    contact: { file: "contact", color: "#ffd49b", lights: [[826, 501, 48, 60]] },
  };
  window.HubIllustrations = (name) => {
    const station = stations[name];
    const id = `painted-${++serial}`;
    const asset = `assets/home-art/${station.file}.webp`;
    const logo = name === "bizzy" ? `<g transform="rotate(10 750 335)"><svg class="bizzy-mark" x="635" y="278" width="230" height="115" viewBox="130 1040 1080 540" preserveAspectRatio="xMidYMid meet"><image href="assets/bizzy-logo-source.png" width="1290" height="2796" preserveAspectRatio="xMidYMid meet"/></svg></g>` : "";
    return `<svg class="hub-vignette" data-station="${station.file}" viewBox="0 0 1248 1420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${id}-foot" x2="0" y2="1"><stop offset="0" stop-color="white"/><stop offset=".86" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
        <linearGradient id="${id}-reflection" x2="0" y2="1"><stop stop-color="white" stop-opacity=".3"/><stop offset="1" stop-color="black"/></linearGradient>
        <radialGradient id="${id}-lamp"><stop stop-color="${station.color}" stop-opacity=".24"/><stop offset="1" stop-color="${station.color}" stop-opacity="0"/></radialGradient>
        <mask id="${id}-wet"><rect width="1248" height="1248" fill="url(#${id}-foot)"/></mask>
        <mask id="${id}-mirror"><rect y="1210" width="1248" height="210" fill="url(#${id}-reflection)"/></mask>
      </defs>
      <g class="painted-reflection" mask="url(#${id}-mirror)"><image href="${asset}" width="1248" height="1248" transform="translate(0 1670) scale(1 -.36)"/></g>
      <image class="station-painting" href="${asset}" width="1248" height="1248" mask="url(#${id}-wet)"/>
      ${logo}
      <g class="${name === "bizzy" ? "sign-breathe" : "window-light"}" fill="url(#${id}-lamp)">${station.lights.map(([x,y,rx,ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join("")}</g>
      <g class="landing-reflection" stroke="${station.color}" stroke-linecap="round" opacity=".23"><path d="M85 1228Q211 1219 338 1228M504 1253Q639 1246 821 1251M974 1213Q1067 1206 1174 1215" stroke-width="3"/><path d="M142 1300H297M815 1319H986M385 1350H604" stroke-width="2"/></g>
    </svg>`;
  };
})();
