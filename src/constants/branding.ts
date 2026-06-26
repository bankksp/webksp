/** โลโก้เริ่มต้นของเว็บไซต์ (ไฟล์ใน public/) */
export const DEFAULT_SITE_LOGO = '/logo-school.png';

export function getSiteLogo(_logoUrl?: string | null): string {
  return DEFAULT_SITE_LOGO;
}

export function getAbsoluteSiteLogo(origin: string, logoUrl?: string | null): string {
  const logo = getSiteLogo(logoUrl);
  if (logo.startsWith('http')) return logo;
  return `${origin.replace(/\/$/, '')}${logo}`;
}
