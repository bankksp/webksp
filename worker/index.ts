import { handleApiRequest, handleHealthCheck } from '../functions/_shared/api';
import { getMetaData, injectMetaTags, isSocialCrawler } from '../functions/_shared/seo';
import { buildRobotsTxt, buildSitemapXml } from '../functions/_shared/sitemap';
import { handleImageProxy } from '../functions/_shared/imageProxy';
import { serveShareImage } from '../functions/_shared/shareImage';
import { getCanonicalOrigin, type CloudflareEnv } from '../functions/_shared/env';

export interface Env extends CloudflareEnv {
  ASSETS: Fetcher;
}

const STATIC_FILE = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|json|woff2?|eot|ttf|pdf)$/i;

const KNOWN_SINGLE_SEGMENT_ROUTES = new Set([
  'about',
  'staff',
  'posts',
  'contact',
  'login',
  'executives',
  'board',
  'info',
  'portfolio',
  'privacy',
  'terms',
  'admin',
  'demo',
  'preview-share',
  'preview-line',
  'p',
  'post',
]);

function isArticlePath(pathname: string): boolean {
  if (pathname.includes('/post/') || pathname.includes('/p/')) return true;
  const segment = pathname.split('/').filter(Boolean)[0];
  return Boolean(segment && !KNOWN_SINGLE_SEGMENT_ROUTES.has(segment));
}

async function serveHtmlWithMeta(
  request: Request,
  env: Env,
  url: URL,
  canonical: string,
): Promise<Response> {
  const indexUrl = new URL('/index.html', url.origin).toString();
  const indexResponse = await env.ASSETS.fetch(indexUrl);
  if (!indexResponse.ok) {
    return new Response('Page not available', { status: 502 });
  }

  let html = await indexResponse.text();
  const meta = await getMetaData(url.pathname, env);
  const metaWithContext = {
    ...meta,
    path: url.pathname,
    type: isArticlePath(url.pathname) ? 'article' : 'website',
  };

  html = injectMetaTags(html, metaWithContext, canonical);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const canonical = getCanonicalOrigin(env);

    if (url.hostname === 'www.ksp.ac.th') {
      return Response.redirect(`${canonical}${url.pathname}${url.search}`, 301);
    }

    if (url.pathname.startsWith('/api')) {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return handleHealthCheck();
      }
      if (url.pathname === '/api/image-proxy' && request.method === 'GET') {
        return handleImageProxy(url);
      }
      return handleApiRequest(request, env);
    }

    if (url.pathname === '/robots.txt') {
      return new Response(buildRobotsTxt(canonical), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
      });
    }

    if (url.pathname === '/sitemap.xml') {
      const xml = await buildSitemapXml(canonical, env);
      return new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    if (url.pathname.startsWith('/share-img/')) {
      return serveShareImage(url.pathname, env);
    }

    const isStatic = STATIC_FILE.test(url.pathname);
    const userAgent = request.headers.get('User-Agent') || '';

    if (!isStatic && (isSocialCrawler(userAgent) || isArticlePath(url.pathname))) {
      return serveHtmlWithMeta(request, env, url, canonical);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
