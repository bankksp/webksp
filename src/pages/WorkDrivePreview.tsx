import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, HardDrive, Upload } from 'lucide-react';
import { AnnualWorkDrivePanel } from '../components/AnnualWorkDrivePanel';
import { SAMPLE_WORK_DRIVE } from '../data/workDrivePreview';
import { AnnualWorkDrive } from '../types';

export const WorkDrivePreview = () => {
  const [drive, setDrive] = useState<AnnualWorkDrive>(SAMPLE_WORK_DRIVE);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-sky-50 border-b border-sky-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-sky-700">ตัวอย่างก่อนอัปโหลด</p>
            <h1 className="text-lg font-black text-sky-900 flex items-center gap-2">
              <HardDrive size={22} /> คลังงานรายปี
            </h1>
            <p className="text-sm text-sky-800 mt-1">
              ดูตัวอย่างการจัดเก็บไฟล์ตามปีและโฟลเดอร์ — ยังไม่อัปโหลดจริง
            </p>
          </div>
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-900 bg-white px-4 py-2 rounded-full border border-sky-200 hover:bg-sky-100 shrink-0"
          >
            <ArrowLeft size={16} /> กลับหน้าบุคลากร
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('view')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
              mode === 'view' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Eye size={14} /> โหมดดูตัวอย่าง
          </button>
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
              mode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Upload size={14} /> โหมดทดลองแก้ไข (ไม่บันทึกจริง)
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-sm text-gray-600">
          <p className="font-bold text-gray-900 mb-2">ข้อมูลตัวอย่างในหน้านี้</p>
          <ul className="list-disc list-inside space-y-1">
            <li>ปี 2569 — โฟลเดอร์「โครงการ / งานประจำปี」มี 2 ไฟล์</li>
            <li>ปี 2569 — โฟลเดอร์「เลื่อนเงินเดือน」มี 1 ไฟล์</li>
            <li>ปี 2568 — โฟลเดอร์「อบรม / สัมมนา」มีรูปตัวอย่าง</li>
          </ul>
          <p className="mt-3 text-amber-700 font-medium">
            อัปโหลดจริงต้องแก้สิทธิ์ Google Drive ใน code.gs ก่อน (รัน initScript แล้ว Deploy)
          </p>
        </div>

        <AnnualWorkDrivePanel
          value={drive}
          editable={mode === 'edit'}
          onChange={setDrive}
        />

        <section className="bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">JSON ตัวอย่าง</h2>
          <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-x-auto border border-gray-100 max-h-64">
            {JSON.stringify(drive, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
};
