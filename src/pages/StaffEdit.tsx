import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { isSiteAdmin } from '../lib/auth';
import { getStaffByUid, updateStaff } from '../services/dataService';
import { FileUpload } from '../components/FileUpload';
import { AlbumUpload } from '../components/AlbumUpload';
import { AnnualWorkDrivePanel } from '../components/AnnualWorkDrivePanel';
import { Staff, Achievement, Activity, Certificate, AnnualWorkDrive } from '../types';
import { Save, ArrowLeft, Plus, Trash2, User, GraduationCap, Award, Calendar, Info, Settings, Palette, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const StaffEdit = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/staff');
      return;
    }

    const fetchStaffData = async () => {
      try {
        const data = await getStaffByUid(user.id, user.email, user.idCard);
        if (data) {
          setStaff(data);
          setIsAdmin(isSiteAdmin(user));
        } else {
          toast.error('ไม่พบข้อมูลบุคลากรที่เชื่อมโยงกับบัญชีนี้');
          navigate('/staff');
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [user, navigate]);

  useEffect(() => {
    if (!staff || loading) return;

    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('section-')) return;

    const timer = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (deepLinkHandled.current) return;
      const shouldAdd = new URLSearchParams(window.location.search).get('add') === '1';
      if (!shouldAdd) return;

      deepLinkHandled.current = true;

      if (hash === 'section-achievements') {
        setStaff((prev) => {
          if (!prev) return prev;
          const newItem: Achievement = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            description: '',
            images: [],
          };
          return { ...prev, achievements: [...(prev.achievements || []), newItem] };
        });
      } else if (hash === 'section-activities') {
        setStaff((prev) => {
          if (!prev) return prev;
          const newItem: Activity = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            description: '',
            images: [],
          };
          return { ...prev, activities: [...(prev.activities || []), newItem] };
        });
      } else if (hash === 'section-certificates') {
        setStaff((prev) => {
          if (!prev) return prev;
          const newCert: Certificate = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            fiscalYear: (new Date().getFullYear() + 543).toString(),
            hours: 0,
            organizer: '',
            description: '',
            imageUrl: '',
          };
          return { ...prev, certificates: [...(prev.certificates || []), newCert] };
        });
      }

      window.history.replaceState(null, '', `${window.location.pathname}#${hash}`);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [staff, loading]);

  const handleSave = async () => {
    if (!staff || !staff.id) return;
    setSaving(true);
    try {
      const { id, ...updateData } = staff;
      await updateStaff(id, updateData);
      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
      navigate(`/staff/profile/${id}`);
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const addAchievement = () => {
    if (!staff) return;
    const newItem: Achievement = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      images: []
    };
    setStaff({ ...staff, achievements: [...(staff.achievements || []), newItem] });
  };

  const updateAchievement = (index: number, item: Achievement) => {
    if (!staff) return;
    const current = [...(staff.achievements || [])];
    current[index] = item;
    setStaff({ ...staff, achievements: current });
  };

  const removeAchievement = (index: number) => {
    if (!staff) return;
    const current = [...(staff.achievements || [])];
    current.splice(index, 1);
    setStaff({ ...staff, achievements: current });
  };

  const addActivity = () => {
    if (!staff) return;
    const newItem: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      images: []
    };
    setStaff({ ...staff, activities: [...(staff.activities || []), newItem] });
  };

  const updateActivity = (index: number, item: Activity) => {
    if (!staff) return;
    const current = [...(staff.activities || [])];
    current[index] = item;
    setStaff({ ...staff, activities: current });
  };

  const removeActivity = (index: number) => {
    if (!staff) return;
    const current = [...(staff.activities || [])];
    current.splice(index, 1);
    setStaff({ ...staff, activities: current });
  };

  const addCertificate = () => {
    if (!staff) return;
    const newCert: Certificate = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      fiscalYear: (new Date().getFullYear() + 543).toString(),
      hours: 0,
      organizer: '',
      description: '',
      imageUrl: ''
    };
    setStaff({ ...staff, certificates: [...(staff.certificates || []), newCert] });
  };

  const updateCertificate = (index: number, cert: Certificate) => {
    if (!staff) return;
    const current = [...(staff.certificates || [])];
    current[index] = cert;
    setStaff({ ...staff, certificates: current });
  };

  const removeCertificate = (index: number) => {
    if (!staff) return;
    const current = [...(staff.certificates || [])];
    current.splice(index, 1);
    setStaff({ ...staff, certificates: current });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={20} /> ยกเลิก
          </button>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลส่วนตัว</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-amber-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Settings size={20} /> จัดการระบบ
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
              บันทึกข้อมูล
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Customization */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Palette size={24} className="text-indigo-600" /> ปรับแต่งหน้าเว็บไซต์ส่วนตัว
            </h2>
            <div className="space-y-6">
              <FileUpload 
                label="ภาพหน้าปก (Cover Image)"
                currentImageUrl={staff.coverUrl}
                onUploadSuccess={(url) => setStaff(prev => prev ? ({ ...prev, coverUrl: url }) : null)}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">สีธีมหลัก (Theme Color)</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Indigo', value: 'indigo' },
                    { name: 'Blue', value: 'blue' },
                    { name: 'Rose', value: 'rose' },
                    { name: 'Emerald', value: 'emerald' },
                    { name: 'Amber', value: 'amber' },
                    { name: 'Violet', value: 'violet' },
                    { name: 'Slate', value: 'slate' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setStaff({ ...staff, themeColor: color.value })}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all
                        ${staff.themeColor === color.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
                      `}
                      style={{ backgroundColor: `var(--color-${color.value}-600, ${color.value})` }}
                      title={color.name}
                    >
                      {staff.themeColor === color.value && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                  <input 
                    type="color" 
                    value={staff.themeColor?.startsWith('#') ? staff.themeColor : '#4f46e5'}
                    onChange={(e) => setStaff({ ...staff, themeColor: e.target.value })}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Basic Info */}
          <section id="section-basic" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} className="text-indigo-600" /> ข้อมูลพื้นฐาน
            </h2>
            <div className="mb-8">
              <FileUpload 
                label="เปลี่ยนรูปโปรไฟล์"
                isCircle={true}
                currentImageUrl={staff.imageUrl}
                onUploadSuccess={(url) => setStaff(prev => prev ? ({ ...prev, imageUrl: url }) : null)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                <input 
                  type="text"
                  value={staff.name || ''}
                  onChange={(e) => setStaff({ ...staff, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง</label>
                <input 
                  type="text"
                  value={staff.position || ''}
                  onChange={(e) => setStaff({ ...staff, position: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ตำแหน่ง"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เลขบัตรประชาชน</label>
                <input 
                  type="text"
                  value={staff.idCard || ''}
                  onChange={(e) => setStaff({ ...staff, idCard: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="เลขบัตรประชาชน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <input 
                  type="text"
                  value={staff.phone || ''}
                  onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="เบอร์โทรศัพท์"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมลติดต่อ</label>
                <input 
                  type="email"
                  value={staff.email || ''}
                  onChange={(e) => setStaff({ ...staff, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="example@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">แนะนำตัวสั้นๆ (Bio)</label>
                <textarea 
                  value={staff.bio || ''}
                  onChange={(e) => setStaff({ ...staff, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                  placeholder="เขียนแนะนำตัวสั้นๆ..."
                />
              </div>
            </div>
          </section>

          {/* Education */}
          <section id="section-education" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap size={24} className="text-indigo-600" /> ประวัติการศึกษา
            </h2>
            <textarea 
              value={staff.education || ''}
              onChange={(e) => setStaff({ ...staff, education: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-48"
              placeholder="ระบุประวัติการศึกษา (เช่น ปริญญาตรี... มหาวิทยาลัย...)"
            />
          </section>

          {/* Achievements */}
          <section id="section-achievements" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award size={24} className="text-indigo-600" /> ผลงานและความภาคภูมิใจ
              </h2>
              <button 
                onClick={addAchievement}
                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="space-y-6">
              {(staff.achievements || []).map((item, idx) => (
                <div key={item.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <button 
                    onClick={() => removeAchievement(idx)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ชื่อผลงาน</label>
                      <input 
                        type="text"
                        value={item.title}
                        onChange={(e) => updateAchievement(idx, { ...item, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ระบุชื่อผลงาน..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">รายละเอียด</label>
                      <textarea 
                        value={item.description}
                        onChange={(e) => updateAchievement(idx, { ...item, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                        placeholder="ระบุรายละเอียด..."
                      />
                    </div>
                    <div>
                      <AlbumUpload 
                        label="อัลบั้มรูปภาพและวิดีโอ"
                        items={item.images || []}
                        onChange={(newMedia) => updateAchievement(idx, { ...item, images: newMedia })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activities */}
          <section id="section-activities" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={24} className="text-indigo-600" /> กิจกรรมที่เข้าร่วม
              </h2>
              <button 
                onClick={addActivity}
                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="space-y-6">
              {(staff.activities || []).map((item, idx) => (
                <div key={item.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <button 
                    onClick={() => removeActivity(idx)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ชื่อกิจกรรม</label>
                      <input 
                        type="text"
                        value={item.title}
                        onChange={(e) => updateActivity(idx, { ...item, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ระบุชื่อกิจกรรม..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">รายละเอียด / การบรรยาย</label>
                      <textarea 
                        value={item.description}
                        onChange={(e) => updateActivity(idx, { ...item, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                        placeholder="ระบุรายละเอียดหรือหัวข้อการบรรยาย..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">วันที่จัดกิจกรรม</label>
                        <input 
                          type="date"
                          value={item.date || ''}
                          onChange={(e) => updateActivity(idx, { ...item, date: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ปีงบประมาณ</label>
                        <input 
                          type="text"
                          value={item.fiscalYear || ''}
                          onChange={(e) => updateActivity(idx, { ...item, fiscalYear: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="เช่น 2567"
                        />
                      </div>
                    </div>
                    <div>
                      <AlbumUpload 
                        label="อัลบั้มรูปภาพและวิดีโอ"
                        items={item.images || []}
                        onChange={(newMedia) => updateActivity(idx, { ...item, images: newMedia })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Certificates */}
          <section id="section-certificates" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award size={24} className="text-indigo-600" /> เกียรติบัตรและวุฒิบัตร
              </h2>
              <button 
                onClick={addCertificate}
                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="space-y-6">
              {(staff.certificates || []).map((cert, idx) => (
                <div key={cert.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <button 
                    onClick={() => removeCertificate(idx)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ชื่อเกียรติบัตร</label>
                      <input 
                        type="text"
                        value={cert.title}
                        onChange={(e) => updateCertificate(idx, { ...cert, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ระบุชื่อเกียรติบัตร..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ปีงบประมาณ</label>
                      <input 
                        type="text"
                        value={cert.fiscalYear}
                        onChange={(e) => updateCertificate(idx, { ...cert, fiscalYear: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="เช่น 2567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">วันที่ได้รับ</label>
                      <input 
                        type="date"
                        value={cert.date || ''}
                        onChange={(e) => updateCertificate(idx, { ...cert, date: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">จำนวนชั่วโมง</label>
                      <input 
                        type="number"
                        value={cert.hours}
                        onChange={(e) => updateCertificate(idx, { ...cert, hours: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">หน่วยงานที่จัด</label>
                      <input 
                        type="text"
                        value={cert.organizer}
                        onChange={(e) => setStaff(prev => prev ? ({
                          ...prev,
                          certificates: prev.certificates?.map((c, i) => i === idx ? { ...c, organizer: e.target.value } : c)
                        }) : null)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ระบุหน่วยงาน..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">รายละเอียด</label>
                      <textarea 
                        value={cert.description}
                        onChange={(e) => updateCertificate(idx, { ...cert, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                        placeholder="ระบุรายละเอียดเพิ่มเติม..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FileUpload 
                        label="รูปเกียรติบัตร"
                        currentImageUrl={cert.imageUrl}
                        onUploadSuccess={(url) => {
                          setStaff(prev => {
                            if (!prev) return null;
                            const current = [...(prev.certificates || [])];
                            current[idx] = { ...current[idx], imageUrl: url };
                            return { ...prev, certificates: current };
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div id="section-work-drive" className="scroll-mt-24">
            <AnnualWorkDrivePanel
              value={staff.annualData}
              editable
              onChange={(drive: AnnualWorkDrive) => setStaff({ ...staff, annualData: drive })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
