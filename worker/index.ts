import { handleApiRequest, handleHealthCheck } from '../functions/_shared/api';
import { getMetaData, injectMetaTags } from '../functions/_shared/seo';
import type { CloudflareEnv } from '../functions/_shared/env';

const STATIC_FILE = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|json|woff2?|eot|ttf|pdf)$/i;

export interface Env extends CloudflareEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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
    const contentType = assetResponse.headers.get('content-type') || '';

    if (assetResponse.ok && !contentType.includes('text/html')) {
      return assetResponse;
    }

    const indexResponse = await env.ASSETS.fetch(
      new Request(`${url.origin}/index.html`, request),
    );

    if (!indexResponse.ok) {
      return assetResponse.ok ? assetResponse : indexResponse;
    }

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
      url.origin,
    );

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
} satisfies ExportedHandler<Env>;
