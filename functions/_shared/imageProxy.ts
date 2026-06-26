const ALLOWED_HOSTS = [
  'lh3.googleusercontent.com',
  'drive.google.com',
  'docs.google.com',
  's.imgz.io',
];

export function handleImageProxy(url: URL): Promise<Response> {
  const raw = url.searchParams.get('url');
  if (!raw) {
    return Promise.resolve(new Response('Missing url parameter', { status: 400 }));
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return Promise.resolve(new Response('Invalid url', { status: 400 }));
  }

  const allowed = ALLOWED_HOSTS.some(
    (host) => target.hostname === host || target.hostname.endsWith(`.${host}`),
  );
  if (!allowed) {
    return Promise.resolve(new Response('Host not allowed', { status: 403 }));
  }

  return fetch(target.toString(), { redirect: 'follow' }).then((imgRes) => {
    if (!imgRes.ok) {
      return new Response('Image fetch failed', { status: imgRes.status });
    }
    return new Response(imgRes.body, {
      headers: {
        'Content-Type': imgRes.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  });
}
