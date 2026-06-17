import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { History, Target, Eye, Award, Users, ShieldCheck, MapPin, Phone, Mail, Facebook, Info, Star, Smile, Sparkles, TreeDeciduous, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';
import { getSchoolInfo } from '../services/dataService';
import { SchoolInfo } from '../types';
import { useSchoolInfo } from '../hooks/useSchoolInfo';

export const About = () => {
  const { section } = useParams<{ section?: string }>();
  const { schoolInfo: info, loading } = useSchoolInfo();

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'history':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white"
          >
            {/* About Institution Section */}
            <section className="py-24 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="w-full lg:w-1/2">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="absolute -inset-4 bg-indigo-100 rounded-[3rem] -z-10 rotate-3"></div>
                      <img 
                        src={info?.aboutImageUrl || "https://picsum.photos/seed/school-1/800/600"} 
                        alt="School Building" 
                        className="w-full h-auto rounded-[2.5rem] shadow-2xl object-cover aspect-[4/3]"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-8">
                    <div>
                      <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        เกี่ยวกับสถานศึกษา
                      </span>
                      <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight mb-6">
                        {info?.name || 'โรงเรียนกาฬสินธุ์ปัญญานุกูล'}
                      </h2>
                      <div className="w-20 h-1.5 bg-indigo-600 rounded-full mb-8"></div>
                    </div>
                    <div className="prose prose-lg text-gray-600 max-w-none">
                      {info?.history ? (
                        info.history.split('\n').map((para, i) => (
                          <p key={i} className="mb-4 leading-relaxed">{para}</p>
                        ))
                      ) : (
                        <p>โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์ สังกัดสำนักบริหารงานการศึกษาพิเศษ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน กระทรวงศึกษาธิการ จัดตั้งขึ้นเพื่อให้บริการทางการศึกษาแก่เด็กที่มีความบกพร่องทางสติปัญญาและเด็กที่มีความบกพร่องหลายอย่าง</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* History/Role Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      className="relative mb-8"
                    >
                      <div className="text-[10rem] md:text-[12rem] font-black text-indigo-600/10 leading-none select-none">
                        {info?.historyYear || '2543'}
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-2">ก่อตั้งเมื่อปี</span>
                        <span className="text-7xl md:text-8xl font-black text-indigo-600 tracking-tighter">
                          {info?.historyYear || '2543'}
                        </span>
                      </div>
                    </motion.div>
                    <div className="max-w-md">
                      <img 
                        src={info?.historyImageUrl || "https://picsum.photos/seed/history/600/400"} 
                        alt="History" 
                        className="w-full h-auto rounded-[2rem] shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50">
                      <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                          <BookOpen size={24} />
                        </div>
                        บทบาทหน้าที่
                      </h3>
                      <ul className="space-y-6">
                        {(info?.historyRole || 'จัดการศึกษาสำหรับเด็กพิการ\nให้บริการช่วยเหลือระยะแรกเริ่ม\nพัฒนาศักยภาพผู้เรียน\nส่งเสริมทักษะอาชีพ').split('\n').map((role, i) => (
                          <motion.li 
                            key={i}
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-4"
                          >
                            <div className="mt-1.5 w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                              <Star size={12} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold text-gray-700 leading-tight">{role}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'vision':
      case 'identity':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white"
          >
            {/* Vision Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-widest uppercase">
                    วิสัยทัศน์ (Vision)
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">วิสัยทัศน์ของโรงเรียน</h2>
                  <div className="relative max-w-4xl mx-auto">
                    <div className="absolute -top-10 -left-10 text-[12rem] font-serif text-indigo-600/10 leading-none select-none">“</div>
                    <p className="text-3xl md:text-4xl font-bold text-gray-700 leading-tight italic relative z-10">
                      {info?.vision || 'มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ เพื่อพัฒนาศักยภาพสู่การพึ่งพาตนเองและดำรงชีวิตในสังคมอย่างมีความสุข'}
                    </p>
                    <div className="absolute -bottom-20 -right-10 text-[12rem] font-serif text-indigo-600/10 leading-none select-none rotate-180">“</div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="w-full lg:w-1/2">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] -z-10 -rotate-3"></div>
                      <img 
                        src={info?.missionImageUrl || "https://picsum.photos/seed/mission/800/1000"} 
                        alt="Mission" 
                        className="w-full h-auto rounded-[2.5rem] shadow-2xl object-cover aspect-[3/4]"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                  <div className="w-full lg:w-1/2">
                    <div className="bg-blue-50 p-12 md:p-16 rounded-[4rem] border border-blue-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <span className="inline-block px-4 py-1.5 bg-white text-blue-600 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                        พันธกิจ (Mission)
                      </span>
                      <h2 className="text-4xl font-black text-gray-900 mb-10 tracking-tighter">พันธกิจของโรงเรียน</h2>
                      <ul className="space-y-6">
                        {(info?.mission || 'จัดการศึกษาและบริการช่วยเหลือระยะแรกเริ่ม\nพัฒนาศักยภาพผู้เรียนตามความถนัดและความสนใจ\nส่งเสริมทักษะอาชีพและการดำรงชีวิตอิสระ').split('\n').filter(line => line.trim()).map((m, i) => (
                          <motion.li 
                            key={i}
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-4"
                          >
                            <div className="mt-1.5 w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                              <CheckCircle size={18} />
                            </div>
                            <span className="text-xl font-bold text-gray-700 leading-tight">{m}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Identity & Uniqueness Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="w-full lg:w-1/2 order-2 lg:order-1">
                    <div className="space-y-12">
                      <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Smile size={32} />
                          </div>
                          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">อัตลักษณ์ (Identity)</h3>
                        </div>
                        <p className="text-3xl font-black text-indigo-600 tracking-tighter leading-tight pl-22">
                          {info?.identity || 'ร่าเริง แจ่มใส ใส่ใจงานอาชีพ'}
                        </p>
                      </div>

                      <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Sparkles size={32} />
                          </div>
                          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">เอกลักษณ์ (Uniqueness)</h3>
                        </div>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter leading-tight pl-22">
                          {info?.uniqueness || 'โรงเรียนสะอาด บรรยากาศ ร่มรื่น'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 order-1 lg:order-2">
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="absolute -inset-4 bg-indigo-100 rounded-[3rem] -z-10 rotate-3"></div>
                      <img 
                        src={info?.identityImageUrl || "https://picsum.photos/seed/identity/800/600"} 
                        alt="Identity" 
                        className="w-full h-auto rounded-[2.5rem] shadow-2xl object-cover aspect-[4/3]"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* Motto & Philosophy Section */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="p-12 bg-indigo-600 rounded-[4rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <Star size={48} className="mb-8 opacity-50" />
                    <span className="text-indigo-200 font-bold tracking-widest uppercase text-sm mb-4 block">คำขวัญโรงเรียน</span>
                    <h3 className="text-4xl font-black mb-8 tracking-tighter">คำขวัญโรงเรียน</h3>
                    <p className="text-3xl font-bold leading-tight italic mb-8">
                      "{info?.motto || 'เราจะไม่ทำความไม่ดี เพราะเราจะได้มีแต่ความสุข'}"
                    </p>
                  </div>

                  <div className="p-12 bg-white rounded-[4rem] border-4 border-indigo-600 shadow-xl relative overflow-hidden">
                    <BookOpen size={48} className="mb-8 text-indigo-600 opacity-20" />
                    <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">ปรัชญา</span>
                    <h3 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">ปรัชญาโรงเรียน</h3>
                    <p className="text-3xl font-black text-indigo-600 leading-tight">
                      "{info?.philosophy || 'ปัญญาเป็นแสงสว่างในโลก'}"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Logo Description Section */}
            <section className="py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-gray-100 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-72 h-72 bg-indigo-50/50 rounded-full p-12 shadow-2xl shadow-indigo-100/50 border-8 border-white flex items-center justify-center shrink-0 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src={info?.logoUrl || "https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png"} 
                alt="School Logo" 
                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </motion.div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6">
                        <Award size={18} /> ตราประจำโรงเรียน
                      </div>
                      <h3 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">ความหมายของตราสัญลักษณ์</h3>
                      <p className="text-2xl text-gray-600 leading-relaxed font-medium italic">
                        {info?.logoDescription || '“ มือประคองรูปสัญลักษณ์ผู้พิการทางสติปัญญาในกรอบวงกลม ภายใต้ซุ้มพระธาตุยาคูอันมงคล ล้อมด้วยโปงลาง อันเป็นสัญลักษณ์ประจำจังหวัด มีเสมาสัญลักษณ์แห่งการศึกษา กอปรขึ้นเป็นตราประจำ โรงเรียน ”'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'basic':
        return (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 bg-gray-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-12 lg:p-20">
                    <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">ข้อมูลทั่วไป</span>
                    <h2 className="text-5xl font-black text-gray-900 mb-12 tracking-tighter">ข้อมูลพื้นฐาน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                          <MapPin size={24} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tighter">ที่อยู่</h4>
                        <p className="text-gray-500 leading-relaxed">{info?.address || 'จังหวัดกาฬสินธุ์'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                          <Phone size={24} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tighter">เบอร์โทรศัพท์</h4>
                        <p className="text-gray-500 leading-relaxed">{info?.phone || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                          <Mail size={24} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tighter">อีเมล</h4>
                        <p className="text-gray-500 leading-relaxed">{info?.email || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className={`w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4`}>
                          <Facebook size={24} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tighter">Facebook</h4>
                        <a href={info?.facebook} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                          {info?.facebook ? 'เยี่ยมชมแฟนเพจ' : 'โรงเรียนกาฬสินธุ์ปัญญานุกูล'}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-600 p-12 lg:p-20 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 blur-3xl"></div>
                    <Info size={80} className="mb-8 opacity-20" />
                    <h3 className="text-4xl font-black mb-6 tracking-tighter leading-none">ติดต่อสอบถาม<br/>ข้อมูลเพิ่มเติม</h3>
                    <p className="text-indigo-100 text-xl leading-relaxed mb-10 font-medium">
                      หากท่านต้องการข้อมูลเพิ่มเติม หรือมีข้อสงสัยเกี่ยวกับการจัดการเรียนการสอน สามารถติดต่อเราได้ตามช่องทางที่ระบุไว้
                    </p>
                    <Link to="/contact" className="bg-white text-indigo-600 px-10 py-4 rounded-3xl font-black text-center hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20">
                      ส่งข้อความหาเรา
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        );
      default:
        return (
          <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">ข้อมูลโรงเรียน</h2>
                <p className="text-xl text-gray-500">เลือกหัวข้อที่ต้องการเพื่อดูรายละเอียดเพิ่มเติม</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { to: '/about/history', icon: <History size={40} />, title: 'ประวัติโรงเรียน', color: 'bg-blue-50 text-blue-600' },
                  { to: '/about/vision', icon: <Target size={40} />, title: 'วิสัยทัศน์และอัตลักษณ์', color: 'bg-indigo-50 text-indigo-600' },
                  { to: '/about/basic', icon: <MapPin size={40} />, title: 'ข้อมูลพื้นฐาน', color: 'bg-orange-50 text-orange-600' }
                ].map((item, idx) => (
                  <Link 
                    key={idx}
                    to={item.to} 
                    className="group p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center"
                  >
                    <div className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{item.title}</h3>
                    <div className="mt-4 w-10 h-1 bg-gray-100 group-hover:w-20 group-hover:bg-indigo-600 transition-all duration-500"></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (section) {
      case 'history': return 'ประวัติโรงเรียน';
      case 'vision':
      case 'identity': return 'วิสัยทัศน์และอัตลักษณ์';
      case 'basic': return 'ข้อมูลพื้นฐาน';
      default: return 'เกี่ยวกับโรงเรียน';
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Helmet>
        <title>{getTitle()} | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="รู้จักกับโรงเรียนกาฬสินธุ์ปัญญานุกูล ประวัติความเป็นมา วิสัยทัศน์ และพันธกิจในการจัดการศึกษาพิเศษ" />
        <meta property="og:title" content={`${getTitle()} | โรงเรียนกาฬสินธุ์ปัญญานุกูล`} />
        <meta property="og:description" content="รู้จักกับโรงเรียนกาฬสินธุ์ปัญญานุกูล ประวัติความเป็นมา วิสัยทัศน์ และพันธกิจในการจัดการศึกษาพิเศษ" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* Header */}
      <section className="relative py-48 bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={info?.aboutCoverUrl || "https://picsum.photos/seed/school-building/1920/1080"} 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-bold tracking-widest uppercase mb-4">
              <Link to="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
              <span>/</span>
              <span className="text-white">{getTitle()}</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
              {getTitle()}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium">
              {section === 'history' ? 'รากฐานที่แข็งแกร่ง เพื่ออนาคตที่ยั่งยืนของนักเรียนทุกคน' : 
               (section === 'vision' || section === 'identity') ? 'มุ่งมั่นพัฒนาศักยภาพผู้เรียนสู่การพึ่งพาตนเองอย่างมีความสุข' : 
               section === 'basic' ? 'ข้อมูลการติดต่อและที่ตั้งของสถานศึกษา' : 'เกี่ยวกับโรงเรียนกาฬสินธุ์ปัญญานุกูล'}
            </p>
          </motion.div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
};
