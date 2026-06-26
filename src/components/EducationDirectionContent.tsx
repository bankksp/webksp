import React from 'react';
import { motion } from 'motion/react';
import {
  Eye, Compass, BookOpen, Smile, Sparkles, Heart,
  Award, Palette, Quote,
} from 'lucide-react';
import { SchoolInfo } from '../types';
import { EDUCATION_DIRECTION_DEFAULTS, splitLines } from '../data/educationDirectionDefaults';
import { getSiteLogo } from '../constants/branding';

interface Props {
  info: SchoolInfo | null;
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <span className="inline-block px-5 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold tracking-wide shadow-md shadow-emerald-200">
        {label}
      </span>
      {title && (
        <h3 className="mt-4 text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{title}</h3>
      )}
    </div>
  );
}

function NumberedList({ items, accent = 'emerald' }: { items: string[]; accent?: 'emerald' | 'blue' | 'violet' }) {
  const accentMap = {
    emerald: 'bg-emerald-600 text-white',
    blue: 'bg-blue-600 text-white',
    violet: 'bg-violet-600 text-white',
  };
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ x: 16, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          viewport={{ once: true }}
          className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all"
        >
          <span
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${accentMap[accent]}`}
          >
            {i + 1}
          </span>
          <span className="text-gray-700 text-base lg:text-lg font-medium leading-relaxed pt-1">{item}</span>
        </motion.li>
      ))}
    </ol>
  );
}

export const EducationDirectionContent = ({ info }: Props) => {
  const d = EDUCATION_DIRECTION_DEFAULTS;
  const vision = info?.vision || d.vision;
  const mission = splitLines(info?.mission, d.mission);
  const goals = splitLines(info?.goals, d.goals);
  const strategies = splitLines(info?.strategies, d.strategies);
  const logoUrl = getSiteLogo(info?.logoUrl);

  const principles = [
    { icon: BookOpen, label: 'ปรัชญา', value: info?.philosophy || d.philosophy, color: 'text-emerald-700 bg-emerald-50' },
    { icon: Smile, label: 'อัตลักษณ์', value: info?.identity || d.identity, color: 'text-teal-700 bg-teal-50' },
    { icon: Sparkles, label: 'เอกลักษณ์', value: info?.uniqueness || d.uniqueness, color: 'text-lime-700 bg-lime-50' },
    { icon: Heart, label: 'ค่านิยม', value: info?.values || d.values, color: 'text-green-700 bg-green-50' },
  ];

  const colorLines = splitLines(info?.colorsDescription, d.colorsDescription);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white">
      {/* สัญลักษณ์ + สีประจำโรงเรียน */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100 shadow-sm mb-4">
              <Compass size={14} />
              ส่วนที่ ๓
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              นโยบายการจัดการการศึกษา
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* ตราสัญลักษณ์ */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-lg shadow-emerald-100/40"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                  <Award size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">สัญลักษณ์ประจำโรงเรียน</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="w-40 h-40 shrink-0 rounded-full bg-emerald-50 p-6 flex items-center justify-center ring-4 ring-emerald-100">
                  <img
                    src={logoUrl}
                    alt="ตราประจำโรงเรียน"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-gray-600 text-base leading-relaxed font-medium italic">
                  &ldquo;{info?.logoDescription || d.logoDescription}&rdquo;
                </p>
              </div>
            </motion.div>

            {/* สีประจำโรงเรียน */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-lg shadow-emerald-100/40"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center text-white">
                  <Palette size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">สีประจำโรงเรียน</h3>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg ring-4 ring-white" title="สีเขียว" />
                  <div className="w-16 h-16 rounded-2xl bg-gray-400 shadow-lg ring-4 ring-white" title="สีเทา" />
                </div>
                <p className="text-2xl font-black text-gray-800">{info?.colors || d.colors}</p>
              </div>
              <ul className="space-y-3">
                {colorLines.map((line, i) => (
                  <li key={i} className="flex gap-3 text-gray-600 text-sm lg:text-base leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* หลักการสำคัญ 4 ข้อ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {principles.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${p.color} group-hover:scale-110 transition-transform`}>
                  <p.icon size={22} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{p.label}</p>
                <p className="text-base lg:text-lg font-bold text-gray-800 leading-snug">{p.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* คติพจน์ */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-10 lg:p-14 text-center text-white shadow-2xl shadow-emerald-200 overflow-hidden"
          >
            <Quote size={48} className="absolute top-6 left-6 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 mb-4">คติพจน์ประจำโรงเรียน</p>
            <p className="text-2xl lg:text-3xl font-black leading-relaxed mb-6">
              &ldquo;{info?.motto || d.motto}&rdquo;
            </p>
            <p className="text-sm text-emerald-100/90 font-medium">
              {info?.mottoAttribution || d.mottoAttribution}
            </p>
          </motion.div>
        </div>
      </section>

      {/* วิสัยทัศน์ */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="วิสัยทัศน์ (Vision)" title="" />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-10 lg:p-14 border border-emerald-100 shadow-xl text-center relative overflow-hidden"
          >
            <Eye size={64} className="absolute -right-4 -bottom-4 text-emerald-50" />
            <p className="text-xl lg:text-2xl font-bold text-gray-700 leading-relaxed relative z-10">{vision}</p>
          </motion.div>
        </div>
      </section>

      {/* พันธกิจ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="พันธกิจ (Mission)" title="พันธกิจของโรงเรียน" />
          <NumberedList items={mission} accent="emerald" />
        </div>
      </section>

      {/* เป้าประสงค์ */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="เป้าประสงค์ (Goals)" title="เป้าหมายการดำเนินงาน" />
          <NumberedList items={goals} accent="blue" />
        </div>
      </section>

      {/* กลยุทธ์ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="กลยุทธ์ (Strategies)" title="กลยุทธ์ในการพัฒนา" />
          <NumberedList items={strategies} accent="violet" />
        </div>
      </section>
    </motion.div>
  );
};
