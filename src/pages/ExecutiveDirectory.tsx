import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { 
  History, Calendar, Award, 
  ArrowRight, BookOpen
} from 'lucide-react';
import { getExecutives } from '../services/dataService';
import { Executive } from '../types';

export const ExecutiveDirectory = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getExecutives();
      setExecutives(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <Helmet>
        <title>ทำเนียบผู้บริหาร | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="รวบรวมรายนามและประวัติของผู้บริหารโรงเรียนกาฬสินธุ์ปัญญานุกูล ตั้งแต่อดีตจนถึงปัจจุบัน ผู้ที่ได้วางรากฐานและพัฒนาโรงเรียนให้ก้าวไกล" />
        <meta property="og:title" content="ทำเนียบผู้บริหาร | โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:description" content="รวบรวมรายนามและประวัติของผู้บริหารโรงเรียนกาฬสินธุ์ปัญญานุกูล ตั้งแต่อดีตจนถึงปัจจุบัน ผู้ที่ได้วางรากฐานและพัฒนาโรงเรียนให้ก้าวไกล" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"
          >
            <History size={16} />
            ทำเนียบผู้บริหาร
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight"
          >
            รำลึกถึง <br /> <span className="text-indigo-600">ผู้บริหารในอดีต</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl leading-relaxed"
          >
            รวบรวมรายนามและประวัติของผู้บริหารโรงเรียนกาฬสินธุ์ปัญญานุกูล ตั้งแต่อดีตจนถึงปัจจุบัน ผู้ที่ได้วางรากฐานและพัฒนาโรงเรียนให้ก้าวไกล
          </motion.p>
        </div>
      </section>

      {/* Timeline/List Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {executives.map((exec, idx) => (
              <motion.div
                key={exec.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col"
              >
                <div className="relative h-96 overflow-hidden bg-gray-100">
                  <img 
                    src={exec.imageUrl || `https://picsum.photos/seed/exec${idx}/800/1000`} 
                    alt={exec.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
                      <Calendar size={14} />
                      <span>ปีที่ดำรงตำแหน่ง: {exec.period}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{exec.name}</h3>
                    <p className="text-white/70 text-sm font-medium">{exec.position}</p>
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Award size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ประวัติโดยย่อ</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                    {exec.bio || 'ไม่มีข้อมูลประวัติเพิ่มเติม'}
                  </p>
                  <div className="pt-6 border-t border-gray-50">
                    <button className="text-indigo-600 font-bold text-sm flex items-center gap-2 group/btn">
                      ดูรายละเอียดเพิ่มเติม <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {executives.length === 0 && (
              <div className="col-span-full py-32 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <History size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ยังไม่มีข้อมูลทำเนียบผู้บริหาร</h3>
                <p className="text-gray-500">กรุณาเพิ่มข้อมูลในระบบจัดการหลังบ้าน</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <BookOpen size={48} className="text-indigo-400 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight max-w-4xl mx-auto">
            "ความสำเร็จของโรงเรียนในวันนี้ คือผลผลิตจากความมุ่งมั่นและเสียสละของผู้บริหารทุกท่านในอดีต"
          </h2>
          <div className="w-20 h-1 bg-indigo-500 mx-auto"></div>
        </div>
      </section>
    </div>
  );
};
