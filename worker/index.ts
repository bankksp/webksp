import { handleApiRequest, handleHealthCheck } from '../functions/_shared/api';
import { getCanonicalOrigin } from '../functions/_shared/env';
import type { CloudflareEnv } from '../functions/_shared/env';
import { getMetaData, injectMetaTags } from '../functions/_shared/seo';

const STATIC_FILE = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|json|woff2?|eot|ttf|pdf)$/i;

export interface Env extends CloudflareEnv {
  ASSETS: Fetcher;
}

async function serveSpaWithSeo(
  request: Request,
  env: Env,
  canonicalOrigin: string,
): Promise<Response> {
  const url = new URL(request.url);
  const indexResponse = await env.ASSETS.fetch(
    new Request(`${url.origin}/index.html`, request),
  );

  if (!indexResponse.ok) {
    return indexResponse;
  }

  try {
    let html = await indexResponse.text();
    const meta = await getMetaData(url.pathname, env);

    html = injectMetaTags(
      html,
      {
        ...meta,
        path: url.pathname,
        type:
          url.pathname.includes('/post/') || url.pathname.includes('/p/')
            ? 'article'
            : 'website',
      },
      canonicalOrigin,
    );

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  } catch (error) {
    console.error('SEO injection failed:', error);
    return indexResponse;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const canonicalOrigin = getCanonicalOrigin(env);

      if (url.hostname === 'www.ksp.ac.th') {
        return Response.redirect(`${canonicalOrigin}${url.pathname}${url.search}`, 301);
      }

      if (url.pathname.startsWith('/api')) {
        if (url.pathname === '/api/health' && request.method === 'GET') {
          return handleHealthCheck();
        }
        return handleApiRequest(request, env);
      }

      if (STATIC_FILE.test(url.pathname)) {
        return env.ASSETS.fetch(request);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.ok) {
        return assetResponse;
      }

      return serveSpaWithSeo(request, env, canonicalOrigin);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
