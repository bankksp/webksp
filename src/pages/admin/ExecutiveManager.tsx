import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  X, Save, History,
  Calendar, User
} from 'lucide-react';
import { getExecutives, createExecutive, updateExecutive, deleteExecutive } from '../../services/dataService';
import { FileUpload } from '../../components/FileUpload';
import { Executive } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const ExecutiveManager = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExec, setEditingExec] = useState<Executive | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: 'ผู้อำนวยการโรงเรียน',
    period: '',
    imageUrl: '',
    bio: '',
    order: 0
  });

  useEffect(() => {
    fetchExecutives();
  }, []);

  const fetchExecutives = async () => {
    setLoading(true);
    const data = await getExecutives();
    setExecutives(data.sort((a, b) => a.order - b.order));
    setLoading(false);
  };

  const handleOpenModal = (exec?: Executive) => {
    if (exec) {
      setEditingExec(exec);
      setFormData({
        name: exec.name || '',
        position: exec.position || '',
        period: exec.period || '',
        imageUrl: exec.imageUrl || '',
        bio: exec.bio || '',
        order: exec.order || 0
      });
    } else {
      setEditingExec(null);
      setFormData({
        name: '',
        position: 'ผู้อำนวยการโรงเรียน',
        period: '',
        imageUrl: '',
        bio: '',
        order: executives.length > 0 ? Math.max(...executives.map(e => e.order)) + 1 : 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading(editingExec ? 'กำลังอัปเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...');
    try {
      if (editingExec) {
        await updateExecutive(editingExec.id!, formData);
        toast.success('อัปเดตข้อมูลสำเร็จ', { id: toastId });
      } else {
        await createExecutive(formData);
        toast.success('เพิ่มข้อมูลสำเร็จ', { id: toastId });
      }
      setIsModalOpen(false);
      fetchExecutives();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
      await deleteExecutive(id);
      toast.success('ลบข้อมูลสำเร็จ');
      fetchExecutives();
    }
  };

  const filteredExecs = executives.filter(exec => 
    exec.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">ทำเนียบผู้บริหาร</h1>
          <p className="text-gray-500">จัดการรายนามและประวัติผู้บริหารในอดีต</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 w-fit"
        >
          <Plus size={20} /> เพิ่มผู้บริหาร
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อผู้บริหาร..." 
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
                <th className="px-6 py-4">ผู้บริหาร</th>
                <th className="px-6 py-4">ปีที่ดำรงตำแหน่ง</th>
                <th className="px-6 py-4">ลำดับ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExecs.map((exec) => (
                <tr key={exec.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img 
                          src={exec.imageUrl || "https://picsum.photos/seed/exec/100/100"} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate max-w-xs">{exec.name}</p>
                        <p className="text-xs text-gray-400">{exec.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-indigo-400" />
                      {exec.period}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                      {exec.order}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(exec)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(exec.id!)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExecs.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    ไม่พบข้อมูลผู้บริหาร
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
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingExec ? 'แก้ไขข้อมูลผู้บริหาร' : 'เพิ่มผู้บริหารใหม่'}</h2>
                    <p className="text-indigo-100 text-xs">กรอกข้อมูลรายละเอียดผู้บริหาร</p>
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
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="เช่น นายสมชาย ใจดี"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ตำแหน่ง</label>
                    <input 
                      required
                      type="text" 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="เช่น ผู้อำนวยการโรงเรียน"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ปีที่ดำรงตำแหน่ง</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.period}
                        onChange={(e) => setFormData({...formData, period: e.target.value})}
                        placeholder="เช่น 2560 - 2565"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ลำดับการแสดงผล</label>
                    <input 
                      required
                      type="number" 
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">รูปภาพประจำตัว</label>
                    <FileUpload 
                      currentImageUrl={formData.imageUrl}
                      onUploadSuccess={(url) => setFormData(prev => ({...prev, imageUrl: url}))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ประวัติโดยย่อ</label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                      placeholder="กรอกประวัติหรือผลงานที่สำคัญ..."
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
                    disabled={saving}
                    className="flex-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={20} />
                    )}
                    {editingExec ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
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
