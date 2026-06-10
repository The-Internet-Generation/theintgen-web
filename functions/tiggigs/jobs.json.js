// Machine-readable job feed for AI agents and integrations.
// GET https://theintgen.com/tiggigs/jobs.json

const SB_URL = 'https://snlcskmszhbipinffwpy.supabase.co/rest/v1';
const SB_KEY = 'sb_publishable_8_Fj46gQBqoA4HgidRKP6g_1uDbhWPM';
const FIELDS = 'job_id,job_title,client_name,asset_type,internal_deadline,publish_date,board_status,description,production_category,complexity,rate_auto,rate_override,is_rush,month';

export async function onRequestGet() {
  try {
    const url = `${SB_URL}/v_jobs?select=${FIELDS}&order=internal_deadline.asc.nullslast&limit=200`;
    const r = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const rows = await r.json();
    const jobs = rows.map((j) => ({
      job_id: j.job_id,
      title: j.job_title,
      client: j.client_name,
      asset_type: j.asset_type,
      status: j.board_status,
      deadline: j.internal_deadline,
      publish_date: j.publish_date,
      payout_inr: j.rate_override ?? j.rate_auto ?? null,
      is_rush: !!j.is_rush,
      complexity: j.complexity,
      production_category: j.production_category,
      description: j.description,
    }));
    const body = {
      source: 'TigGigs — The Internet Generation job board',
      site: 'https://theintgen.com/tiggigs/',
      apply: 'https://tally.so/r/0QLLWZ',
      generated_at: new Date().toISOString(),
      open_count: jobs.filter((j) => j.status === 'Open').length,
      total_count: jobs.length,
      jobs,
    };
    return new Response(JSON.stringify(body, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=0, s-maxage=300',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'feed temporarily unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
}
