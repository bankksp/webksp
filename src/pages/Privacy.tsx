import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="pt-20 bg-gray-50 min-h-screen pb-20">
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-xl shadow-indigo-100"
          >
            <Shield size={40} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
          >
            นโยบายความเป็นส่วนตัว
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500"
          >
            โรงเรียนกาฬสินธุ์ปัญญานุกูล ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-gray-100 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <Lock size={24} />
                <h2 className="text-2xl font-bold">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                เราเก็บรวบรวมข้อมูลที่จำเป็นเพื่อการจัดการศึกษาและการให้บริการผ่านเว็บไซต์ เช่น ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์ และข้อมูลการใช้งานเว็บไซต์ เพื่อนำมาปรับปรุงประสบการณ์การใช้งานของคุณ
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <Eye size={24} />
                <h2 className="text-2xl font-bold">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                <li>เพื่อใช้ในการติดต่อสื่อสารและประชาสัมพันธ์ข่าวสารของโรงเรียน</li>
                <li>เพื่อปรับปรุงและพัฒนาประสิทธิภาพการทำงานของเว็บไซต์</li>
                <li>เพื่อความปลอดภัยและป้องกันการใช้งานที่ผิดกฎหมาย</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <Shield size={24} />
                <h2 className="text-2xl font-bold">3. การรักษาความปลอดภัยของข้อมูล</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง การแก้ไข หรือการเปิดเผยข้อมูลส่วนบุคคลของคุณโดยไม่ได้รับอนุญาต ข้อมูลของคุณจะถูกเก็บรักษาไว้อย่างปลอดภัยในระบบของเรา
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <FileText size={24} />
                <h2 className="text-2xl font-bold">4. สิทธิของเจ้าของข้อมูล</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                คุณมีสิทธิในการเข้าถึง แก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของคุณออกจากระบบของเรา โดยสามารถติดต่อเจ้าหน้าที่ผ่านช่องทางที่ระบุไว้ในหน้า "ติดต่อเรา"
              </p>
            </div>

            <div className="pt-12 border-t border-gray-100">
              <p className="text-sm text-gray-400 text-center italic">
                อัปเดตล่าสุดเมื่อวันที่ 1 เมษายน 2569
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
