import React, { useState, useEffect } from 'react';
import { 
  Save, Info, MapPin, Phone, 
  Mail, Globe, Facebook, Youtube,
  History, Target, Eye, RefreshCw,
  CheckCircle, AlertCircle, Image as ImageIcon,
  Award, Star, BookOpen, TreeDeciduous, Palette, Smile, Sparkles, MessageSquare
} from 'lucide-react';
import { getSchoolInfo, updateSchoolInfo } from '../../services/dataService';
import { FileUpload } from '../../components/FileUpload';
import { SchoolInfo } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const SchoolInfoEditor = () => {
  const [info, setInfo] = useState<SchoolInfo>({
    name: '',
    history: '',
    vision: '',
    mission: '',
    address: '',
    phone: '',
    email: '',
    facebook: '',
    youtube: '',
    mapUrl: '',
    logoUrl: '',
    motto: '',
    philosophy: '',
    schoolTree: '',
    identity: '',
    uniqueness: '',
    slogan: '',
    colors: '',
    logoDescription: '',
    aboutCoverUrl: '',
    aboutImageUrl: '',
    missionImageUrl: '',
    identityImageUrl: '',
    historyImageUrl: '',
    historyYear: '',
    historyRole: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  useEffect(() => {
    console.log('Current SchoolInfo state:', info);
  }, [info]);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const data = await getSchoolInfo();
      if (data) {
        console.log('Fetched SchoolInfo data:', data);
        setInfo(prev => ({
          ...prev,
          ...data,
          // Ensure all fields are at least empty strings
          name: data.name || '',
          history: data.history || '',
          vision: data.vision || '',
          mission: data.mission || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          facebook: data.facebook || '',
          youtube: data.youtube || '',
          mapUrl: data.mapUrl || '',
          logoUrl: data.logoUrl || '',
          motto: data.motto || '',
          philosophy: data.philosophy || '',
          schoolTree: data.schoolTree || '',
          identity: data.identity || '',
          uniqueness: data.uniqueness || '',
          slogan: data.slogan || '',
          colors: data.colors || '',
          logoDescription: data.logoDescription || '',
          aboutCoverUrl: data.aboutCoverUrl || '',
          aboutImageUrl: data.aboutImageUrl || '',
          missionImageUrl: data.missionImageUrl || '',
          identityImageUrl: data.identityImageUrl || '',
          historyImageUrl: data.historyImageUrl || '',
          historyYear: data.historyYear || '',
          historyRole: data.historyRole || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching school info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      console.log('Attempting to save school info state:', info);
      await updateSchoolInfo(info);
      setStatus({ type: 'success', message: 'บันทึกข้อมูลโรงเรียนเรียบร้อยแล้ว' });
      // Refresh data after save to ensure we have the latest (including ID if it was new)
      await fetchInfo();
    } catch (error: any) {
      console.error('Save failed details:', error);
      setStatus({ type: 'error', message: `เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message || 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ข้อมูลโรงเรียน</h1>
        <p className="text-gray-500">แก้ไขประวัติ วิสัยทัศน์ พันธกิจ และข้อมูลการติดต่อของโรงเรียน</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Info size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ข้อมูลพื้นฐานและอัตลักษณ์</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Globe size={16} className="text-indigo-600" /> ชื่อโรงเรียน
                </label>
                <input 
                  type="text" 
                  value={info.name}
                  onChange={(e) => setInfo(prev => ({...prev, name: e.target.value}))}
                  placeholder="โรงเรียนกาฬสินธุ์ปัญญานุกูล"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg outline-none"
                />
              </div>

              <div className="space-y-3">
                <FileUpload 
                  label="ตราสัญลักษณ์โรงเรียน (Logo)"
                  currentImageUrl={info.logoUrl}
                  onUploadSuccess={(url) => setInfo(prev => ({...prev, logoUrl: url}))}
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <History size={16} className="text-indigo-600" /> ประวัติโรงเรียน
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <textarea 
                    rows={8}
                    value={info.history}
                    onChange={(e) => setInfo(prev => ({...prev, history: e.target.value}))}
                    placeholder="ประวัติความเป็นมาของโรงเรียน..."
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none h-full"
                  ></textarea>
                </div>
                <div className="space-y-3">
                  <FileUpload 
                    label="รูปส่วนประวัติโรงเรียน"
                    currentImageUrl={info.aboutImageUrl}
                    onUploadSuccess={(url) => setInfo(prev => ({...prev, aboutImageUrl: url}))}
                  />
                  <p className="text-[10px] text-gray-400 italic">รูปภาพที่จะแสดงในส่วน "เกี่ยวกับสถานศึกษา"</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Eye size={16} className="text-indigo-600" /> วิสัยทัศน์ (Vision)
                </label>
                <textarea 
                  rows={4}
                  value={info.vision}
                  onChange={(e) => setInfo(prev => ({...prev, vision: e.target.value}))}
                  placeholder="วิสัยทัศน์ของโรงเรียน..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none"
                ></textarea>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Target size={16} className="text-indigo-600" /> พันธกิจ (Mission)
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <textarea 
                    rows={4}
                    value={info.mission}
                    onChange={(e) => setInfo(prev => ({...prev, mission: e.target.value}))}
                    placeholder="พันธกิจของโรงเรียน..."
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none"
                  ></textarea>
                  <FileUpload 
                    label="รูปส่วนพันธกิจ"
                    currentImageUrl={info.missionImageUrl}
                    onUploadSuccess={(url) => setInfo(prev => ({...prev, missionImageUrl: url}))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Motto */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Award size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">อัตลักษณ์ เอกลักษณ์ และคำขวัญ</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Star size={16} className="text-indigo-600" /> คำขวัญโรงเรียน
                </label>
                <textarea 
                  rows={3}
                  value={info.motto}
                  onChange={(e) => setInfo(prev => ({...prev, motto: e.target.value}))}
                  placeholder="คำขวัญของโรงเรียน..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none"
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-600" /> ปรัชญาโรงเรียน
                </label>
                <textarea 
                  rows={3}
                  value={info.philosophy}
                  onChange={(e) => setInfo(prev => ({...prev, philosophy: e.target.value}))}
                  placeholder="ปรัชญาของโรงเรียน..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Smile size={16} className="text-indigo-600" /> อัตลักษณ์
                  </label>
                  <input 
                    type="text" 
                    value={info.identity}
                    onChange={(e) => setInfo(prev => ({...prev, identity: e.target.value}))}
                    placeholder="ร่าเริง แจ่มใส ใส่ใจงานอาชีพ"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" /> เอกลักษณ์
                  </label>
                  <input 
                    type="text" 
                    value={info.uniqueness}
                    onChange={(e) => setInfo(prev => ({...prev, uniqueness: e.target.value}))}
                    placeholder="โรงเรียนสะอาด บรรยากาศ ร่มรื่น"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <FileUpload 
                  label="รูปส่วนอัตลักษณ์/เอกลักษณ์"
                  currentImageUrl={info.identityImageUrl}
                  onUploadSuccess={(url) => setInfo(prev => ({...prev, identityImageUrl: url}))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-600" /> คติพจน์
              </label>
              <input 
                type="text" 
                value={info.slogan}
                onChange={(e) => setInfo(prev => ({...prev, slogan: e.target.value}))}
                placeholder="พัฒนากาย สังคม จิต ช่วยพิชิตความพิการ"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-indigo-600" /> ความหมายตราสัญลักษณ์
              </label>
              <textarea 
                rows={3}
                value={info.logoDescription}
                onChange={(e) => setInfo(prev => ({...prev, logoDescription: e.target.value}))}
                placeholder="ความหมายของตราประจำโรงเรียน..."
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* About Page Customization */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ปรับแต่งหน้า "เกี่ยวกับเรา" (About Page)</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FileUpload 
                label="รูปหน้าปกหน้าเกี่ยวกับเรา (Cover Image)"
                currentImageUrl={info.aboutCoverUrl}
                onUploadSuccess={(url) => setInfo(prev => ({...prev, aboutCoverUrl: url}))}
              />
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <History size={16} className="text-indigo-600" /> ปีที่ก่อตั้ง (พ.ศ.)
                </label>
                <input 
                  type="text" 
                  value={info.historyYear}
                  onChange={(e) => setInfo(prev => ({...prev, historyYear: e.target.value}))}
                  placeholder="2543"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-600" /> บทบาทหน้าที่ (รายการ)
                </label>
                <textarea 
                  rows={8}
                  value={info.historyRole}
                  onChange={(e) => setInfo(prev => ({...prev, historyRole: e.target.value}))}
                  placeholder="ระบุบทบาทหน้าที่ (ขึ้นบรรทัดใหม่สำหรับแต่ละข้อ)..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none h-full"
                ></textarea>
              </div>
              <div className="space-y-3">
                <FileUpload 
                  label="รูปส่วนบทบาทหน้าที่"
                  currentImageUrl={info.historyImageUrl}
                  onUploadSuccess={(url) => setInfo(prev => ({...prev, historyImageUrl: url}))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ข้อมูลการติดต่อและโซเชียลมีเดีย</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" /> ที่อยู่โรงเรียน
              </label>
              <textarea 
                rows={2}
                value={info.address}
                onChange={(e) => setInfo(prev => ({...prev, address: e.target.value}))}
                placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone size={16} className="text-indigo-600" /> เบอร์โทรศัพท์
                </label>
                <input 
                  type="tel" 
                  value={info.phone}
                  onChange={(e) => setInfo(prev => ({...prev, phone: e.target.value}))}
                  placeholder="043-xxx-xxxx"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-indigo-600" /> อีเมล
                </label>
                <input 
                  type="email" 
                  value={info.email}
                  onChange={(e) => setInfo(prev => ({...prev, email: e.target.value}))}
                  placeholder="school@ksp.ac.th"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Facebook size={16} className="text-indigo-600" /> Facebook Page (URL)
                </label>
                <input 
                  type="url" 
                  value={info.facebook}
                  onChange={(e) => setInfo(prev => ({...prev, facebook: e.target.value}))}
                  placeholder="https://facebook.com/..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Youtube size={16} className="text-indigo-600" /> YouTube Channel (URL)
                </label>
                <input 
                  type="url" 
                  value={info.youtube}
                  onChange={(e) => setInfo(prev => ({...prev, youtube: e.target.value}))}
                  placeholder="https://youtube.com/..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" /> Google Maps Embed URL
              </label>
              <input 
                type="url" 
                value={info.mapUrl}
                onChange={(e) => setInfo(prev => ({...prev, mapUrl: e.target.value}))}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
              />
              <p className="text-xs text-gray-400 ml-1 italic">คัดลอกจากส่วน "Embed a map" ใน Google Maps</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`p-6 rounded-2xl flex items-center gap-4 ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {status.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
              <p className="font-bold">{status.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <div className="flex justify-end gap-4 sticky bottom-8 z-10">
          <button 
            type="button"
            onClick={fetchInfo}
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-lg outline-none"
          >
            <RefreshCw size={20} /> คืนค่าเดิม
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 outline-none"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={20} />
            )}
            บันทึกข้อมูลโรงเรียน
          </button>
        </div>
      </form>
    </div>
  );
};
