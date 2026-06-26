import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { History, MapPin, Phone, Mail, Facebook, Info, Star, BookOpen, Compass } from 'lucide-react';
import { fixDriveUrl } from '../services/dataService';
import { SchoolInfo } from '../types';
import { useSchoolInfo } from '../hooks/useSchoolInfo';
import { EducationDirectionContent } from '../components/EducationDirectionContent';

function SchoolNameHeading({ name, className }: { name: string; className?: string }) {
  const match = name.match(/^(.+?)\s+(จังหวัด.+)$/);
  if (match) {
    return (
      <h2 className={className}>
        <span className="block">{match[1]}</span>
        <span className="block">{match[2]}</span>
      </h2>
    );
  }
  return <h2 className={className}>{name}</h2>;
}

export const About = () => {
  const { section } = useParams<{ section?: string }>();
  const { schoolInfo: info, loading } = useSchoolInfo();

  if (section === 'vision' || section === 'identity') {
    return <Navigate to="/about/direction" replace />;
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'history': {
        const historyParagraphs = info?.history
          ? info.history.split('\n').filter((p) => p.trim())
          : [
              'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์ สังกัดสำนักบริหารงานการศึกษาพิเศษ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน กระทรวงศึกษาธิการ จัดตั้งขึ้นเพื่อให้บริการทางการศึกษาแก่เด็กที่มีความบกพร่องทางสติปัญญาและเด็กที่มีความบกพร่องหลายอย่าง',
            ];
        const mid = Math.ceil(historyParagraphs.length / 2);
        const historyCol1 = historyParagraphs.slice(0, mid);
        const historyCol2 = historyParagraphs.slice(mid);
        const aboutImage = info?.aboutImageUrl
          ? fixDriveUrl(info.aboutImageUrl)
          : 'https://picsum.photos/seed/school-1/1600/900';
        const historyImage = info?.historyImageUrl
          ? fixDriveUrl(info.historyImageUrl)
          : aboutImage;
        const roleItems = (
          info?.historyRole ||
          'จัดการศึกษาสำหรับเด็กพิการ\nให้บริการช่วยเหลือระยะแรกเริ่ม\nพัฒนาศักยภาพผู้เรียน\nส่งเสริมทักษะอาชีพ'
        )
          .split('\n')
          .filter((r) => r.trim());

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white">
            {/* เกี่ยวกับสถานศึกษา — ข้อความด้านบน รูปด้านล่าง */}
            <section className="relative py-20 lg:py-28 overflow-hidden">
              <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-12 lg:mb-16"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-lg shadow-indigo-200">
                    <History size={14} />
                    เกี่ยวกับสถานศึกษา
                  </span>
                  <SchoolNameHeading
                    name={info?.name || 'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์'}
                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 tracking-tight leading-snug mb-5 max-w-4xl"
                  />
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 w-16 bg-indigo-600 rounded-full" />
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                      ก่อตั้ง พ.ศ. {info?.historyYear || '2538'}
                    </p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-14 lg:mb-20">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                    className="space-y-5"
                  >
                    {historyCol1.map((para, i) => (
                      <p key={i} className="text-gray-600 text-lg leading-[1.85] font-medium">
                        {para}
                      </p>
                    ))}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="space-y-5"
                  >
                    {historyCol2.length > 0 ? (
                      historyCol2.map((para, i) => (
                        <p key={i} className="text-gray-600 text-lg leading-[1.85] font-medium">
                          {para}
                        </p>
                      ))
                    ) : (
                      <div className="h-full min-h-[120px] rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/80 p-8 flex flex-col justify-center">
                        <p className="text-5xl font-black text-indigo-600/20 leading-none mb-2">
                          {info?.historyYear || '2538'}
                        </p>
                        <p className="text-sm font-bold text-indigo-700">ปีที่ก่อตั้งสถานศึกษา</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 32, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="relative group"
                >
                  <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20 rounded-[2rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="relative overflow-hidden rounded-[1.75rem] lg:rounded-[2rem] shadow-2xl shadow-indigo-900/10 ring-1 ring-black/5">
                    <img
                      src={aboutImage}
                      alt={info?.name || 'ภาพโรงเรียน'}
                      className="w-full aspect-[16/9] lg:aspect-[21/9] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.fallback) {
                          img.dataset.fallback = '1';
                          img.src = 'https://picsum.photos/seed/ksp-school/1600/900';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                      <div>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">
                          โรงเรียนกาฬสินธุ์ปัญญานุกูล
                        </p>
                        <p className="text-white text-lg sm:text-xl font-bold">
                          สถานศึกษาเพื่อเด็กที่มีความต้องการจำเป็นพิเศษ
                        </p>
                      </div>
                      <div className="shrink-0 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-white text-sm font-bold">
                        จ.กาฬสินธุ์
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* บทบาทหน้าที่ + ประวัติย่อย */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <motion.div
                    initial={{ x: -24, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="order-2 lg:order-1"
                  >
                    <div className="relative overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
                      <img
                        src={historyImage}
                        alt="ประวัติโรงเรียน"
                        className="w-full aspect-[4/3] object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallback) {
                            img.dataset.fallback = '1';
                            img.src = aboutImage;
                          }
                        }}
                      />
                      <div className="absolute top-6 left-6 px-5 py-3 bg-white/95 backdrop-blur rounded-2xl shadow-lg">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ก่อตั้งเมื่อปี</p>
                        <p className="text-3xl font-black text-indigo-600 leading-none mt-1">
                          {info?.historyYear || '2538'}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 24, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="order-1 lg:order-2"
                  >
                    <span className="inline-block px-4 py-1.5 bg-white text-indigo-600 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border border-indigo-100 shadow-sm">
                      บทบาทหน้าที่
                    </span>
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-4">
                      <span className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                        <BookOpen size={22} />
                      </span>
                      พันธกิจการจัดการศึกษา
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roleItems.map((role, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 16, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
                        >
                          <div className="mt-0.5 w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                            <Star size={14} fill="currentColor" />
                          </div>
                          <span className="text-base font-bold text-gray-700 leading-snug">{role}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          </motion.div>
        );
      }
      case 'direction':
        return <EducationDirectionContent info={info} />;
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
                  { to: '/about/direction', icon: <Compass size={40} />, title: 'นโยบายการจัดการศึกษา', color: 'bg-emerald-50 text-emerald-600' },
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
      case 'direction': return 'นโยบายการจัดการศึกษา';
      case 'basic': return 'ข้อมูลพื้นฐาน';
      default: return 'เกี่ยวกับโรงเรียน';
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Helmet>
        <title>{getTitle()} | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="ทิศทางการจัดการศึกษา วิสัยทัศน์ พันธกิจ เป้าประสงค์ และกลยุทธ์ของโรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:title" content={`${getTitle()} | โรงเรียนกาฬสินธุ์ปัญญานุกูล`} />
        <meta property="og:description" content="ทิศทางการจัดการศึกษา วิสัยทัศน์ พันธกิจ เป้าประสงค์ และกลยุทธ์ของโรงเรียนกาฬสินธุ์ปัญญานุกูล" />
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
               section === 'direction' ? 'นโยบายการจัดการการศึกษา วิสัยทัศน์ พันธกิจ เป้าประสงค์ และกลยุทธ์' : 
               section === 'basic' ? 'ข้อมูลการติดต่อและที่ตั้งของสถานศึกษา' : 'เกี่ยวกับโรงเรียนกาฬสินธุ์ปัญญานุกูล'}
            </p>
          </motion.div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
};
