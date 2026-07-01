import { KSP_MANAGEMENT_GAS_URL } from '../config';
import { Certificate } from '../types';
import { fixDriveUrl } from '../services/dataService';

export interface KspPersonnel {
  id: number;
  idCard: string;
  personnelName: string;
  personnelTitle?: string;
  position?: string;
}

export interface KspAchievement {
  id: number;
  personnelId: number;
  personnelName: string;
  date: string;
  title: string;
  level?: string;
  description?: string;
  attachments?: unknown;
  fiscalYear: string;
  assessmentRound?: string;
  organizer?: string;
  hours?: number;
}

const LEVEL_LABELS: Record<string, string> = {
  school: 'ระดับสถานศึกษา',
  district: 'ระดับเขตพื้นที่',
  province: 'ระดับจังหวัด',
  nation: 'ระดับประเทศ',
};

export function achievementLevelLabel(level?: string): string {
  if (!level) return '';
  return LEVEL_LABELS[level] || level;
}

export function normalizeIdCard(id?: string | null): string {
  return String(id || '').replace(/\D/g, '');
}

function parseAttachments(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item));
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return [];
}

function getDriveId(url: string): string | null {
  const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
  return match?.[1] || null;
}

export function attachmentToImageUrl(attachments: unknown): string {
  const list = parseAttachments(attachments);
  const first = list[0];
  if (!first) return '';
  const id = getDriveId(first);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
  return fixDriveUrl(first);
}

export function isoToBuddhistDate(iso: string): string {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

export function buddhistDateToIso(thai: string): string {
  if (!thai || !thai.includes('/')) return thai;
  const [day, month, yearRaw] = thai.split('/');
  let year = parseInt(yearRaw, 10);
  if (year > 2400) year -= 543;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function postKsp<T = any>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(KSP_MANAGEMENT_GAS_URL, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`KSP API HTTP ${response.status}`);
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message || 'KSP API error');
  return result;
}

let personnelCache: KspPersonnel[] | null = null;
let personnelCacheAt = 0;

async function fetchKspPersonnel(): Promise<KspPersonnel[]> {
  if (personnelCache && Date.now() - personnelCacheAt < 5 * 60 * 1000) {
    return personnelCache;
  }
  const result = await postKsp<{ data: KspPersonnel[] }>({ action: 'getPersonnel' });
  personnelCache = result.data || [];
  personnelCacheAt = Date.now();
  return personnelCache;
}

export async function findKspPersonnelByIdCard(idCard?: string | null): Promise<KspPersonnel | null> {
  const digits = normalizeIdCard(idCard);
  if (!digits) return null;
  const personnel = await fetchKspPersonnel();
  return personnel.find((p) => normalizeIdCard(p.idCard) === digits) || null;
}

let achievementsCache: KspAchievement[] | null = null;
let achievementsCacheAt = 0;

async function fetchAllKspAchievements(): Promise<KspAchievement[]> {
  if (achievementsCache && Date.now() - achievementsCacheAt < 2 * 60 * 1000) {
    return achievementsCache;
  }
  const result = await postKsp<{ data: KspAchievement[] }>({ action: 'getAchievements' });
  achievementsCache = result.data || [];
  achievementsCacheAt = Date.now();
  return achievementsCache;
}

export function clearKspCaches() {
  personnelCache = null;
  achievementsCache = null;
}

export async function fetchKspAchievementsForIdCard(idCard?: string | null): Promise<KspAchievement[]> {
  const person = await findKspPersonnelByIdCard(idCard);
  if (!person) return [];
  const all = await fetchAllKspAchievements();
  return all.filter((a) => String(a.personnelId) === String(person.id));
}

export function kspAchievementToCertificate(achievement: KspAchievement): Certificate {
  const imageUrl = attachmentToImageUrl(achievement.attachments);
  return {
    id: `ksp-${achievement.id}`,
    kspAchievementId: Number(achievement.id),
    title: achievement.title || '',
    fiscalYear: String(achievement.fiscalYear || ''),
    hours: Number(achievement.hours) || 0,
    organizer: achievement.organizer || '',
    description: achievement.description || '',
    imageUrl,
    date: buddhistDateToIso(achievement.date || ''),
    level: achievement.level,
    assessmentRound: achievement.assessmentRound ? String(achievement.assessmentRound) : undefined,
    source: 'ksp',
  };
}

export function certificateToKspAchievement(
  cert: Certificate,
  person: KspPersonnel,
  staffName: string,
): Record<string, unknown> {
  const attachments = cert.imageUrl ? [cert.imageUrl] : [];
  return {
    id: cert.kspAchievementId || Date.now(),
    personnelId: person.id,
    personnelName: person.personnelName || staffName,
    date: isoToBuddhistDate(cert.date || ''),
    title: cert.title,
    level: cert.level || 'school',
    description: cert.description || '',
    attachments,
    fiscalYear: String(cert.fiscalYear || ''),
    assessmentRound: cert.assessmentRound || '1',
    organizer: cert.organizer || '',
    hours: cert.hours || 0,
  };
}

function certSortKey(cert: Certificate): number {
  const date = cert.date ? new Date(cert.date).getTime() : 0;
  return date || Number(cert.fiscalYear) || 0;
}

export function mergeCertificates(
  local: Certificate[] | undefined,
  kspAchievements: KspAchievement[],
): Certificate[] {
  const localList = [...(local || [])];
  const localByKspId = new Map<number, Certificate>();
  localList.forEach((cert) => {
    if (cert.kspAchievementId) localByKspId.set(cert.kspAchievementId, cert);
  });

  const merged: Certificate[] = [];
  const linkedKspIds = new Set<number>();

  for (const achievement of kspAchievements) {
    const kspId = Number(achievement.id);
    const fromKsp = kspAchievementToCertificate(achievement);
    const existing = localByKspId.get(kspId);
    if (existing) {
      merged.push({
        ...fromKsp,
        ...existing,
        id: existing.id || fromKsp.id,
        kspAchievementId: kspId,
        imageUrl: existing.imageUrl || fromKsp.imageUrl,
        source: 'ksp',
      });
    } else {
      merged.push(fromKsp);
    }
    linkedKspIds.add(kspId);
  }

  for (const cert of localList) {
    if (cert.kspAchievementId && linkedKspIds.has(cert.kspAchievementId)) continue;
    merged.push({ ...cert, source: cert.source || 'webksp' });
  }

  return merged.sort((a, b) => certSortKey(b) - certSortKey(a));
}

export function certificatesFingerprint(certs: Certificate[] | undefined): string {
  return JSON.stringify(
    (certs || []).map((c) => ({
      id: c.id,
      kspAchievementId: c.kspAchievementId,
      title: c.title,
      fiscalYear: c.fiscalYear,
      date: c.date,
      imageUrl: c.imageUrl,
    })),
  );
}

export async function pullCertificatesFromKsp(
  local: Certificate[] | undefined,
  idCard?: string | null,
): Promise<Certificate[]> {
  const kspAchievements = await fetchKspAchievementsForIdCard(idCard);
  return mergeCertificates(local, kspAchievements);
}

export async function syncCertificatesToKsp(
  certificates: Certificate[],
  previousCertificates: Certificate[] | undefined,
  idCard: string | undefined,
  staffName: string,
): Promise<Certificate[]> {
  const person = await findKspPersonnelByIdCard(idCard);
  if (!person) return certificates;

  const next = [...certificates];

  for (let i = 0; i < next.length; i++) {
    const cert = next[i];
    const payload = certificateToKspAchievement(cert, person, staffName);
    const result = await postKsp<{ data: { id: number } }>({
      action: 'saveAchievement',
      data: payload,
    });
    const savedId = result.data?.id ?? cert.kspAchievementId;
    if (savedId) {
      next[i] = {
        ...cert,
        kspAchievementId: Number(savedId),
        source: 'ksp',
      };
    }
  }

  const prevIds = new Set(
    (previousCertificates || [])
      .map((c) => c.kspAchievementId)
      .filter((id): id is number => typeof id === 'number'),
  );
  const currentIds = new Set(
    next.map((c) => c.kspAchievementId).filter((id): id is number => typeof id === 'number'),
  );
  const deleteIds = [...prevIds].filter((id) => !currentIds.has(id));
  if (deleteIds.length) {
    await postKsp({ action: 'deleteAchievements', ids: deleteIds });
  }

  clearKspCaches();
  return next;
}
