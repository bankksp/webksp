import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleImageProxy } from '../functions/_shared/imageProxy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optionally load .env file for backend if it exists
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) {
  // Ignore
}

const app = express();
const PORT = 3000;

// 1. Basic Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Configuration ---
const GAS_WEB_APP_URL = process.env.GAS_WEB_APP_URL || process.env.VITE_GAS_WEB_APP_URL || "https://script.google.com/macros/s/AKfycbx1RpY1-wuslTse_CIDomMq_gOaPp3wgEhTdbXoMq7WMYaY3Zzo4jBlfYEyVNC_TIVmdw/exec";
const GAS_SECRET = process.env.GAS_SECRET || process.env.VITE_GAS_SECRET || "KSP_PANYA_SECRET_2026";

console.log(`[Server] GAS URL: ${GAS_WEB_APP_URL.substring(0, 50)}...`);

// 2. Logging middleware
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
  next();
});

// 3. API Routes - DEFINED BEFORE VITE/STATIC
const handleDataRequest = async (req: express.Request, res: express.Response) => {
  console.log(`[API] Processing ${req.method} request to ${req.path}`);
  // Use either body or query depending on method
  const params = req.method === 'POST' ? req.body : req.query;
  const { action, sheet, secret } = params || {};
  
  if (!sheet && !action && req.method === 'GET') {
    return res.json({ message: 'API is alive. Use POST with sheet and action.', time: new Date().toISOString() });
  }

  const effectiveSecret = secret || GAS_SECRET || "";

  console.log(`[API] ${req.method} Action: ${action || 'read'}, Sheet: ${sheet}`);

  try {
    // If it's a GET request, we might need to reconstruct the body for GAS
    const bodyToPass = req.method === 'POST' 
      ? JSON.stringify({ ...req.body, secret: effectiveSecret })
      : JSON.stringify({ ...req.query, secret: effectiveSecret, action: action || 'read' });

    const fetchFromGAS = async (retries = 2): Promise<Response> => {
      let lastResponse: Response | null = null;
      for (let i = 0; i <= retries; i++) {
        try {
          const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: bodyToPass,
            redirect: 'follow'
          });
          
          lastResponse = response;
          
          if (!response.ok && response.status === 404) {
             const cloned = response.clone();
             const text = await cloned.text();
             if (text.includes('Unable to open the file') || text.includes('drive-logo')) {
                 console.warn(`[API] GAS returned intermittent 404. Retry ${i}/${retries}...`);
                 await new Promise(r => setTimeout(r, 1500));
                 continue;
             }
          }
          
          return response;
        } catch (error: any) {
             console.warn(`[API] fetch failed. Retry ${i}/${retries}... Error:`, error.message);
             if (i === retries) throw error;
             await new Promise(r => setTimeout(r, 1500));
        }
      }
      return lastResponse as Response;
    };

    let response = await fetchFromGAS();

    if (!response.ok) {
      const text = await response.text();
      console.error(`[API] GAS Backend Error Status: ${response.status}`);
      return res.status(response.status).json({ 
        error: 'GAS Proxy Error', 
        status: response.status,
        details: text 
      });
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error(`[API] Expected JSON from GAS, but got HTML. First 200 chars:`, htmlText.substring(0, 200));
      return res.status(500).json({ error: 'GAS Logic Error', message: 'Google Apps Script returned an HTML page. Please verify the URL and deployment settings (Must be deployed as "Anyone").' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('[API] Fatal Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Mount API health check before other proxy routes
app.get('/api/health', (req, res) => {
  console.log('[Server] Health check');
  res.json({ status: 'ok', node: process.version, time: new Date().toISOString() });
});

app.get('/api/image-proxy', async (req, res) => {
  try {
    const url = new URL(req.originalUrl, `${req.protocol}://${req.get('host')}`);
    const response = await handleImageProxy(url);
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') res.setHeader(key, value);
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (error: any) {
    res.status(502).json({ error: error.message || 'Image proxy failed' });
  }
});

// Mount API routes globally so Vercel serverless function catches it natively
app.use('/api', handleDataRequest);

// --- SEO & Meta Handling ---
async function getMetaData(urlPath: string) {
  let title = 'โรงเรียนกาฬสินธุ์ปัญญานุกูล';
  let description = 'มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ พัฒนาทักษะชีวิต วิชาการ และอาชีพ';
  let imageUrl = 'https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png';

  const fixDriveUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return url;
    const driveRegex = /(?:drive\.google\.com\/(?:uc\?.*id=|file\/d\/|open\?.*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const getPostShareImage = (post: { newsletterUrl?: string; album?: string | unknown[] }) => {
    if (post.newsletterUrl) return post.newsletterUrl;
    if (post.album) {
      try {
        const album = typeof post.album === 'string' ? JSON.parse(post.album) : post.album;
        if (Array.isArray(album)) {
          const newsletter = album.find((item: { type?: string; url?: string }) => item.type === 'newsletter');
          if (newsletter?.url) return newsletter.url;
        }
      } catch {
        /* ignore */
      }
    }
    return undefined;
  };

  try {
    // Decode URL to handle Thai characters properly
    const decodedPath = decodeURIComponent(urlPath);
    const segments = decodedPath.split('/').filter(Boolean);
    const route = segments[0] || 'home';
    
    const routes: Record<string, string> = {
      'p': 'ข่าว/กิจกรรม',
      'post': 'ข่าว/กิจกรรม',
      'about': 'เกี่ยวกับเรา',
      'staff': 'บุคลากร',
      'posts': 'ข่าวประชาสัมพันธ์',
      'contact': 'ติดต่อเรา',
      'executives': 'ผู้บริหาร',
      'board': 'คณะกรรมการ',
      'info': 'สารสนเทศ',
      'portfolio': 'ผลงาน'
    };

    // Special handling for post detail pages
    if ((route === 'post' || route === 'p') && segments[1]) {
      const postId = segments[1];
      console.log(`[SEO] Fetching post data for ID: ${postId}`);
      
      let response: Response;
      try {
        response = await fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ 
            action: 'read', 
            sheet: 'Posts', 
            id: postId,
            secret: GAS_SECRET 
          }),
          redirect: 'follow'
        });
      } catch (e) {
        console.warn(`[SEO] Fetch error: ${e}`);
        return { title, description, imageUrl };
      }

      if (response.ok) {
        const post = await response.json();
        if (post && !post.error) {
          title = `${post.title} | ${title}`;
          // Clean up content for description (remove markdown/html)
          description = post.content ? post.content.substring(0, 160).replace(/[#*`]/g, '').replace(/<[^>]*>?/gm, '').trim() : description;
          const shareImage = getPostShareImage(post);
          if (shareImage) {
            imageUrl = fixDriveUrl(shareImage);
          }
          return { title, description, imageUrl };
        }
      }
    } 
    // Handling for short IDs (URLs like /ksp19)
    else if (segments.length === 1 && route !== 'home' && !routes[route]) {
      const shortId = route;
      console.log(`[SEO] Checking if "${shortId}" is a short ID`);
      
      let response: Response;
      try {
        response = await fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ 
            action: 'read', 
            sheet: 'Posts', 
            secret: GAS_SECRET 
          }),
          redirect: 'follow'
        });
      } catch (e) {
        console.warn(`[SEO] Fetch error: ${e}`);
        return { title, description, imageUrl };
      }

      if (response.ok) {
        const posts = await response.json();
        if (Array.isArray(posts)) {
          const post = posts.find((p: any) => {
            if (!p.album) return false;
            try {
              const album = typeof p.album === 'string' ? JSON.parse(p.album) : p.album;
              if (Array.isArray(album)) {
                return album.some((item: any) => item.type === 'shortId' && item.url === shortId);
              }
            } catch (e) {}
            return false;
          });

          if (post) {
            title = `${post.title} | ${title}`;
            description = post.content ? post.content.substring(0, 160).replace(/[#*`]/g, '').replace(/<[^>]*>?/gm, '').trim() : description;
            const shareImage = getPostShareImage(post);
            if (shareImage) {
              imageUrl = fixDriveUrl(shareImage);
            }
            return { title, description, imageUrl };
          }
        }
      }
    }

    if (routes[route]) {
      title = `${routes[route]} | ${title}`;
    }
  } catch (e: any) {
    console.error(`[SEO] Error fetching meta data:`, e.message);
  }

  return { title, description, imageUrl };
}

// --- Server Lifecycle ---
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

function injectMetaTags(html: string, meta: any, origin: string) {
  let processedHtml = html;
  
  // Ensure imageUrl is absolute
  let absoluteImageUrl = meta.imageUrl;
  if (absoluteImageUrl && absoluteImageUrl.startsWith('/')) {
    absoluteImageUrl = `${origin}${absoluteImageUrl}`;
  }

  // Replace title
  processedHtml = processedHtml.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
  
  // Tags to inject/replace
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
    { name: 'twitter:image', content: absoluteImageUrl }
  ];

  tags.forEach(tag => {
    const attr = tag.name ? 'name' : 'property';
    const val = (tag as any).name || (tag as any).property;
    const regex = new RegExp(`<meta\\s+[^>]*?${attr}="${val}"[^>]*?>`, 'i');
    const newTag = `<meta ${attr}="${val}" content="${tag.content}">`;
    
    if (regex.test(processedHtml)) {
      processedHtml = processedHtml.replace(regex, newTag);
    } else {
      processedHtml = processedHtml.replace('</head>', `    ${newTag}\n  </head>`);
    }
  });
  
  return processedHtml;
}

async function startServer() {
  let vite: any = null;

  // We already mounted /api outside startServer for Vercel compatibility
  app.use((req, res, next) => {
    // If it starts with /api but fell through, log it!
    if (req.path.startsWith('/api')) {
      console.warn(`[Server/Debug] API Request missed routes: ${req.method} ${req.path}`);
    }
    next();
  });

  app.get('/test-server', (req, res) => {
    res.send('Server is working perfectly!');
  });

  if (!isProduction) {
    console.log('[Server] Initializing Vite Middleware');
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Running in Production mode');
    // For production, we serve static files EXCEPT for the root/HTML which we handle manually for SEO
    app.use(express.static(path.join(process.cwd(), 'dist'), { index: false }));
  }

// Update SPA Catch-all with Meta Injection
app.get(/.*/, async (req, res, next) => {
  const url = req.path;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const origin = `${protocol}://${req.get('host')}`;

  // Skip API and Health endpoints
  if (url.startsWith('/api') || url.startsWith('/health')) {
    return next();
  }

  // Skip static assets
  const isStaticFile = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|json|woff2?|eot|ttf|pdf)$/i.test(url);
  if (isStaticFile) {
    return next();
  }

  try {
    const indexPath = isProduction 
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(indexPath)) {
      console.warn(`[Server] Index not found at ${indexPath}`);
      return next();
    }

    let html = fs.readFileSync(indexPath, 'utf-8');
    
    if (!isProduction && vite) {
      html = await vite.transformIndexHtml(req.originalUrl, html);
    }

    const meta = await getMetaData(url);
    // Add path and type to meta for better injection
    const metaWithContext = {
      ...meta,
      path: url,
      type: url.includes('/post/') || url.includes('/p/') ? 'article' : 'website'
    };

    html = injectMetaTags(html, metaWithContext, origin);
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e: any) {
    console.error('[Server] HTML Transform Error:', e.message);
    if (!isProduction && vite) vite.ssrFixStacktrace(e);
    res.status(500).send(e.message);
  }
});

  // 5. Explicit 404 Handler for everything else
  app.use((req, res) => {
    console.warn(`[Server] 404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Endpoint not found on this server' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Startup Critical Failure:', err);
  process.exit(1);
});

export default app;
