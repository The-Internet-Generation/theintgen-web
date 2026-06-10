// Server-side rendering layer for /tiggigs/
// Injects live job listings (semantic HTML + JobPosting JSON-LD) into the
// static page so AI crawlers and no-JS readers can see real content.
// Humans see the exact same page — client JS still renders the live board.

const SB_URL = 'https://snlcskmszhbipinffwpy.supabase.co/rest/v1';
const SB_KEY = 'sb_publishable_8_Fj46gQBqoA4HgidRKP6g_1uDbhWPM'; // publishable anon key
const FIELDS = 'job_id,job_title,client_name,asset_type,internal_deadline,publish_date,board_status,description,production_category,complexity,rate_auto,rate_override,is_rush,created_at,month';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const trunc = (s, n) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

async function fetchJobs() {
  const url = `${SB_URL}/v_jobs?select=${FIELDS}&order=internal_deadline.asc.nullslast&limit=200`;
  const r = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!r.ok) throw new Error(`supabase ${r.status}`);
  return r.json();
}

function jobRate(j) {
  return j.rate_override ?? j.rate_auto ?? null;
}

function buildJobsHtml(jobs) {
  const open = jobs.filter(j => j.board_status === 'Open');
  const other = jobs.filter(j => j.board_status !== 'Open');
  const li = (j, full) => {
    const rate = jobRate(j);
    return `<li><strong>${esc(j.job_title)}</strong> (${esc(j.job_id)}) — ${esc(j.asset_type || j.production_category || 'Creative')} for ${esc(j.client_name || 'TIG')}.` +
      ` Status: ${esc(j.board_status)}.` +
      (j.internal_deadline ? ` Deadline: ${esc(j.internal_deadline)}.` : '') +
      (rate ? ` Payout: ₹${rate}.` : '') +
      (j.is_rush ? ' Rush job.' : '') +
      (full && j.description ? ` Brief: ${esc(trunc(j.description, 500))}` : '') +
      `</li>`;
  };
  return `
<section id="ai-readable-jobs" aria-hidden="false" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%)">
  <h2>Current TIG job board listings (live from database)</h2>
  <p>TigGigs is The Internet Generation's curated freelance job board for designers, video editors and content creators in India. ${open.length} jobs are open right now. Approved TIG freelancers can claim jobs directly at https://theintgen.com/tiggigs/. To join the roster, apply at https://tally.so/r/0QLLWZ. Machine-readable feed: https://theintgen.com/tiggigs/jobs.json</p>
  <h3>Open jobs (${open.length})</h3>
  <ul>${open.map(j => li(j, true)).join('\n')}</ul>
  <h3>Recently claimed or completed (${other.length})</h3>
  <ul>${other.slice(0, 40).map(j => li(j, false)).join('\n')}</ul>
</section>`;
}

function buildJsonLd(jobs) {
  const open = jobs.filter(j => j.board_status === 'Open');
  const postings = open.map(j => {
    const rate = jobRate(j);
    const p = {
      '@type': 'JobPosting',
      title: j.job_title,
      description: trunc(j.description, 1500) || j.job_title,
      identifier: { '@type': 'PropertyValue', name: 'TIG Job ID', value: j.job_id },
      datePosted: (j.created_at || '').slice(0, 10) || undefined,
      validThrough: j.internal_deadline || undefined,
      employmentType: 'CONTRACTOR',
      hiringOrganization: { '@type': 'Organization', name: 'The Internet Generation (TIG)', sameAs: 'https://theintgen.com', logo: 'https://theintgen.com/tiggigs/logo-theintgen.png' },
      jobLocationType: 'TELECOMMUTE',
      applicantLocationRequirements: { '@type': 'Country', name: 'India' },
      directApply: true,
      url: 'https://theintgen.com/tiggigs/#' + encodeURIComponent(j.job_id),
    };
    if (rate) p.baseSalary = { '@type': 'MonetaryAmount', currency: 'INR', value: { '@type': 'QuantitativeValue', value: rate, unitText: 'JOB' } };
    return p;
  });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': postings })}</script>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const staticRes = await env.ASSETS.fetch(request);
  const type = staticRes.headers.get('content-type') || '';
  if (!type.includes('text/html')) return staticRes;

  // Edge cache the enriched page for 5 minutes
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).toString(), request);
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let html = await staticRes.text();
  try {
    const jobs = await fetchJobs();
    const injection = buildJobsHtml(jobs) + '\n' + buildJsonLd(jobs) + '\n</body>';
    html = html.replace('</body>', injection);
  } catch (e) {
    // On any failure, serve the untouched static page
  }
  const res = new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300',
    },
  });
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
