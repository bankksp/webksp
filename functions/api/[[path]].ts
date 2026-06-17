import { handleApiRequest, handleHealthCheck } from '../_shared/api';
import type { CloudflareEnv } from '../_shared/env';

export const onRequestGet: PagesFunction<CloudflareEnv> = async (context) => {
  const path = context.params.path?.join('/') || '';

  if (path === 'health') {
    return handleHealthCheck();
  }

  return handleApiRequest(context.request, context.env);
};

export const onRequestPost: PagesFunction<CloudflareEnv> = async (context) => {
  return handleApiRequest(context.request, context.env);
};
