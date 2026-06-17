import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { 
  User, Globe, Mail, Phone, ExternalLink, 
  Award, BookOpen, Heart
} from 'lucide-react';
import { getStaff } from '../services/dataService';
import { Staff } from '../types';
import { Link } from 'react-router-dom';

export const BoardOfDirectors = () => {
  const [director, setDirector] = useState<Staff | null>(null);
  const [deputies, setDeputies] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allStaff = await getStaff();
      
      // Filter for Director (ผู้อำนวยการ)
      const dir = allStaff.find(s => s.position.includes('ผู้อำนวยการ') && !s.position.includes('รอง'));
      setDirector(dir || null);

      // Filter for Deputy Directors (รองผู้อำนวยการ)
      const deps = allStaff.filter(s => s.position.includes('รองผู้อำนวยการ'))
        .sort((a, b) => a.order - b.order)
        .slice(0, 4);
      setDeputies(deps);
      
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
        <title>คณะผู้บริหาร | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="ทำความรู้จักกับคณะผู้บริหารโรงเรียนกาฬสินธุ์ปัญญานุกูล มุ่งมั่นบริหารจัดการศึกษา เพื่อพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ" />
        <meta property="og:title" content="คณะผู้บริหาร | โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:description" content="ทำความรู้จักกับคณะผู้บริหารโรงเรียนกาฬสินธุ์ปัญญานุกูล มุ่งมั่นบริหารจัดการศึกษา เพื่อพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
          >
            คณะผู้บริหาร <span className="text-indigo-600">โรงเรียน</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto"
          >
            มุ่งมั่นบริหารจัดการศึกษา เพื่อพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ
          </motion.p>
        </div>
      </section>

      {/* Director Section */}
      {director && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-1 bg-gray-200"></div>
              <h2 className="text-3xl font-extrabold text-gray-900">ผู้อำนวยการโรงเรียน</h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 border border-gray-100 flex flex-col lg:flex-row"
            >
              <div className="lg:w-2/5 relative h-[500px] lg:h-auto overflow-hidden">
                <img 
                  src={director.imageUrl || "https://picsum.photos/seed/director/800/1000"} 
                  alt={director.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent lg:hidden"></div>
                <div className="absolute bottom-8 left-8 right-8 lg:hidden">
                  <h3 className="text-3xl font-bold text-white mb-2">{director.name}</h3>
                  <p className="text-indigo-200 font-medium">{director.position}</p>
                </div>
              </div>
              <div className="lg:w-3/5 p-12 lg:p-20 flex flex-col justify-center">
                <div className="hidden lg:block mb-8">
                  <h3 className="text-4xl font-extrabold text-gray-900 mb-2">{director.name}</h3>
                  <p className="text-xl text-indigo-600 font-bold">{director.position}</p>
                </div>
                
                <div className="space-y-8 mb-12">
                  <p className="text-gray-600 text-lg leading-relaxed italic">
                    "{director.bio || 'มุ่งมั่นพัฒนาการศึกษาพิเศษ เพื่อให้เด็กทุกคนมีโอกาสที่เท่าเทียมในสังคม'}"
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">อีเมล</p>
                        <p className="text-sm font-bold text-gray-700">{director.email || 'contact@ksp.ac.th'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">เบอร์โทรศัพท์</p>
                        <p className="text-sm font-bold text-gray-700">{director.phone || '043-XXX-XXX'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link 
                    to={`/staff/profile/${director.id}`}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <User size={20} /> ดูประวัติส่วนตัว
                  </Link>
                  {director.website && (
                    <a 
                      href={director.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <Globe size={20} /> เว็บไซต์ส่วนตัว <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Deputy Directors Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h2 className="text-3xl font-extrabold text-gray-900">รองผู้อำนวยการโรงเรียน</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deputies.map((deputy, idx) => (
              <motion.div
                key={deputy.id || `deputy-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-xl mb-6 bg-gray-100">
                  <img 
                    src={deputy.imageUrl || `https://picsum.photos/seed/deputy${idx}/600/800`} 
                    alt={deputy.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white font-bold text-lg mb-1">{deputy.name}</p>
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider">{deputy.position}</p>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-3">
                      <Link 
                        to={`/staff/profile/${deputy.id}`}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg hover:bg-indigo-600 hover:text-white transition-all"
                        title="ดูประวัติ"
                      >
                        <User size={20} />
                      </Link>
                      {deputy.website && (
                        <a 
                          href={deputy.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg hover:bg-indigo-600 hover:text-white transition-all"
                          title="เว็บไซต์ส่วนตัว"
                        >
                          <Globe size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {deputies.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400 italic">
                ยังไม่มีข้อมูลรองผู้อำนวยการ
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <Award size={40} className="text-indigo-200" />
              </div>
              <h4 className="text-2xl font-bold">วิสัยทัศน์กว้างไกล</h4>
              <p className="text-indigo-100/70">มุ่งเน้นการบริหารจัดการที่เป็นเลิศ เพื่อคุณภาพชีวิตที่ดีของผู้เรียน</p>
            </div>
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <BookOpen size={40} className="text-indigo-200" />
              </div>
              <h4 className="text-2xl font-bold">วิชาการเข้มแข็ง</h4>
              <p className="text-indigo-100/70">พัฒนาหลักสูตรและการจัดการเรียนรู้ที่ตอบสนองความต้องการจำเป็นพิเศษ</p>
            </div>
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <Heart size={40} className="text-indigo-200" />
              </div>
              <h4 className="text-2xl font-bold">ดูแลด้วยหัวใจ</h4>
              <p className="text-indigo-100/70">ใส่ใจทุกรายละเอียดเพื่อความสุขและความสำเร็จของนักเรียนทุกคน</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
