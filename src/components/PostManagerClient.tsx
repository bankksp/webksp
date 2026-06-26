'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, 
  Edit2, Trash2, Eye, Calendar, 
  Image as ImageIcon, X, Save, AlertCircle,
  Bold, Italic, Heading1, AlignLeft, List, Type,
  Heading2, AlignCenter, AlignRight, AlignJustify, Link,
  LayoutTemplate
} from 'lucide-react';
import { toast } from 'sonner';
import { getPosts, createPost, updatePost, deletePost, getSchoolInfo, getExecutives, uploadFile } from '@/services/dataService';
import { FileUpload } from '@/components/FileUpload';
import { AlbumUpload } from '@/components/AlbumUpload';
import { Post, MediaItem, SchoolInfo, Executive } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { createExcerpt } from '@/lib/excerpt';
import { SITE_URL } from '@/config';
import { NewsletterTemplate } from '@/components/NewsletterTemplate';
import { toBlob, toJpeg } from 'html-to-image';

// WYSIWYG Editor
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ReactQuillAny = ReactQuill as any;

// Register custom fonts for Quill
const Quill = ReactQuill.Quill;
const Font = Quill.import('formats/font');
Font.whitelist = ['sarabun', 'kanit', 'prompt', 'mitr', 'chakra-petch', 'montserrat', 'inter'];
Quill.register(Font, true);

const PostManagerClient = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [executives, setExecutives] = useState<Executive[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const newsletterRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: 'news' | 'publication' | 'info' | 'activity';
    imageUrl: string;
    author: string;
    album: MediaItem[];
    driveLink: string;
    imagePosition: string;
    fontSize: string;
    lineHeight: string;
  }>({
    title: '',
    content: '',
    category: 'news',
    imageUrl: '',
    author: 'Admin',
    album: [],
    driveLink: '',
    imagePosition: 'center',
    fontSize: '2',
    lineHeight: '0'
  });

  const quillRef = useRef<any>(null);

  const modules = {
    toolbar: {
      container: "#quill-toolbar",
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'align'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, info, execs] = await Promise.all([
        getPosts(),
        getSchoolInfo(),
        getExecutives()
      ]);
      setPosts(data || []);
      setSchoolInfo(info);
      setExecutives(execs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    const data = await getPosts();
    setPosts(data || []);
  };

  const handleOpenModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      
      // Basic check if content is markdown and convert to HTML for visual editor
      let content = post.content;
      const isMarkdown = content.includes('###') || content.includes('**') || content.includes('* ') || content.includes('> ');
      if (isMarkdown && !content.includes('<') && !content.includes('>')) {
        content = content
          .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
          .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
          .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br/>');
        
        if (!content.startsWith('<')) content = `<p>${content}</p>`;
      }

      setFormData({
        title: post.title,
        content: content,
        category: post.category,
        imageUrl: post.imageUrl || '',
        author: post.author,
        album: post.album || [],
        driveLink: post.driveLink || '',
        imagePosition: post.imagePosition || 'center',
        fontSize: post.fontSize || '2',
        lineHeight: post.lineHeight || '0'
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        category: 'news',
        imageUrl: '',
        author: 'Admin',
        album: [],
        driveLink: '',
        imagePosition: 'center',
        fontSize: '2',
        lineHeight: '0'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    const toastId = toast.loading(editingPost ? 'กำลังอัปเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...');
    
    try {
      if (editingPost && editingPost.id) {
        await updatePost(editingPost.id, formData);
        toast.success('อัปเดตข่าวสารสำเร็จ', { id: toastId });
      } else {
        await createPost(formData);
        toast.success('บันทึกข่าวสารใหม่สำเร็จ', { id: toastId });
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้', { 
        id: toastId,
        description: error.message || 'กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข่าวสารนี้?')) {
      await deletePost(id);
      fetchPosts();
    }
  };

  const handlePreview = (post: Post) => {
    const origin = (SITE_URL || window.location.origin).replace(/\/$/, '');
    const path = post.shortId ? `/${post.shortId}` : `/p/${post.id}`;
    window.open(`${origin}${path}`, '_blank', 'noopener,noreferrer');
  };

  const handleGenerateNewsletter = () => {
    if (!formData.title) {
      toast.error('กรุณากรอกหัวข้อข่าวสารก่อนสร้างแผ่นข่าว');
      return;
    }
    setIsNewsletterModalOpen(true);
  };

  const handleSaveNewsletter = async () => {
    if (!newsletterRef.current) return;
    
    setIsGeneratingImage(true);
    const toastId = toast.loading('กำลังสร้างและอัปโหลดแผ่นข่าว...');
    
    try {
      // 1. Generate jpeg data URL
      const dataUrl = await toJpeg(newsletterRef.current, {
        quality: 0.95,
        pixelRatio: 2.0,
      });
      
      if (!dataUrl) throw new Error('Could not generate image');
      
      // Convert to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      // 2. Upload blob
      const file = new File([blob], `newsletter-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await uploadFile(file);
      
      // 3. Set to formData.imageUrl and formData.newsletterUrl
      setFormData(prev => ({ ...prev, imageUrl: url })); // Use as main image as requested
      
      toast.success('สร้างแผ่นข่าวและตั้งเป็นรูปหน้าปกสำเร็จ', { id: toastId });
      setIsNewsletterModalOpen(false);
      
    } catch (error: any) {
      console.error(error);
      toast.error('ไม่สามารถสร้างแผ่นข่าวได้', { id: toastId, description: error.message });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">จัดการข่าวสารและผลงาน</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข หรือลบข่าวประชาสัมพันธ์และกิจกรรมของโรงเรียน</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> เขียนข่าวใหม่
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาหัวข้อข่าว..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-12 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-medium text-gray-700"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="news">ข่าวประชาสัมพันธ์</option>
              <option value="activity">กิจกรรมโรงเรียน</option>
              <option value="publication">วารสาร/ผลงาน</option>
              <option value="info">สารสนเทศ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table/Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">หัวข้อข่าว</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">วันที่โพสต์</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">ผู้เขียน</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                          <img 
                            src={post.imageUrl || "https://picsum.photos/seed/news/100/100"} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          {post.album && post.album.length > 0 && (
                            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white text-[8px] px-1 rounded-tl-md font-bold">
                              +{post.album.length}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{createExcerpt(post.content)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        post.category === 'news' ? 'bg-blue-50 text-blue-600' :
                        post.category === 'activity' ? 'bg-emerald-50 text-emerald-600' :
                        post.category === 'publication' ? 'bg-purple-50 text-purple-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(post.createdAt).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handlePreview(post)}
                          title="ดูตัวอย่างหน้าข่าว"
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(post)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => post.id && handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    ไม่พบข้อมูลข่าวสาร
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {editingPost ? 'แก้ไขข่าวสาร' : 'เขียนข่าวสารใหม่'}
                  </h2>
                  <p className="text-gray-500 text-sm">กรอกข้อมูลให้ครบถ้วนเพื่อเผยแพร่ลงหน้าเว็บไซต์</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">หัวข้อข่าวสาร</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="เช่น กิจกรรมวันไหว้ครู ประจำปี 2569"
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">หมวดหมู่</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                    >
                      <option value="news">ข่าวประชาสัมพันธ์</option>
                      <option value="activity">กิจกรรมโรงเรียน</option>
                      <option value="publication">วารสาร/ผลงาน</option>
                      <option value="info">สารสนเทศ</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ผู้เขียน</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl mb-2">
                      <div>
                        <h4 className="font-bold text-indigo-900">แผ่นประชาสัมพันธ์ข่าว (Newsletter A4)</h4>
                        <p className="text-xs text-indigo-700/70">สร้างกราฟิกอัตโนมัติพร้อมผู้บริหาร เพื่อใช้เป็นปกแชร์ Facebook / LINE</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleGenerateNewsletter}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
                      >
                        <LayoutTemplate size={16} />
                        สร้างรูปแผ่นข่าวอัตโนมัติ
                      </button>
                    </div>

                    <FileUpload 
                      label="รูปภาพหน้าปก / รูปปก Facebook (กดยกเลิกเพื่อเปลี่ยนใหม่)"
                      currentImageUrl={formData.imageUrl}
                      onUploadSuccess={(url) => setFormData({...formData, imageUrl: url})}
                    />
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">ตำแหน่งภาพ</label>
                        <select 
                          value={formData.imagePosition}
                          onChange={(e) => setFormData({...formData, imagePosition: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium mt-1"
                        >
                          <option value="center">กึ่งกลาง (Center)</option>
                          <option value="top">ชิดบน (Top)</option>
                          <option value="bottom">ชิดล่าง (Bottom)</option>
                          <option value="0% 25%">ค่อนบน (Top 25%)</option>
                          <option value="0% 75%">ค่อนล่าง (Bottom 75%)</option>
                        </select>
                      </div>
                      <div className="flex-[2]">
                        <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">หรือระบุ URL รูปภาพโดยตรง</label>
                        <div className="relative mt-1">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="url" 
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="w-full pl-10 pr-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ลิงก์อัลบั้มรูปภาพ/วิดีโอเพิ่มเติม (Google Photos/Drive)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="url" 
                        value={formData.driveLink}
                        onChange={(e) => setFormData({...formData, driveLink: e.target.value})}
                        placeholder="ลิงก์อัลบั้มรูปภาพ (ถ้ามี)"
                        className="w-full pl-10 pr-5 py-4 bg-indigo-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Type size={16} className="text-indigo-600" />
                          เนื้อหาข่าวสาร (แก้ไขแบบ WYSIWYG)
                        </label>
                      </div>

                      {/* Formatting Toolbar */}
                      <div id="quill-toolbar" className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm mr-2">
                          <button className="ql-bold p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" title="ตัวหนา">
                            <Bold size={16} />
                          </button>
                          <button className="ql-italic p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" title="ตัวเอียง">
                            <Italic size={16} />
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-1"></div>
                          <button className="ql-header p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" value="1" title="หัวข้อใหญ่">
                            <Heading1 size={16} />
                          </button>
                          <button className="ql-header p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" value="2" title="หัวข้อย่อย">
                            <Heading2 size={16} />
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-1"></div>
                          <button className="ql-list p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" value="bullet" title="รายการ">
                            <List size={16} />
                          </button>
                          <button className="ql-link p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" title="แนบลิงก์" type="button">
                            <Link size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select className="ql-font text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none h-9 min-w-[120px]">
                            <option value="">รูปแบบฟอนต์</option>
                            <option value="sarabun">Sarabun</option>
                            <option value="kanit">Kanit</option>
                            <option value="prompt">Prompt</option>
                            <option value="mitr">Mitr</option>
                            <option value="chakra-petch">Chakra Petch</option>
                            <option value="montserrat">Montserrat</option>
                            <option value="inter">Inter</option>
                          </select>
                          
                          <select className="ql-size text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none h-9 min-w-[100px]">
                            <option value="small">เล็ก</option>
                            <option value="">ปกติ</option>
                            <option value="large">ใหญ่</option>
                            <option value="huge">ใหญ่มาก</option>
                          </select>

                          <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                            <button className="ql-align p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" value="" title="ชิดซ้าย">
                              <AlignLeft size={16} />
                            </button>
                            <button className="ql-align p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" value="center" title="กึ่งกลาง">
                              <AlignCenter size={16} />
                            </button>
                            <button className="ql-align p-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded transition-all" value="right" title="ชิดขวา">
                              <AlignRight size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5 ml-1 leading-none text-center whitespace-nowrap">ขนาด (1-7)</span>
                            <select 
                              value={formData.fontSize}
                              onChange={(e) => setFormData({...formData, fontSize: e.target.value})}
                              className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 text-gray-900 h-9 min-w-[80px] shadow-sm cursor-pointer"
                            >
                              <option value="1">1 (14px)</option>
                              <option value="2">2 (16px)</option>
                              <option value="3">3 (18px)</option>
                              <option value="4">4 (20px)</option>
                              <option value="5">5 (24px)</option>
                              <option value="6">6 (32px)</option>
                              <option value="7">7 (48px)</option>
                              <option value="8">8 (60px)</option>
                              <option value="9">9 (72px)</option>
                            </select>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5 ml-1 leading-none text-center whitespace-nowrap">ห่าง (-2..3)</span>
                            <select 
                              value={formData.lineHeight}
                              onChange={(e) => setFormData({...formData, lineHeight: e.target.value})}
                              className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 text-gray-900 h-9 min-w-[80px] shadow-sm cursor-pointer"
                            >
                              <option value="-2">-2 (1.0)</option>
                              <option value="-1">-1 (1.2)</option>
                              <option value="0">0 (1.5)</option>
                              <option value="1">1 (1.8)</option>
                              <option value="2">2 (2.0)</option>
                              <option value="3">3 (2.5)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`wysiwyg-editor bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-inner min-h-[400px] break-words whitespace-normal`}>
                      <ReactQuillAny 
                        ref={quillRef}
                        theme="snow"
                        value={formData.content}
                        onChange={(content: string) => setFormData({...formData, content})}
                        modules={modules}
                        formats={formats}
                        placeholder="เขียนข่าวสารที่นี่..."
                        className={`h-full border-none font-sarabun ql-editor-custom`}
                        style={{ 
                          fontSize: 
                            formData.fontSize === '1' ? '14px' :
                            formData.fontSize === '2' ? '16px' :
                            formData.fontSize === '3' ? '18px' :
                            formData.fontSize === '4' ? '20px' :
                            formData.fontSize === '5' ? '24px' :
                            formData.fontSize === '6' ? '32px' :
                            formData.fontSize === '7' ? '48px' : '16px',
                          lineHeight:
                            formData.lineHeight === '-2' ? '1.0' :
                            formData.lineHeight === '-1' ? '1.2' :
                            formData.lineHeight === '0' ? '1.5' :
                            formData.lineHeight === '1' ? '1.8' :
                            formData.lineHeight === '2' ? '2.0' :
                            formData.lineHeight === '3' ? '2.5' : '1.5'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl text-indigo-700 text-sm">
                  <AlertCircle size={18} />
                  <p>ข่าวสารจะถูกเผยแพร่ทันทีหลังจากกดบันทึก กรุณาตรวจสอบความถูกต้อง</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className={`flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 ${
                      saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={20} />
                    )}
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Newsletter Generator Modal */}
      <AnimatePresence>
        {isNewsletterModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                    <LayoutTemplate className="text-indigo-600" />
                    พรีวิวแผ่นประชาสัมพันธ์ข่าว
                  </h2>
                  <p className="text-gray-500 text-sm">ข้อมูลทั้งหมดจะถูกดึงมาจากระบบ หากต้องการแก้ไขรูป ให้ปิดหน้านี้แล้วแก้ไขในฟอร์ม</p>
                </div>
                <button 
                  onClick={() => setIsNewsletterModalOpen(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"
                  disabled={isGeneratingImage}
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 flex justify-center bg-gray-200">
                 {/* Scale down visually but keep actual size for rendering */}
                 <div className="shadow-2xl origin-top" style={{ transform: 'scale(0.6)', transformOrigin: 'top center', marginBottom: '-600px' }}>
                   <NewsletterTemplate 
                     ref={newsletterRef}
                     post={{
                       ...formData,
                       createdAt: editingPost?.createdAt || new Date().toISOString(),
                     } as Post}
                     schoolInfo={schoolInfo}
                     executives={executives}
                   />
                 </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsNewsletterModalOpen(false)}
                  disabled={isGeneratingImage}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button"
                  disabled={isGeneratingImage}
                  onClick={handleSaveNewsletter}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 ${
                    isGeneratingImage ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                >
                  {isGeneratingImage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={20} />
                  )}
                  {isGeneratingImage ? 'กำลังสร้างรูปภาพ...' : 'บันทึกเป็นหน้าปกทันที'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostManagerClient;
