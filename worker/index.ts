import { handleApiRequest, handleHealthCheck } from '../functions/_shared/api';

export interface Env {
  ASSETS: Fetcher;
  GAS_WEB_APP_URL?: string;
  GAS_SECRET?: string;
  VITE_GAS_WEB_APP_URL?: string;
  VITE_GAS_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api')) {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return handleHealthCheck();
      }
      return handleApiRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
