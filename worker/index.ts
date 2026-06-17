import { handleApiRequest, handleHealthCheck } from '../functions/_shared/api';

export interface Env {
  ASSETS: Fetcher;
  GAS_WEB_APP_URL?: string;
  GAS_SECRET?: string;
  VITE_GAS_WEB_APP_URL?: string;
  VITE_GAS_SECRET?: string;
  CANONICAL_URL?: string;
  VITE_APP_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const canonical = (env.CANONICAL_URL || env.VITE_APP_URL || 'https://ksp.ac.th').replace(/\/$/, '');

    if (url.hostname === 'www.ksp.ac.th') {
      return Response.redirect(`${canonical}${url.pathname}${url.search}`, 301);
    }

    if (url.pathname.startsWith('/api')) {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return handleHealthCheck();
      }
      return handleApiRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
