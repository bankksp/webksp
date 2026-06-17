# webksp — โรงเรียนกาฬสินธุ์ปัญญานุกูล

เว็บไซต์โรงเรียนกาฬสินธุ์ปัญญานุกูล พัฒนาด้วย React + Vite และ deploy บน **Cloudflare Pages** (เชื่อม GitHub อัตโนมัติ)

## สถาปัตยกรรม

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| API Proxy | Cloudflare Pages Functions (`/functions`) |
| ฐานข้อมูล | Google Sheets ผ่าน Google Apps Script |
| Deploy | Cloudflare Pages + GitHub |

## การเตรียม Google Apps Script

1. สร้าง Google Sheets ใหม่
2. ไปที่ `Extensions` > `Apps Script`
3. คัดลอกโค้ดจากไฟล์ `code.gs` ไปวาง
4. แก้ไข `SECRET` ใน `code.gs`
5. `Deploy` > `New Deployment` → Web App → Execute as: Me → Who has access: **Anyone**
6. คัดลอก Web App URL

## Environment Variables

คัดลอก `.env.example` เป็น `.env` สำหรับพัฒนาในเครื่อง:

```bash
cp .env.example .env
```

ตั้งค่าใน **Cloudflare Dashboard** → Workers & Pages → **webksp** → Settings → Environment variables:

| ตัวแปร | ใช้เมื่อ | คำอธิบาย |
|--------|---------|----------|
| `VITE_GAS_WEB_APP_URL` | Build | URL จาก Apps Script |
| `VITE_GAS_SECRET` | Build | Secret สำหรับ client |
| `VITE_ADMIN_EMAIL` | Build | อีเมล admin |
| `GAS_WEB_APP_URL` | Runtime | URL สำหรับ API/SEO บน edge |
| `GAS_SECRET` | Runtime | Secret สำหรับ API/SEO บน edge |

## พัฒนาในเครื่อง

```bash
npm install
npm run dev          # Express dev server (localhost:3000)
npm run pages:dev    # ทดสอบแบบ Cloudflare Pages (หลัง build)
```

## Deploy บน Cloudflare Pages + GitHub

### 1. Push โค้ดขึ้น GitHub

```bash
git init
git add .
git commit -m "Initial commit: webksp for Cloudflare Pages"
git branch -M main
git remote add origin https://github.com/<username>/webksp.git
git push -u origin main
```

### 2. เชื่อม Cloudflare กับ GitHub (Deploy อัตโนมัติ)

1. เข้า [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
2. **Create** → **Pages** → **Connect to Git**
3. เลือก GitHub → อนุญาต Cloudflare → เลือก repo **webksp**
4. ตั้งค่า Build:

| การตั้งค่า | ค่า |
|------------|-----|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

5. เพิ่ม Environment variables (ตารางด้านบน) ทั้ง **Production** และ **Preview**
6. **Save and Deploy**

ทุกครั้งที่ push ขึ้น `main` Cloudflare จะ build และ deploy ใหม่อัตโนมัติ

### 3. Deploy ด้วย CLI (ทางเลือก)

```bash
npx wrangler login
npm run pages:deploy
```

## ฟีเจอร์เด่น

- **SEO Dynamic Meta Tags** — พรีวิวลิงก์ Facebook/Line ผ่าน Cloudflare Pages Functions
- **Google Sheets Backend** — จัดการข้อมูลผ่าน Google Sheets
- **Admin Panel** — ระบบหลังบ้านสำหรับเจ้าหน้าที่
- **Responsive Design** — รองรับทุกหน้าจอ
