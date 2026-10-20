/* ==========================================================================
   TIGABITES arcade: replay the five chomper games after the site loads,
   with a shared high-score board (Supabase: tigabites_scores).
   - A small "Play now" button floats in after the loading screen.
   - [data-arcade-open] anywhere on the page opens the arcade (optional data-game="0-4").
   - #hof renders the Hall of Fame board on the home page.
   ========================================================================== */
(function () {
  const ROUND_MS = 20000;
  const SB = {
    url: "https://snlcskmszhbipinffwpy.supabase.co",
    key: "sb_publishable_8_Fj46gQBqoA4HgidRKP6g_1uDbhWPM", // publishable key, safe in the browser
  };
  const NAMES = () => (window.TBGame ? TBGame.names : ["SNACK ATTACK", "HOP & CHOMP", "LANE MUNCHER", "WHACK-A-SNACK", "POWER PELLET"]);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---- Scores API ----
     Goes through our own /tigabites/api/scores proxy first (some mobile networks in
     India block supabase.co, which showed up as "Failed to fetch"), then falls back
     to Supabase directly, e.g. on a local preview with no Pages Functions. */
  const API = "/tigabites/api/scores";
  async function viaProxyOrDirect(proxy, direct) {
    try { const r = await proxy(); if (r.status !== 404 && r.status !== 405 && r.status < 500) return r; } catch (e) {}
    return direct();
  }
  async function topScores(game, limit = 10) {
    const r = await viaProxyOrDirect(
      () => fetch(`${API}?game=${game}`, { cache: "no-store" }),
      () => fetch(`${SB.url}/rest/v1/tigabites_scores?select=name,score&game=eq.${game}&order=score.desc,created_at.asc&limit=${limit}`, { headers: { apikey: SB.key } })
    );
    if (!r.ok) throw new Error("board unavailable");
    return r.json();
  }
  async function submitScore(game, name, score) {
    let r;
    try {
      r = await viaProxyOrDirect(
        () => fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game, name, score }) }),
        () => fetch(`${SB.url}/rest/v1/rpc/submit_tigabites_score`, {
          method: "POST",
          headers: { apikey: SB.key, "Content-Type": "application/json" },
          body: JSON.stringify({ p_game: game, p_name: name, p_score: score }),
        })
      );
    } catch (e) {
      throw new Error("Couldn't reach the board. Check your connection and tap Save again.");
    }
    if (!r.ok) {
      let msg = "Couldn't save that one. Try again in a minute.";
      try { const j = await r.json(); if (/too many/.test(j.message)) msg = "The board's busy. Try again in a minute."; } catch (e) {}
      throw new Error(msg);
    }
  }
  const boardHTML = (rows, highlight) => rows.length
    ? `<ol class="board">${rows.map((r, i) => `<li class="${highlight && r.name === highlight.name && r.score === highlight.score ? "you" : ""}"><span class="rk">${String(i + 1).padStart(2, "0")}</span><span class="nm">${esc(r.name)}</span><span class="sc">${String(r.score).padStart(5, "0")}</span></li>`).join("")}</ol>`
    : `<p class="board-empty">No scores yet. The top spot is yours for the taking.</p>`;

  /* ---- Overlay ---- */
  let ov, run = null, current = 0, lastFocus = null;
  function build() {
    ov = document.createElement("div");
    ov.className = "arcade-ov";
    ov.hidden = true;
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Tigabites arcade");
    ov.innerHTML = `
      <button class="loader-skip ao-close" type="button">CLOSE ✕</button>
      <div class="loader-brand"><img class="loader-logo" src="assets/img/brand/tigabites-logo.png" alt="Tigabites"><span>ARCADE</span></div>
      <div class="ao-menu">
        <p class="ao-sub">PICK A GAME · ${ROUND_MS / 1000} SECONDS · BEAT THE BOARD</p>
        <div class="ao-games">${NAMES().map((n, i) => `<button type="button" class="ao-game" data-g="${i}"><span data-chomper="right"></span><b>${n}</b><small data-best="${i}">BEST —</small></button>`).join("")}</div>
        <p class="ao-hof-link"><button class="btn ghost" type="button" data-view-hof>🏆 Just looking? View the Hall of Fame</button></p>
      </div>
      <div class="ao-hof" hidden>
        <p class="ao-sub">HALL OF FAME · TOP 10 PER GAME</p>
        <div class="hof-tabs" role="tablist" aria-label="Choose a game">${NAMES().map((n, i) => `<button role="tab" type="button" data-hg="${i}" aria-selected="${i === 0}">${n}</button>`).join("")}</div>
        <div class="ao-board"></div>
        <div class="ao-actions"><button class="btn" type="button" data-hof-play>Play ${esc(NAMES()[0])}</button><button class="btn ghost" type="button" data-menu>All games</button></div>
      </div>
      <div class="ao-play" hidden>
        <div class="loader-top"><span>1UP <em data-score>00000</em></span><span data-game></span></div>
        <canvas width="420" height="520" aria-label="Game canvas"></canvas>
        <div class="loader-bar" aria-hidden="true"><i></i></div>
        <p class="loader-hint"></p>
      </div>
      <div class="ao-over" hidden>
        <p class="ao-sub" data-over-game></p>
        <p class="ao-score"><span data-final>0</span><small>POINTS</small></p>
        <form class="ao-save">
          <label for="ao-name" class="ao-sub">NAME FOR THE BOARD</label>
          <div class="ao-row"><input id="ao-name" name="name" maxlength="16" autocomplete="nickname" placeholder="YOUR NAME" required><button class="btn" type="submit">Save score</button></div>
          <p class="ao-msg" role="status"></p>
        </form>
        <div class="ao-board"></div>
        <div class="ao-actions"><button class="btn" type="button" data-again>Play again</button><button class="btn ghost" type="button" data-menu>Other games</button></div>
      </div>`;
    document.body.appendChild(ov);
    if (window.TB && TB.paint) TB.paint(ov);

    ov.querySelector(".ao-close").addEventListener("click", close);
    ov.querySelectorAll(".ao-game").forEach((b) => b.addEventListener("click", () => play(+b.dataset.g)));
    ov.querySelector("[data-again]").addEventListener("click", () => play(current));
    ov.querySelectorAll("[data-menu]").forEach((b) => b.addEventListener("click", showMenu));
    ov.querySelector("[data-view-hof]").addEventListener("click", () => showHof());
    ov.querySelectorAll("[data-hg]").forEach((t) => t.addEventListener("click", () => showHof(+t.dataset.hg)));
    ov.querySelector("[data-hof-play]").addEventListener("click", () => play(ovHofGame));
    ov.querySelector(".ao-save").addEventListener("submit", onSave);
    ov.addEventListener("keydown", (e) => { if (e.key === "Escape" && !run) close(); });
  }
  const show = (part) => ["menu", "play", "over", "hof"].forEach((p) => (ov.querySelector(".ao-" + p).hidden = p !== part));

  function open(game, view) {
    if (!ov) build();
    lastFocus = document.activeElement;
    ov.hidden = false;
    document.documentElement.classList.add("arcade-open");
    if (view === "hof") showHof(Number.isInteger(game) ? game : 0);
    else if (Number.isInteger(game)) play(game); else showMenu();
  }
  // Scores only, no playing required
  let ovHofGame = 0;
  function showHof(g = ovHofGame) {
    ovHofGame = g;
    show("hof");
    const box = ov.querySelector(".ao-hof");
    box.querySelectorAll("[data-hg]").forEach((t) => t.setAttribute("aria-selected", String(+t.dataset.hg === g)));
    box.querySelector("[data-hof-play]").textContent = "Play " + NAMES()[g];
    loadBoard(box.querySelector(".ao-board"), g);
    box.querySelector(`[data-hg="${g}"]`).focus();
  }
  function close() {
    if (run) { const r = run; run = null; r.stop(); }
    ov.hidden = true;
    document.documentElement.classList.remove("arcade-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    renderHof();
  }
  function showMenu() {
    show("menu");
    NAMES().forEach((_, i) => { const b = store.get("tb_best_" + i); ov.querySelector(`[data-best="${i}"]`).textContent = b ? "YOUR BEST " + b : "NOT PLAYED YET"; });
    ov.querySelector(".ao-game").focus();
  }
  function play(i) {
    if (!window.TBGame) return;
    current = i;
    show("play");
    const box = ov.querySelector(".ao-play");
    // fresh canvas each round so old listeners never leak between runs
    const old = box.querySelector("canvas"), c = old.cloneNode(false); old.replaceWith(c);
    box.querySelector(".loader-bar i").style.width = "0";
    run = TBGame.run({ el: box, idx: i, durationMs: ROUND_MS, mode: "arcade", onEnd: (score, skipped) => { run = null; if (ov.hidden) return; if (skipped) showMenu(); else over(score); } });
  }
  let lastScore = 0;
  async function over(score) {
    lastScore = score;
    show("over");
    const best = +(store.get("tb_best_" + current) || 0);
    if (score > best) store.set("tb_best_" + current, String(score));
    ov.querySelector("[data-over-game]").textContent = NAMES()[current] + (score > best && best ? " · NEW PERSONAL BEST" : "");
    ov.querySelector("[data-final]").textContent = String(score).padStart(5, "0");
    const form = ov.querySelector(".ao-save");
    form.hidden = score <= 0;
    form.querySelector("button").disabled = false;
    form.querySelector(".ao-msg").textContent = "";
    const input = form.querySelector("input");
    input.value = store.get("tb_name") || "";
    loadBoard(ov.querySelector(".ao-board"), current);
    (score > 0 ? input : ov.querySelector("[data-again]")).focus();
  }
  async function onSave(e) {
    e.preventDefault();
    const form = e.currentTarget, btn = form.querySelector("button"), msg = form.querySelector(".ao-msg");
    const name = form.name.value.replace(/[^A-Za-z0-9 ._-]/g, "").trim().slice(0, 16);
    if (!name) { msg.textContent = "Letters and numbers only, please."; return; }
    btn.disabled = true;
    msg.textContent = "Saving…";
    try {
      await submitScore(current, name, lastScore);
      store.set("tb_name", name);
      msg.textContent = "Saved. You're on the board!";
      form.hidden = true;
      loadBoard(ov.querySelector(".ao-board"), current, { name, score: lastScore });
    } catch (err) {
      msg.textContent = err.message;
      btn.disabled = false;
    }
  }
  async function loadBoard(box, game, highlight) {
    box.innerHTML = `<p class="board-empty">Loading the board…</p>`;
    try { box.innerHTML = `<p class="ao-sub">TOP 10 · ${esc(NAMES()[game])}</p>` + boardHTML(await topScores(game), highlight); }
    catch (e) { box.innerHTML = `<p class="board-empty">The board is taking a snack break. Try again soon.</p>`; }
  }

  /* ---- Home page Hall of Fame ---- */
  let hofGame = 0;
  function renderHof() {
    const hof = document.getElementById("hof");
    if (!hof) return;
    if (!hof.dataset.ready) {
      hof.dataset.ready = "1";
      hof.innerHTML = `
        <div class="hof-tabs" role="tablist" aria-label="Choose a game">${NAMES().map((n, i) => `<button role="tab" type="button" data-g="${i}" aria-selected="${i === 0}">${n}</button>`).join("")}</div>
        <div class="hof-board" role="tabpanel"></div>
        <div class="hof-cta"><button class="btn" type="button" data-hof-play>Play ${esc(NAMES()[0])} <span class="arrow">▶</span></button></div>`;
      hof.querySelectorAll("[role=tab]").forEach((t) => t.addEventListener("click", () => {
        hofGame = +t.dataset.g;
        hof.querySelectorAll("[role=tab]").forEach((x) => x.setAttribute("aria-selected", String(x === t)));
        hof.querySelector("[data-hof-play]").innerHTML = `Play ${esc(NAMES()[hofGame])} <span class="arrow">▶</span>`;
        loadBoard(hof.querySelector(".hof-board"), hofGame);
      }));
      hof.querySelector("[data-hof-play]").addEventListener("click", () => open(hofGame));
    }
    loadBoard(hof.querySelector(".hof-board"), hofGame);
  }

  /* ---- Floating "Play now" button ---- */
  function addPlayButton() {
    if (document.querySelector(".play-chip")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "play-chip";
    b.innerHTML = `<span data-chomper="right"></span><span class="lbl">PLAY NOW</span><span class="nudge">Missed a bite? Come back and play</span>`;
    b.addEventListener("click", () => open());
    document.body.appendChild(b);
    if (window.TB && TB.paint) TB.paint(b);
    setTimeout(() => b.classList.add("in"), 50);
    setTimeout(() => b.classList.add("quiet"), 7000); // the nudge text tucks away after a few seconds
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-arcade-open]");
    if (!t) return;
    e.preventDefault();
    open(t.dataset.game != null ? +t.dataset.game : undefined, t.dataset.arcadeOpen || undefined);
  });

  window.TBArcade = { open };
  document.addEventListener("tb:ready", () => {
    renderHof();
    if (document.documentElement.classList.contains("loading")) document.addEventListener("tb:loader-done", addPlayButton, { once: true });
    else addPlayButton();
  });
})();
