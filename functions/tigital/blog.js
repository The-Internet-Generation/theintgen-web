// functions/tigital/blog.js
// Blog index — /tigital/blog  (and /tigital/blog/)

const CATEGORY_COLORS = {
  'Blog':       { bg:'#9B1C3A', light:'#FFF0F3', emoji:'\u{1F4DD}' },
  'Guide':      { bg:'#3D2B8E', light:'#F0EEFF', emoji:'\u{1F4D6}' },
  'Case Study': { bg:'#0A5C3C', light:'#E8FFF5', emoji:'\u{1F4CA}' },
  'Influencer': { bg:'#6B1FA3', light:'#F7EEFF', emoji:'\u{1F3AF}' },
  'Design':     { bg:'#C84B00', light:'#FFF4EC', emoji:'\u{1F3A8}' },
  'Video':      { bg:'#1A3A9E', light:'#EEF3FF', emoji:'\u{1F3AC}' },
  'Strategy':   { bg:'#0A5C6A', light:'#E8FFFE', emoji:'\u{1F9E0}' },
  'Tool':       { bg:'#2A6A1A', light:'#F0FFF0', emoji:'\u{1F6E0}️' },
  'Resource':   { bg:'#6A5A1A', light:'#FFFAEC', emoji:'\u{1F4E6}' },
};
function catColor(cat){ return CATEGORY_COLORS[cat]||{bg:'#1A0A3C',light:'#F0EEFF',emoji:'\u{1F4F2}'}; }

function fmtDate(iso){ if(!iso)return''; return new Date(iso).toLocaleDateString('en-GB',{month:'short',year:'numeric'}); }

function cardGradient(cat){
  const gradients={
    'Blog':'linear-gradient(135deg,#9B1C3A,#1A0A3C)',
    'Guide':'linear-gradient(135deg,#1A0A3C,#3D2B8E)',
    'Case Study':'linear-gradient(135deg,#0A3C2C,#0F0A1E)',
    'Influencer':'linear-gradient(135deg,#4A1070,#1A0A3C)',
    'Design':'linear-gradient(135deg,#C84B00,#1A0A3C)',
    'Video':'linear-gradient(135deg,#0A206E,#1A0A3C)',
    'Strategy':'linear-gradient(135deg,#0A3C4A,#1A0A3C)',
  };
  return gradients[cat]||'linear-gradient(135deg,#9B1C3A,#1A0A3C)';
}

function renderCard(post){
  const cc=catColor(post.category);
  const href=post.slug?`/tigital/${post.slug}/`:'#';
  return `<a href="${href}" class="card">
    <div class="card-cover" style="background:${cardGradient(post.category)}">
      <div class="card-pat"></div>
      <span class="card-emoji">${cc.emoji}</span>
    </div>
    <div class="card-body">
      <span class="cat-tag" style="background:${cc.light};color:${cc.bg}">${post.category}</span>
      <h2 class="card-title">${post.title}</h2>
      <p class="card-excerpt">${post.excerpt}</p>
      <div class="card-foot">
        <span class="card-date">${fmtDate(post.date)}</span>
        <span class="card-read">Read →</span>
      </div>
    </div>
  </a>`;
}

function renderPage(posts,activeCategory){
  const allCats=['All',...new Set(posts.map(p=>p.category).filter(Boolean))];
  const filtered=activeCategory&&activeCategory!=='All'?posts.filter(p=>p.category===activeCategory):posts;
  const cardsHtml=filtered.length?filtered.map(renderCard).join(''):`<div class="empty"><p>No posts in this category yet.</p></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Blog — Tigital</title>
<meta name="description" content="Free digital marketing guides, performance marketing insights, and brand-building strategies by The Internet Generation."/>
<link rel="icon" type="image/png" href="/public/assets/logo-tigital.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
:root{--navy:#1A0A3C;--yellow:#FFD600;--crimson:#9B1C3A;--ink:#0F0A1E;--paper:#F7F5F0;--muted:#6B6580;--border:#E8E4F0}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink)}
.nav{position:sticky;top:0;z-index:100;background:var(--navy);border-bottom:3px solid var(--yellow);padding:0 clamp(1rem,5vw,3rem);height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-brand{display:flex;align-items:center;gap:.5rem;text-decoration:none;color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem}
.nav-brand img{height:28px}.nav-brand span{color:var(--yellow)}
.nav-home{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.55);text-decoration:none;border:1px solid rgba(255,255,255,.2);border-radius:3px;padding:.35rem .85rem;transition:all .2s}
.nav-home:hover{color:#fff;border-color:rgba(255,255,255,.5)}
.masthead{background:var(--navy);padding:clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem) clamp(2rem,5vw,3.5rem);border-bottom:1px solid rgba(255,255,255,.08)}
.masthead-inner{max-width:1100px;margin:0 auto}
.mast-label{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:var(--yellow);margin-bottom:1rem}
.mast-title{font-family:'Playfair Display',serif;font-weight:900;font-size:clamp(2.8rem,7vw,5rem);color:#fff;line-height:1.05;margin-bottom:1rem}
.mast-title em{color:var(--yellow);font-style:italic}
.mast-sub{color:rgba(255,255,255,.55);font-size:1.05rem;max-width:500px;line-height:1.7}
.mast-count{margin-top:1.5rem;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3)}
.mast-count strong{color:rgba(255,255,255,.6)}
.filter-bar{background:var(--paper);border-bottom:1px solid var(--border);position:sticky;top:56px;z-index:90;padding:0 clamp(1rem,5vw,3rem)}
.filter-inner{max-width:1100px;margin:0 auto;display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;padding:.75rem 0}
.filter-inner::-webkit-scrollbar{display:none}
.filter-btn{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:.4rem 1rem;border-radius:20px;border:1.5px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;white-space:nowrap;transition:all .2s;text-decoration:none}
.filter-btn.active,.filter-btn:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
.grid-section{max-width:1100px;margin:0 auto;padding:clamp(2rem,5vw,3.5rem) clamp(1rem,5vw,3rem)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2rem}
.card{display:flex;flex-direction:column;background:#fff;border-radius:10px;overflow:hidden;text-decoration:none;color:var(--ink);box-shadow:0 2px 12px rgba(26,10,60,.06);transition:transform .2s,box-shadow .2s;border:1px solid var(--border)}
.card:hover{transform:translateY(-4px);box-shadow:0 8px 30px rgba(26,10,60,.12)}
.card-cover{position:relative;height:160px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.card-pat{position:absolute;inset:0;background-image:radial-gradient(circle at 70% 30%,rgba(255,255,255,.06) 1px,transparent 1px);background-size:20px 20px}
.card-emoji{position:relative;font-size:3.5rem;opacity:.85;filter:drop-shadow(0 2px 8px rgba(0,0,0,.3))}
.card-body{padding:1.25rem 1.5rem 1.5rem;display:flex;flex-direction:column;flex:1}
.cat-tag{display:inline-block;font-family:'Syne',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:.25rem .65rem;border-radius:3px;margin-bottom:.85rem;width:fit-content}
.card-title{font-family:'Playfair Display',serif;font-weight:700;font-size:1.1rem;line-height:1.35;color:var(--navy);margin-bottom:.65rem;flex:1}
.card-excerpt{font-size:.88rem;line-height:1.65;color:var(--muted);margin-bottom:1.1rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-foot{display:flex;justify-content:space-between;align-items:center}
.card-date{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.card-read{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.06em;color:var(--crimson)}
.empty{grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--muted);font-family:'Syne',sans-serif;font-size:.9rem}
.footer{background:var(--navy);padding:1.5rem clamp(1rem,5vw,3rem);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-top:2rem}
.footer a{color:rgba(255,255,255,.5);text-decoration:none;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.footer a:hover{color:#fff}
@media(max-width:600px){.grid{grid-template-columns:1fr}.mast-title{font-size:2.5rem}}
</style>
</head>
<body>
<nav class="nav">
  <a href="/tigital/" class="nav-brand"><img src="/public/assets/logo-tigital.png" alt="Tigital"/><span class="nav-brand-name">tigi<span>tal</span></span></a>
  <a href="/tigital/" class="nav-home">← Tigital Home</a>
</nav>
<section class="masthead">
  <div class="masthead-inner">
    <p class="mast-label">Tigital · All Articles</p>
    <h1 class="mast-title">The <em>Blog.</em></h1>
    <p class="mast-sub">Performance marketing, content strategy, design, video, and brand-building — everything you need to grow.</p>
    <p class="mast-count"><strong>${filtered.length}</strong> of <strong>${posts.length}</strong> articles</p>
  </div>
</section>
<div class="filter-bar">
  <div class="filter-inner">
    ${allCats.map(cat=>`<a href="${cat==='All'?'/tigital/blog/':'/tigital/blog/?cat='+encodeURIComponent(cat)}" class="filter-btn${(!activeCategory&&cat==='All')||(activeCategory===cat)?' active':''}">${cat}</a>`).join('')}
  </div>
</div>
<section class="grid-section">
  <div class="grid">${cardsHtml}</div>
</section>
<footer class="footer">
  <a href="/tigital/">← Back to Tigital</a>
  <span style="color:rgba(255,255,255,.25);font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.1em">TIGITAL · THE INTERNET GENERATION</span>
</footer>
</body>
</html>`;
}

export async function onRequestGet({request,env}){
  if(!env.NOTION_TOKEN||!env.NOTION_DB_ID){
    return new Response('<h1>Configuration error</h1>',{status:503,headers:{'Content-Type':'text/html'}});
  }
  const url=new URL(request.url);
  const activeCategory=url.searchParams.get('cat')||null;

  const notionRes=await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DB_ID}/query`,{
    method:'POST',
    headers:{'Authorization':`Bearer ${env.NOTION_TOKEN}`,'Notion-Version':'2022-06-28','Content-Type':'application/json'},
    body:JSON.stringify({
      filter:{property:'Status',select:{equals:'Published'}},
      sorts:[{property:'PublishedDate',direction:'descending'}],
      page_size:100
    })
  });

  if(!notionRes.ok)return new Response(renderPage([],activeCategory),{headers:{'Content-Type':'text/html;charset=utf-8'}});
  const{results}=await notionRes.json();
  const posts=(results||[]).map(p=>({
    id:p.id,
    title:p.properties.Title?.title?.[0]?.plain_text??'',
    slug:p.properties.Slug?.rich_text?.[0]?.plain_text??'',
    category:p.properties.Category?.select?.name??'Blog',
    excerpt:p.properties.Excerpt?.rich_text?.[0]?.plain_text??'',
    date:p.properties.PublishedDate?.date?.start??'',
    featured:p.properties.Featured?.checkbox??false,
  }));

  return new Response(renderPage(posts,activeCategory),{
    headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public,max-age=60,s-maxage=60'}
  });
}
