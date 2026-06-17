export interface CloudflareEnv {
  GAS_WEB_APP_URL?: string;
  GAS_SECRET?: string;
  VITE_GAS_WEB_APP_URL?: string;
  VITE_GAS_SECRET?: string;
  ASSETS?: { fetch: typeof fetch };
}

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbx1RpY1-wuslTse_CIDomMq_gOaPp3wgEhTdbXoMq7WMYaY3Zzo4jBlfYEyVNC_TIVmdw/exec';

const DEFAULT_GAS_SECRET = 'KSP_PANYA_SECRET_2026';

export function getGasConfig(env: CloudflareEnv) {
  return {
    gasUrl: env.GAS_WEB_APP_URL || env.VITE_GAS_WEB_APP_URL || DEFAULT_GAS_URL,
    gasSecret: env.GAS_SECRET || env.VITE_GAS_SECRET || DEFAULT_GAS_SECRET,
  };
}
