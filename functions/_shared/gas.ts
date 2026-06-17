import { getGasConfig, type CloudflareEnv } from './env';

export async function fetchFromGAS(
  env: CloudflareEnv,
  body: Record<string, unknown>,
  retries = 2,
): Promise<Response> {
  const { gasUrl } = getGasConfig(env);
  const bodyToPass = JSON.stringify(body);

  let lastResponse: Response | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: bodyToPass,
        redirect: 'follow',
      });

      lastResponse = response;

      if (!response.ok && response.status === 404) {
        const text = await response.clone().text();
        if (text.includes('Unable to open the file') || text.includes('drive-logo')) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return lastResponse as Response;
}
