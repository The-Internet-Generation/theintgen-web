/**
 * Cloudflare Pages Function: /api/posts
 * Fetches published posts from Notion, caches 5 minutes.
 * 
 * Required Pages env vars:
 *   NOTION_TOKEN   — your Notion integration secret (secret_...)
 *   NOTION_DB_ID   — Posts database ID (7ea988611f044600ac1bbacdd2f7499a)
 */

const CACHE_TTL = 300; // 5 minutes

export async function onRequestGet({ request, env, waitUntil }) {
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  // Return cached response if fresh
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // Validate env
  if (!env.NOTION_TOKEN || !env.NOTION_DB_ID) {
    return json({ error: 'NOTION_TOKEN and NOTION_DB_ID env vars required' }, 500);
  }

  // Query Notion for published posts, newest first
  const notionRes = await fetch(
    `https://api.notion.com/v1/databases/${env.NOTION_DB_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'Status', select: { equals: 'Published' } },
        sorts: [{ property: 'PublishedDate', direction: 'descending' }],
        page_size: 20,
      }),
    }
  );

  if (!notionRes.ok) {
    const err = await notionRes.text();
    return json({ error: 'Notion query failed', detail: err }, 502);
  }

  const { results } = await notionRes.json();

  const posts = results.map(page => ({
    id: page.id,
    title:    page.properties.Title?.title?.[0]?.plain_text    ?? '',
    slug:     page.properties.Slug?.rich_text?.[0]?.plain_text ?? '',
    category: page.properties.Category?.select?.name           ?? '',
    excerpt:  page.properties.Excerpt?.rich_text?.[0]?.plain_text ?? '',
    date:     page.properties.PublishedDate?.date?.start        ?? '',
    featured: page.properties.Featured?.checkbox               ?? false,
  }));

  const response = new Response(JSON.stringify({ posts }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
    },
  });

  waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}