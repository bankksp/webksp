import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, User, Search, Filter, ChevronRight, ChevronDown, Award } from 'lucide-react';
import { getStaff } from '../services/dataService';
import { Staff as StaffType } from '../types';

export const Staff = () => {
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      const data = await getStaff();
      setStaffList(data || []);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'all' || staff.type === filter;
    const matchesPosition = positionFilter === 'all' || staff.position === positionFilter;
    return matchesSearch && matchesType && matchesPosition;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  const categories = [
    { id: 'all', name: 'บุคลากรทั้งหมด' },
    { id: 'ข้าราชการ', name: 'ข้าราชการ' },
    { id: 'พนักงานราชการ', name: 'พนักงานราชการ' },
    { id: 'ลูกจ้าง', name: 'ลูกจ้าง' },
  ];

  const positions = ['all', ...Array.from(new Set(staffList.map(s => s.position))).filter(Boolean)].sort();

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <Helmet>
        <title>บุคลากร | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="ทำความรู้จักกับทีมงานผู้เชี่ยวชาญและมุ่งมั่นในการพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:title" content="บุคลากร | โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:description" content="ทำความรู้จักกับทีมงานผู้เชี่ยวชาญและมุ่งมั่นในการพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-gray-900 mb-6"
          >
            บุคลากรของเรา
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto mb-8"
          >
            ทีมงานผู้เชี่ยวชาญและมุ่งมั่นในการพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Link 
              to="/portfolio"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Award size={20} /> ดูแฟ้มสะสมงานทั้งหมด
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    filter === cat.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Position Filter */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none text-sm"
                >
                  <option value="all">ทุกตำแหน่ง</option>
                  {positions.filter(p => p !== 'all').map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStaff.map((staff, idx) => (
                <motion.div
                  layout
                  key={staff.id || `staff-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 group"
                >
                  <Link to={`/staff/profile/${staff.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <img 
                      src={staff.imageUrl || "https://picsum.photos/seed/staff/400/500"} 
                      alt={staff.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <div className="text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">ดูข้อมูลบุคลากร</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          คลิกเพื่อดูรายละเอียด <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest block">
                        {staff.type}
                      </span>
                      <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest block">
                        {staff.department}
                      </span>
                    </div>
                    <Link to={`/staff/profile/${staff.id}`}>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
                        {staff.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 font-medium text-sm mb-4">{staff.position}</p>
                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                      {staff.email && (
                        <a href={`mailto:${staff.email}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <Mail size={18} />
                        </a>
                      )}
                      {staff.phone && (
                        <a href={`tel:${staff.phone}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <Phone size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <User size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลบุคลากร</h3>
              <p className="text-gray-500">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-8">ร่วมเป็นส่วนหนึ่งของทีมงานเรา</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            โรงเรียนกาฬสินธุ์ปัญญานุกูล เปิดรับสมัครบุคลากรที่มีความมุ่งมั่นและใจรักในการจัดการศึกษาพิเศษ
          </p>
          <button className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl flex items-center gap-2 mx-auto">
            ดูตำแหน่งงานว่าง <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};
