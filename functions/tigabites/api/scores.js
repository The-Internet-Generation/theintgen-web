// functions/tigabites/api/scores.js
// Same-origin proxy for the Tigabites arcade leaderboard (Supabase: tigabites_scores).
// Some Indian mobile networks block *.supabase.co, which made score saves fail with
// "Failed to fetch" on phones. The browser now only talks to theintgen.com.
//   GET  /tigabites/api/scores?game=0-4      -> top 10 [{name, score}]
//   POST /tigabites/api/scores {game, name, score}

const SB_URL = "https://snlcskmszhbipinffwpy.supabase.co";
const SB_KEY = "sb_publishable_8_Fj46gQBqoA4HgidRKP6g_1uDbhWPM"; // publishable key, already public in the site JS

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });

export async function onRequestGet({ request }) {
  const game = Number(new URL(request.url).searchParams.get("game"));
  if (!Number.isInteger(game) || game < 0 || game > 4) return json({ message: "bad game" }, 400);
  const r = await fetch(
    `${SB_URL}/rest/v1/tigabites_scores?select=name,score&game=eq.${game}&order=score.desc,created_at.asc&limit=10`,
    { headers: { apikey: SB_KEY } }
  );
  return new Response(r.body, { status: r.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function onRequestPost({ request }) {
  let b;
  try { b = await request.json(); } catch (e) { return json({ message: "bad body" }, 400); }
  const game = Number(b.game), score = Number(b.score), name = String(b.name || "").slice(0, 16);
  if (!Number.isInteger(game) || !Number.isInteger(score) || !name) return json({ message: "bad input" }, 400);
  const r = await fetch(`${SB_URL}/rest/v1/rpc/submit_tigabites_score`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_game: game, p_name: name, p_score: score }),
  });
  if (r.ok) return new Response(null, { status: 204 });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type": "application/json" } });
}
