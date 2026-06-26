import type { AnnualWorkDrive, WorkDriveFolder, WorkDriveFile, WorkDriveYear } from '../types';

export function emptyWorkDrive(): AnnualWorkDrive {
  return { version: 1, years: [] };
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function currentBuddhistYear(): string {
  return String(new Date().getFullYear() + 543);
}

export function parseWorkDrive(raw: unknown): { drive: AnnualWorkDrive; legacyNote?: string } {
  if (!raw) return { drive: emptyWorkDrive() };

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return { drive: emptyWorkDrive() };
    try {
      return parseWorkDrive(JSON.parse(trimmed));
    } catch {
      return { drive: emptyWorkDrive(), legacyNote: trimmed };
    }
  }

  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (obj.version === 1 && Array.isArray(obj.years)) {
      return { drive: normalizeDrive(raw as AnnualWorkDrive) };
    }

    const years: WorkDriveYear[] = Object.entries(obj)
      .filter(([key]) => key !== 'version' && key !== 'years')
      .map(([year, info]) => ({
        year,
        folders: [
          {
            id: createId(),
            name: 'ข้อมูลเดิม',
            files: [],
            note: typeof info === 'string' ? info : JSON.stringify(info, null, 2),
            createdAt: new Date().toISOString(),
          },
        ],
      }));

    if (years.length > 0) return { drive: { version: 1, years } };
  }

  return { drive: emptyWorkDrive() };
}

function normalizeDrive(drive: AnnualWorkDrive): AnnualWorkDrive {
  return {
    version: 1,
    years: (drive.years || []).map((y) => ({
      year: String(y.year),
      folders: (y.folders || []).map((f) => ({
        id: f.id || createId(),
        name: f.name || 'โฟลเดอร์',
        files: (f.files || []).map((file) => ({
          id: file.id || createId(),
          name: file.name,
          url: file.url,
          mimeType: file.mimeType,
          size: file.size,
          uploadedAt: file.uploadedAt || new Date().toISOString(),
        })),
        note: f.note,
        createdAt: f.createdAt || new Date().toISOString(),
      })),
    })),
  };
}

export function getFileKind(name: string, mimeType?: string): 'image' | 'video' | 'pdf' | 'doc' | 'other' {
  const lower = name.toLowerCase();
  const mime = (mimeType || '').toLowerCase();
  if (mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|bmp|svg)$/.test(lower)) return 'image';
  if (mime.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv|m4v)$/.test(lower)) return 'video';
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (/\.(docx?|xlsx?|pptx?|txt|csv|zip|rar)$/.test(lower)) return 'doc';
  return 'other';
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function addYear(drive: AnnualWorkDrive, year: string): AnnualWorkDrive {
  const y = year.trim();
  if (!y || drive.years.some((item) => item.year === y)) return drive;
  return {
    ...drive,
    years: [...drive.years, { year: y, folders: [] }].sort((a, b) => Number(b.year) - Number(a.year)),
  };
}

export function addFolder(drive: AnnualWorkDrive, year: string, name: string): AnnualWorkDrive {
  const folder: WorkDriveFolder = {
    id: createId(),
    name: name.trim() || 'โฟลเดอร์ใหม่',
    files: [],
    createdAt: new Date().toISOString(),
  };
  return {
    ...drive,
    years: drive.years.map((y) =>
      y.year === year ? { ...y, folders: [...y.folders, folder] } : y,
    ),
  };
}

export function addFileToFolder(
  drive: AnnualWorkDrive,
  year: string,
  folderId: string,
  file: WorkDriveFile,
): AnnualWorkDrive {
  return {
    ...drive,
    years: drive.years.map((y) =>
      y.year !== year
        ? y
        : {
            ...y,
            folders: y.folders.map((f) =>
              f.id === folderId ? { ...f, files: [...f.files, file] } : f,
            ),
          },
    ),
  };
}

export function removeFolder(drive: AnnualWorkDrive, year: string, folderId: string): AnnualWorkDrive {
  return {
    ...drive,
    years: drive.years.map((y) =>
      y.year === year ? { ...y, folders: y.folders.filter((f) => f.id !== folderId) } : y,
    ),
  };
}

export function removeFile(
  drive: AnnualWorkDrive,
  year: string,
  folderId: string,
  fileId: string,
): AnnualWorkDrive {
  return {
    ...drive,
    years: drive.years.map((y) =>
      y.year !== year
        ? y
        : {
            ...y,
            folders: y.folders.map((f) =>
              f.id === folderId ? { ...f, files: f.files.filter((file) => file.id !== fileId) } : f,
            ),
          },
    ),
  };
}

export function renameFolder(
  drive: AnnualWorkDrive,
  year: string,
  folderId: string,
  name: string,
): AnnualWorkDrive {
  return {
    ...drive,
    years: drive.years.map((y) =>
      y.year !== year
        ? y
        : {
            ...y,
            folders: y.folders.map((f) => (f.id === folderId ? { ...f, name: name.trim() || f.name } : f)),
          },
    ),
  };
}
