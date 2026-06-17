'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  X, Save, BookOpen, FileText,
  Calendar, Layout, Eye, Check
} from 'lucide-react';
import { getInfoDocuments, createInfoDocument, updateInfoDocument, deleteInfoDocument } from '@/services/dataService';
import { FileUpload } from '@/components/FileUpload';
import { InfoDocument } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const InfoDocumentManagerClient = () => {
  const [documents, setDocuments] = useState<InfoDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<InfoDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultCategories = [
    { id: 'curriculum', name: 'หลักสูตรโรงเรียน' },
    { id: 'download', name: 'เอกสารดาวน์โหลด' },
    { id: 'info', name: 'สารสนเทศโรงเรียน' },
    { id: 'sar', name: 'SAR ประจำปี' },
    { id: 'plan', name: 'แผนประจำปี' },
  ];

  const [customCategories, setCustomCategories] = useState<{ id: string, name: string }[]>(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_doc_categories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const allCategories = [...defaultCategories, ...customCategories];

  const discoveredCategories = documents
    .map(doc => doc.category)
    .filter(cat => cat && !allCategories.some(c => c.id === cat));
  const uniqueDiscovered = Array.from(new Set(discoveredCategories)).map(cat => ({
    id: cat,
    name: cat
  }));

  const combinedCategories = [...allCategories, ...uniqueDiscovered];

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    const trimmed = newCategoryName.trim();
    if (combinedCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() || c.id === trimmed)) {
      toast.warning('มีหมวดหมู่นี้อยู่แล้ว');
      return;
    }
    const newId = 'custom-' + Date.now();
    const updated = [...customCategories, { id: newId, name: trimmed }];
    setCustomCategories(updated);
    localStorage.setItem('ksp_custom_doc_categories', JSON.stringify(updated));
    window.dispatchEvent(new Event('ksp_categories_updated'));
    setFormData(prev => ({ ...prev, category: newId }));
    setNewCategoryName('');
    toast.success(`เพิ่มหมวดหมู่ "${trimmed}" สำเร็จ`);
  };

  const handleRenameCategory = async (catId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    const trimmed = newName.trim();
    
    // Update customCategories state and localStorage
    const updated = customCategories.map(c => c.id === catId ? { ...c, name: trimmed } : c);
    setCustomCategories(updated);
    localStorage.setItem('ksp_custom_doc_categories', JSON.stringify(updated));
    window.dispatchEvent(new Event('ksp_categories_updated'));

    // Silent background updates for all documents under this category in Firebase
    const usingDocs = documents.filter(doc => {
      const docCat = doc.category || '';
      return docCat === catId || docCat.startsWith(catId + ':');
    });

    if (usingDocs.length > 0) {
      toast.info(`กำลังอัปเดตชื่อหมวดหมู่ในเอกสาร ${usingDocs.length} ฉบับ...`);
      try {
        for (const doc of usingDocs) {
          await updateInfoDocument(doc.id!, {
            ...doc,
            category: `${catId}:${trimmed}`
          });
        }
        await fetchDocuments();
        toast.success('อัปเดตข้อมูลหมวดหมู่ในเอกสารสำเร็จ');
      } catch (err) {
        console.error(err);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตเอกสาร');
      }
    } else {
      toast.success('แก้ไขชื่อหมวดหมู่สำเร็จ');
    }
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async (catId: string) => {
    const usingDocs = documents.filter(doc => {
      const docCat = doc.category || '';
      return docCat === catId || docCat.startsWith(catId + ':');
    });

    const confirmMsg = usingDocs.length > 0
      ? `ต้องการลบหมวดหมู่นี้หรือไม่? มีเอกสาร ${usingDocs.length} ฉบับในหมวดหมู่นี้ ซึ่งจะถูกย้ายไปหมวดหมู่ "สารสนเทศโรงเรียน" อัตโนมัติ`
      : `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?`;

    if (window.confirm(confirmMsg)) {
      // Remove from customCategories state and localStorage
      const updated = customCategories.filter(c => c.id !== catId);
      setCustomCategories(updated);
      localStorage.setItem('ksp_custom_doc_categories', JSON.stringify(updated));
      window.dispatchEvent(new Event('ksp_categories_updated'));

      // If document is selected as deleted category, reset form select to 'info'
      if (formData.category === catId) {
        setFormData(prev => ({ ...prev, category: 'info' }));
      }

      // Update Firebase docs
      if (usingDocs.length > 0) {
        toast.info(`กำลังย้ายเอกสาร ${usingDocs.length} ฉบับ...`);
        try {
          for (const doc of usingDocs) {
            await updateInfoDocument(doc.id!, {
              ...doc,
              category: 'info',
              year: Number(doc.year) || new Date().getFullYear() + 543
            });
          }
          await fetchDocuments();
          toast.success('ย้ายเอกสารและลบหมวดหมู่สำเร็จ');
        } catch (err) {
          console.error(err);
          toast.error('เกิดข้อผิดพลาดในการปรับปรุงเอกสาร');
        }
      } else {
        toast.success('ลบหมวดหมู่สำเร็จ');
      }
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'info' as string,
    pdfUrl: '',
    thumbnailUrl: '',
    description: '',
    year: new Date().getFullYear() + 543
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const data = await getInfoDocuments();
    setDocuments(data || []);
    setLoading(false);

    // Silent background migration to upgrade existing document category fields to contain Thai names
    if (data && data.length > 0) {
      try {
        const stored = localStorage.getItem('ksp_custom_doc_categories');
        const list = stored ? JSON.parse(stored) : [];
        if (list.length > 0) {
          data.forEach(async (doc: InfoDocument) => {
            const cat = doc.category || '';
            if (cat.startsWith('custom-') && !cat.includes(':')) {
              const matched = list.find((c: any) => c.id === cat);
              if (matched && matched.name) {
                console.log(`Silent migrating category for doc ${doc.id}`);
                await updateInfoDocument(doc.id!, {
                  title: doc.title,
                  category: `${cat}:${matched.name}`,
                  pdfUrl: doc.pdfUrl,
                  thumbnailUrl: doc.thumbnailUrl || '',
                  description: doc.description || '',
                  year: Number(doc.year) || new Date().getFullYear() + 543
                });
              }
            }
          });
        }
      } catch (e) {
        console.error('Silent migration error:', e);
      }
    }
  };

  const handleOpenModal = (doc?: InfoDocument) => {
    if (doc) {
      setEditingDoc(doc);
      let catId = doc.category || 'info';
      if (catId.includes(':')) {
        catId = catId.split(':')[0];
      }
      setFormData({
        title: doc.title,
        category: catId,
        pdfUrl: doc.pdfUrl,
        thumbnailUrl: doc.thumbnailUrl || '',
        description: doc.description || '',
        year: Number(doc.year) || new Date().getFullYear() + 543
      });
    } else {
      setEditingDoc(null);
      setFormData({
        title: '',
        category: 'info',
        pdfUrl: '',
        thumbnailUrl: '',
        description: '',
        year: new Date().getFullYear() + 543
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pdfUrl) {
      toast.error('กรุณาอัปโหลดไฟล์ PDF');
      return;
    }
    try {
      const matchedCat = combinedCategories.find(c => c.id === formData.category);
      const categoryToSave = formData.category.startsWith('custom-') && matchedCat && matchedCat.name && !formData.category.includes(':')
        ? `${formData.category}:${matchedCat.name}`
        : formData.category;

      const finalData = {
        ...formData,
        category: categoryToSave
      };

      if (editingDoc) {
        await updateInfoDocument(editingDoc.id!, finalData);
        toast.success('อัปเดตข้อมูลสำเร็จ');
      } else {
        await createInfoDocument(finalData);
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }
      setIsModalOpen(false);
      fetchDocuments();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) {
      await deleteInfoDocument(id);
      toast.success('ลบเอกสารสำเร็จ');
      fetchDocuments();
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">จัดการสารสนเทศ/E-Book</h1>
          <p className="text-gray-500">จัดการเอกสาร PDF และสารสนเทศในรูปแบบ E-Book</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 w-fit"
        >
          <Plus size={20} /> เพิ่มเอกสารใหม่
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อเอกสาร..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">เอกสาร</th>
                <th className="px-6 py-4">หมวดหมู่</th>
                <th className="px-6 py-4">ปี</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                        <img 
                          src={doc.thumbnailUrl || "https://picsum.photos/seed/doc/100/140"} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate max-w-xs">{doc.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{doc.description || 'ไม่มีคำอธิบาย'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                      {(() => {
                        const catStr = doc.category || '';
                        let id = catStr;
                        let name = catStr;
                        if (catStr.includes(':')) {
                          const parts = catStr.split(':');
                          id = parts[0];
                          name = parts.slice(1).join(':');
                        }
                        const matched = combinedCategories.find(c => c.id === id);
                        return matched ? matched.name : name;
                      })()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-medium">{doc.year}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={doc.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="ดูไฟล์ PDF"
                      >
                        <Eye size={18} />
                      </a>
                      <button 
                        onClick={() => handleOpenModal(doc)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id!)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    ไม่พบข้อมูลเอกสาร
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingDoc ? 'แก้ไขข้อมูลเอกสาร' : 'เพิ่มเอกสารใหม่'}</h2>
                    <p className="text-indigo-100 text-xs">กรอกข้อมูลรายละเอียดเอกสาร PDF</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ชื่อเอกสาร</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="เช่น หลักสูตรสถานศึกษา พ.ศ. 2566"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2 bg-indigo-50/20 border border-indigo-100/40 p-5 rounded-3xl">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                        <Layout className="text-indigo-600" size={16} /> หมวดหมู่เอกสาร
                      </label>
                      <button 
                        type="button"
                        onClick={() => setIsManagingCategories(!isManagingCategories)}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/60 transition-all bg-white px-3 py-1.5 border border-indigo-100 rounded-xl shadow-sm flex items-center gap-1"
                      >
                        {isManagingCategories ? 'เสร็จสิ้น' : '⚙️ จัดการ/ลบ/แก้ไขหมวดหมู่'}
                      </button>
                    </div>
                    
                    {isManagingCategories ? (
                      <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-100 mt-2">
                        {/* Inline Add Category form */}
                        <div className="flex gap-2 pb-3 border-b border-gray-50">
                          <input
                            type="text"
                            placeholder="พิมพ์ชื่อหมวดหมู่ใหม่ที่นี่..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Plus size={14} /> เพิ่มหมวดหมู่
                          </button>
                        </div>

                        {/* Category List */}
                        <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                          {defaultCategories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center py-2 px-3 bg-gray-50/70 rounded-xl border border-gray-150">
                              <span className="text-sm text-gray-500 font-medium">{cat.name}</span>
                              <span className="text-[10px] text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded-full font-bold">หมวดหมู่ระบบ (🔒)</span>
                            </div>
                          ))}
                          {customCategories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-all">
                              {editingCategoryId === cat.id ? (
                                <div className="flex gap-2 items-center w-full">
                                  <input
                                    type="text"
                                    value={editingCategoryName}
                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-indigo-300 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRenameCategory(cat.id, editingCategoryName)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors shrink-0"
                                    title="บันทึกชื่อใหม่"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategoryId(null)}
                                    className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors shrink-0"
                                    title="ยกเลิก"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm text-gray-800 font-bold">{cat.name}</span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCategoryId(cat.id);
                                        setEditingCategoryName(cat.name);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                      title="แก้ไขชื่อหมวดหมู่"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(cat.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="ลบหมวดหมู่"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="relative mt-2">
                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none font-bold text-gray-800 hover:border-indigo-300 cursor-pointer"
                        >
                          {combinedCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ปีการศึกษา (พ.ศ.)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="number" 
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        placeholder="เช่น 2566"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ไฟล์เอกสาร (PDF)</label>
                    <FileUpload 
                      currentImageUrl={formData.pdfUrl}
                      onUploadSuccess={(url) => setFormData({...formData, pdfUrl: url})}
                      accept="application/pdf"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">รูปหน้าปก (Thumbnail)</label>
                    <FileUpload 
                      currentImageUrl={formData.thumbnailUrl}
                      onUploadSuccess={(url) => setFormData({...formData, thumbnailUrl: url})}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">คำอธิบายเพิ่มเติม</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      placeholder="กรอกรายละเอียดสั้นๆ เกี่ยวกับเอกสาร..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> {editingDoc ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสาร'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoDocumentManagerClient;
