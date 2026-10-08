/* ==========================================================================
   TIGABITES chomper mini-games.
   - Loading screen: a 5-second round, once per session on the home page.
     A different game plays on each visit. ?loader=1 forces it; &game=0-4 picks one.
   - Arcade (assets/js/arcade.js): the same five games, longer rounds, with a
     shared high-score board. Both use TBGame.run() below.
   ========================================================================== */
(function () {
  const TB = window.TB;
  const GAME_NAMES = ["SNACK ATTACK", "HOP & CHOMP", "LANE MUNCHER", "WHACK-A-SNACK", "POWER PELLET"];

  /**
   * Run one round in a container holding: canvas, [data-score], .loader-bar i,
   * .loader-hint, [data-game] and an optional .loader-skip.
   * opts: { el, idx, durationMs, mode: "loader" | "arcade", onEnd(score, skipped) }
   */
  function runGame(opts) {
  const el = opts.el;
  const W = 420, H = 520, GAME_MS = opts.durationMs || 5000, OUTRO_MS = opts.mode === "arcade" ? 1000 : 1300;
  const canvas = el.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;

  const scoreEl = el.querySelector("[data-score]");
  const barEl = el.querySelector(".loader-bar i");
  const hintEl = el.querySelector(".loader-hint");
  const nameEl = el.querySelector("[data-game]");

  /* ---- Sprite cache: bake pixel maps once to offscreen canvases ---- */
  const cache = {};
  function bake(key, rows, pal, px) {
    if (cache[key]) return cache[key];
    const c = document.createElement("canvas");
    c.width = rows[0].length * px; c.height = rows.length * px;
    const g = c.getContext("2d");
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const k = row[x];
        if (k !== "." && pal[k]) { g.fillStyle = pal[k]; g.fillRect(x * px, y * px, px, px); }
      }
    });
    return (cache[key] = c);
  }
  const P = TB.palette;
  const sprite = (name, over = {}, px = 3) => bake(name + JSON.stringify(over) + px, TB.sprites[name], Object.assign({}, P, over), px);
  const FOODS = ["burger", "cone", "donut", "pizza", "fries", "cherry", "cup"];
  const GHOSTS = ["#ff4d2e", "#ff8fc7", "#3fe0e0", "#ffb347"];
  const food = () => sprite(FOODS[(Math.random() * FOODS.length) | 0]);
  const ghost = () => sprite("ghost", { "#": GHOSTS[(Math.random() * 4) | 0] });
  const scared = () => sprite("scared", { "#": "#3b5bff", W: "#ffd6c2" });
  const pacFrames = {};
  ["up", "down", "left", "right"].forEach((d) => {
    pacFrames[d] = [0, 0.35, 0.62].map((o, i) => bake("pac" + d + i, TB.chomperGrid(13, o, d), { Y: "#fddf29", K: "#140028" }, 4));
  });

  /* ---- Shared state ---- */
  const S = {
    score: 0, pops: [], frame: 0, frameT: 0, shake: 0, hurt: 0,
    input: false, ptr: { x: null, y: null, tap: false }, keys: { l: false, r: false, u: false, d: false, act: false },
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pop = (x, y, text, color) => S.pops.push({ x, y, text, color, t: 0 });
  function eat(type, x, y) {
    if (type === "dot") S.score += 10;
    else if (type === "food") { S.score += 50; pop(x, y, "+50", "#fddf29"); }
    else if (type === "scared") { S.score += 200; pop(x, y, "+200 BONUS", "#3fe0e0"); }
    else if (type === "ghost" && S.hurt <= 0) { S.score = Math.max(0, S.score - 100); S.hurt = 0.6; S.shake = 0.25; pop(x, y, "OUCH -100", "#ff4d2e"); }
  }
  function drawPac(x, y, dir) {
    if (S.hurt > 0 && Math.floor(S.hurt * 20) % 2) return;
    const f = pacFrames[dir][[0, 1, 2, 1][S.frame]];
    ctx.drawImage(f, (x - f.width / 2) | 0, (y - f.height / 2) | 0);
  }
  function drawItem(it) {
    if (it.type === "dot") { ctx.fillStyle = "#fff6dc"; ctx.fillRect(it.x - 5, it.y - 5, 10, 10); }
    else ctx.drawImage(it.img, (it.x - it.img.width / 2) | 0, (it.y - it.img.height / 2) | 0);
  }
  function makeItem(type, x, y, extra = {}) {
    const img = type === "food" ? food() : type === "ghost" ? ghost() : type === "scared" ? scared() : null;
    return Object.assign({ type, x, y, img, s: type === "dot" ? 10 : type === "food" ? 32 : 38 }, extra);
  }
  const rollType = (pDot, pFood, pGhost) => { const r = Math.random(); return r < pDot ? "dot" : r < pDot + pFood ? "food" : r < pDot + pFood + pGhost ? "ghost" : "scared"; };
  function bg(style) {
    ctx.fillStyle = "#0d001f"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#3b5bff"; ctx.lineWidth = 3;
    if (style === "rails") { [16, W - 16].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }); }
    if (style === "box") ctx.strokeRect(14, 14, W - 28, H - 28);
  }

  /* ======================================================================
     The five games. Each has: name, hint, init, update(dt, t), draw(t).
     Every game has an autopilot so the loader looks alive with no input.
     ====================================================================== */
  const GAMES = [
    /* 0 — Snack Attack: catch falling snacks from below */
    {
      name: "SNACK ATTACK", hint: "MOVE OR DRAG TO CATCH · DODGE GHOSTS",
      init() {
        this.pac = { x: W / 2, y: H - 46 }; this.items = []; this.spawnT = 0;
        for (let i = 0; i < 9; i++) this.spawn(-40 + i * 44);
      },
      spawn(y = -40) {
        const t = rollType(0.5, 0.2, 0.17);
        this.items.push(makeItem(t, rnd(34, W - 34), y, { vy: rnd(240, 320) * (t === "dot" ? 1 : 0.88), wob: t.includes("g") || t === "scared" ? rnd(0, 6) : null }));
      },
      auto() {
        const p = this.pac; let best = null, bs = -1e9;
        for (const it of this.items) {
          if (it.y > p.y - 10 || it.type === "ghost") continue;
          const sc = { dot: 1, food: 3, scared: 6 }[it.type] * 2 - Math.abs(it.x - p.x) / 120 - (p.y - it.y) / it.vy * 0.8;
          if (sc > bs) { bs = sc; best = it; }
        }
        let tx = best ? best.x : W / 2;
        for (const it of this.items) if (it.type === "ghost" && it.y > p.y - 160 && it.y < p.y + 10 && Math.abs(it.x - tx) < 46) tx = it.x + (it.x > W / 2 ? -80 : 80);
        return tx;
      },
      update(dt) {
        const p = this.pac;
        let tx = S.input ? S.ptr.x : this.auto();
        if (S.keys.l || S.keys.r) tx = p.x + (S.keys.r ? 400 : -400) * dt;
        if (tx != null) p.x += (tx - p.x) * Math.min(1, dt * (S.input ? 18 : 7));
        p.x = Math.max(26, Math.min(W - 26, p.x));
        if ((this.spawnT -= dt) <= 0) { this.spawn(); this.spawnT = rnd(0.1, 0.2); }
        for (const it of this.items) {
          it.y += it.vy * dt;
          if (it.wob != null) it.x += Math.sin((it.y + it.wob * 40) / 30) * 0.8;
          if (!it.dead && Math.hypot(it.x - p.x, it.y - (p.y - 8)) < 26 + it.s * 0.35) { it.dead = true; eat(it.type, it.x, it.y); }
        }
        this.items = this.items.filter((it) => !it.dead && it.y < H + 50);
      },
      draw(t) {
        bg("rails");
        ctx.fillStyle = "rgba(255,246,220,.07)";
        for (let y = ((t / 8) % 26) - 26; y < H; y += 26) for (let x = 36; x < W - 30; x += 26) ctx.fillRect(x, y, 3, 3);
        this.items.forEach(drawItem);
        drawPac(this.pac.x, this.pac.y, "up");
      },
    },

    /* 1 — Hop & Chomp: an endless runner; jump over ghosts */
    {
      name: "HOP & CHOMP", hint: "TAP, CLICK OR SPACE TO JUMP OVER GHOSTS",
      init() {
        this.ground = 400; this.pac = { x: 92, y: this.ground - 26, vy: 0 }; this.items = []; this.spawnX = 0;
        for (let x = 180; x < W + 200; x += 46) this.spawnAt(x, true);
      },
      spawnAt(x, safe) {
        const t = safe ? "dot" : rollType(0.48, 0.2, 0.22);
        const air = t === "food" || (t === "dot" && Math.random() < 0.35);
        this.items.push(makeItem(t, x, air ? this.ground - 110 : this.ground - 22));
      },
      jump() { if (this.pac.y >= this.ground - 27) this.pac.vy = -620; },
      update(dt) {
        const p = this.pac, speed = 270;
        if (S.ptr.tap || S.keys.act || S.keys.u) { this.jump(); S.ptr.tap = false; }
        if (!S.input) {
          const next = this.items.find((it) => it.x > p.x + 10 && it.x < p.x + 120);
          if (next && (next.type === "ghost" || (next.type !== "scared" && next.y < this.ground - 60)) && next.x - p.x < 95) this.jump();
        }
        p.vy += 1700 * dt; p.y += p.vy * dt;
        if (p.y > this.ground - 26) { p.y = this.ground - 26; p.vy = 0; }
        for (const it of this.items) {
          it.x -= speed * dt;
          if (!it.dead && Math.hypot(it.x - p.x, it.y - p.y) < 24 + it.s * 0.35) { it.dead = true; eat(it.type, it.x, it.y); }
        }
        this.items = this.items.filter((it) => !it.dead && it.x > -40);
        const last = this.items.reduce((m, it) => Math.max(m, it.x), 0);
        if (last < W + 40) this.spawnAt(last + rnd(46, 80), false);
      },
      draw(t) {
        bg("box");
        ctx.strokeStyle = "#3b5bff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(14, this.ground + 2); ctx.lineTo(W - 14, this.ground + 2); ctx.stroke();
        ctx.fillStyle = "rgba(59,91,255,.35)";
        for (let x = W - ((t * 0.27) % 40); x > 0; x -= 40) ctx.fillRect(x, this.ground + 14, 18, 4);
        this.items.forEach(drawItem);
        drawPac(this.pac.x, this.pac.y, this.pac.vy < -50 ? "up" : "right");
      },
    },

    /* 2 — Lane Muncher: three lanes of incoming snacks */
    {
      name: "LANE MUNCHER", hint: "TAP ABOVE OR BELOW TO SWITCH LANES · ↑ ↓ KEYS",
      init() {
        this.lanes = [H * 0.32, H * 0.5, H * 0.68]; this.lane = 1; this.pac = { x: 80, y: this.lanes[1] }; this.items = [];
        for (let x = 170; x < W + 220; x += 64) this.spawnAt(x);
      },
      spawnAt(x) {
        const lane = (Math.random() * 3) | 0;
        this.items.push(makeItem(rollType(0.45, 0.25, 0.2), x, this.lanes[lane], { lane }));
        if (Math.random() < 0.4) this.items.push(makeItem("dot", x, this.lanes[(lane + 1 + ((Math.random() * 2) | 0)) % 3], { lane: -1 }));
      },
      update(dt) {
        const p = this.pac;
        if (S.keys.u) { this.lane = Math.max(0, this.lane - 1); S.keys.u = false; }
        if (S.keys.d) { this.lane = Math.min(2, this.lane + 1); S.keys.d = false; }
        if (S.ptr.tap) { this.lane = S.ptr.y < p.y - 30 ? Math.max(0, this.lane - 1) : S.ptr.y > p.y + 30 ? Math.min(2, this.lane + 1) : this.lane; S.ptr.tap = false; }
        if (!S.input) {
          const score = (l) => this.items.filter((it) => Math.abs(it.y - this.lanes[l]) < 4 && it.x > p.x && it.x < p.x + 190)
            .reduce((s, it) => s + ({ dot: 1, food: 3, scared: 6, ghost: -12 }[it.type]) / (1 + (it.x - p.x) / 80), 0) - Math.abs(l - this.lane) * 0.3;
          this.lane = [0, 1, 2].reduce((b, l) => (score(l) > score(b) ? l : b), this.lane);
        }
        p.y += (this.lanes[this.lane] - p.y) * Math.min(1, dt * 16);
        for (const it of this.items) {
          it.x -= 300 * dt;
          if (!it.dead && Math.hypot(it.x - p.x, it.y - p.y) < 24 + it.s * 0.3) { it.dead = true; eat(it.type, it.x, it.y); }
        }
        this.items = this.items.filter((it) => !it.dead && it.x > -40);
        const last = this.items.reduce((m, it) => Math.max(m, it.x), 0);
        if (last < W + 40) this.spawnAt(last + rnd(58, 80));
      },
      draw() {
        bg("box");
        ctx.strokeStyle = "rgba(59,91,255,.6)"; ctx.lineWidth = 2; ctx.setLineDash([8, 10]);
        [(this.lanes[0] + this.lanes[1]) / 2, (this.lanes[1] + this.lanes[2]) / 2].forEach((y) => { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 20, y); ctx.stroke(); });
        ctx.setLineDash([]);
        this.items.forEach(drawItem);
        drawPac(this.pac.x, this.pac.y, "right");
      },
    },

    /* 3 — Whack-a-Snack: snacks pop up on plates; tap to send the chomper */
    {
      name: "WHACK-A-SNACK", hint: "TAP A PLATE TO CHOMP IT · SKIP THE GHOSTS",
      init() {
        this.cells = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) this.cells.push({ x: 90 + c * 120, y: 130 + r * 130, item: null, life: 0 });
        this.pac = { x: this.cells[4].x, y: this.cells[4].y, tx: this.cells[4].x, ty: this.cells[4].y, dir: "right" };
        this.spawnT = 0;
      },
      update(dt) {
        const p = this.pac;
        if ((this.spawnT -= dt) <= 0) {
          const free = this.cells.filter((c) => !c.item);
          if (free.length) { const c = free[(Math.random() * free.length) | 0]; c.item = makeItem(rollType(0.15, 0.5, 0.22), c.x, c.y); c.life = rnd(0.7, 1.1); }
          this.spawnT = rnd(0.16, 0.3);
        }
        for (const c of this.cells) if (c.item && (c.life -= dt) <= 0) c.item = null;
        if (S.ptr.tap) {
          const c = this.cells.reduce((b, c) => (Math.hypot(c.x - S.ptr.x, c.y - S.ptr.y) < Math.hypot(b.x - S.ptr.x, b.y - S.ptr.y) ? c : b));
          p.tx = c.x; p.ty = c.y; S.ptr.tap = false;
        } else if (!S.input) {
          const good = this.cells.filter((c) => c.item && c.item.type !== "ghost").sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
          if (good) { p.tx = good.x; p.ty = good.y; }
        }
        const dx = p.tx - p.x, dy = p.ty - p.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
        p.x += dx * Math.min(1, dt * 14); p.y += dy * Math.min(1, dt * 14);
        for (const c of this.cells) if (c.item && Math.hypot(c.x - p.x, c.y - p.y) < 18) { eat(c.item.type, c.x, c.y); c.item = null; }
      },
      draw() {
        bg("box");
        for (const c of this.cells) {
          ctx.fillStyle = "#2c0a58"; ctx.beginPath(); ctx.ellipse(c.x, c.y + 18, 44, 14, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#3b5bff"; ctx.lineWidth = 2; ctx.stroke();
          if (c.item) drawItem(c.item);
        }
        drawPac(this.pac.x, this.pac.y, this.pac.dir);
      },
    },

    /* 4 — Power Pellet: free roam, the ghosts are scared and on the menu */
    {
      name: "POWER PELLET", hint: "DRAG OR USE ARROWS · EAT THE BLUE GHOSTS",
      init() {
        this.pac = { x: W / 2, y: H / 2, dir: "right" }; this.items = [];
        for (let y = 60; y < H - 40; y += 52) for (let x = 50; x < W - 30; x += 52) if (Math.random() < 0.55) this.items.push(makeItem("dot", x, y));
        this.ghosts = [];
        for (let i = 0; i < 4; i++) this.addGhost();
      },
      addGhost() {
        const a = rnd(0, Math.PI * 2);
        this.ghosts.push(makeItem("scared", rnd(50, W - 50), Math.random() < 0.5 ? 50 : H - 50, { vx: Math.cos(a) * 120, vy: Math.sin(a) * 120 }));
      },
      update(dt) {
        const p = this.pac;
        let tx = null, ty = null;
        if (S.input && S.ptr.x != null) { tx = S.ptr.x; ty = S.ptr.y; }
        if (S.keys.l || S.keys.r || S.keys.u || S.keys.d) { tx = p.x + (S.keys.r ? 300 : S.keys.l ? -300 : 0) * dt * 8; ty = p.y + (S.keys.d ? 300 : S.keys.u ? -300 : 0) * dt * 8; }
        if (!S.input) {
          const all = this.ghosts.concat(this.items);
          const t = all.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) / (a.type === "scared" ? 2.5 : 1) - Math.hypot(b.x - p.x, b.y - p.y) / (b.type === "scared" ? 2.5 : 1))[0];
          if (t) { tx = t.x; ty = t.y; }
        }
        if (tx != null) {
          const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), sp = Math.min(d, 290 * dt);
          if (d > 3) { p.x += (dx / d) * sp; p.y += (dy / d) * sp; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up"; }
        }
        p.x = Math.max(36, Math.min(W - 36, p.x)); p.y = Math.max(36, Math.min(H - 36, p.y));
        for (const g of this.ghosts) {
          g.x += g.vx * dt; g.y += g.vy * dt;
          if (g.x < 36 || g.x > W - 36) g.vx *= -1;
          if (g.y < 36 || g.y > H - 36) g.vy *= -1;
          if (!g.dead && Math.hypot(g.x - p.x, g.y - p.y) < 34) { g.dead = true; eat("scared", g.x, g.y); }
        }
        for (const it of this.items) if (!it.dead && Math.hypot(it.x - p.x, it.y - p.y) < 24) { it.dead = true; eat("dot", it.x, it.y); }
        this.items = this.items.filter((i) => !i.dead);
        const before = this.ghosts.length;
        this.ghosts = this.ghosts.filter((g) => !g.dead);
        for (let i = this.ghosts.length; i < before; i++) this.addGhost();
      },
      draw(t) {
        bg("box");
        ctx.strokeStyle = "rgba(59,91,255,.55)"; ctx.lineWidth = 3;
        [[110, 150, 70, 0], [240, 360, 70, 0], [120, 330, 0, 60], [300, 120, 0, 60]].forEach(([x, y, w, h]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.stroke(); });
        this.items.forEach(drawItem);
        const blink = t > GAME_MS - 1200 && Math.floor(t / 150) % 2;
        for (const g of this.ghosts) { if (blink) ctx.globalAlpha = 0.5; drawItem(g); ctx.globalAlpha = 1; }
        drawPac(this.pac.x, this.pac.y, this.pac.dir);
      },
    },
  ];

  const game = GAMES[opts.idx % GAMES.length];
  if (nameEl) nameEl.textContent = game.name;
  hintEl.innerHTML = game.hint + (opts.mode === "arcade" ? "" : "<br>LOADING YOUR APPETITE…");
  game.init();
  if (opts.mode === "arcade") S.input = true; // no autopilot when someone is actually playing

  /* ---- Loop ---- */
  let t0 = 0, last = 0, phase = "play", outroT = 0, raf, finished = false;

  function step(dt, elapsed) {
    game.update(dt, elapsed);
    if (S.hurt > 0) S.hurt -= dt;
    if (S.shake > 0) S.shake -= dt;
    for (const p of S.pops) p.t += dt;
    S.pops = S.pops.filter((p) => p.t < 0.8);
    if ((S.frameT += dt) > 0.07) { S.frameT = 0; S.frame = (S.frame + 1) % 4; }
  }

  function render(elapsed) {
    ctx.save();
    if (S.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    game.draw(elapsed);
    ctx.textAlign = "center";
    ctx.font = '10px "Press Start 2P", monospace';
    for (const p of S.pops) { ctx.globalAlpha = 1 - p.t / 0.8; ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y - p.t * 50); }
    ctx.globalAlpha = 1;
    if (phase === "outro") {
      ctx.fillStyle = "rgba(28,1,59,.82)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fddf29"; ctx.font = '28px "Press Start 2P", monospace';
      ctx.fillText("BURP!", W / 2, H / 2 - 30);
      ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = "#fff6dc";
      ctx.fillText("SCORE " + S.score, W / 2, H / 2 + 6);
      ctx.fillText(opts.mode === "arcade" ? "TIME'S UP!" : S.score >= 600 ? "NOW THAT'S AN APPETITE" : "APPETITE: LOADED", W / 2, H / 2 + 34);
    }
    ctx.restore();
  }

  function loop(t) {
    if (!t0) { t0 = t; last = t; }
    let acc = Math.min(0.25, (t - last) / 1000); // fixed 60Hz steps for slow devices
    last = t;
    const elapsed = t - t0;
    while (acc > 0) { const s = Math.min(1 / 60, acc); step(s, elapsed); acc -= s; }
    if (phase === "play") {
      barEl.style.width = Math.min(100, (elapsed / GAME_MS) * 100) + "%";
      if (elapsed >= GAME_MS) { phase = "outro"; outroT = t; }
    } else if (t - outroT > OUTRO_MS) return finish();
    scoreEl.textContent = String(S.score).padStart(5, "0");
    render(elapsed);
    raf = requestAnimationFrame(loop);
  }

  function finish(skipped) {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(safety);
    removeEventListener("keydown", onKeyDown);
    removeEventListener("keyup", onKeyUp);
    if (opts.onEnd) opts.onEnd(S.score, skipped === true);
  }

  /* ---- Controls ---- */
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  const takeOver = () => { S.input = true; };
  canvas.addEventListener("pointermove", (e) => { takeOver(); [S.ptr.x, S.ptr.y] = toCanvas(e); });
  canvas.addEventListener("pointerdown", (e) => { takeOver(); [S.ptr.x, S.ptr.y] = toCanvas(e); S.ptr.tap = true; });
  const keyMap = { ArrowLeft: "l", a: "l", ArrowRight: "r", d: "r", ArrowUp: "u", w: "u", ArrowDown: "d", s: "d", " ": "act", Enter: "act" };
  function onKeyDown(e) {
    if (finished) return;
    if (e.key === "Escape") return finish(true);
    const k = keyMap[e.key];
    if (k) { takeOver(); S.keys[k] = true; S.ptr.x = null; e.preventDefault(); }
  }
  function onKeyUp(e) {
    const k = keyMap[e.key];
    if (k) S.keys[k] = false;
    if (k === "l" || k === "r") S.ptr.x = game.pac ? game.pac.x : null;
  }
  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);
  const skip = el.querySelector(".loader-skip");
  if (skip) skip.onclick = () => finish(true);

  let safety = 0;
  const start = () => { safety = setTimeout(() => finish(), GAME_MS + OUTRO_MS + 4000); raf = requestAnimationFrame(loop); };
  (document.fonts && document.fonts.load) ? document.fonts.load('10px "Press Start 2P"').then(start, start) : start();
  return { stop: () => finish(true) };
  }

  window.TBGame = { run: runGame, names: GAME_NAMES };

  /* ---- Loading screen: once per session on the home page ---- */
  const root = document.documentElement;
  const el = document.querySelector(".loader");
  if (!el) return;
  if (!root.classList.contains("loading")) { el.remove(); return; }
  const q = new URLSearchParams(location.search);
  let idx = 0;
  try { idx = (parseInt(localStorage.getItem("tb_game_idx") || "0", 10) || 0) % GAME_NAMES.length; } catch (e) {}
  if (q.has("game")) idx = Math.abs(parseInt(q.get("game"), 10) || 0) % GAME_NAMES.length;
  try { localStorage.setItem("tb_game_idx", String((idx + 1) % GAME_NAMES.length)); } catch (e) {}
  runGame({
    el, idx, durationMs: 5000, mode: "loader",
    onEnd() {
      try { sessionStorage.setItem("tb_played", "1"); } catch (e) {}
      el.classList.add("done");
      setTimeout(() => { root.classList.remove("loading"); el.remove(); document.dispatchEvent(new CustomEvent("tb:loader-done")); }, 600);
    },
  });
})();
