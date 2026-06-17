# วิธี Deploy ใหม่บน Cloudflare (หลังลบโปรเจกต์)

## 1. สร้าง Worker ใหม่ + เชื่อม GitHub

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. เลือก **Workers** → **Connect to Git**
3. เลือก repo **bankksp/webksp** → branch **main**
4. ตั้งค่า Build:

| การตั้งค่า | ค่า |
|------------|-----|
| Build command | `npm run deploy` |
| หรือ | `npm ci && npm run deploy` |

5. **Save and Deploy**

## 2. Environment Variables

**Settings → Variables and Secrets** → เพิ่ม:

```
GAS_WEB_APP_URL = (URL Apps Script)
GAS_SECRET = (secret ของคุณ)
VITE_GAS_WEB_APP_URL = (URL Apps Script)
VITE_GAS_SECRET = (secret ของคุณ)
VITE_ADMIN_EMAIL = nanthaphat@ksp.ac.th
```

## 3. ทดสอบ

หลัง deploy สำเร็จ เปิด URL: `https://webksp.<account>.workers.dev`

## 4. เพิ่มโดเมน ksp.ac.th (ทีหลัง)

**Settings → Domains & Routes → Add custom domain** → `ksp.ac.th`

โดเมนต้องอยู่ใน Cloudflare account เดียวกัน (Websites → ksp.ac.th)

## Deploy ด้วย CLI (ทางเลือก)

```bash
npx wrangler login
npm run deploy
```
