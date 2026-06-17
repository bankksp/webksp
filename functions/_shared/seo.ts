import { fetchFromGAS } from './gas';
import { getGasConfig, type CloudflareEnv } from './env';

export interface PageMeta {
  title: string;
  description: string;
  imageUrl: string;
  path?: string;
  type?: string;
}

const DEFAULT_TITLE = 'โรงเรียนกาฬสินธุ์ปัญญานุกูล';
const DEFAULT_DESCRIPTION =
  'มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ พัฒนาทักษะชีวิต วิชาการ และอาชีพ';
const DEFAULT_IMAGE = 'https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png';

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

function fixDriveUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const driveRegex =
    /(?:drive\.google\.com\/(?:uc\?.*id=|file\/d\/|open\?.*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match?.[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

function cleanDescription(content: string): string {
  return content.substring(0, 160).replace(/[#*`]/g, '').replace(/<[^>]*>?/gm, '').trim();
}

export async function getMetaData(urlPath: string, env: CloudflareEnv): Promise<PageMeta> {
  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let imageUrl = DEFAULT_IMAGE;

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
        const post = (await response.json()) as {
          error?: string;
          title?: string;
          content?: string;
          imageUrl?: string;
        };
        if (post && !post.error) {
          title = `${post.title} | ${title}`;
          description = post.content ? cleanDescription(post.content) : description;
          if (post.imageUrl) imageUrl = fixDriveUrl(post.imageUrl);
          return { title, description, imageUrl };
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
        const posts = (await response.json()) as Array<{
          title?: string;
          content?: string;
          imageUrl?: string;
          album?: string | unknown[];
        }>;

        if (Array.isArray(posts)) {
          const post = posts.find((p) => {
            if (!p.album) return false;
            try {
              const album = typeof p.album === 'string' ? JSON.parse(p.album) : p.album;
              if (Array.isArray(album)) {
                return album.some(
                  (item: { type?: string; url?: string }) =>
                    item.type === 'shortId' && item.url === shortId,
                );
              }
            } catch {
              /* ignore */
            }
            return false;
          });

          if (post) {
            title = `${post.title} | ${title}`;
            description = post.content ? cleanDescription(post.content) : description;
            if (post.imageUrl) imageUrl = fixDriveUrl(post.imageUrl);
            return { title, description, imageUrl };
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

  return { title, description, imageUrl };
}

export function injectMetaTags(html: string, meta: PageMeta, origin: string): string {
  let processedHtml = html;

  let absoluteImageUrl = meta.imageUrl;
  if (absoluteImageUrl?.startsWith('/')) {
    absoluteImageUrl = `${origin}${absoluteImageUrl}`;
  }

  processedHtml = processedHtml.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);

  const tags = [
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:image', content: absoluteImageUrl },
    { property: 'og:image:secure_url', content: absoluteImageUrl },
    { property: 'og:type', content: meta.type || 'website' },
    { property: 'og:url', content: `${origin}${meta.path || ''}` },
    { property: 'og:site_name', content: 'โรงเรียนกาฬสินธุ์ปัญญานุกูล' },
    { name: 'description', content: meta.description },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
    { name: 'twitter:image', content: absoluteImageUrl },
  ];

  for (const tag of tags) {
    const attr = 'name' in tag && tag.name ? 'name' : 'property';
    const val = 'name' in tag && tag.name ? tag.name : (tag as { property: string }).property;
    const regex = new RegExp(`<meta\\s+[^>]*?${attr}="${val}"[^>]*?>`, 'i');
    const newTag = `<meta ${attr}="${val}" content="${tag.content}">`;

    if (regex.test(processedHtml)) {
      processedHtml = processedHtml.replace(regex, newTag);
    } else {
      processedHtml = processedHtml.replace('</head>', `    ${newTag}\n  </head>`);
    }
  }

  return processedHtml;
}
