import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FolderOpen, FolderPlus, Upload, Trash2, FileText, Image as ImageIcon,
  Film, File, Download, ExternalLink, Save, Pencil, ChevronRight, HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';
import { AnnualWorkDrive } from '../types';
import { uploadFile, fixDriveUrl } from '../services/dataService';
import {
  parseWorkDrive, currentBuddhistYear, createId,
  getFileKind, formatFileSize, addYear, addFolder, addFileToFolder,
  removeFolder, removeFile, renameFolder,
} from '../lib/workDrive';

interface Props {
  value?: unknown;
  editable?: boolean;
  onSave?: (drive: AnnualWorkDrive) => Promise<void> | void;
  onChange?: (drive: AnnualWorkDrive) => void;
}

function FileIcon({ name, mimeType }: { name: string; mimeType?: string }) {
  const kind = getFileKind(name, mimeType);
  if (kind === 'image') return <ImageIcon size={18} className="text-emerald-600" />;
  if (kind === 'video') return <Film size={18} className="text-violet-600" />;
  if (kind === 'pdf' || kind === 'doc') return <FileText size={18} className="text-blue-600" />;
  return <File size={18} className="text-gray-500" />;
}

export const AnnualWorkDrivePanel: React.FC<Props> = ({ value, editable = false, onSave, onChange }) => {
  const parsed = useMemo(() => parseWorkDrive(value), [value]);
  const [drive, setDrive] = useState<AnnualWorkDrive>(parsed.drive);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type DialogMode = 'add-year' | 'add-folder' | 'rename-folder' | 'delete-folder';
  const [dialog, setDialog] = useState<{
    mode: DialogMode;
    folderId?: string;
    defaultValue?: string;
  } | null>(null);
  const [dialogInput, setDialogInput] = useState('');

  const closeDialog = () => {
    setDialog(null);
    setDialogInput('');
  };

  const openDialog = (mode: DialogMode, defaultValue = '', folderId?: string) => {
    setDialog({ mode, folderId, defaultValue });
    setDialogInput(defaultValue);
  };

  useEffect(() => {
    const next = parseWorkDrive(value);
    setDrive(next.drive);
    const years = next.drive.years.map((y) => y.year);
    if (years.length && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    } else if (!years.length) {
      setSelectedYear('');
    }
    setOpenFolderId(null);
    setDirty(false);
  }, [value]);

  const updateDrive = (next: AnnualWorkDrive) => {
    setDrive(next);
    setDirty(true);
    onChange?.(next);
  };

  const yearData = drive.years.find((y) => y.year === selectedYear);
  const openFolder = yearData?.folders.find((f) => f.id === openFolderId) || null;

  const handleAddYear = () => {
    openDialog('add-year', currentBuddhistYear());
  };

  const handleAddFolder = () => {
    if (!selectedYear) {
      toast.error('กรุณาเพิ่มปีก่อน');
      return;
    }
    openDialog('add-folder', 'โครงการ / งานประจำปี');
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    if (!selectedYear) return;
    openDialog('rename-folder', currentName, folderId);
  };

  const submitDialog = () => {
    if (!dialog) return;
    const input = dialogInput.trim();

    if (dialog.mode === 'add-year') {
      if (!input) {
        toast.error('กรุณาระบุปี พ.ศ.');
        return;
      }
      if (drive.years.some((y) => y.year === input)) {
        toast.error(`มีปี ${input} อยู่แล้ว`);
        return;
      }
      const next = addYear(drive, input);
      updateDrive(next);
      setSelectedYear(input);
      toast.success(`เพิ่มปี ${input} แล้ว`);
      closeDialog();
      return;
    }

    if (dialog.mode === 'add-folder') {
      if (!input) {
        toast.error('กรุณาระบุชื่อโฟลเดอร์');
        return;
      }
      updateDrive(addFolder(drive, selectedYear, input));
      toast.success('สร้างโฟลเดอร์แล้ว');
      closeDialog();
      return;
    }

    if (dialog.mode === 'rename-folder' && dialog.folderId) {
      if (!input) {
        toast.error('กรุณาระบุชื่อโฟลเดอร์');
        return;
      }
      updateDrive(renameFolder(drive, selectedYear, dialog.folderId, input));
      toast.success('เปลี่ยนชื่อโฟลเดอร์แล้ว');
      closeDialog();
      return;
    }

    if (dialog.mode === 'delete-folder' && dialog.folderId) {
      updateDrive(removeFolder(drive, selectedYear, dialog.folderId));
      setOpenFolderId(null);
      toast.success('ลบโฟลเดอร์แล้ว');
      closeDialog();
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !selectedYear || !openFolderId) return;
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile(file);
        const entry = {
          id: createId(),
          name: file.name,
          url,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setDrive((prev) => {
          const next = addFileToFolder(prev, selectedYear, openFolderId, entry);
          onChange?.(next);
          return next;
        });
        setDirty(true);
      } catch {
        /* toast ใน uploadFile แล้ว */
      }
    }
    toast.success('อัปโหลดไฟล์แล้ว');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(drive);
      setDirty(false);
      toast.success('บันทึกคลังงานแล้ว');
    } catch {
      toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <HardDrive size={24} className="text-indigo-600" />
            คลังงานรายปี
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            จัดเก็บงานแยกตามปีและโฟลเดอร์ — รองรับรูปภาพ วิดีโอ และเอกสารทุกประเภท
          </p>
        </div>
        {editable && onSave && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            <Save size={16} />
            {saving ? 'กำลังบันทึก…' : 'บันทึกคลังงาน'}
          </button>
        )}
      </div>

      {parsed.legacyNote && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900 whitespace-pre-line">
          <p className="font-bold mb-1">ข้อมูลเดิม</p>
          {parsed.legacyNote}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {drive.years.map((y) => (
          <button
            key={y.year}
            type="button"
            onClick={() => {
              setSelectedYear(y.year);
              setOpenFolderId(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedYear === y.year
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ปี {y.year}
            <span className="ml-1 opacity-70">({y.folders.length})</span>
          </button>
        ))}
        {editable && (
          <button
            type="button"
            onClick={handleAddYear}
            className="px-4 py-2 rounded-full text-sm font-bold border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            + เพิ่มปี
          </button>
        )}
      </div>

      {!selectedYear ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {editable ? 'เริ่มต้นด้วยการเพิ่มปี พ.ศ.' : 'ยังไม่มีคลังงานรายปี'}
          </p>
        </div>
      ) : !openFolder ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-700">โฟลเดอร์งาน ปี {selectedYear}</p>
            {editable && (
              <button
                type="button"
                onClick={handleAddFolder}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <FolderPlus size={16} /> สร้างโฟลเดอร์
              </button>
            )}
          </div>
          {yearData?.folders.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {yearData.folders.map((folder) => (
                <div
                  key={folder.id}
                  className="relative p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFolderId(folder.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3 pr-8">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <FolderOpen size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{folder.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{folder.files.length} ไฟล์</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 shrink-0 mt-2" />
                    </div>
                  </button>
                  {editable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFolder(folder.id, folder.name);
                      }}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-white/80"
                      title="เปลี่ยนชื่อโฟลเดอร์"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">ยังไม่มีโฟลเดอร์ในปีนี้</p>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <button
              type="button"
              onClick={() => setOpenFolderId(null)}
              className="text-sm font-bold text-indigo-600 hover:underline"
            >
              ← กลับไปรายการโฟลเดอร์
            </button>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-800">{openFolder.name}</p>
              {editable && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRenameFolder(openFolder.id, openFolder.name)}
                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                    title="เปลี่ยนชื่อ"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDialog('delete-folder', '', openFolder.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="ลบโฟลเดอร์"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {openFolder.note && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 whitespace-pre-line border border-gray-100">
              {openFolder.note}
            </div>
          )}

          {editable && (
            <div className="mb-5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
              >
                <Upload size={16} /> อัปโหลดไฟล์
              </button>
              <p className="text-xs text-gray-400 mt-2">รูปภาพ วิดีโอ PDF Word Excel และไฟล์อื่นๆ (แนะนำไม่เกิน 20MB)</p>
            </div>
          )}

          {openFolder.files.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Upload size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">ยังไม่มีไฟล์ในโฟลเดอร์นี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openFolder.files.map((file) => {
                const url = fixDriveUrl(file.url);
                const kind = getFileKind(file.name, file.mimeType);
                return (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/40"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        <FileIcon name={file.name} mimeType={file.mimeType} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    {kind === 'image' && (
                      <img
                        src={url}
                        alt={file.name}
                        className="w-full sm:w-32 h-24 object-cover rounded-xl border border-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {kind === 'video' && (
                      <video
                        src={url}
                        controls
                        className="w-full sm:w-48 max-h-32 rounded-xl bg-black"
                        preload="metadata"
                      />
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                      >
                        <ExternalLink size={14} /> เปิด
                      </a>
                      <a
                        href={url}
                        download={file.name}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Download size={14} /> ดาวน์โหลด
                      </a>
                      {editable && (
                        <button
                          type="button"
                          onClick={() => updateDrive(removeFile(drive, selectedYear, openFolder.id, file.id))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {dialog && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              {dialog.mode === 'add-year' && 'เพิ่มปีงบประมาณ'}
              {dialog.mode === 'add-folder' && 'สร้างโฟลเดอร์งาน'}
              {dialog.mode === 'rename-folder' && 'เปลี่ยนชื่อโฟลเดอร์'}
              {dialog.mode === 'delete-folder' && 'ลบโฟลเดอร์'}
            </h4>

            {dialog.mode === 'delete-folder' ? (
              <p className="text-sm text-gray-600 mb-6">
                ลบโฟลเดอร์นี้และไฟล์ทั้งหมดภายใน? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            ) : (
              <input
                type="text"
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitDialog();
                  if (e.key === 'Escape') closeDialog();
                }}
                autoFocus
                placeholder={
                  dialog.mode === 'add-year' ? 'เช่น 2569' : 'ชื่อโฟลเดอร์งาน'
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitDialog}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white ${
                  dialog.mode === 'delete-folder'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {dialog.mode === 'delete-folder' ? 'ลบโฟลเดอร์' : 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
