import { fetchFromGAS } from './gas';
import { getGasConfig, type CloudflareEnv } from './env';

export function handleHealthCheck(): Response {
  return Response.json({
    status: 'ok',
    runtime: 'cloudflare-worker',
    time: new Date().toISOString(),
  });
}

function apiError(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return Response.json({ error: message, ...extra }, { status });
}

export async function handleApiRequest(
  request: Request,
  env: CloudflareEnv,
): Promise<Response> {
  const { gasSecret, gasUrl } = getGasConfig(env);
  let params: Record<string, unknown> = {};

  if (request.method === 'POST') {
    try {
      params = (await request.json()) as Record<string, unknown>;
    } catch {
      return apiError('Invalid JSON body', 400);
    }
  } else {
    const url = new URL(request.url);
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  const { action, sheet } = params;

  if (!sheet && !action && request.method === 'GET') {
    return Response.json({
      message: 'API is alive. Use POST with sheet and action.',
      gasUrl: gasUrl.substring(0, 60) + '...',
      time: new Date().toISOString(),
    });
  }

  if (!action) {
    return apiError('Missing action parameter');
  }

  const effectiveSecret = (params.secret as string) || gasSecret || '';
  if (!effectiveSecret) {
    return apiError('Server misconfigured: GAS_SECRET is not set', 500);
  }

  try {
    const bodyToPass = {
      ...params,
      secret: effectiveSecret,
    };

    const response = await fetchFromGAS(env, bodyToPass);

    if (!response.ok) {
      const text = await response.text();
      return apiError('GAS Proxy Error', response.status, { details: text.substring(0, 300) });
    }

    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text();

    if (contentType.includes('text/html') || raw.trimStart().startsWith('<')) {
      return apiError(
        'Google Apps Script returned HTML. Redeploy Web App as "Anyone" and verify GAS URL.',
        502,
        { details: raw.substring(0, 200) },
      );
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return apiError('Invalid JSON from Google Apps Script', 502, { details: raw.substring(0, 200) });
    }

    // Some legacy GAS scripts return { status: 'error', message: '...' }
    if (data.status === 'error' && data.message) {
      return apiError(String(data.message), 400, {
        hint: 'GAS URL may point to wrong Apps Script. Deploy code.gs from this repo.',
      });
    }

    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError('Internal Server Error', 500, { message });
  }
}
