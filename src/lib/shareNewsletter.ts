/** A4 portrait dimensions used by NewsletterTemplate */
export const NEWSLETTER_OG_WIDTH = 1200;
export const NEWSLETTER_OG_HEIGHT = 1697;

export async function fetchNewsletterBlob(imageUrl: string): Promise<Blob | null> {
  try {
    const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export function triggerNewsletterDownload(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
