/* ==========================================================================
   TIGABITES — work data + GIF-style preview tiles
   Shared by Home ("Peek into the kitchen") and the Clean Plates work page.
   All items come from assets/data/work-data.json.
   ========================================================================== */
(function () {
  const W = (window.TBWork = {});
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  W.DATA_URL = "assets/data/work-data.json";
  // Preview loops from scripts/make_previews.py live at the repo root: /assets/tigabites/work/previews
  W.PREVIEW_BASE = "../assets/tigabites/work/previews/";

  let cache = null;
  W.load = () => (cache = cache || fetch(W.DATA_URL).then((r) => r.json()));

  W.folder = (cat) => cat.toLowerCase().replace(/ /g, "-");
  W.base = (it) => W.PREVIEW_BASE + W.folder(it.category) + "/" + it.slug;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  W.esc = esc;
  W.watchLabel = (it) => (it.platform === "youtube" ? "Watch on YouTube ↗" : "Watch on Instagram ↗");

  /* ---- Lazy play/pause: clips only load and play while on screen ---- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    for (const en of entries) {
      const tile = en.target;
      if (en.isIntersecting) mount(tile);
      const v = tile.querySelector("video");
      if (!v) continue;
      if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    }
  }, { rootMargin: "120px 0px" }) : null;

  /* Swap the placeholder for real media once we know the poster exists */
  function mount(tile) {
    if (tile.dataset.mounted) return;
    tile.dataset.mounted = "1";
    const base = tile.dataset.base, isImg = tile.dataset.type === "image";
    const probe = new Image();
    probe.onload = () => {
      const media = tile.querySelector(".wt-media");
      if (isImg || REDUCED) {
        media.innerHTML = `<img src="${base}.jpg" alt="" loading="lazy">`;
      } else {
        media.innerHTML = `<video autoplay muted loop playsinline preload="none" poster="${base}.jpg">
          <source src="${base}.webm" type="video/webm"><source src="${base}.mp4" type="video/mp4"></video>`;
        const v = media.querySelector("video");
        v.muted = true;
        // Some "video" posts are stills with only a cover image: fall back to that image
        v.querySelector("source:last-child").addEventListener("error", () => { media.innerHTML = `<img src="${base}.jpg" alt="" loading="lazy">`; });
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      }
      tile.classList.add("has-media");
    };
    probe.src = base + ".jpg";
  }

  /** Build one preview tile (an <a> that opens the post in a new tab). */
  W.tile = function (it, extraClass = "") {
    const labels = [it.brand && `<span class="wt-tag">${esc(it.brand)}</span>`, it.views && `<span class="wt-tag">${esc(it.views)} views</span>`].filter(Boolean).join("");
    return `<a class="wt ${extraClass}" href="${esc(it.url)}" target="_blank" rel="noopener" data-base="${esc(W.base(it))}" data-type="${it.type}" aria-label="${esc(it.title)}: ${esc(W.watchLabel(it))}">
      <span class="wt-media"><span class="wt-ph"><span data-chomper="right"></span><span class="wt-ph-title">${esc(it.title)}</span></span></span>
      ${labels ? `<span class="wt-tags">${labels}</span>` : ""}
      <span class="wt-ov"><strong>${esc(it.title)}</strong><span>${W.watchLabel(it)}</span></span>
    </a>`;
  };

  /** Paint sprites and start observing every tile under root. */
  W.wire = function (root) {
    if (window.TB && TB.paint) TB.paint(root);
    root.querySelectorAll(".wt:not([data-watched])").forEach((t) => {
      t.dataset.watched = "1";
      if (io) io.observe(t); else mount(t);
    });
  };
})();
