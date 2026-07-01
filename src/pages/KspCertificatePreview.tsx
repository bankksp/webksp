import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  ArrowLeft,
  Building2,
  Clock,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  X,
} from 'lucide-react';
import { Certificate } from '../types';
import {
  achievementLevelLabel,
  fetchKspAchievementsForIdCard,
  mergeCertificates,
} from '../lib/kspManagementSync';
import { PREVIEW_STAFF, SAMPLE_KSP_ACHIEVEMENTS } from '../data/kspCertificatePreview';

export const KspCertificatePreview = () => {
  const [certFilter, setCertFilter] = useState({ fiscalYear: '', startMonth: '1', endMonth: '12' });
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [idCardInput, setIdCardInput] = useState('');
  const [liveAchievements, setLiveAchievements] = useState<typeof SAMPLE_KSP_ACHIEVEMENTS | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'sample' | 'live'>('sample');

  const kspAchievements = dataSource === 'live' && liveAchievements ? liveAchievements : SAMPLE_KSP_ACHIEVEMENTS;

  const displayCertificates = useMemo(
    () => mergeCertificates([], kspAchievements),
    [kspAchievements],
  );

  const months = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const filterItems = (items: Certificate[]) =>
    items.filter((item) => {
      const itemDate = item.date ? new Date(item.date) : null;
      const itemMonth = itemDate ? itemDate.getMonth() + 1 : null;
      const itemYear = item.fiscalYear || '';
      const matchYear = !certFilter.fiscalYear || String(itemYear) === String(certFilter.fiscalYear);
      const matchMonth =
        !itemMonth ||
        (itemMonth >= parseInt(certFilter.startMonth, 10) && itemMonth <= parseInt(certFilter.endMonth, 10));
      return matchYear && matchMonth;
    });

  const filteredCertificates = filterItems(displayCertificates);

  const groupedCertificates = filteredCertificates.reduce(
    (acc, cert) => {
      const year = cert.fiscalYear || 'ไม่ระบุปี';
      if (!acc[year]) acc[year] = [];
      acc[year].push(cert);
      return acc;
    },
    {} as Record<string, Certificate[]>,
  );

  const sortedYears = Object.keys(groupedCertificates).sort((a, b) => b.localeCompare(a));

  const loadLiveData = async () => {
    const digits = idCardInput.replace(/\D/g, '');
    if (digits.length !== 13) {
      setLiveError('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
      return;
    }
    setLiveLoading(true);
    setLiveError(null);
    try {
      const achievements = await fetchKspAchievementsForIdCard(digits);
      setLiveAchievements(achievements);
      setDataSource('live');
      if (achievements.length === 0) {
        setLiveError('ไม่พบเกียรติบัตรใน KSP Management สำหรับเลขบัตรนี้');
      }
    } catch (error) {
      console.error(error);
      setLiveError('เชื่อมต่อ KSP Management ไม่สำเร็จ — ดูตัวอย่างข้อมูลด้านล่างแทน');
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-700">ตัวอย่างก่อนอัปโหลด</p>
            <h1 className="text-lg font-black text-amber-900">ดูข้อมูลเกียรติบัตรจาก KSP Management</h1>
            <p className="text-sm text-amber-800 mt-1">
              แสดงข้อมูลแบบเดียวกับ SESMS — จับคู่ด้วยเลขบัตรประชาชน
            </p>
          </div>
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-900 bg-white px-4 py-2 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors shrink-0"
          >
            <ArrowLeft size={16} /> กลับหน้าบุคลากร
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">ข้อมูลต้นทาง (KSP Achievements)</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setDataSource('sample')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                dataSource === 'sample' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ตัวอย่างในระบบ ({SAMPLE_KSP_ACHIEVEMENTS.length} รายการ)
            </button>
            <button
              type="button"
              onClick={() => dataSource === 'live' && liveAchievements && setDataSource('live')}
              disabled={!liveAchievements?.length}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-40 ${
                dataSource === 'live' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ข้อมูลจริงจาก KSP {liveAchievements ? `(${liveAchievements.length})` : ''}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={idCardInput}
              onChange={(e) => setIdCardInput(e.target.value)}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก เพื่อดึงข้อมูลจริง"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={loadLiveData}
              disabled={liveLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60"
            >
              {liveLoading ? <RefreshCw size={16} className="animate-spin" /> : <Link2 size={16} />}
              โหลดจาก KSP Management
            </button>
          </div>

          {liveError && (
            <p className="text-sm text-red-600 font-medium mb-4">{liveError}</p>
          )}

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-3">วันที่</th>
                  <th className="px-4 py-3">ปีงบ</th>
                  <th className="px-4 py-3">ชื่อเกียรติบัตร</th>
                  <th className="px-4 py-3">ระดับ</th>
                  <th className="px-4 py-3">รอบ</th>
                  <th className="px-4 py-3">หน่วยงาน</th>
                  <th className="px-4 py-3">ชม.</th>
                </tr>
              </thead>
              <tbody>
                {kspAchievements.map((ach) => (
                  <tr key={ach.id} className="border-t border-gray-50 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{ach.date}</td>
                    <td className="px-4 py-3">{ach.fiscalYear}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 max-w-xs">{ach.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{achievementLevelLabel(ach.level)}</td>
                    <td className="px-4 py-3">{ach.assessmentRound ? `รอบที่ ${ach.assessmentRound}` : '-'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[10rem] truncate">{ach.organizer}</td>
                    <td className="px-4 py-3">{ach.hours || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            บุคลากรตัวอย่าง: {PREVIEW_STAFF.name} · เลขบัตรตัวอย่าง: {PREVIEW_STAFF.idCard}
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="space-y-4 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award size={28} className="text-indigo-600" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">เกียรติบัตรและวุฒิบัตร</h2>
                  <p className="text-sm text-gray-500">{PREVIEW_STAFF.name}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
                <Link2 size={12} /> {dataSource === 'live' ? 'ข้อมูลจริงจาก KSP' : 'ตัวอย่างข้อมูล KSP'} ({displayCertificates.length} รายการ)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 px-2 text-gray-400">
                <Filter size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">กรองข้อมูล</span>
              </div>
              <select
                value={certFilter.fiscalYear}
                onChange={(e) => setCertFilter({ ...certFilter, fiscalYear: e.target.value })}
                className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="">ทุกปีงบประมาณ</option>
                {Array.from(new Set(displayCertificates.map((c) => c.fiscalYear).filter(Boolean)))
                  .sort()
                  .reverse()
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
              <div className="flex items-center gap-1">
                <select
                  value={certFilter.startMonth}
                  onChange={(e) => setCertFilter({ ...certFilter, startMonth: e.target.value })}
                  className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <span className="text-gray-400 text-xs">ถึง</span>
                <select
                  value={certFilter.endMonth}
                  onChange={(e) => setCertFilter({ ...certFilter, endMonth: e.target.value })}
                  className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {sortedYears.length > 0 ? (
            <div className="space-y-12">
              {sortedYears.map((year) => (
                <div key={year}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg uppercase tracking-widest bg-indigo-600">
                      ปีงบประมาณ {year}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {groupedCertificates[year].map((cert, idx) => (
                      <motion.div
                        key={cert.id || `cert-${year}-${idx}`}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => setSelectedCert(cert)}
                        className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 cursor-pointer group hover:shadow-2xl transition-all duration-500"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                          {cert.imageUrl ? (
                            <img
                              src={cert.imageUrl}
                              alt={cert.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                              <ImageIcon size={64} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span className="text-white font-bold text-sm flex items-center gap-2">
                              คลิกเพื่อขยาย <ExternalLink size={16} />
                            </span>
                          </div>
                          {cert.date && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-gray-600 shadow-sm">
                              {new Date(cert.date).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit',
                              })}
                            </div>
                          )}
                          {cert.level && (
                            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm">
                              {achievementLevelLabel(cert.level)}
                            </div>
                          )}
                          {cert.assessmentRound && (
                            <div className="absolute bottom-4 right-4 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm">
                              รอบที่ {cert.assessmentRound}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                            {cert.title}
                          </h4>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <Building2 size={14} className="text-indigo-400" /> {cert.organizer}
                            </div>
                            {cert.hours > 0 && (
                              <div className="flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg text-indigo-600 bg-indigo-50">
                                <Clock size={14} /> {cert.hours} ชม.
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <Award size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold">ไม่พบข้อมูลเกียรติบัตรตามเงื่อนไขที่เลือก</p>
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">ข้อมูลหลังแปลง (แสดงบนเว็บไซต์)</h2>
          <pre className="text-xs bg-gray-50 p-4 rounded-2xl overflow-x-auto border border-gray-100">
            {JSON.stringify(displayCertificates, null, 2)}
          </pre>
        </section>
      </div>

      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="absolute top-6 right-6 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-gray-100 flex items-center justify-center p-6 lg:p-12">
                  {selectedCert.imageUrl ? (
                    <img
                      src={selectedCert.imageUrl}
                      alt={selectedCert.title}
                      className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-xl"
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-4">
                      <ImageIcon size={80} />
                      <p className="font-bold">ไม่มีรูปภาพเกียรติบัตร</p>
                    </div>
                  )}
                </div>
                <div className="p-8 lg:p-16 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">
                    เกียรติบัตร / วุฒิบัตร
                  </p>
                  <p className="text-sm font-bold text-gray-500 mb-2">ปีงบประมาณ {selectedCert.fiscalYear}</p>
                  {selectedCert.level && (
                    <p className="text-xs font-bold text-indigo-600 mb-6">{achievementLevelLabel(selectedCert.level)}</p>
                  )}
                  <h2 className="text-3xl font-black text-gray-900 mb-8 leading-tight">{selectedCert.title}</h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">หน่วยงานที่จัด</p>
                      <p className="text-gray-900 font-bold text-lg">{selectedCert.organizer}</p>
                    </div>
                    {selectedCert.description && (
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">รายละเอียด</p>
                        <p className="text-gray-600 leading-relaxed">{selectedCert.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
