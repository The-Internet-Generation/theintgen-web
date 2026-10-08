/* ==========================================================================
   TIGABITES — shared site script
   Pixel sprites, the chomper mascot, nav/footer, and all the little bites.
   ========================================================================== */

const TB = (window.TB = window.TB || {});

TB.contact = {
  phone: "+91 99402 37330",
  wa: "919940237330",
  email: "jaytesh@theintgen.com",
  instagram: "https://www.instagram.com/tigital.so/",
  instagramHandle: "@tigital.so",
  maps: "https://www.google.com/maps/search/?api=1&query=The+Internet+Generation+Chennai",
  // Apps Script web app that writes to the "Tigabites Website Leads" sheet (Tigital drive > BizDev).
  // Setup steps: "Tigabites Website Leads: Apps Script setup" doc in the same folder. Empty = not logging yet.
  leadsEndpoint: "",
};

// NEEDED: paste the TIGOM playlist link here, e.g. "https://open.spotify.com/playlist/<id>"
TB.spotifyPlaylist = "";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Pixel sprites ----------
   Each sprite is a list of rows; each character is a palette key, "." is empty. */
TB.palette = {
  K: "#140028", W: "#ffffff", w: "#fff3c4", C: "#fff6dc", V: "#1c013b",
  Y: "#fddf29", R: "#ff4d2e", G: "#2fd07a", M: "#6b3a1e", B: "#e8a33d",
  O: "#c97a2b", P: "#ff8fc7", U: "#3b5bff", E: "#1a2bd6",
  H: "#2b1a10", S: "#c68863", T: "#3b5bff", "#": "#ff4d2e",
};

TB.sprites = {
  burger: [
    "...BBBBBB...", ".BBwBBBBBBB.", "BBBBBBBwBBBB", "BBwBBBBBBBwB",
    "GGGGGGGGGGGG", "MMMMMMMMMMMM", "MMMMMMMMMMMM", "YYYYYYYYYYYY",
    ".BBBBBBBBBB.", "..BBBBBBBB..",
  ],
  cone: [
    "..PPPP..", ".PPPPPP.", "PPPWPPPP", "PPPPPPPP", "YYYYYYYY", ".YOYOYO.",
    ".OYOYOY.", "..YOYO..", "..OYOY..", "...YO...", "...OY...", "....Y...",
  ],
  bowl: [
    "...wwwwww...", ".wwwwwwwwww.", "wwwwwwwwwwww", "RRRRRRRRRRRR", ".RRRRRRRRRR.",
    ".RRYYRRYYRR.", "..RRRRRRRR..", "...RRRRRR...", "....RRRR....", "...KKKKKK...",
  ],
  cup: [
    "WWWWWWWW..", "WMMMMMMW..", "WWWWWWWWWW", "WWWWWWWW.W", "WRRRRRRW.W",
    "WWWWWWWWWW", "WWWWWWWW..", ".WWWWWW...", "..WWWW....", "KKKKKKKK..",
  ],
  donut: [
    "..PPPPPP..", ".PPYPPGPP.", "PGPP..PPYP", "PPP....PPP", "PPP....PPP",
    "OPP....PPO", "OOPP..PPOO", ".OOOPPOOO.", "..OOOOOO..",
  ],
  pizza: [
    "OOOOOOOOOO", "OYYYYYYYYO", ".YRYYYRYY.", ".YYYYYYYY.", "..YYRYYY..",
    "..YYYYYY..", "...YYRY...", "...YYYY...", "....YY....",
  ],
  fries: [
    "..Y..Y.Y..", ".YY.YY.YY.", ".YYYYYYYY.", "RRYYYYYYRR", "RRRRRRRRRR",
    "RRRRYYRRRR", "RRRYRRYRRR", ".RRRRRRRR.", ".RRRRRRRR.", "..RRRRRR..",
  ],
  cherry: [
    ".......KK.", "......K.K.", ".....K..K.", "....K...K.", ".RRRR.RRRR",
    "RWRRRRWRRR", "RRRRRRRRRR", "RRRR.RRRR.", ".RR...RR..",
  ],
  momo: [
    "....OO....", "...OwwO...", "..OwwwwO..", ".OwOwwOwO.", "OwwwwwwwwO", "OwwwwwwwwO", ".OOOOOOOO.",
  ],
  recipebook: [
    ".KKKKKKKKKK.", "KRRRRRRRRRRK", "KRYYYYYYYYRK", "KRYKKYYKKYRK", "KRYYYYYYYYRK", "KRRRRRRRRRRK",
    "KRRRRwwRRRRK", "KRRRwwwwRRRK", "KRRRRwwRRRRK", "KRRRRRwRRRRK", "KwwwwwwwwwwK", ".KKKKKKKKKK.",
  ],
  sparkle: [
    ".....P.....", ".....P.....", "....PYP....", "....PYP....", "..PPYYYPP..", "PPYYYWYYYPP",
    "..PPYYYPP..", "....PYP....", "....PYP....", ".....P.....", ".....P.....",
  ],
  moviecam: [
    ".YYY..YYY....", "YYKYYYYKYY...", ".YYY..YYY....", "RRRRRRRRRR..W", "RRRRRRRRRR.WW",
    "RRWWRRRRRRWWW", "RRWWRRRRRRWWW", "RRRRRRRRRR.WW", "RRRRRRRRRR..W", "..R....R.....",
  ],
  shades: [
    "PPPPPPPPPPPPPPP", "PEWEEEP.PEWEEEP", "PEEWEEP.PEEWEEP", "PEEEEEP.PEEEEEP", ".PEEEP...PEEEP.", "..PPP.....PPP..",
  ],
  magnifier: [
    "...UUUU....", ".UU.CC.UU..", ".U.CC...U..", "U.CC.....U.", "U.C......U.", "U........U.",
    ".U......U..", ".UU....UU..", "...UUUUOO..", ".......OOO.", "........OOO",
  ],
  heart: [".RR.RR.", "RRRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."],
  star: [
    "....Y....", "....Y....", "...YYY...", "YYYYYYYYY", ".YYYYYYY.",
    "..YYYYY..", "..YYYYY..", ".YY...YY.", "YY.....YY",
  ],
  chat: [
    ".KKKKKKKKK.", "KWWWWWWWWWK", "KWWWWWWWWWK", "KWKWWKWWKWK", "KWWWWWWWWWK",
    ".KKKKKKKKK.", "..KWK......", "..KK.......",
  ],
  phone: [
    ".KKKKK.", "KWWWWWK", "KYYYYYK", "KYYYYYK", "KYYYYYK",
    "KYYYYYK", "KYYYYYK", "KWWWWWK", "KWWKWWK", ".KKKKK.",
  ],
  mail: [
    "KKKKKKKKKKK", "KKWWWWWWWKK", "KWKWWWWWKWK", "KWWKWWWKWWK",
    "KWWWKKKWWWK", "KWWWWWWWWWK", "KWWWWWWWWWK", "KKKKKKKKKKK",
  ],
  calendar: [
    ".K.....K.", "RRRRRRRRR", "RRRRRRRRR", "WWWWWWWWW", "WKWKWKWKW",
    "WWWWWWWWW", "WKWKWKWKW", "WWWWWWWWW", "KKKKKKKKK",
  ],
  insta: [
    ".PPPPPPP.", "P......PP", "P.......P", "P..PPP..P", "P..P.P..P",
    "P..PPP..P", "P.......P", "P.......P", ".PPPPPPP.",
  ],
  ghost: [
    ".....####.....", "...########...", "..##########..", ".##WW####WW##.",
    ".#WWWW##WWWW#.", ".#WWEE##WWEE#.", "##WWEE##WWEE##", "###WW####WW###",
    "##############", "##############", "##############", "##############",
    "##.###..###.##", "#...##..##...#",
  ],
  scared: [
    ".....####.....", "...########...", "..##########..", ".############.",
    ".###WW##WW###.", ".###WW##WW###.", "##############", "##############",
    "#W##WW##WW##W#", "##WW##WW##WW##", "##############", "##############",
    "##.###..###.##", "#...##..##...#",
  ],
  avatar: [
    "...HHHHHH...", "..HHHHHHHH..", ".HHHHHHHHHH.", ".HHSSSSSSHH.",
    ".HSSSSSSSSH.", ".HSKSSSSKSH.", "..SSSSSSSS..", "..SSSRRSSS..",
    "...SSSSSS...", "....SSSS....", "..TTTTTTTT..", ".TTTTTTTTTT.",
  ],
};

TB.ghostColors = { red: "#ff4d2e", pink: "#ff8fc7", cyan: "#3fe0e0", orange: "#ffb347" };

/** Render a sprite map to an SVG string. `over` overrides palette keys. */
TB.spriteSVG = function (name, over = {}) {
  const rows = TB.sprites[name];
  if (!rows) return "";
  const pal = Object.assign({}, TB.palette, over);
  const h = rows.length, w = rows[0].length;
  let rects = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c !== "." && pal[c]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[c]}"/>`;
    }
  });
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${rects}</svg>`;
};

/** The chomper: a pixel circle with a wedge mouth. Returns one frame's pixel grid. */
TB.chomperGrid = function (n = 13, open = 0.28, dir = "right", eye = true) {
  const dirs = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
  const [dx, dy] = dirs[dir] || dirs.right;
  const c = (n - 1) / 2, r2 = (n / 2) * (n / 2) - 0.6;
  const grid = [];
  const ex = Math.round(c + dy * 0.3 * n + dx * 0.05 * n);
  const ey = Math.round(c - dx * 0.3 * n + dy * 0.05 * n);
  for (let y = 0; y < n; y++) {
    let row = "";
    for (let x = 0; x < n; x++) {
      const vx = x - c, vy = y - c;
      if (vx * vx + vy * vy > r2) { row += "."; continue; }
      const len = Math.hypot(vx, vy) || 1;
      const cos = (vx * dx + vy * dy) / len;
      const inMouth = open > 0 && cos > Math.cos(open * Math.PI * 0.5) && len > 0.6;
      if (inMouth) row += ".";
      else if (eye && x === ex && y === ey) row += "K";
      else row += "Y";
    }
    grid.push(row);
  }
  return grid;
};

/** Chomper SVG with three stacked frames (closed, half, open); CSS cycles them. */
TB.chomperSVG = function (dir = "right", color = "#fddf29", n = 13) {
  const frames = [0, 0.35, 0.62].map((o) => TB.chomperGrid(n, o, dir));
  const pal = { Y: color, K: "#140028" };
  const g = frames.map((rows, i) => {
    let r = "";
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] !== ".") r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[row[x]]}"/>`;
    });
    return `<g class="f${i}">${r}</g>`;
  }).join("");
  return `<svg class="chomp" viewBox="0 0 ${n} ${n}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
};

(function chompCycle() {
  const style = document.createElement("style");
  style.textContent = `.chomp g{display:none}html[data-chomp="0"] .chomp .f0,html[data-chomp="1"] .chomp .f1,html[data-chomp="2"] .chomp .f2,html[data-chomp="3"] .chomp .f1{display:inline}`;
  document.head.appendChild(style);
  let f = 0;
  document.documentElement.dataset.chomp = REDUCED ? "1" : "0";
  if (!REDUCED) setInterval(() => { f = (f + 1) % 4; document.documentElement.dataset.chomp = f; }, 120);
})();

/** Fill every [data-sprite] / [data-chomper] element. */
TB.paint = function (root = document) {
  root.querySelectorAll("[data-sprite]").forEach((el) => {
    if (el.dataset.painted) return;
    const name = el.dataset.sprite;
    const over = {};
    if (el.dataset.color) over["#"] = TB.ghostColors[el.dataset.color] || el.dataset.color;
    if (el.dataset.hair) over.H = el.dataset.hair;
    if (el.dataset.skin) over.S = el.dataset.skin;
    if (el.dataset.shirt) over.T = el.dataset.shirt;
    if (el.dataset.y) over.Y = el.dataset.y;
    if (name === "scared") { over["#"] = "#3b5bff"; over.W = "#ffd6c2"; }
    el.classList.add("sprite");
    el.innerHTML = TB.spriteSVG(name, over);
    el.dataset.painted = 1;
  });
  root.querySelectorAll("[data-chomper]").forEach((el) => {
    if (el.dataset.painted) return;
    el.classList.add("sprite");
    el.innerHTML = TB.chomperSVG(el.dataset.chomper || "right", el.dataset.color || "#fddf29");
    el.dataset.painted = 1;
  });
  root.querySelectorAll("[data-social]").forEach((el) => {
    if (el.dataset.painted) return;
    el.classList.add("sprite", "soc-ic");
    el.innerHTML = TB.socialSVG(el.dataset.social);
    el.dataset.painted = 1;
  });
};

/* ---------- Social media icons (the dots our chomper eats) ----------
   11x11 pixel tiles with a 5-7px glyph. Simplified pixel nods, not official logos. */
TB.socials = {
  facebook:  { bg: "#1877f2", fg: "#fff", g: ["..##.", ".#...", ".#...", "####.", ".#...", ".#...", ".#..."] },
  instagram: { bg: "#e1306c", fg: "#fff", g: ["######", "#...##", "#.##.#", "#.##.#", "#....#", "######"] },
  linkedin:  { bg: "#0a66c2", fg: "#fff", g: ["#....", ".....", "#.##.", "##..#", "#...#", "#...#", "#...#"] },
  pinterest: { bg: "#e60023", fg: "#fff", g: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."] },
  youtube:   { bg: "#ff0000", fg: "#fff", g: ["#...", "##..", "###.", "####", "###.", "##..", "#..."] },
  reddit:    { bg: "#ff4500", fg: "#fff", g: ["...#.", "..#..", ".###.", "#####", "#.#.#", "#####", ".###."] },
  quora:     { bg: "#b92b27", fg: "#fff", g: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"] },
  google:    { bg: "#ffffff", fg: "#4285f4", g: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."] },
  tumblr:    { bg: "#35465c", fg: "#fff", g: [".#...", ".#...", "####.", ".#...", ".#...", ".#..#", "..##."] },
  x:         { bg: "#000000", fg: "#fff", g: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"] },
  threads:   { bg: "#000000", fg: "#fff", g: [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".###."] },
  snapchat:  { bg: "#fffc00", fg: "#000", g: ["..#..", ".###.", ".###.", "#####", ".###.", "#.#.#"] },
  tiktok:    { bg: "#010101", fg: "#25f4ee", g: ["..##.", "..#.#", "..#..", "###..", "###..", ".#..."] },
  whatsapp:  { bg: "#25d366", fg: "#fff", g: [".###.", "#...#", "#.#.#", "#..##", "#...#", ".###.", "#...."] },
};
TB.socialOrder = Object.keys(TB.socials);

TB.socialSVG = function (name) {
  const s = TB.socials[name];
  if (!s) return "";
  const N = 11, h = s.g.length, w = s.g[0].length;
  const ox = Math.floor((N - w) / 2), oy = Math.floor((N - h) / 2);
  let r = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const corner = (x === 0 || x === N - 1) && (y === 0 || y === N - 1);
    if (!corner) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${s.bg}"/>`;
  }
  s.g.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") r += `<rect x="${x + ox}" y="${y + oy}" width="1.02" height="1.02" fill="${s.fg}"/>`;
  });
  return `<svg viewBox="0 0 ${N} ${N}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${r}</svg>`;
};

/* ---------- Nav + footer (shared across pages) ---------- */
const PAGES = [
  ["index.html", "Home", "Start here"],
  ["first-bite.html", "First Bite", "Our story"],
  ["menu.html", "The Menu", "What we cook"],
  ["work.html", "Clean Plates", "The proof"],
  ["kiss-the-chef.html", "Kiss the Chef?", "Say hi"],
];

function currentPage() {
  const f = location.pathname.split("/").pop() || "index.html";
  const clean = f.includes(".") ? f : f + ".html";
  return PAGES.some(([href]) => href === clean) ? clean : "index.html";
}

function buildNav() {
  const here = currentPage();
  const aria = (h) => (h === here ? ' aria-current="page"' : "");
  const links = PAGES.filter(([h]) => h !== "kiss-the-chef.html").map(([h, l]) => `<li><a href="${h}"${aria(h)}>${l}</a></li>`).join("");
  const sheetLinks = PAGES.map(([h, l]) => `<li><a href="${h}"${aria(h)}>${l}</a></li>`).join("");

  const nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML = `
    <div class="wrap">
      <a class="logo" href="index.html" aria-label="Tigabites home"><span data-chomper="right"></span><span>Tiga<b>bites</b></span></a>
      <nav aria-label="Main"><ul class="nav-links">${links}</ul></nav>
      <a class="btn nav-cta" href="kiss-the-chef.html">Book a free consult <span class="arrow">→</span></a>
      <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu-sheet">
        <i class="bun top"></i><span></span><span></span><span></span><i class="bun bottom"></i>
      </button>
    </div>`;

  const sheet = document.createElement("div");
  sheet.className = "menu-sheet";
  sheet.id = "menu-sheet";
  sheet.setAttribute("aria-hidden", "true");
  sheet.innerHTML = `
    <header><span class="logo" style="color:var(--yellow)"><span data-chomper="right"></span><span>Tigabites</span></span>
    <button class="close">CLOSE ✕</button></header>
    <ol>${sheetLinks}</ol>
    <p class="pixel" style="font-size:10px;color:var(--yellow);margin-top:30px">TODAY'S SPECIAL: A FREE 20-MIN CONSULT</p>`;

  document.body.prepend(sheet);
  document.body.prepend(nav);

  const burger = nav.querySelector(".burger");
  const toggle = (open) => {
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) sheet.querySelector(".close").focus();
  };
  burger.addEventListener("click", () => toggle(true));
  sheet.querySelector(".close").addEventListener("click", () => { toggle(false); burger.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet.classList.contains("open")) toggle(false); });

  buildMunchRail();
}

/* Scroll progress: a vertical line of social icons down the right edge.
   The icons stay put; the chomper travels down the line and munches them.
   Scroll back up and it turns around, leaving a trail of pellet dots behind it
   (which it eats again on the way down). */
function buildMunchRail() {
  const rail = document.createElement("div");
  rail.className = "munch-rail";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = `<div class="rail-icons"></div><div class="rail-muncher"><span class="face down" data-chomper="down"></span><span class="face up" data-chomper="up"></span></div>`;
  document.body.appendChild(rail);
  const holder = rail.querySelector(".rail-icons");
  let spots = [], lastP = 0;

  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  const layout = () => {
    const count = Math.max(6, Math.floor(rail.clientHeight / 34));
    holder.innerHTML = "";
    spots = [];
    const p = progress();
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "soc";
      el.style.top = ((i + 1) / (count + 1)) * 100 + "%";
      el.innerHTML = TB.socialSVG(TB.socialOrder[i % TB.socialOrder.length]) + '<i class="pellet"></i>';
      holder.appendChild(el);
      const at = (i + 1) / (count + 1);
      // On load mid-page, everything above the chomper is already eaten
      spots.push({ el, at, state: at <= p + 0.015 ? "gone" : "icon" });
    }
    lastP = p;
    update();
  };
  const update = () => {
    const p = progress();
    if (p > lastP + 0.0005) rail.classList.remove("going-up");
    else if (p < lastP - 0.0005) rail.classList.add("going-up");
    lastP = p;
    rail.style.setProperty("--p", p);
    for (const s of spots) {
      if (s.at <= p + 0.015) s.state = "gone";          // eaten (icon or pellet)
      else if (s.state === "gone") s.state = "dot";      // left behind on the way back up
      s.el.classList.toggle("eaten", s.state === "gone");
      s.el.classList.toggle("trail", s.state === "dot");
    }
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", layout);
  layout();
}

function buildFooter() {
  const c = TB.contact;
  const f = document.createElement("footer");
  f.className = "footer";
  const no = String(Math.floor(1000 + Math.random() * 8999));
  f.innerHTML = `
    <div class="wrap">
      <div class="receipt" role="contentinfo">
        <h4>TIGABITES</h4>
        <p class="center">WE FEED YOUR FEED!<br>The digital marketing venture of TIG<br>ORDER #${no}</p>
        <hr class="rule">
        ${PAGES.map(([h, l, d], i) => `<div class="line"><span>0${i + 1}</span><a href="${h}">${l}</a><span class="fill"></span><span>${d}</span></div>`).join("")}
        <hr class="rule">
        <div class="line"><span>Brands fed</span><span class="fill"></span><span>30+</span></div>
        <div class="line"><span>People reached</span><span class="fill"></span><span>45M+</span></div>
        <div class="line"><span>Junk posts</span><span class="fill"></span><span>0%</span></div>
        <div class="line total"><span>TOTAL</span><span class="fill"></span><span>1 happy feed</span></div>
        <hr class="rule">
        <div class="line"><span>WhatsApp</span><span class="fill"></span><a href="https://wa.me/${c.wa}" target="_blank" rel="noopener">${c.phone}</a></div>
        <div class="line"><span>Email</span><span class="fill"></span><a href="mailto:${c.email}">${c.email}</a></div>
        <div class="line"><span>Instagram</span><span class="fill"></span><a href="${c.instagram}" target="_blank" rel="noopener">${c.instagramHandle}</a></div>
        <div class="line"><span>Find us</span><span class="fill"></span><a href="${c.maps}" target="_blank" rel="noopener">TIG, Chennai ↗</a></div>
        <hr class="rule">
        <p class="center" style="margin:0 0 6px">MORE FROM THE TIG KITCHEN</p>
        <div class="line"><a href="/tiggigs/">TigGigs</a><span class="fill"></span><a href="/tigpods/">TigPods</a><span class="fill"></span><a href="/tigom/">TIGOM</a><span class="fill"></span><a href="/">TIGHQ</a></div>
        <div class="barcode" aria-hidden="true"></div>
        <p class="center" style="margin:0">THANK YOU · VISIT AGAIN</p>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Tigabites, the digital marketing venture of <a href="/">TIG (The Internet Generation)</a></span>
        <span>Made hungry in Chennai</span>
      </div>
    </div>`;
  document.body.appendChild(f);

  const wa = document.createElement("a");
  wa.className = "wa-float";
  wa.href = `https://wa.me/${c.wa}?text=${encodeURIComponent("Hi Tigabites! I'd like to chat about my food brand.")}`;
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.innerHTML = `<span data-sprite="chat"></span><span class="lbl">Chat on WhatsApp</span>`;
  document.body.appendChild(wa);

  buildMusic();
}

/* ---------- TIGOM radio: Spotify player, opened on demand ---------- */
function buildMusic() {
  const box = document.createElement("div");
  box.className = "radio";
  const embed = (TB.spotifyPlaylist || "").replace("open.spotify.com/", "open.spotify.com/embed/").split("?")[0];
  box.innerHTML = `
    <button class="radio-btn" type="button" aria-expanded="false" aria-controls="radio-panel">
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="lbl">TIGOM RADIO</span>
    </button>
    <div class="radio-panel" id="radio-panel" hidden>
      ${embed
        ? `<iframe title="TIGOM playlist on Spotify" data-src="${embed}?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
        : `<p data-draft="add the TIGOM Spotify playlist link in site.js"><strong>Now cooking: the TIGOM playlist.</strong><br>Our open-mic soundtrack lands here soon. Meanwhile, catch TIGOM on the <a href="/tigom/">TIGOM page</a>.</p>`}
    </div>`;
  document.body.appendChild(box);
  const btn = box.querySelector(".radio-btn"), panel = box.querySelector(".radio-panel");
  btn.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    box.classList.toggle("on", open);
    const fr = panel.querySelector("iframe[data-src]");
    if (open && fr && !fr.src) fr.src = fr.dataset.src; // load Spotify only when asked
  });
}

/* ---------- Ticker: duplicate content for a seamless loop ---------- */
function initTickers() {
  document.querySelectorAll(".ticker-track").forEach((t) => { t.innerHTML += t.innerHTML; });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || REDUCED) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((e) => io.observe(e));
}

/* ---------- Count-up numbers ---------- */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  const run = (el) => {
    const to = +el.dataset.count, suf = el.dataset.suffix || "", dur = 1400;
    if (REDUCED) { el.textContent = to.toLocaleString("en-IN") + suf; return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e).toLocaleString("en-IN") + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.5 });
  els.forEach((e) => io.observe(e));
}

/* ---------- Flip cards: tap to flip on touch ---------- */
function initFlips() {
  document.querySelectorAll(".flip").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      card.classList.toggle("flipped");
    });
  });
}

/* ---------- Crumbs on click ---------- */
function initCrumbs() {
  if (REDUCED) return;
  const cols = ["#fddf29", "#ff4d2e", "#c97a2b", "#e8a33d", "#1c013b"];
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    for (let i = 0; i < 7; i++) {
      const s = document.createElement("i");
      s.className = "crumb";
      const a = Math.random() * Math.PI * 2, d = 24 + Math.random() * 40;
      s.style.cssText = `left:${e.clientX - 3}px;top:${e.clientY - 3}px;background:${cols[i % cols.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 20}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 750);
    }
  });
}

/* ---------- First-visit offer pop-up ---------- */
function initOffer() {
  if (currentPage() === "kiss-the-chef.html") return;
  let seen = false;
  try { seen = localStorage.getItem("tb_offer_seen") === "1"; } catch (e) {}
  if (seen) return;
  const box = document.createElement("aside");
  box.className = "offer";
  box.setAttribute("aria-label", "Free consult offer");
  box.innerHTML = `
    <button class="x" aria-label="Close offer">✕</button>
    <span data-chomper="right"></span>
    <h3>Hungry for growth?</h3>
    <p>Grab a free 20-minute strategy chat with our brand experts. No strings, just ideas.</p>
    <a class="btn dark" href="kiss-the-chef.html">Book my free chat <span class="arrow">→</span></a>`;
  document.body.appendChild(box);
  TB.paint(box);
  const close = () => { box.classList.remove("show"); try { localStorage.setItem("tb_offer_seen", "1"); } catch (e) {} };
  box.querySelector(".x").addEventListener("click", close);
  box.querySelector("a").addEventListener("click", close);
  let shown = false;
  const show = () => { if (shown || document.documentElement.classList.contains("loading")) return; shown = true; box.classList.add("show"); };
  setTimeout(show, 16000);
  addEventListener("scroll", () => {
    if (scrollY > (document.documentElement.scrollHeight - innerHeight) * 0.55) show();
  }, { passive: true });
}

/* ---------- Draft markers: ?drafts=1 outlines every placeholder ---------- */
function initDrafts() {
  if (new URLSearchParams(location.search).has("drafts")) document.body.classList.add("show-drafts");
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildNav();
  buildFooter();
  TB.paint();
  initTickers();
  initReveal();
  initCounters();
  initFlips();
  initCrumbs();
  initOffer();
  initDrafts();
  document.dispatchEvent(new CustomEvent("tb:ready"));
});
