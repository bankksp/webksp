import { getMetaData, injectMetaTags } from './_shared/seo';
import type { CloudflareEnv } from './_shared/env';

const STATIC_FILE = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|json|woff2?|eot|ttf|pdf)$/i;

export const onRequest: PagesFunction<CloudflareEnv> = async (context) => {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/api')) {
    return context.next();
  }

  if (STATIC_FILE.test(url.pathname)) {
    return context.next();
  }

  const assets = context.env.ASSETS;
  if (!assets) {
    return context.next();
  }

  const assetResponse = await assets.fetch(context.request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const indexResponse = await assets.fetch(
    new Request(`${url.origin}/index.html`, context.request),
  );

  if (!indexResponse.ok) {
    return indexResponse;
  }

  let html = await indexResponse.text();
  const meta = await getMetaData(url.pathname, context.env);
  const metaWithContext = {
    ...meta,
    path: url.pathname,
    type:
      url.pathname.includes('/post/') || url.pathname.includes('/p/')
        ? 'article'
        : 'website',
  };

  html = injectMetaTags(html, metaWithContext, url.origin);

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
};
