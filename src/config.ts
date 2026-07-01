// Google Apps Script Web App URL (ต้อง deploy code.gs เป็น Web App "Anyone")
export const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbx1RpY1-wuslTse_CIDomMq_gOaPp3wgEhTdbXoMq7WMYaY3Zzo4jBlfYEyVNC_TIVmdw/exec';

export const SITE_URL = 'https://ksp.ac.th';
export const API_URL = '/api';

/** Google Apps Script ของ KSP Management / SESMS (ชีต Achievements) */
export const KSP_MANAGEMENT_GAS_URL =
  import.meta.env.VITE_KSP_MANAGEMENT_GAS_URL ||
  'https://script.google.com/macros/s/AKfycbzPULly51wnfwG5MgS2VItYEt9Olp1RXBUmdSk8yvsgMViMr5u4iTNVZ6BlNcAheen9CA/exec';
