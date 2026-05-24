// functions/tigital/[slug].js
// Cloudflare Pages Function — individual blog post renderer

const CATEGORY_THEME = {
  'Blog':       { bg: 'linear-gradient(135deg,#9B1C3A 0%,#1A0A3C 100%)', emoji: '\u{1F4DD}', accent: '#9B1C3A', ta: '#FFD600' },
  'Guide':      { bg: 'linear-gradient(135deg,#1A0A3C 0%,#3D2B8E 100%)', emoji: '\u{1F4D6}', accent: '#3D2B8E', ta: '#FFD600' },
  'Case Study': { bg: 'linear-gradient(135deg,#0A3C2C 0%,#0F0A1E 100%)', emoji: '\u{1F4CA}', accent: '#0A5C3C', ta: '#4ECCA3' },
  'Influencer': { bg: 'linear-gradient(135deg,#4A1070 0%,#1A0A3C 100%)', emoji: '\u{1F3AF}', accent: '#6B1FA3', ta: '#E091FF' },
  'Design':     { bg: 'linear-gradient(135deg,#C84B00 0%,#1A0A3C 100%)', emoji: '\u{1F3A8}', accent: '#C84B00', ta: '#FFB347' },
  'Video':      { bg: 'linear-gradient(135deg,#0A206E 0%,#1A0A3C 100%)', emoji: '\u{1F3AC}', accent: '#1A3A9E', ta: '#7EB2FF' },
  'Strategy':   { bg: 'linear-gradient(135deg,#0A3C4A 0%,#1A0A3C 100%)', emoji: '\u{1F9E0}', accent: '#0A5C6A', ta: '#4ECFEE' },
  'Tool':       { bg: 'linear-gradient(135deg,#1A4A0A 0%,#0F0A1E 100%)', emoji: '\u{1F6E0}️', accent: '#2A6A1A', ta: '#7EE07E' },
  'Resource':   { bg: 'linear-gradient(135deg,#4A3A0A 0%,#0F0A1E 100%)', emoji: '\u{1F4E6}', accent: '#6A5A1A', ta: '#FFD600' },
};
function T(cat){ return CATEGORY_THEME[cat]||{bg:'linear-gradient(135deg,#9B1C3A 0%,#1A0A3C 100%)',emoji:'\u{1F4F2}',accent:'#9B1C3A',ta:'#FFD600'}; }

function rt(arr){
  if(!arr||!arr.length)return'';
  return arr.map(t=>{
    let s=(t.plain_text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    if(t.annotations){
      if(t.annotations.bold)s=`<strong>${s}</strong>`;
      if(t.annotations.italic)s=`<em>${s}</em>`;
      if(t.annotations.strikethrough)s=`<s>${s}</s>`;
      if(t.annotations.code)s=`<code class="ic">${s}</code>`;
    }
    if(t.href)s=`<a href="${t.href}" target="_blank" rel="noopener">${s}</a>`;
    return s;
  }).join('');
}

function toHtml(blocks,theme){
  let h='',ib=false,in_=false;
  const accent=theme.accent;
  for(const b of blocks){
    const type=b.type,d=b[type]||{};
    if(type!=='bulleted_list_item'&&ib){h+='</ul>';ib=false;}
    if(type!=='numbered_list_item'&&in_){h+='</ol>';in_=false;}
    switch(type){
      case'paragraph':{
        const p=rt(d.rich_text);
        if(!p.trim()){h+='<div style="height:.75rem"></div>';break;}
        const raw=p.replace(/<[^>]*>/g,'');
        if(/^[₹\d]/.test(raw)){h+=`<div class="stat-hl">${p}</div>`;break;}
        h+=`<p>${p}</p>`;break;
      }
      case'heading_1':h+=`<h2 class="bh2">${rt(d.rich_text)}</h2>`;break;
      case'heading_2':h+=`<h2 class="bh2">${rt(d.rich_text)}</h2>`;break;
      case'heading_3':h+=`<h3 class="bh3">${rt(d.rich_text)}</h3>`;break;
      case'bulleted_list_item':if(!ib){h+='<ul class="sl">';ib=true;}h+=`<li>${rt(d.rich_text)}</li>`;break;
      case'numbered_list_item':if(!in_){h+='<ol class="sl nm">';in_=true;}h+=`<li>${rt(d.rich_text)}</li>`;break;
      case'quote':h+=`<blockquote class="pq"><span class="qm">&ldquo;</span><p>${rt(d.rich_text)}</p></blockquote>`;break;
      case'callout':{
        const ic=d.icon?.emoji||'\u{1F4A1}';
        const cbg={'yellow_background':'#FFF9E6','blue_background':'#E6F0FF','green_background':'#E6FFF2','red_background':'#FFF0F0','purple_background':'#F5EEFF','gray_background':'#F5F5F5'}[d.color]||'#FFF9E6';
        const cbc={'yellow_background':'#FFD600','blue_background':'#1A3A9E','green_background':'#0A5C3C','red_background':'#9B1C3A','purple_background':'#6B1FA3','gray_background':'#888'}[d.color]||accent;
        h+=`<div class="cb" style="background:${cbg};border-left-color:${cbc}"><span class="ci">${ic}</span><div>${rt(d.rich_text)}</div></div>`;break;
      }
      case'code':{
        const code=(d.rich_text||[]).map(t=>t.plain_text).join('').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        h+=`<pre class="code-b"><span class="lang">${d.language||'code'}</span><code>${code}</code></pre>`;break;
      }
      case'divider':h+=`<div class="div-dec"><span></span><span>◆</span><span></span></div>`;break;
      case'image':{
        const url=d.type==='external'?d.external?.url:d.file?.url;
        const cap=d.caption?rt(d.caption):'';
        if(url)h+=`<figure class="fig"><img src="${url}" alt="${cap||''}" loading="lazy"/>${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`;break;
      }
    }
  }
  if(ib)h+='</ul>';if(in_)h+='</ol>';
  return h;
}

function readTime(blocks){
  const w=blocks.reduce((a,b)=>{const d=b[b.type]||{};return a+(d.rich_text||[]).map(t=>t.plain_text).join(' ').split(/\s+/).filter(Boolean).length;},0);
  return Math.max(2,Math.ceil(w/200));
}

function fmtDate(iso){if(!iso)return'';return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});}

function r404(){return`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Not Found — Tigital</title><link rel="icon" href="/public/assets/logo-tigital.png"/><style>body{font-family:sans-serif;background:#F7F5F0;color:#0F0A1E;display:flex;flex-direction:column;min-height:100vh;margin:0}.nav{background:#1A0A3C;border-bottom:3px solid #FFD600;height:56px;display:flex;align-items:center;padding:0 2rem}.nav a{color:#fff;text-decoration:none;font-weight:800;font-size:1.1rem}.nav a span{color:#FFD600}.cnt{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem}.cnt h1{font-size:2.5rem;margin-bottom:1rem}.cnt p{color:#6B6580;margin-bottom:2rem}.btn{background:#9B1C3A;color:#fff;padding:.75rem 1.75rem;border-radius:4px;text-decoration:none;font-weight:700}</style></head><body><nav class="nav"><a href="/tigital/">tigi<span>tal</span></a></nav><div class="cnt"><h1>Post Not Found</h1><p>This article doesn't exist or hasn't been published yet.</p><a href="/tigital/blog/" class="btn">← Browse All Posts</a></div></body></html>`;}

function render(post,body,rm){
  const th=T(post.category);
  const encTitle=encodeURIComponent(post.title);
  const encUrl=encodeURIComponent(`https://theintgen.com/tigital/${post.slug}/`);
  return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${post.title} — Tigital</title>
<meta name="description" content="${post.excerpt}"/>
<meta property="og:title" content="${post.title}"/>
<meta property="og:description" content="${post.excerpt}"/>
<link rel="icon" type="image/png" href="/public/assets/logo-tigital.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet"/>
<style>
:root{--navy:#1A0A3C;--yellow:#FFD600;--crimson:#9B1C3A;--ink:#0F0A1E;--paper:#F7F5F0;--muted:#6B6580;--border:#E8E4F0;--accent:${th.accent};--ta:${th.ta}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink);overflow-x:hidden}
#pb{position:fixed;top:0;left:0;z-index:200;height:3px;background:var(--ta);width:0;transition:width .1s}
.nav{position:sticky;top:0;z-index:100;background:var(--navy);border-bottom:3px solid var(--yellow);padding:0 clamp(1rem,5vw,3rem);height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-brand{display:flex;align-items:center;gap:.5rem;text-decoration:none;color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem}
.nav-brand img{height:28px}.nav-brand span{color:var(--yellow)}
.nav-back{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);text-decoration:none;border:1px solid rgba(255,255,255,.2);border-radius:3px;padding:.35rem .85rem;transition:all .2s}
.nav-back:hover{color:#fff;border-color:rgba(255,255,255,.5)}
.hero{position:relative;background:${th.bg};overflow:hidden;padding:clamp(3.5rem,9vw,6rem) clamp(1rem,5vw,4rem) clamp(2.5rem,6vw,4rem)}
.hero-pat{position:absolute;inset:0;background-image:radial-gradient(circle at 80% 20%,rgba(255,255,255,.05) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
.hero-deco{position:absolute;right:clamp(1rem,5vw,4rem);top:50%;transform:translateY(-50%);font-size:clamp(6rem,15vw,11rem);opacity:.1;line-height:1;user-select:none}
.hero-in{position:relative;max-width:780px}
.cat-badge{display:inline-flex;align-items:center;gap:.4rem;font-family:'Syne',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--ta);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);padding:.3rem 1rem .3rem .7rem;border-radius:3px;margin-bottom:1.5rem}
.badge-dot{width:6px;height:6px;border-radius:50%;background:var(--ta);flex-shrink:0}
.h1{font-family:'Playfair Display',serif;font-weight:900;font-size:clamp(2rem,5.5vw,3.8rem);color:#fff;line-height:1.12;margin-bottom:1.25rem;max-width:700px}
.excerpt{font-size:clamp(.95rem,1.5vw,1.15rem);color:rgba(255,255,255,.7);line-height:1.75;max-width:620px;margin-bottom:2rem}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.5rem;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.rm-badge{background:rgba(255,255,255,.12);border-radius:20px;padding:.2rem .7rem;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.15)}
.meta-sep{color:rgba(255,255,255,.2)}
.art{max-width:760px;margin:0 auto;padding:clamp(2.5rem,6vw,4.5rem) clamp(1rem,5vw,2rem)}
.art p{font-size:1.05rem;line-height:1.88;margin-bottom:1.5rem}
.bh2{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.4rem,2.8vw,2rem);color:var(--navy);margin:2.5rem 0 1rem;line-height:1.25}
.bh3{font-family:'Syne',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:2rem 0 .75rem;padding-left:.75rem;border-left:3px solid var(--accent)}
.sl{list-style:none;margin:0 0 1.5rem;padding:0}
.sl li{position:relative;padding:.4rem 0 .4rem 2rem;font-size:1.05rem;line-height:1.7}
.sl li::before{content:'▸';position:absolute;left:0;color:var(--accent);font-size:.85rem;top:.55rem}
.sl.nm{counter-reset:li}.sl.nm li{counter-increment:li}
.sl.nm li::before{content:counter(li,'decimal-leading-zero');font-family:'Syne',sans-serif;font-weight:700;font-size:.7rem;color:var(--accent);letter-spacing:.05em;top:.55rem}
.pq{position:relative;margin:2.5rem 0;padding:1.5rem 1.75rem 1.5rem 2.25rem;border-left:4px solid var(--ta);background:rgba(26,10,60,.04);border-radius:0 6px 6px 0}
.pq .qm{display:block;font-family:'Playfair Display',serif;font-size:4rem;line-height:0;color:var(--accent);opacity:.3;margin-bottom:1rem;height:2rem}
.pq p{font-family:'Playfair Display',serif;font-style:italic;font-size:1.2rem;line-height:1.65;color:var(--navy);margin:0}
.cb{display:flex;gap:1rem;padding:1.1rem 1.4rem;border-left:4px solid;border-radius:0 6px 6px 0;margin:1.75rem 0}
.ci{font-size:1.4rem;flex-shrink:0;line-height:1.3}
.cb div{font-size:.97rem;line-height:1.7}
.stat-hl{background:var(--navy);color:#fff;border-left:4px solid var(--ta);padding:1rem 1.5rem;border-radius:0 6px 6px 0;font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;margin:1.75rem 0}
.code-b{position:relative;background:var(--navy);color:#e8e4f0;padding:1.5rem 1.5rem 1.2rem;border-radius:6px;overflow-x:auto;margin:1.5rem 0;font-size:.88rem;line-height:1.7}
.lang{display:block;font-family:'Syne',sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:.75rem}
.code-b code{background:none;color:inherit;padding:0;font-family:monospace}
.ic{background:rgba(26,10,60,.08);color:var(--crimson);padding:.15em .45em;border-radius:3px;font-size:.9em;font-family:monospace}
.div-dec{display:flex;align-items:center;gap:1rem;margin:2.5rem 0;color:var(--border)}
.div-dec span{flex:1;height:1px;background:var(--border)}
.div-dec span:nth-child(2){flex:0;color:var(--accent);font-size:.5rem}
.fig{margin:2rem 0}.fig img{width:100%;border-radius:8px;display:block;box-shadow:0 4px 20px rgba(0,0,0,.1)}
.fig figcaption{text-align:center;font-size:.82rem;color:var(--muted);margin-top:.75rem;font-style:italic}
.art a{color:var(--accent);text-decoration:underline;text-decoration-color:transparent;transition:text-decoration-color .2s}
.art a:hover{text-decoration-color:var(--accent)}
.art strong{font-weight:600;color:var(--navy)}
.art em{font-style:italic;color:var(--navy)}
.art hr{border:none;border-top:1px solid var(--border);margin:2.5rem 0}
.cta-wrap{max-width:760px;margin:0 auto;padding:0 clamp(1rem,5vw,2rem) clamp(2rem,5vw,3rem)}
.cta-box{background:var(--navy);border-radius:8px;padding:2rem 2.5rem;text-align:center;border-top:3px solid var(--yellow)}
.cta-box h3{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.1em;text-transform:uppercase;color:var(--yellow);margin-bottom:.6rem}
.cta-box p{color:rgba(255,255,255,.7);margin-bottom:1.5rem;font-size:.95rem}
.cta-btn{display:inline-block;background:var(--yellow);color:var(--navy);padding:.75rem 2rem;border-radius:4px;text-decoration:none;font-family:'Syne',sans-serif;font-weight:800;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase}
.pfoot{border-top:1px solid var(--border);padding:1.5rem clamp(1rem,5vw,3rem);display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}
.pfoot a{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-decoration:none}
.pfoot a:hover{color:var(--accent)}
.share-grp{display:flex;gap:.75rem;align-items:center}
.share-lbl{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.share-btn{font-size:.75rem;font-family:'Syne',sans-serif;font-weight:700;color:var(--muted);text-decoration:none;border:1px solid var(--border);border-radius:3px;padding:.3rem .7rem;transition:all .2s}
.share-btn:hover{color:var(--navy);border-color:var(--navy)}
@media(max-width:600px){.h1{font-size:1.85rem}.hero-deco{display:none}.pq p{font-size:1.05rem}}
</style>
</head>
<body>
<div id="pb"></div>
<nav class="nav">
  <a href="/tigital/" class="nav-brand"><img src="/public/assets/logo-tigital.png" alt="Tigital"/><span class="nav-brand-name">tigi<span>tal</span></span></a>
  <a href="/tigital/blog/" class="nav-back">← All Posts</a>
</nav>
<section class="hero">
  <div class="hero-pat"></div>
  <div class="hero-deco">${th.emoji}</div>
  <div class="hero-in">
    <span class="cat-badge"><span class="badge-dot"></span>${post.category}</span>
    <h1 class="h1">${post.title}</h1>
    <p class="excerpt">${post.excerpt}</p>
    <div class="meta">
      <span>Tigital</span><span class="meta-sep">·</span>
      <span>${fmtDate(post.date)}</span><span class="meta-sep">·</span>
      <span class="rm-badge">${rm} min read</span>
    </div>
  </div>
</section>
<article class="art">${body||`<p>${post.excerpt}</p>`}</article>
<div class="cta-wrap">
  <div class="cta-box">
    <h3>Get the weekly marketing drop</h3>
    <p>Strategies, tools and platform updates that actually move the needle — straight to WhatsApp. No spam.</p>
    <a href="https://wa.me/919940237330" target="_blank" rel="noopener" class="cta-btn">\u{1F4F2} Join the Community →</a>
  </div>
</div>
<footer class="pfoot">
  <a href="/tigital/blog/">← Browse all posts</a>
  <div class="share-grp">
    <span class="share-lbl">Share</span>
    <a href="https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}" target="_blank" rel="noopener" class="share-btn">\u{1D54F} Twitter</a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}" target="_blank" rel="noopener" class="share-btn">in LinkedIn</a>
  </div>
</footer>
<script>const pb=document.getElementById('pb');window.addEventListener('scroll',()=>{const d=document.documentElement;pb.style.width=Math.min(100,(d.scrollTop/(d.scrollHeight-d.clientHeight))*100)+'%';},{passive:true});</script>
</body>
</html>`;
}

export async function onRequestGet({params,env}){
  const slug=params.slug;
  if(!env.NOTION_TOKEN||!env.NOTION_DB_ID)return new Response(r404(),{status:503,headers:{'Content-Type':'text/html;charset=utf-8'}});
  const dbRes=await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DB_ID}/query`,{method:'POST',headers:{'Authorization':`Bearer ${env.NOTION_TOKEN}`,'Notion-Version':'2022-06-28','Content-Type':'application/json'},body:JSON.stringify({filter:{and:[{property:'Slug',rich_text:{equals:slug}},{property:'Status',select:{equals:'Published'}}]},page_size:1})});
  if(!dbRes.ok)return new Response(r404(),{status:404,headers:{'Content-Type':'text/html;charset=utf-8'}});
  const{results}=await dbRes.json();
  if(!results||!results.length)return new Response(r404(),{status:404,headers:{'Content-Type':'text/html;charset=utf-8'}});
  const page=results[0],props=page.properties;
  const post={id:page.id,title:props.Title?.title?.[0]?.plain_text??'',slug:props.Slug?.rich_text?.[0]?.plain_text??slug,category:props.Category?.select?.name??'Blog',excerpt:props.Excerpt?.rich_text?.[0]?.plain_text??'',date:props.PublishedDate?.date?.start??''};
  const blRes=await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`,{headers:{'Authorization':`Bearer ${env.NOTION_TOKEN}`,'Notion-Version':'2022-06-28'}});
  let blocks=[],body='';
  if(blRes.ok){const d=await blRes.json();blocks=d.results||[];body=toHtml(blocks,T(post.category));}
  return new Response(render(post,body,readTime(blocks)),{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public,max-age=300,s-maxage=300'}});
}
