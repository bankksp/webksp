export interface CloudflareEnv {
  GAS_WEB_APP_URL?: string;
  GAS_SECRET?: string;
  VITE_GAS_WEB_APP_URL?: string;
  VITE_GAS_SECRET?: string;
  CANONICAL_URL?: string;
  VITE_APP_URL?: string;
  ASSETS?: { fetch: typeof fetch };
}

export const SITE_URL = 'https://ksp.ac.th';

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbzPULly51wnfwG5MgS2VItYEt9Olp1RXBUmdSk8yvsgMViMr5u4iTNVZ6BlNcAheen9CA/exec';

const DEFAULT_GAS_SECRET = 'KSP_PANYA_SECRET_2026';

export function getGasConfig(env: CloudflareEnv) {
  return {
    gasUrl: env.GAS_WEB_APP_URL || env.VITE_GAS_WEB_APP_URL || DEFAULT_GAS_URL,
    gasSecret: env.GAS_SECRET || env.VITE_GAS_SECRET || DEFAULT_GAS_SECRET,
  };
}

export function getCanonicalOrigin(env: CloudflareEnv): string {
  return (env.CANONICAL_URL || env.VITE_APP_URL || SITE_URL).replace(/\/$/, '');
}
