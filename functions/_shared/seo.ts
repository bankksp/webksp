import { fetchFromGAS } from './gas';
import { getGasConfig, type CloudflareEnv } from './env';
import { buildMetaDescription, normalizeShortId } from './seoText';
import { buildPublicShareImageUrl } from './shareImage';

export interface PageMeta {
  title: string;
  description: string;
  imageUrl: string;
  path?: string;
  type?: string;
  publishedAt?: string;
  author?: string;
  headline?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const CRAWLER_UA =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|linespider|linebot|line-poker|line\/|ia_archiver|bingbot|googlebot|google-inspectiontool|embedly|pinterest|vkshare|yandexbot|duckduckbot|kakaotalk-scrap|slackbot-linkexpanding/i;

export function isSocialCrawler(userAgent: string): boolean {
  return CRAWLER_UA.test(userAgent);
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const DEFAULT_TITLE = 'โรงเรียนกาฬสินธุ์ปัญญานุกูล';
const DEFAULT_DESCRIPTION =
  'มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ พัฒนาทักษะชีวิต วิชาการ และอาชีพ';
const DEFAULT_IMAGE = 'https://ksp.ac.th/logo-school.png';
const PUBLISHER_NAME = 'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์';

const ROUTES: Record<string, string> = {
  p: 'ข่าว/กิจกรรม',
  post: 'ข่าว/กิจกรรม',
  about: 'เกี่ยวกับเรา',
  staff: 'บุคลากร',
  posts: 'ข่าวประชาสัมพันธ์',
  contact: 'ติดต่อเรา',
  executives: 'ผู้บริหาร',
  board: 'คณะกรรมการ',
  info: 'สารสนเทศ',
  portfolio: 'ผลงาน',
};

type RawPost = {
  id?: string;
  shortId?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  newsletterUrl?: string;
  author?: string;
  authorName?: string;
  createdAt?: string;
  album?: string | Array<{ type?: string; url?: string }>;
  error?: string;
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

const NEWSLETTER_OG_WIDTH = 1200;
const NEWSLETTER_OG_HEIGHT = 1697;

function getPostShareImage(post: RawPost): { url?: string; isNewsletter: boolean } {
  if (post.newsletterUrl) {
    return { url: post.newsletterUrl, isNewsletter: true };
  }
  if (post.album) {
    try {
      const album = typeof post.album === 'string' ? JSON.parse(post.album) : post.album;
      if (Array.isArray(album)) {
        const newsletter = album.find((item) => item.type === 'newsletter');
        if (newsletter?.url) return { url: newsletter.url, isNewsletter: true };
      }
    } catch {
      /* ignore */
    }
  }
  if (post.imageUrl) return { url: post.imageUrl, isNewsletter: false };
  return { url: undefined, isNewsletter: false };
}

function postMetaFromRaw(
  post: RawPost,
  schoolTitle = DEFAULT_TITLE,
  origin = 'https://ksp.ac.th',
  urlPath = '',
): PageMeta {
  const headline = post.title || schoolTitle;
  const description = post.content ? buildMetaDescription(post.content) : DEFAULT_DESCRIPTION;
  const { url: shareImage, isNewsletter } = getPostShareImage(post);
  const publicImage =
    isNewsletter && urlPath
      ? buildPublicShareImageUrl(origin, urlPath, true)
      : '';
  const imageUrl = publicImage || (shareImage ? fixDriveUrl(shareImage) : DEFAULT_IMAGE);
  return {
    title: `${headline} | ${schoolTitle}`,
    headline,
    description,
    imageUrl,
    imageWidth: isNewsletter ? NEWSLETTER_OG_WIDTH : undefined,
    imageHeight: isNewsletter ? NEWSLETTER_OG_HEIGHT : undefined,
    publishedAt: post.createdAt,
    author: post.author || post.authorName || PUBLISHER_NAME,
    type: 'article',
  };
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
          (item: { type?: string; url?: string }) =>
            item.type === 'shortId' && normalizeShortId(item.url) === needle,
        );
      }
    } catch {
      /* ignore */
    }
    return false;
  });
}

export async function getMetaData(urlPath: string, env: CloudflareEnv): Promise<PageMeta> {
  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let imageUrl = DEFAULT_IMAGE;
  const origin = (env.CANONICAL_URL || env.VITE_APP_URL || 'https://ksp.ac.th').replace(/\/$/, '');

  const { gasSecret } = getGasConfig(env);

  try {
    const decodedPath = decodeURIComponent(urlPath);
    const segments = decodedPath.split('/').filter(Boolean);
    const route = segments[0] || 'home';

    if ((route === 'post' || route === 'p') && segments[1]) {
      const postId = segments[1];
      const response = await fetchFromGAS(env, {
        action: 'read',
        sheet: 'Posts',
        id: postId,
        secret: gasSecret,
      });

      if (response.ok) {
        const post = (await response.json()) as RawPost;
        if (post && !post.error) {
          return { ...postMetaFromRaw(post, DEFAULT_TITLE, origin, urlPath), path: urlPath };
        }
      }
    } else if (segments.length === 1 && route !== 'home' && !ROUTES[route]) {
      const shortId = route;
      const response = await fetchFromGAS(env, {
        action: 'read',
        sheet: 'Posts',
        secret: gasSecret,
      });

      if (response.ok) {
        const posts = (await response.json()) as RawPost[];
        if (Array.isArray(posts)) {
          const post = findPostByShortId(posts, shortId);
          if (post) {
            return { ...postMetaFromRaw(post, DEFAULT_TITLE, origin, urlPath), path: urlPath };
          }
        }
      }
    }

    if (ROUTES[route]) {
      title = `${ROUTES[route]} | ${title}`;
    }
  } catch {
    /* use defaults */
  }

  return { title, description, imageUrl, path: urlPath };
}

function buildArticleJsonLd(meta: PageMeta, canonicalUrl: string): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: meta.headline || meta.title,
    description: meta.description,
    image: [meta.imageUrl],
    datePublished: meta.publishedAt || undefined,
    author: {
      '@type': 'Organization',
      name: meta.author || PUBLISHER_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: 'th',
  };
  return JSON.stringify(schema);
}

function upsertMetaTag(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const regex = new RegExp(`<meta\\s+[^>]*?${attr}="${key}"[^>]*?>`, 'i');
  const newTag = `<meta ${attr}="${key}" content="${escapeHtmlAttr(content)}">`;
  if (regex.test(html)) {
    return html.replace(regex, newTag);
  }
  return html.replace('</head>', `    ${newTag}\n  </head>`);
}

function upsertLinkTag(html: string, rel: string, href: string): string {
  const regex = new RegExp(`<link\\s+[^>]*?rel="${rel}"[^>]*?>`, 'i');
  const newTag = `<link rel="${rel}" href="${escapeHtmlAttr(href)}">`;
  if (regex.test(html)) {
    return html.replace(regex, newTag);
  }
  return html.replace('</head>', `    ${newTag}\n  </head>`);
}

export function injectMetaTags(html: string, meta: PageMeta, origin: string): string {
  let processedHtml = html;

  const pagePath = meta.path || '';
  const canonicalUrl = `${origin}${pagePath}`;
  const isArticle = meta.type === 'article';

  let absoluteImageUrl = meta.imageUrl;
  if (absoluteImageUrl?.startsWith('/')) {
    absoluteImageUrl = `${origin}${absoluteImageUrl}`;
  }

  // Strip all default OG/Twitter tags from index.html (LINE reads only og:* but duplicates confuse parsers)
  processedHtml = processedHtml.replace(/<meta\s+[^>]*property="og:[^"]*"[^>]*>\s*/gi, '');
  processedHtml = processedHtml.replace(/<meta\s+[^>]*name="twitter:[^"]*"[^>]*>\s*/gi, '');
  processedHtml = processedHtml.replace(/<meta\s+[^>]*name="description"[^>]*>\s*/gi, '');

  const safeTitle = escapeHtmlAttr(meta.title);
  const safeHeadline = escapeHtmlAttr(meta.headline || meta.title);
  const safeDescription = escapeHtmlAttr(meta.description);
  const safeImage = escapeHtmlAttr(absoluteImageUrl);
  const safeUrl = escapeHtmlAttr(canonicalUrl);

  processedHtml = processedHtml.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);

  // LINE/Linespider needs og:title, og:description, og:image early in <head> (before scripts)
  const earlyOgLines = [
    `<meta property="og:title" content="${safeHeadline}">`,
    `<meta property="og:description" content="${safeDescription}">`,
    `<meta property="og:image" content="${safeImage}">`,
    `<meta property="og:url" content="${safeUrl}">`,
    `<meta property="og:type" content="${meta.type || 'website'}">`,
    `<meta name="description" content="${safeDescription}">`,
    `<link rel="image_src" href="${safeImage}">`,
  ];

  if (meta.imageWidth && meta.imageHeight) {
    earlyOgLines.push(
      `<meta property="og:image:width" content="${meta.imageWidth}">`,
      `<meta property="og:image:height" content="${meta.imageHeight}">`,
    );
  }
  earlyOgLines.push(`<meta property="og:image:type" content="image/jpeg">`);

  if (isArticle && meta.publishedAt) {
    earlyOgLines.push(`<meta property="article:published_time" content="${escapeHtmlAttr(meta.publishedAt)}">`);
  }

  const earlyOgBlock = `${earlyOgLines.join('\n    ')}\n`;
  processedHtml = processedHtml.replace(/<head([^>]*)>/i, `<head$1>\n    ${earlyOgBlock}`);

  processedHtml = upsertLinkTag(processedHtml, 'canonical', canonicalUrl);

  if (isArticle) {
    const jsonLd = buildArticleJsonLd({ ...meta, imageUrl: absoluteImageUrl }, canonicalUrl);
    const scriptTag = `<script type="application/ld+json">${jsonLd}</script>`;
    processedHtml = processedHtml.replace('</head>', `    ${scriptTag}\n  </head>`);
  }

  return processedHtml;
}
