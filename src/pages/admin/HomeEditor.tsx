import React, { useState, useEffect } from 'react';
import { 
  Save, Image as ImageIcon, Layout, 
  Type, Link as LinkIcon, Play, 
  AlertCircle, CheckCircle, RefreshCw,
  Users, Plus, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';
import { getHomeConfig, updateHomeConfig } from '../../services/dataService';
import { FileUpload } from '../../components/FileUpload';
import { HomeConfig, BannerSlide } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { getYoutubeId } from '../../lib/utils';

export const HomeEditor = () => {
  const [config, setConfig] = useState<HomeConfig>({
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    heroVideoUrl: '',
    featuredPostIds: [],
    statsTeachers: 0,
    statsEmployees: 0,
    statsStudents: 0,
    recommendedPrograms: [],
    bannerSlides: [],
    youtubeVideos: [],
    announcementEnabled: false,
    announcementTitle: '',
    announcementImageUrl: '',
    announcementLink: '',
    quickInfoTitle: '',
    quickInfoSubtitle: '',
    quickInfoDescription: '',
    quickInfoImageUrl: '',
    quickInfoStatsLabel1: '',
    quickInfoStatsValue1: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    const data = await getHomeConfig();
    if (data) {
      setConfig(prev => ({
        ...prev,
        ...data,
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
        heroImageUrl: data.heroImageUrl || '',
        heroVideoUrl: data.heroVideoUrl || '',
        featuredPostIds: data.featuredPostIds || [],
        statsTeachers: data.statsTeachers || 0,
        statsEmployees: data.statsEmployees || 0,
        statsStudents: data.statsStudents || 0,
        recommendedPrograms: data.recommendedPrograms || [],
        bannerSlides: data.bannerSlides || [],
        youtubeVideos: data.youtubeVideos || [],
        announcementTitle: data.announcementTitle || '',
        announcementImageUrl: data.announcementImageUrl || '',
        announcementLink: data.announcementLink || '',
        quickInfoTitle: data.quickInfoTitle || '',
        quickInfoSubtitle: data.quickInfoSubtitle || '',
        quickInfoDescription: data.quickInfoDescription || '',
        quickInfoImageUrl: data.quickInfoImageUrl || '',
        quickInfoStatsLabel1: data.quickInfoStatsLabel1 || '',
        quickInfoStatsValue1: data.quickInfoStatsValue1 || ''
      }));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await updateHomeConfig(config);
      setStatus({ type: 'success', message: 'บันทึกการตั้งค่าหน้าแรกเรียบร้อยแล้ว' });
    } catch (error) {
      setStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">แก้ไขหน้าแรก</h1>
        <p className="text-gray-500">ปรับแต่งส่วนหัว (Hero Section) และเนื้อหาหลักของหน้าแรก</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Layout size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ส่วนหัวเว็บไซต์ (Hero Section)</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Type size={16} className="text-indigo-600" /> หัวข้อหลัก (Hero Title)
                </label>
                <input 
                  type="text" 
                  value={config.heroTitle}
                  onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
                  placeholder="เช่น โรงเรียนกาฬสินธุ์ปัญญานุกูล"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Type size={16} className="text-indigo-600" /> คำขวัญ/คำอธิบาย (Hero Subtitle)
                </label>
                <textarea 
                  rows={3}
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({...config, heroSubtitle: e.target.value})}
                  placeholder="คำอธิบายสั้นๆ ใต้หัวข้อหลัก..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <FileUpload 
                    label="รูปภาพพื้นหลัง (Hero Image)"
                    currentImageUrl={config.heroImageUrl}
                    onUploadSuccess={(url) => setConfig(prev => ({...prev, heroImageUrl: url}))}
                  />
                  <div className="mt-2">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">หรือระบุ URL รูปภาพโดยตรง</label>
                    <div className="relative mt-1">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        value={config.heroImageUrl}
                        onChange={(e) => setConfig({...config, heroImageUrl: e.target.value})}
                        placeholder="https://example.com/hero.jpg"
                        className="w-full pl-10 pr-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Play size={16} className="text-indigo-600" /> วิดีโอแนะนำ (YouTube URL)
                  </label>
                  <input 
                    type="text" 
                    value={config.heroVideoUrl}
                    onChange={(e) => setConfig({...config, heroVideoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                  <div className="aspect-video rounded-2xl bg-gray-900 overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                    {config.heroVideoUrl ? (
                      <div className="text-white text-center">
                        <Play size={32} className="mx-auto mb-2 text-red-500" />
                        <p className="text-xs">วิดีโอถูกตั้งค่าแล้ว</p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Play size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs">ยังไม่มีวิดีโอ</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Slides Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">แบนเนอร์สไลด์ (Banner Slides)</h2>
            </div>
            <button 
              type="button"
              onClick={() => {
                const newSlides = [...(Array.isArray(config.bannerSlides) ? config.bannerSlides : [])];
                newSlides.push({
                  id: Date.now().toString(),
                  imageUrl: '',
                  title: '',
                  subtitle: '',
                  link: '',
                  order: newSlides.length
                });
                setConfig({...config, bannerSlides: newSlides});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm"
            >
              <Plus size={16} /> เพิ่มสไลด์
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {(Array.isArray(config.bannerSlides) ? [...config.bannerSlides] : []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((slide, idx) => (
                <div key={slide.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => {
                        if (idx === 0) return;
                        const newSlides = [...(Array.isArray(config.bannerSlides) ? config.bannerSlides : [])];
                        const tempOrder = newSlides[idx].order;
                        newSlides[idx] = { ...newSlides[idx], order: newSlides[idx-1].order };
                        newSlides[idx-1] = { ...newSlides[idx-1], order: tempOrder };
                        setConfig({...config, bannerSlides: newSlides});
                      }}
                      className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-lg shadow-sm"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const slidesCount = Array.isArray(config.bannerSlides) ? config.bannerSlides.length : 0;
                        if (idx === slidesCount - 1) return;
                        const newSlides = [...(Array.isArray(config.bannerSlides) ? config.bannerSlides : [])];
                        const tempOrder = newSlides[idx].order;
                        newSlides[idx] = { ...newSlides[idx], order: newSlides[idx+1].order };
                        newSlides[idx+1] = { ...newSlides[idx+1], order: tempOrder };
                        setConfig({...config, bannerSlides: newSlides});
                      }}
                      className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-lg shadow-sm"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const newSlides = (Array.isArray(config.bannerSlides) ? config.bannerSlides : []).filter(s => s.id !== slide.id);
                        setConfig({...config, bannerSlides: newSlides});
                      }}
                      className="p-2 bg-white text-red-400 hover:text-red-600 rounded-lg shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-3">
                      <FileUpload 
                        label="รูปภาพสไลด์"
                        currentImageUrl={slide.imageUrl}
                        onUploadSuccess={(url) => {
                          setConfig(prev => {
                            const newSlides = [...(Array.isArray(prev.bannerSlides) ? prev.bannerSlides : [])];
                            const sIdx = newSlides.findIndex(s => s.id === slide.id);
                            if (sIdx !== -1) {
                              newSlides[sIdx] = { ...newSlides[sIdx], imageUrl: url };
                              return { ...prev, bannerSlides: newSlides };
                            }
                            return prev;
                          });
                        }}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">หัวข้อสไลด์</label>
                          <input 
                            type="text"
                            value={slide.title}
                            onChange={(e) => {
                              const newSlides = [...(Array.isArray(config.bannerSlides) ? config.bannerSlides : [])];
                              const sIdx = newSlides.findIndex(s => s.id === slide.id);
                              if (sIdx !== -1) {
                                newSlides[sIdx] = { ...newSlides[sIdx], title: e.target.value };
                                setConfig({...config, bannerSlides: newSlides});
                              }
                            }}
                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">คำอธิบายสไลด์</label>
                          <input 
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => {
                              const newSlides = [...(Array.isArray(config.bannerSlides) ? config.bannerSlides : [])];
                              const sIdx = newSlides.findIndex(s => s.id === slide.id);
                              if (sIdx !== -1) {
                                newSlides[sIdx] = { ...newSlides[sIdx], subtitle: e.target.value };
                                setConfig({...config, bannerSlides: newSlides});
                              }
                            }}
                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">ลิงก์ (URL)</label>
                          <input 
                            type="text"
                            value={slide.link}
                            onChange={(e) => {
                              const newSlides = [...(Array.isArray(config.bannerSlides) ? config.bannerSlides : [])];
                              const sIdx = newSlides.findIndex(s => s.id === slide.id);
                              if (sIdx !== -1) {
                                newSlides[sIdx] = { ...newSlides[sIdx], link: e.target.value };
                                setConfig({...config, bannerSlides: newSlides});
                              }
                            }}
                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(!Array.isArray(config.bannerSlides) || config.bannerSlides.length === 0) && (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium">ยังไม่มีแบนเนอร์สไลด์</p>
                  <button 
                    type="button"
                    onClick={() => {
                      const newSlides = [{
                        id: Date.now().toString(),
                        imageUrl: '',
                        title: '',
                        subtitle: '',
                        link: '',
                        order: 0
                      }];
                      setConfig({...config, bannerSlides: newSlides});
                    }}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                  >
                    เพิ่มสไลด์แรก
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcement Popup Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">ป๊อปอัพประกาศ (Announcement Popup)</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.announcementEnabled}
                onChange={(e) => setConfig({...config, announcementEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ml-3 text-sm font-bold text-gray-700">{config.announcementEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
            </label>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">หัวข้อประกาศ (ถ้ามี)</label>
                <input 
                  type="text" 
                  value={config.announcementTitle}
                  onChange={(e) => setConfig({...config, announcementTitle: e.target.value})}
                  placeholder="เช่น ประกาศข่าวด่วน, แจ้งปิดเรียน..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <FileUpload 
                    label="รูปภาพประกาศ"
                    currentImageUrl={config.announcementImageUrl}
                    onUploadSuccess={(url) => setConfig(prev => ({...prev, announcementImageUrl: url}))}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">ลิงก์เมื่อคลิก (URL)</label>
                  <input 
                    type="text" 
                    value={config.announcementLink}
                    onChange={(e) => setConfig({...config, announcementLink: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-medium"
                  />
                  <p className="text-xs text-gray-400 italic">* หากใส่ลิงก์ เมื่อผู้ใช้คลิกที่รูปภาพจะไปยังหน้านั้น</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Layout size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ข้อมูลสารสนเทศ (Quick Info Section)</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">หัวข้อหลัก (Title)</label>
                <input 
                  type="text" 
                  value={config.quickInfoTitle}
                  onChange={(e) => setConfig({...config, quickInfoTitle: e.target.value})}
                  placeholder="เช่น เป้าหมายของเราคือ"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">หัวข้อย่อย (Subtitle - ตัวเอียง)</label>
                <input 
                  type="text" 
                  value={config.quickInfoSubtitle}
                  onChange={(e) => setConfig({...config, quickInfoSubtitle: e.target.value})}
                  placeholder="เช่น การสร้างอนาคตที่เท่าเทียม"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">เนื้อหาบรรยาย (Description)</label>
              <textarea 
                rows={4}
                value={config.quickInfoDescription}
                onChange={(e) => setConfig({...config, quickInfoDescription: e.target.value})}
                placeholder="รายละเอียดเนื้อหา..."
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <FileUpload 
                  label="รูปภาพประกอบ (Quick Info Image)"
                  currentImageUrl={config.quickInfoImageUrl}
                  onUploadSuccess={(url) => setConfig(prev => ({...prev, quickInfoImageUrl: url}))}
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">ตัวเลขสถิติ (Stats Value)</label>
                  <input 
                    type="text" 
                    value={config.quickInfoStatsValue1}
                    onChange={(e) => setConfig({...config, quickInfoStatsValue1: e.target.value})}
                    placeholder="เช่น 25+"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-black text-2xl"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">ข้อความใต้สถิติ (Stats Label)</label>
                  <input 
                    type="text" 
                    value={config.quickInfoStatsLabel1}
                    onChange={(e) => setConfig({...config, quickInfoStatsLabel1: e.target.value})}
                    placeholder="เช่น ปีแห่งการสร้างโอกาส"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ข้อมูลสถิติจำนวนบุคลากรและนักเรียน</h2>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">จำนวนครู</label>
                <input 
                  type="number" 
                  value={config.statsTeachers}
                  onChange={(e) => setConfig({...config, statsTeachers: parseInt(e.target.value) || 0})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">จำนวนลูกจ้าง</label>
                <input 
                  type="number" 
                  value={config.statsEmployees}
                  onChange={(e) => setConfig({...config, statsEmployees: parseInt(e.target.value) || 0})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">จำนวนนักเรียน</label>
                <input 
                  type="number" 
                  value={config.statsStudents}
                  onChange={(e) => setConfig({...config, statsStudents: parseInt(e.target.value) || 0})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-bold text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Videos Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                <Play size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">วิดีโอโรงเรียน (YouTube)</h2>
            </div>
            <button 
              type="button"
              onClick={() => {
                const newVideos = [...(Array.isArray(config.youtubeVideos) ? config.youtubeVideos : [])];
                newVideos.push({
                  id: Date.now().toString(),
                  title: '',
                  url: '',
                  order: newVideos.length
                });
                setConfig({...config, youtubeVideos: newVideos});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm"
            >
              <Plus size={16} /> เพิ่มวิดีโอ
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {(Array.isArray(config.youtubeVideos) ? [...config.youtubeVideos] : []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((video, idx) => (
                <div key={video.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => {
                        if (idx === 0) return;
                        const newVideos = [...(Array.isArray(config.youtubeVideos) ? config.youtubeVideos : [])];
                        const tempOrder = newVideos[idx].order;
                        newVideos[idx] = { ...newVideos[idx], order: newVideos[idx-1].order };
                        newVideos[idx-1] = { ...newVideos[idx-1], order: tempOrder };
                        setConfig({...config, youtubeVideos: newVideos});
                      }}
                      className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-lg shadow-sm"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const videosCount = Array.isArray(config.youtubeVideos) ? config.youtubeVideos.length : 0;
                        if (idx === videosCount - 1) return;
                        const newVideos = [...(Array.isArray(config.youtubeVideos) ? config.youtubeVideos : [])];
                        const tempOrder = newVideos[idx].order;
                        newVideos[idx] = { ...newVideos[idx], order: newVideos[idx+1].order };
                        newVideos[idx+1] = { ...newVideos[idx+1], order: tempOrder };
                        setConfig({...config, youtubeVideos: newVideos});
                      }}
                      className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-lg shadow-sm"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const newVideos = (Array.isArray(config.youtubeVideos) ? config.youtubeVideos : []).filter(v => v.id !== video.id);
                        setConfig({...config, youtubeVideos: newVideos});
                      }}
                      className="p-2 bg-white text-red-400 hover:text-red-600 rounded-lg shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">ชื่อวิดีโอ</label>
                      <input 
                        type="text"
                        value={video.title}
                        onChange={(e) => {
                          const newVideos = [...(Array.isArray(config.youtubeVideos) ? config.youtubeVideos : [])];
                          const vIdx = newVideos.findIndex(v => v.id === video.id);
                          if (vIdx !== -1) {
                            newVideos[vIdx] = { ...newVideos[vIdx], title: e.target.value };
                            setConfig({...config, youtubeVideos: newVideos});
                          }
                        }}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-bold"
                        placeholder="เช่น บรรยากาศภายในโรงเรียน"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">YouTube URL</label>
                      <input 
                        type="text"
                        value={video.url}
                        onChange={(e) => {
                          const newVideos = [...(Array.isArray(config.youtubeVideos) ? config.youtubeVideos : [])];
                          const vIdx = newVideos.findIndex(v => v.id === video.id);
                          if (vIdx !== -1) {
                            newVideos[vIdx] = { ...newVideos[vIdx], url: e.target.value };
                            setConfig({...config, youtubeVideos: newVideos});
                          }
                        }}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  {/* Video Preview */}
                  {video.url && (
                    <div className="mt-4 aspect-video rounded-2xl overflow-hidden bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`}
                        title="Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              ))}

              {(!Array.isArray(config.youtubeVideos) || config.youtubeVideos.length === 0) && (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <Play size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium">ยังไม่มีวิดีโอ YouTube</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Programs Settings */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <LinkIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">โปรแกรมแนะนำ / ลิงก์ภายนอก</h2>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {(Array.isArray(config.recommendedPrograms) ? config.recommendedPrograms : []).map((program, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative">
                  <button 
                    type="button"
                    onClick={() => {
                      const newPrograms = [...(Array.isArray(config.recommendedPrograms) ? config.recommendedPrograms : [])];
                      newPrograms.splice(idx, 1);
                      setConfig({...config, recommendedPrograms: newPrograms});
                    }}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <RefreshCw size={16} className="rotate-45" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">ชื่อโปรแกรม/แบรนด์</label>
                      <input 
                        type="text"
                        value={program.title}
                        onChange={(e) => {
                          const newPrograms = [...(Array.isArray(config.recommendedPrograms) ? config.recommendedPrograms : [])];
                          newPrograms[idx] = { ...newPrograms[idx], title: e.target.value };
                          setConfig({...config, recommendedPrograms: newPrograms});
                        }}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">ลิงก์ (URL)</label>
                      <input 
                        type="text"
                        value={program.link}
                        onChange={(e) => {
                          const newPrograms = [...(Array.isArray(config.recommendedPrograms) ? config.recommendedPrograms : [])];
                          newPrograms[idx] = { ...newPrograms[idx], link: e.target.value };
                          setConfig({...config, recommendedPrograms: newPrograms});
                        }}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">รูปภาพโลโก้ (URL)</label>
                    <div className="flex gap-4">
                      <input 
                        type="text"
                        value={program.imageUrl}
                        onChange={(e) => {
                          const newPrograms = [...(Array.isArray(config.recommendedPrograms) ? config.recommendedPrograms : [])];
                          newPrograms[idx] = { ...newPrograms[idx], imageUrl: e.target.value };
                          setConfig({...config, recommendedPrograms: newPrograms});
                        }}
                        className="flex-1 px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                        {program.imageUrl && <img src={program.imageUrl} alt="preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={() => {
                  const newPrograms = [...(Array.isArray(config.recommendedPrograms) ? config.recommendedPrograms : []), { title: '', imageUrl: '', link: '' }];
                  setConfig({...config, recommendedPrograms: newPrograms});
                }}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
              >
                <LinkIcon size={20} /> เพิ่มโปรแกรมแนะนำ
              </button>
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
            onClick={fetchConfig}
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-lg"
          >
            <RefreshCw size={20} /> คืนค่าเดิม
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={20} />
            )}
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </form>
    </div>
  );
};
