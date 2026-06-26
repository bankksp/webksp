/** โลโก้เริ่มต้นของเว็บไซต์ (ไฟล์ใน public/) */
export const DEFAULT_SITE_LOGO = '/logo-school.png';

const LEGACY_LOGO_URL = 'https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png';

export function getSiteLogo(logoUrl?: string | null): string {
  if (!logoUrl || logoUrl === LEGACY_LOGO_URL) return DEFAULT_SITE_LOGO;
  return logoUrl;
}

export function getAbsoluteSiteLogo(origin: string, logoUrl?: string | null): string {
  const logo = getSiteLogo(logoUrl);
  if (logo.startsWith('http')) return logo;
  return `${origin.replace(/\/$/, '')}${logo}`;
}
