import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Calendar, ChevronRight, Download, ExternalLink, FileText, X,
} from 'lucide-react';
import { InfoDocument } from '../types';
import { fixDriveUrl } from '../services/dataService';

interface CategoryMeta {
  id: string;
  name: string;
  color?: string;
}

interface Props {
  documents: InfoDocument[];
  categories: CategoryMeta[];
  categoryTitle: string;
  getThumbnail: (doc: InfoDocument) => string;
}

const ACCENT: Record<string, { from: string; to: string }> = {
  curriculum: { from: '#1d4ed8', to: '#3b82f6' },
  download: { from: '#047857', to: '#10b981' },
  info: { from: '#6d28d9', to: '#8b5cf6' },
  sar: { from: '#c2410c', to: '#f97316' },
  plan: { from: '#4338ca', to: '#6366f1' },
  default: { from: '#334155', to: '#64748b' },
};

function accent(category: string) {
  const base = category?.split(':')[0] || 'default';
  return ACCENT[base] || ACCENT.default;
}

function BookCover({
  doc,
  thumbnail,
  categoryName,
  onOpen,
}: {
  doc: InfoDocument;
  thumbnail: string;
  categoryName: string;
  onOpen: () => void;
}) {
  const year = doc.year || new Date(doc.createdAt).getFullYear() + 543;
  const colors = accent(doc.category);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#4a2c1a] rounded-lg"
      title={doc.title}
    >
      <div className="relative transition-all duration-500 ease-out group-hover:-translate-y-5 group-hover:scale-[1.03]">
        {/* ขอบเล่ม / หน้ากระดาษด้านข้าง */}
        <div
          className="absolute top-2 bottom-2 left-[calc(100%-2px)] w-2 rounded-r-sm bg-gradient-to-r from-gray-100 to-gray-200"
          style={{ boxShadow: '2px 0 0 #e5e5e5, 4px 0 0 #d4d4d4, 6px 0 0 #c4c4c4' }}
        />

        <div
          className="relative w-[130px] sm:w-[150px] md:w-[165px] overflow-hidden bg-white p-2 sm:p-2.5 shadow-2xl"
          style={{
            boxShadow:
              '0 2px 0 #fff inset, 0 12px 28px rgba(0,0,0,0.35), 4px 0 0 #f5f5f5, 8px 0 0 #ebebeb, 12px 0 0 #ddd',
          }}
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              src={thumbnail}
              alt={doc.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-indigo-700 shadow-lg">
                <BookOpen size={16} />
                เปิดดูเล่ม
              </div>
            </div>
            <span
              className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
            >
              {year}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-[150px] text-center text-[11px] sm:text-xs font-bold leading-snug text-amber-50/90 line-clamp-2 px-1">
        {doc.title}
      </p>
      <span className="sr-only">{doc.title} — {categoryName}</span>
    </button>
  );
}

function OpenBookPanel({
  doc,
  categoryName,
  thumbnail,
  onClose,
}: {
  doc: InfoDocument;
  categoryName: string;
  thumbnail: string;
  onClose: () => void;
}) {
  const pdfUrl = fixDriveUrl(doc.pdfUrl);
  const year = doc.year || new Date(doc.createdAt).getFullYear() + 543;
  const colors = accent(doc.category);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-colors"
        >
          <X size={18} /> ปิดเล่ม
        </button>

        <div className="relative flex flex-col md:flex-row rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 z-10"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          <div className="md:w-[42%] bg-gradient-to-br from-gray-100 to-gray-200 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
              >
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">เปิดดูเล่ม</p>
                <p className="text-xs font-bold text-gray-700">{categoryName}</p>
              </div>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white aspect-[3/4] max-h-[420px] mx-auto w-full">
              <img
                src={thumbnail}
                alt={doc.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-4 font-medium">ปกเอกสาร</p>
          </div>

          <div className="md:w-[58%] bg-[#fffdf8] p-6 sm:p-10 flex flex-col relative">
            <div
              className="absolute inset-y-0 left-0 w-8 hidden md:block opacity-30"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
              }}
            />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                  style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
                >
                  <BookOpen size={12} /> เล่มที่เปิดอยู่
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <Calendar size={13} className="text-indigo-400" />
                  {year}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4">
                {doc.title}
              </h2>

              <p className="text-gray-600 leading-relaxed text-sm sm:text-base flex-1 mb-8">
                {doc.description || 'เอกสารสารสนเทศของโรงเรียนกาฬสินธุ์ปัญญานุกูล — คลิกปุ่มด้านล่างเพื่อเปิดอ่านไฟล์ PDF'}
              </p>

              <div className="space-y-3 mt-auto">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/15 group/btn"
                >
                  <BookOpen size={18} />
                  เปิดอ่านเอกสาร
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
                <div className="flex gap-3">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink size={16} />
                    เปิดในแท็บใหม่
                  </a>
                  <a
                    href={pdfUrl}
                    download
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Download size={16} />
                    ดาวน์โหลด PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const InfoBookshelf: React.FC<Props> = ({
  documents,
  categories,
  categoryTitle,
  getThumbnail,
}) => {
  const [selected, setSelected] = useState<InfoDocument | null>(null);

  const groupedByYear = useMemo(() => {
    const map = new Map<string, InfoDocument[]>();
    documents.forEach((doc) => {
      const year = doc.year || String(new Date(doc.createdAt).getFullYear() + 543);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(doc);
    });
    return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [documents]);

  const getCategoryName = (doc: InfoDocument) => {
    const cat = doc.category?.split(':')[0] || '';
    return categories.find((c) => c.id === cat)?.name || doc.category || categoryTitle;
  };

  return (
    <>
      <div className="space-y-20">
        {groupedByYear.map(([year, docs]) => (
          <div key={year}>
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">ชั้นหนังสือ</p>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                    {categoryTitle} <span className="text-indigo-600">{year}</span>
                  </h2>
                </div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
              <span className="text-xs font-bold text-gray-400">{docs.length} เล่ม</span>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              {/* พื้นหลังไม้ */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    repeating-linear-gradient(
                      90deg,
                      #3d2214 0px,
                      #4a2c1a 3px,
                      #3d2214 6px,
                      #5c3820 9px,
                      #3d2214 12px
                    )
                  `,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

              <div className="relative px-6 sm:px-10 lg:px-14 pt-12 pb-4">
                <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-10 sm:gap-x-10 md:gap-x-12 lg:justify-start">
                  {docs.map((doc) => (
                    <BookCover
                      key={doc.id}
                      doc={doc}
                      thumbnail={getThumbnail(doc)}
                      categoryName={getCategoryName(doc)}
                      onOpen={() => setSelected(doc)}
                    />
                  ))}
                </div>
              </div>

              {/* ขอบชั้นไม้ */}
              <div
                className="relative h-6 sm:h-7"
                style={{
                  background: 'linear-gradient(180deg, #a67c52 0%, #7a5438 50%, #5c3d28 100%)',
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            <div
              className="h-3 mx-8 sm:mx-16 -mt-1 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 72%)',
              }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <OpenBookPanel
            doc={selected}
            categoryName={getCategoryName(selected)}
            thumbnail={getThumbnail(selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
