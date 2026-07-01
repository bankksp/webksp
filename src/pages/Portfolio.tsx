import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Search, Filter, Calendar, ChevronDown, Plus, User, ExternalLink, Clock, Building2, Image as ImageIcon, X, Download } from 'lucide-react';
import { getAllStaff } from '../services/dataService';
import { Staff, Certificate } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { pullCertificatesFromKsp } from '../lib/kspManagementSync';

interface EnhancedCertificate extends Certificate {
  staffName: string;
  staffId: string;
  staffType: string;
  staffDepartment: string;
}

export const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allCertificates, setAllCertificates] = useState<EnhancedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCert, setSelectedCert] = useState<EnhancedCertificate | null>(null);

  const [myStaffId, setMyStaffId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const staffData = await getAllStaff();
        const certs: EnhancedCertificate[] = [];
        
        for (const staff of staffData) {
          let staffCerts = staff.certificates || [];
          if (staff.idCard) {
            try {
              staffCerts = await pullCertificatesFromKsp(staffCerts, staff.idCard);
            } catch {
              // ใช้ข้อมูลในเว็บไซต์ถ้าซิงค์ไม่ได้
            }
          }
          staffCerts.forEach(cert => {
            certs.push({
              ...cert,
              staffName: staff.name,
              staffId: staff.id || '',
              staffType: staff.type,
              staffDepartment: staff.department
            });
          });
        }
        
        // Sort by year desc, then title
        certs.sort((a, b) => {
          const yearA = parseInt(a.fiscalYear) || 0;
          const yearB = parseInt(b.fiscalYear) || 0;
          if (yearB !== yearA) return yearB - yearA;
          return a.title.localeCompare(b.title);
        });
        
        setAllCertificates(certs);

        // Find current user's staff ID
        if (user) {
          const myStaff = staffData.find(s => s.uid === user.id);
          if (myStaff) setMyStaffId(myStaff.id || null);
        }
      } catch (error) {
        console.error('Error fetching staff for portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const fiscalYears = ['all', ...Array.from(new Set(allCertificates.map(c => c.fiscalYear))).sort((a, b) => (b as string).localeCompare(a as string))];

  const filteredCerts = allCertificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cert.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = fiscalYearFilter === 'all' || cert.fiscalYear === fiscalYearFilter;
    const matchesMode = viewMode === 'all' || (myStaffId && cert.staffId === myStaffId);
    
    return matchesSearch && matchesYear && matchesMode;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">กำลังโหลดระบบเก็บผลงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <Helmet>
        <title>แฟ้มสะสมงาน | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="ระบบเก็บผลงานออนไลน์ รวบรวมเกียรติบัตร วุฒิบัตร และผลงานทางวิชาการของบุคลากรโรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:title" content="แฟ้มสะสมงาน | โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:description" content="ระบบเก็บผลงานออนไลน์ รวบรวมเกียรติบัตร วุฒิบัตร และผลงานทางวิชาการของบุคลากรโรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2"
              >
                <Award size={20} /> ระบบเก็บผลงานออนไลน์
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-extrabold text-gray-900"
              >
                Portfolio <span className="text-indigo-600">System</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 mt-4 max-w-2xl text-lg"
              >
                รวบรวมเกียรติบัตร วุฒิบัตร และผลงานทางวิชาการของบุคลากรโรงเรียนกาฬสินธุ์ปัญญานุกูล
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              {user ? (
                <Link 
                  to="/staff/edit" 
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                  <Plus size={20} /> เพิ่มผลงานใหม่
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <User size={20} /> เข้าสู่ระบบเพื่อจัดการผลงาน
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-auto">
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ผลงานทั้งหมด
              </button>
              {user && (
                <button
                  onClick={() => setViewMode('my')}
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ผลงานของฉัน
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative min-w-[180px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={fiscalYearFilter}
                  onChange={(e) => setFiscalYearFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none text-sm"
                >
                  <option value="all">ทุกปีงบประมาณ</option>
                  {fiscalYears.filter(y => y !== 'all').map(year => (
                    <option key={year} value={year}>ปีงบประมาณ {year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อผลงาน, ชื่อครู..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCerts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredCerts.map((cert, idx) => (
                  <motion.div
                    layout
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedCert(cert)}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 group cursor-pointer"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      {cert.imageUrl ? (
                        <img 
                          src={cert.imageUrl} 
                          alt={cert.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={64} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 shadow-sm uppercase tracking-tighter">
                        ปีงบประมาณ {cert.fiscalYear}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <div className="text-white">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            คลิกเพื่อดูรายละเอียด <ExternalLink size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{cert.staffType}</p>
                          <p className="text-xs font-bold text-gray-700 truncate">{cert.staffName}</p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {cert.title}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Building2 size={14} />
                          <span className="text-[10px] font-bold truncate max-w-[120px]">{cert.organizer}</span>
                        </div>
                        {cert.hours > 0 && (
                          <div className="flex items-center gap-1 text-indigo-600">
                            <Clock size={14} />
                            <span className="text-[10px] font-black">{cert.hours} ชม.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <Award size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลผลงาน</h3>
              <p className="text-gray-500">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนการกรอง</p>
              <button 
                onClick={() => {setSearchTerm(''); setFiscalYearFilter('all'); setViewMode('all');}}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                ล้างการกรองทั้งหมด
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Certificate Detail Modal */}
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
              onClick={e => e.stopPropagation()}
            >
              <button 
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
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-4">
                      <ImageIcon size={80} />
                      <p className="font-bold">ไม่มีรูปภาพเกียรติบัตร</p>
                    </div>
                  )}
                </div>
                
                <div className="p-8 lg:p-16 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">เกียรติบัตร / วุฒิบัตร</p>
                      <p className="text-sm font-bold text-gray-500">ปีงบประมาณ {selectedCert.fiscalYear}</p>
                    </div>
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-8 leading-tight">
                    {selectedCert.title}
                  </h2>
                  
                  <div className="space-y-8 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">เจ้าของผลงาน</p>
                        <p className="text-gray-900 font-bold text-lg">{selectedCert.staffName}</p>
                        <p className="text-xs text-gray-500">{selectedCert.staffType} | {selectedCert.staffDepartment}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">หน่วยงานที่จัด</p>
                          <p className="text-gray-900 font-bold">{selectedCert.organizer}</p>
                        </div>
                      </div>
                      
                      {selectedCert.hours > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">จำนวนชั่วโมง</p>
                            <p className="text-gray-900 font-bold">{selectedCert.hours} ชั่วโมง</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedCert.description && (
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-10">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">รายละเอียดเพิ่มเติม</p>
                      <p className="text-gray-600 leading-relaxed font-medium">{selectedCert.description}</p>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap gap-4">
                    <Link 
                      to={`/staff/profile/${selectedCert.staffId}`}
                      className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <User size={20} /> ดูโปรไฟล์เจ้าของผลงาน
                    </Link>
                    {selectedCert.imageUrl && (
                      <a 
                        href={selectedCert.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-indigo-50 text-indigo-600 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={20} /> ดาวน์โหลดรูป
                      </a>
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
