import { fetchFromGAS } from './gas';
import { getGasConfig, type CloudflareEnv } from './env';

const STATIC_PATHS: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/posts', changefreq: 'daily', priority: '0.9' },
  { path: '/staff', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/info', changefreq: 'weekly', priority: '0.8' },
  { path: '/executives', changefreq: 'monthly', priority: '0.6' },
  { path: '/board', changefreq: 'monthly', priority: '0.6' },
  { path: '/portfolio', changefreq: 'weekly', priority: '0.7' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPostPath(post: {
  id?: string;
  shortId?: string | number;
  album?: string | Array<{ type?: string; url?: string }>;
}): string | null {
  let shortId = post.shortId != null ? String(post.shortId).trim() : '';
  if (!shortId && post.album) {
    try {
      const album = typeof post.album === 'string' ? JSON.parse(post.album) : post.album;
      if (Array.isArray(album)) {
        const item = album.find((i) => i.type === 'shortId');
        if (item?.url) shortId = item.url;
      }
    } catch {
      /* ignore */
    }
  }
  if (shortId) return `/${shortId}`;
  if (post.id) return `/p/${post.id}`;
  return null;
}

function formatLastMod(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().split('T')[0];
}

export async function buildSitemapXml(origin: string, env: CloudflareEnv): Promise<string> {
  const { gasSecret } = getGasConfig(env);
  const entries: string[] = [];

  for (const page of STATIC_PATHS) {
    const loc = `${origin}${page.path === '/' ? '' : page.path}`;
    entries.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  try {
    const response = await fetchFromGAS(env, {
      action: 'read',
      sheet: 'Posts',
      secret: gasSecret,
    });

    if (response.ok) {
      const posts = (await response.json()) as Array<{
        id?: string;
        shortId?: string;
        album?: string | unknown[];
        createdAt?: string;
      }>;

      if (Array.isArray(posts)) {
        for (const post of posts) {
          const path = getPostPath(post);
          if (!path) continue;
          const lastmod = formatLastMod(post.createdAt);
          entries.push(`  <url>
    <loc>${escapeXml(`${origin}${path}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
        }
      }
    }
  } catch {
    /* static pages only */
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}

export function buildRobotsTxt(origin: string): string {
  return `User-agent: *
Allow: /

User-agent: Linespider
Allow: /

User-agent: Line
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}
