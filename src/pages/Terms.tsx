import React from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';

export const Terms = () => {
  return (
    <div className="pt-20 bg-gray-50 min-h-screen pb-20">
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-xl shadow-emerald-100"
          >
            <FileText size={40} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
          >
            ข้อกำหนดการใช้งาน
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500"
          >
            กรุณาอ่านข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์โรงเรียนกาฬสินธุ์ปัญญานุกูล
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-gray-100 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-emerald-600">
                <CheckCircle size={24} />
                <h2 className="text-2xl font-bold">1. การยอมรับข้อกำหนด</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                การเข้าถึงและใช้งานเว็บไซต์นี้ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุไว้ หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาหยุดการใช้งานเว็บไซต์ทันที
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-emerald-600">
                <UserCheck size={24} />
                <h2 className="text-2xl font-bold">2. สิทธิและหน้าที่ของผู้ใช้งาน</h2>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                <li>ผู้ใช้งานต้องให้ข้อมูลที่เป็นความจริงและถูกต้อง</li>
                <li>ห้ามมิให้ผู้ใช้งานกระทำการใดๆ ที่เป็นการละเมิดลิขสิทธิ์หรือทรัพย์สินทางปัญญา</li>
                <li>ห้ามมิให้ผู้ใช้งานนำข้อมูลจากเว็บไซต์ไปใช้ในทางที่ผิดกฎหมายหรือก่อให้เกิดความเสียหาย</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-emerald-600">
                <AlertTriangle size={24} />
                <h2 className="text-2xl font-bold">3. การจำกัดความรับผิดชอบ</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                โรงเรียนกาฬสินธุ์ปัญญานุกูล จะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นจากการใช้งานเว็บไซต์ หรือการไม่สามารถเข้าถึงเว็บไซต์ได้ รวมถึงความผิดพลาดของข้อมูลที่อาจเกิดขึ้น
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-emerald-600">
                <FileText size={24} />
                <h2 className="text-2xl font-bold">4. การเปลี่ยนแปลงข้อกำหนด</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                เราขอสงวนสิทธิ์ในการเปลี่ยนแปลง แก้ไข หรือยกเลิกข้อกำหนดการใช้งานได้ทุกเมื่อโดยไม่ต้องแจ้งให้ทราบล่วงหน้า โดยการเปลี่ยนแปลงจะมีผลทันทีเมื่อประกาศลงบนเว็บไซต์
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
