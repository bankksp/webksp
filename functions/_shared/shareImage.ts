import { fetchFromGAS } from './gas';
import { getGasConfig, type CloudflareEnv } from './env';
import { normalizeShortId } from './seoText';

type RawPost = {
  id?: string;
  shortId?: string | number;
  newsletterUrl?: string;
  imageUrl?: string;
  album?: string | Array<{ type?: string; url?: string }> | string;
};

function fixDriveUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const driveRegex =
    /(?:drive\.google\.com\/(?:uc\?.*id=|file\/d\/|open\?.*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match?.[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w1200`;
  }
  if (url.includes('lh3.googleusercontent.com/d/') && !url.includes('=')) {
    return `${url}=w1200`;
  }
  return url;
}

function getNewsletterSourceUrl(post: RawPost): string | undefined {
  if (post.newsletterUrl) return post.newsletterUrl;
  if (!post.album) return undefined;
  try {
    const album = typeof post.album === 'string' ? JSON.parse(post.album) : post.album;
    if (Array.isArray(album)) {
      const item = album.find((i) => i?.type?.toLowerCase() === 'newsletter');
      if (item?.url) return item.url;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function findPostByShortId(posts: RawPost[], shortId: string): RawPost | undefined {
  const needle = normalizeShortId(shortId);
  return posts.find((p) => {
    if (normalizeShortId(p.shortId) === needle) return true;
    if (!p.album) return false;
    try {
      const album = typeof p.album === 'string' ? JSON.parse(p.album) : p.album;
      if (Array.isArray(album)) {
        return album.some(
          (item) => item?.type === 'shortId' && normalizeShortId(item.url) === needle,
        );
      }
    } catch {
      /* ignore */
    }
    return false;
  });
}

export async function resolvePostShareImageUrl(
  env: CloudflareEnv,
  segments: string[],
): Promise<string | undefined> {
  const { gasSecret } = getGasConfig(env);

  if (segments[0] === 'p' && segments[1]) {
    const response = await fetchFromGAS(env, {
      action: 'read',
      sheet: 'Posts',
      id: segments[1],
      secret: gasSecret,
    });
    if (!response.ok) return undefined;
    const post = (await response.json()) as RawPost;
    if (!post || (post as { error?: string }).error) return undefined;
    const src = getNewsletterSourceUrl(post) || post.imageUrl;
    return src ? fixDriveUrl(src) : undefined;
  }

  if (segments.length === 1 && segments[0]) {
    const response = await fetchFromGAS(env, {
      action: 'read',
      sheet: 'Posts',
      secret: gasSecret,
    });
    if (!response.ok) return undefined;
    const posts = (await response.json()) as RawPost[];
    if (!Array.isArray(posts)) return undefined;
    const post = findPostByShortId(posts, segments[0]);
    if (!post) return undefined;
    const src = getNewsletterSourceUrl(post) || post.imageUrl;
    return src ? fixDriveUrl(src) : undefined;
  }

  return undefined;
}

export function buildPublicShareImageUrl(origin: string, articlePath: string, isNewsletter: boolean): string {
  if (!isNewsletter) return '';
  const path = articlePath.replace(/\/$/, '');
  if (path.startsWith('/p/')) {
    return `${origin}/share-img/p/${path.slice(3)}`;
  }
  const shortId = path.split('/').filter(Boolean)[0];
  if (shortId) return `${origin}/share-img/${shortId}`;
  return '';
}

export async function serveShareImage(pathname: string, env: CloudflareEnv): Promise<Response> {
  const parts = pathname.split('/').filter(Boolean);
  const segments = parts[0] === 'share-img' ? parts.slice(1) : parts;
  if (segments.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const imageUrl = await resolvePostShareImageUrl(env, segments);
  if (!imageUrl) {
    return new Response('Image not found', { status: 404 });
  }

  const imgRes = await fetch(imageUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Linespider/1.1 (+https://lin.ee/4dwXkTH)' },
  });
  if (!imgRes.ok) {
    return new Response('Upstream image error', { status: 502 });
  }

  const contentType = imgRes.headers.get('Content-Type') || 'image/jpeg';
  const buffer = await imgRes.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType.includes('image') ? contentType : 'image/jpeg',
      'Content-Length': String(buffer.byteLength),
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'bytes',
    },
  });
}
