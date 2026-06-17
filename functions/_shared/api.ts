import { fetchFromGAS } from './gas';
import { getGasConfig, type CloudflareEnv } from './env';

export function handleHealthCheck(): Response {
  return Response.json({
    status: 'ok',
    runtime: 'cloudflare-worker',
    time: new Date().toISOString(),
  });
}

export async function handleApiRequest(
  request: Request,
  env: CloudflareEnv,
): Promise<Response> {
  const { gasSecret } = getGasConfig(env);
  let params: Record<string, unknown> = {};

  if (request.method === 'POST') {
    try {
      params = (await request.json()) as Record<string, unknown>;
    } catch {
      params = {};
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
      time: new Date().toISOString(),
    });
  }

  const effectiveSecret = (params.secret as string) || gasSecret || '';

  try {
    const bodyToPass = {
      ...params,
      secret: effectiveSecret,
      action: action || 'read',
    };

    const response = await fetchFromGAS(env, bodyToPass);

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: 'GAS Proxy Error', status: response.status, details: text },
        { status: response.status },
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      const htmlText = await response.text();
      return Response.json(
        {
          error: 'GAS Logic Error',
          message:
            'Google Apps Script returned an HTML page. Please verify the URL and deployment settings (Must be deployed as "Anyone").',
          details: htmlText.substring(0, 200),
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
