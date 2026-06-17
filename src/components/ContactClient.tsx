'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Phone, Mail, Facebook, 
  Youtube, Globe, Send, CheckCircle, 
  AlertCircle, MessageSquare, Clock
} from 'lucide-react';
import { getSchoolInfo } from '@/services/dataService';
import { SchoolInfo } from '@/types';

export default function ContactClient() {
  const [info, setInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await getSchoolInfo();
      setInfo(data);
      setLoading(false);
    };
    fetchInfo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Mock submission
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-gray-900 mb-6"
          >
            ติดต่อเรา
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto"
          >
            หากคุณมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม สามารถติดต่อเราได้ผ่านช่องทางต่างๆ ด้านล่างนี้
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-indigo-100">
                  <MapPin size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ที่อยู่โรงเรียน</h3>
                <p className="text-gray-500 leading-relaxed">
                  {info?.address || 'เลขที่ 169 หมู่ 13 ตำบล ดอนสมบูรณ์ อำเภอ ยางตลาด จังหวัด กาฬสินธุ์ 46120'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-100">
                  <Phone size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">เบอร์โทรศัพท์</h3>
                <p className="text-gray-500 leading-relaxed">
                  {info?.phone || '043-840842'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-100">
                  <Mail size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">อีเมล</h3>
                <p className="text-gray-500 leading-relaxed">
                  {info?.email || 'kalasinpanyanukun@ksp.ac.th'}
                </p>
              </div>

              <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 relative z-10">
                  <Clock size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">เวลาทำการ</h3>
                <div className="space-y-2 text-gray-400 text-sm relative z-10">
                  <p className="flex justify-between"><span>จันทร์ - ศุกร์:</span> <span className="text-white font-bold">08:00 - 16:30</span></p>
                  <p className="flex justify-between"><span>เสาร์ - อาทิตย์:</span> <span className="text-white font-bold">ปิดทำการ</span></p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm h-full">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">ส่งข้อความถึงเรา</h2>
                    <p className="text-gray-500">เราจะติดต่อกลับหาคุณโดยเร็วที่สุด</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">ชื่อ-นามสกุล</label>
                      <input 
                        required
                        type="text" 
                        placeholder="กรอกชื่อของคุณ..." 
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">อีเมล</label>
                      <input 
                        required
                        type="email" 
                        placeholder="example@email.com" 
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">เบอร์โทรศัพท์</label>
                      <input 
                        type="tel" 
                        placeholder="08x-xxx-xxxx" 
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">หัวข้อเรื่อง</label>
                      <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none">
                        <option>สอบถามข้อมูลทั่วไป</option>
                        <option>สมัครเรียน</option>
                        <option>แจ้งปัญหาการใช้งาน</option>
                        <option>อื่นๆ</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">ข้อความของคุณ</label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="เขียนข้อความที่นี่..." 
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-4">
                      {info?.facebook && (
                        <a href={info.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-100">
                          <Facebook size={20} />
                        </a>
                      )}
                      {info?.youtube && (
                        <a href={info.youtube} target="_blank" rel="noreferrer" className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100">
                          <Youtube size={20} />
                        </a>
                      )}
                      <a href="#" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-lg shadow-gray-100">
                        <Globe size={20} />
                      </a>
                    </div>

                    <button 
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="bg-indigo-600 text-white px-12 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      {formStatus === 'submitting' ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={20} />
                      )}
                      ส่งข้อความ
                    </button>
                  </div>

                  <AnimatePresence>
                    {formStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-6 bg-emerald-50 rounded-2xl flex items-center gap-4 text-emerald-700"
                      >
                        <CheckCircle size={24} />
                        <p className="font-bold">ส่งข้อความสำเร็จ! เราจะติดต่อกลับหาคุณโดยเร็วที่สุด</p>
                      </motion.div>
                    )}
                    {formStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-6 bg-red-50 rounded-2xl flex items-center gap-4 text-red-700"
                      >
                        <AlertCircle size={24} />
                        <p className="font-bold">เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">แผนที่โรงเรียน</span>
            <h2 className="text-4xl font-extrabold text-gray-900">การเดินทางมายังโรงเรียน</h2>
          </div>
          <div className="w-full h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
            <iframe 
              src={info?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.876352934242!2d103.3768223148624!3d16.38010898868848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3122a6f7f0000001%3A0x8f0f0f0f0f0f0f0f!2z4LmC4Lij4LiH4LmA4Lij4Li14Lii4LiZ4LiB4Liy4Lil4Lia4Li04LiZ4Lir4Li44LiB4Lij4Liy4LiX4Liy4LiH4Lia4Li44LiN4LiB4Li54Lil4Lia4Liy4LiH4LiB4Liy4Lil4Lia4Li04LiZ4Lir4Li44LiB4Lij4Liy4LiX4Liy4LiH4Lia4Li44LiN!5e0!3m2!1sth!2sth!4v16763651927"} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
