import { ReactNode } from 'react';

/** แสดงป้าย "ตัวอย่าง" เมื่อเป็นข้อมูล demo */
export function SampleBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200 ${className}`}
    >
      ตัวอย่าง
    </span>
  );
}

export function SampleBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="font-bold">ข้อมูลตัวอย่าง</span>
      {children ? (
        <> — {children}</>
      ) : (
        <> — แสดงเนื้อหาตัวอย่างเพื่อให้เห็นหน้าตาเว็บไซต์ ข้อมูลจริงจะแสดงเมื่อเชื่อมต่อ Google Sheets แล้ว</>
      )}
    </div>
  );
}
