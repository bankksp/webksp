import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Facebook, MessageCircle, Image as ImageIcon } from 'lucide-react';

const SAMPLE = {
  title: 'กิจกรรมรณรงค์วันงดสูบบุหรี่โลก ประจำปี 2569',
  date: '10 มิถุนายน 2569',
  category: 'ข่าวสาร',
  coverUrl: 'https://picsum.photos/seed/ksp-tobacco-cover/1200/675',
  newsletterUrl: 'https://picsum.photos/seed/ksp-tobacco-newsletter/900/1270',
};

export const SharePreview = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-4">
            ตัวอย่างก่อน Deploy — ยังไม่ขึ้นเว็บจริง
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ตัวอย่างรูปปก vs แผ่นข่าวแชร์</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            รูปปกที่อัปโหลดจะแสดงในการ์ดข่าวและหน้าบทความ ส่วนแผ่นข่าวใช้แชร์ Facebook / LINE เท่านั้น
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cover usage */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-lg font-bold text-gray-900">รูปปกที่อัปโหลด</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">imageUrl</span>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 max-w-sm mx-auto lg:mx-0">
              <div className="relative h-56">
                <img
                  src={SAMPLE.coverUrl}
                  alt={SAMPLE.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {SAMPLE.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                  <Calendar size={12} />
                  <span>{SAMPLE.date}</span>
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-2">{SAMPLE.title}</h3>
                <p className="text-xs text-gray-400 mt-3">← การ์ดข่าวหน้าแรก</p>
              </div>
            </div>

            <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg max-w-sm mx-auto lg:mx-0">
              <img
                src={SAMPLE.coverUrl}
                alt={SAMPLE.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-sm line-clamp-2">{SAMPLE.title}</p>
                <p className="text-white/60 text-[10px] mt-1">← หน้าบทความ (Hero)</p>
              </div>
            </div>
          </div>

          {/* Newsletter share */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="text-lg font-bold text-gray-900">แผ่นข่าวสำหรับแชร์</h2>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">newsletterUrl</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <img
                src={SAMPLE.newsletterUrl}
                alt="แผ่นข่าวแชร์"
                className="w-full max-h-[420px] object-contain rounded-2xl mx-auto"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-gray-400 text-center mt-3">← สร้างจากปุ่ม "สร้างแผ่นข่าวแชร์"</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm max-w-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">ตัวอย่าง Preview ตอนแชร์</p>
              <div className="flex gap-3">
                <img
                  src={SAMPLE.newsletterUrl}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 line-clamp-2">{SAMPLE.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1">ksp.ac.th</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-[#1877F2] text-xs font-bold">
                  <Facebook size={16} /> Facebook
                </div>
                <div className="flex items-center gap-1.5 text-[#06C755] text-xs font-bold">
                  <MessageCircle size={16} /> LINE
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="text-indigo-600" />
            ขั้นตอนในหน้า Admin
          </h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 shrink-0">1.</span>
              อัปโหลด <strong>รูปภาพหน้าปก</strong> — รูปกิจกรรม/ภาพสวยๆ ที่ต้องการแสดงบนเว็บ
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 shrink-0">2.</span>
              กด <strong>สร้างแผ่นข่าวแชร์</strong> — ระบบสร้างกราฟิกจดหมายข่าว A4 แยกต่างหาก
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600 shrink-0">3.</span>
              บันทึก — รูปปกกับแผ่นข่าวจะไม่ทับกันอีกต่อไป
            </li>
          </ol>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
          >
            กลับหน้าแรก <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
