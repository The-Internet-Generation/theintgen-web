// functions/tigital/[slug].js
// Cloudflare Pages Function — serves individual blog post pages
// Route: /tigital/:slug  and  /tigital/:slug/

function richText(arr) {
  if (!arr || !arr.length) return '';
  return arr.map(t => {
    let text = t.plain_text || '';
    if (t.annotations) {
      if (t.annotations.bold)          text = `<strong>${text}</strong>`;
      if (t.annotations.italic)        text = `<em>${text}</em>`;
      if (t.annotations.strikethrough) text = `<s>${text}</s>`;
      if (t.annotations.code)          text = `<code>${text}</code>`;
    }
    if (t.href) text = `<a href="${t.href}" target="_blank" rel="noopener">${text}</a>`;
    return text;
  }).join('');
}

function blocksToHtml(blocks) {
  let html = '';
  let inBullet = false;
  let inNumber = false;

  for (const block of blocks) {
    const type = block.type;
    const data = block[type] || {};

    // Close open lists if we hit a non-list block
    if (type !== 'bulleted_list_item' && inBullet) { html += '</ul>'; inBullet = false; }
    if (type !== 'numbered_list_item' && inNumber) { html += '</ol>'; inNumber = false; }

    switch (type) {
      case 'paragraph':
        const pText = richText(data.rich_text);
        if (pText.trim()) html += `<p>${pText}</p>`;
        else html += '<br/>';
        break;
      case 'heading_1':
        html += `<h1>${richText(data.rich_text)}</h1>`;
        break;
      case 'heading_2':
        html += `<h2>${richText(data.rich_text)}</h2>`;
        break;
      case 'heading_3':
        html += `<h3>${richText(data.rich_text)}</h3>`;
        break;
      case 'bulleted_list_item':
        if (!inBullet) { html += '<ul>'; inBullet = true; }
        html += `<li>${richText(data.rich_text)}</li>`;
        break;
      case 'numbered_list_item':
        if (!inNumber) { html += '<ol>'; inNumber = true; }
        html += `<li>${richText(data.rich_text)}</li>`;
        break;
      case 'quote':
        html += `<blockquote>${richText(data.rich_text)}</blockquote>`;
        break;
      case 'callout':
        const icon = data.icon?.emoji || '💡';
        html += `<div class="callout">${icon} ${richText(data.rich_text)}</div>`;
        break;
      case 'code':
        const code = (data.rich_text || []).map(t => t.plain_text).join('');
        html += `<pre><code>${code}</code></pre>`;
        break;
      case 'divider':
        html += '<hr/>';
        break;
      case 'image':
        const imgUrl = data.type === 'external' ? data.external?.url : data.file?.url;
        if (imgUrl) html += `<figure><img src="${imgUrl}" alt="" loading="lazy"/></figure>`;
        break;
      case 'table':
        // skip for now — complex
        break;
      default:
        // ignore unsupported blocks
        break;
    }
  }

  // Close any open lists
  if (inBullet) html += '</ul>';
  if (inNumber) html += '</ol>';

  return html;
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function render404(slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Post Not Found — Tigital</title>
<link rel="icon" type="image/png" href="/public/assets/logo-tigital.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet"/>
<style>
  :root { --navy:#1A0A3C; --yellow:#FFD600; --crimson:#9B1C3A; --ink:#0F0A1E; --paper:#F7F5F0; --muted:#6B6580; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:var(--paper); color:var(--ink); }
  .nav { background:var(--navy); border-bottom:3px solid var(--yellow); padding:0 clamp(1rem,5vw,3rem); height:56px; display:flex; align-items:center; gap:2rem; }
  .nav a { color:#fff; text-decoration:none; font-family:'Syne',sans-serif; font-weight:700; font-size:1.1rem; }
  .nav a span { color:var(--yellow); }
  .center { text-align:center; padding:8rem 2rem; }
  .center h1 { font-family:'Playfair Display',serif; font-size:3rem; margin-bottom:1rem; }
  .center p { color:var(--muted); margin-bottom:2rem; }
  .btn { display:inline-block; background:var(--crimson); color:#fff; padding:0.75rem 1.75rem; border-radius:4px; text-decoration:none; font-family:'Syne',sans-serif; font-weight:700; }
</style>
</head>
<body>
<nav class="nav">
  <a href="/tigital/">tigi<span>tal</span></a>
</nav>
<div class="center">
  <h1>Post Not Found</h1>
  <p>The article you're looking for doesn't exist or hasn't been published yet.</p>
  <a href="/tigital/" class="btn">← Back to Tigital</a>
</div>
</body>
</html>`;
}

function renderPost(post, bodyHtml) {
  const CATEGORY_EMOJI = { Blog: '📝', Guide: '📖', Tool: '🛠️', Resource: '📦' };
  const emoji = CATEGORY_EMOJI[post.category] || '📲';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${post.title} — Tigital</title>
<meta name="description" content="${post.excerpt}"/>
<link rel="icon" type="image/png" href="/public/assets/logo-tigital.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet"/>
<style>
  :root {
    --navy:    #1A0A3C;
    --yellow:  #FFD600;
    --crimson: #9B1C3A;
    --white:   #FFFFFF;
    --ink:     #0F0A1E;
    --paper:   #F7F5F0;
    --muted:   #6B6580;
    --border:  #E8E4F0;
  }
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:var(--paper); color:var(--ink); }

  /* NAV */
  .nav {
    position:sticky; top:0; z-index:100;
    background:var(--navy); border-bottom:3px solid var(--yellow);
    padding:0 clamp(1rem,5vw,3rem); height:56px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .nav-brand {
    display:flex; align-items:center; gap:0.5rem;
    text-decoration:none; color:#fff;
    font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem;
  }
  .nav-brand img { height:28px; }
  .nav-brand span { color:var(--yellow); }
  .nav-back {
    font-family:'Syne',sans-serif; font-size:0.75rem; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase;
    color:rgba(255,255,255,0.6); text-decoration:none;
    border:1px solid rgba(255,255,255,0.2); border-radius:3px;
    padding:0.35rem 0.85rem; transition:all 0.2s;
  }
  .nav-back:hover { color:#fff; border-color:rgba(255,255,255,0.6); }

  /* HERO */
  .post-hero {
    background:var(--navy);
    padding:clamp(3rem,8vw,5rem) clamp(1rem,5vw,3rem) clamp(2rem,5vw,3.5rem);
    text-align:center;
    border-bottom:1px solid rgba(255,255,255,0.1);
  }
  .post-category {
    display:inline-block;
    font-family:'Syne',sans-serif; font-size:0.65rem; font-weight:700;
    letter-spacing:0.2em; text-transform:uppercase;
    color:var(--yellow);
    background:rgba(255,214,0,0.12);
    border:1px solid rgba(255,214,0,0.3);
    padding:0.3rem 0.9rem; border-radius:3px; margin-bottom:1.5rem;
  }
  .post-title {
    font-family:'Playfair Display',serif; font-weight:900;
    font-size:clamp(2rem,5vw,3.5rem); color:#fff; line-height:1.15;
    max-width:800px; margin:0 auto 1.25rem;
  }
  .post-excerpt {
    font-size:1.1rem; color:rgba(255,255,255,0.65); line-height:1.7;
    max-width:640px; margin:0 auto 2rem;
  }
  .post-meta {
    display:flex; align-items:center; justify-content:center; gap:1.5rem;
    font-family:'Syne',sans-serif; font-size:0.7rem; font-weight:600;
    letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.45);
  }
  .post-meta .dot { color:var(--yellow); }

  /* ARTICLE BODY */
  .post-body {
    max-width:720px; margin:0 auto;
    padding:clamp(2.5rem,6vw,4rem) clamp(1rem,5vw,2rem);
  }
  .post-body p {
    font-size:1.05rem; line-height:1.85; color:var(--ink);
    margin-bottom:1.4rem;
  }
  .post-body h1, .post-body h2 {
    font-family:'Playfair Display',serif; font-weight:700;
    color:var(--navy); margin:2.5rem 0 1rem; line-height:1.25;
  }
  .post-body h1 { font-size:clamp(1.6rem,3vw,2.2rem); }
  .post-body h2 { font-size:clamp(1.3rem,2.5vw,1.8rem); }
  .post-body h3 {
    font-family:'Syne',sans-serif; font-weight:700; font-size:1rem;
    letter-spacing:0.08em; text-transform:uppercase;
    color:var(--crimson); margin:2rem 0 0.75rem;
  }
  .post-body ul, .post-body ol {
    margin:0 0 1.4rem 1.5rem; line-height:1.85;
  }
  .post-body li { margin-bottom:0.4rem; font-size:1.05rem; }
  .post-body blockquote {
    border-left:4px solid var(--yellow);
    margin:2rem 0; padding:1rem 1.5rem;
    background:rgba(26,10,60,0.04); border-radius:0 4px 4px 0;
    font-style:italic; color:var(--navy);
  }
  .post-body .callout {
    background:rgba(155,28,58,0.07);
    border:1px solid rgba(155,28,58,0.2);
    border-radius:6px; padding:1rem 1.25rem;
    margin-bottom:1.4rem; font-size:0.98rem; line-height:1.7;
  }
  .post-body pre {
    background:var(--navy); color:#e8e4f0;
    padding:1.25rem 1.5rem; border-radius:6px;
    overflow-x:auto; margin-bottom:1.4rem; font-size:0.9rem;
  }
  .post-body code {
    background:rgba(26,10,60,0.08); color:var(--crimson);
    padding:0.15em 0.4em; border-radius:3px; font-size:0.92em;
  }
  .post-body pre code { background:none; color:inherit; padding:0; }
  .post-body hr {
    border:none; border-top:1px solid var(--border);
    margin:2.5rem 0;
  }
  .post-body figure { margin:1.5rem 0; }
  .post-body figure img { width:100%; border-radius:6px; display:block; }
  .post-body a { color:var(--crimson); }
  .post-body strong { font-weight:600; color:var(--navy); }

  /* CTA BOX */
  .post-cta {
    max-width:720px; margin:0 auto;
    padding:0 clamp(1rem,5vw,2rem) clamp(2rem,5vw,3rem);
  }
  .cta-box {
    background:var(--navy); border-radius:8px;
    padding:2rem 2.5rem; text-align:center;
    border-top:3px solid var(--yellow);
  }
  .cta-box h3 {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:1rem; letter-spacing:0.12em; text-transform:uppercase;
    color:var(--yellow); margin-bottom:0.6rem;
  }
  .cta-box p { color:rgba(255,255,255,0.7); margin-bottom:1.5rem; font-size:0.95rem; }
  .cta-box a {
    display:inline-block; background:var(--yellow); color:var(--navy);
    padding:0.7rem 1.75rem; border-radius:4px; text-decoration:none;
    font-family:'Syne',sans-serif; font-weight:800; font-size:0.85rem;
    letter-spacing:0.06em; text-transform:uppercase;
  }

  /* FOOTER NAV */
  .post-footer {
    border-top:1px solid var(--border);
    padding:1.5rem clamp(1rem,5vw,3rem);
    display:flex; justify-content:center;
    margin-top:1rem;
  }
  .post-footer a {
    font-family:'Syne',sans-serif; font-size:0.75rem; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; color:var(--muted);
    text-decoration:none;
  }
  .post-footer a:hover { color:var(--crimson); }

  @media (max-width:600px) {
    .post-title { font-size:1.8rem; }
  }
</style>
</head>
<body>
<nav class="nav">
  <a href="/tigital/" class="nav-brand">
    <img src="/public/assets/logo-tigital.png" alt="Tigital"/>
    <span class="nav-brand-name">tigi<span>tal</span></span>
  </a>
  <a href="/tigital/" class="nav-back">← All Posts</a>
</nav>

<section class="post-hero">
  <span class="post-category">${emoji} ${post.category}</span>
  <h1 class="post-title">${post.title}</h1>
  <p class="post-excerpt">${post.excerpt}</p>
  <div class="post-meta">
    <span>Tigital</span>
    <span class="dot">·</span>
    <span>${fmtDate(post.date)}</span>
    <span class="dot">·</span>
    <span>${post.category}</span>
  </div>
</section>

<article class="post-body">
  ${bodyHtml || `<p>${post.excerpt}</p>`}
</article>

<div class="post-cta">
  <div class="cta-box">
    <h3>Get weekly marketing drops</h3>
    <p>Strategies, tools and platform updates that actually matter — straight to WhatsApp. No spam, no noise.</p>
    <a href="https://wa.me/919940237330" target="_blank" rel="noopener">📲 Join the Community →</a>
  </div>
</div>

<footer class="post-footer">
  <a href="/tigital/">← Back to Tigital</a>
</footer>
</body>
</html>`;
}

export async function onRequestGet({ params, env }) {
  const slug = params.slug;

  if (!env.NOTION_TOKEN || !env.NOTION_DB_ID) {
    return new Response(render404(slug), { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // Query Notion for the post with this slug
  const dbRes = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Slug', rich_text: { equals: slug } },
          { property: 'Status', select: { equals: 'Published' } }
        ]
      },
      page_size: 1
    })
  });

  if (!dbRes.ok) {
    return new Response(render404(slug), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const { results } = await dbRes.json();
  if (!results || results.length === 0) {
    return new Response(render404(slug), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const page = results[0];
  const props = page.properties;
  const post = {
    id:       page.id,
    title:    props.Title?.title?.[0]?.plain_text ?? '',
    slug:     props.Slug?.rich_text?.[0]?.plain_text ?? slug,
    category: props.Category?.select?.name ?? 'Blog',
    excerpt:  props.Excerpt?.rich_text?.[0]?.plain_text ?? '',
    date:     props.PublishedDate?.date?.start ?? '',
  };

  // Fetch page blocks (the actual article content)
  let bodyHtml = '';
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, {
    headers: {
      'Authorization': `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    }
  });

  if (blocksRes.ok) {
    const { results: blocks } = await blocksRes.json();
    bodyHtml = blocksToHtml(blocks);
  }

  const html = renderPost(post, bodyHtml);
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    }
  });
}
