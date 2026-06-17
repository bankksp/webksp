import { GAS_WEB_APP_URL, SITE_URL } from './config';

export interface CloudflareEnv {
  GAS_WEB_APP_URL?: string;
  GAS_SECRET?: string;
  VITE_GAS_WEB_APP_URL?: string;
  VITE_GAS_SECRET?: string;
  CANONICAL_URL?: string;
  VITE_APP_URL?: string;
  GOOGLE_DRIVE_FOLDER_ID?: string;
  ASSETS?: { fetch: typeof fetch };
}

export { SITE_URL, GAS_WEB_APP_URL };

const DEFAULT_GAS_SECRET = 'KSP_PANYA_SECRET_2026';

export function getGasConfig(env: CloudflareEnv) {
  return {
    gasUrl: env.GAS_WEB_APP_URL || env.VITE_GAS_WEB_APP_URL || GAS_WEB_APP_URL,
    gasSecret: env.GAS_SECRET || env.VITE_GAS_SECRET || DEFAULT_GAS_SECRET,
  };
}

export function getCanonicalOrigin(env: CloudflareEnv): string {
  return (env.CANONICAL_URL || env.VITE_APP_URL || SITE_URL).replace(/\/$/, '');
}
