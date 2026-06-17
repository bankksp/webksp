import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, 
  Edit2, Trash2, User, Mail, Phone, 
  Image as ImageIcon, X, Save, AlertCircle,
  Briefcase, Lock, Globe,
  FileDown, FileUp, Download, CheckCircle2
} from 'lucide-react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../services/dataService';
import { FileUpload } from '../../components/FileUpload';
import { Staff } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const StaffManager = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [importData, setImportData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: 'บริหาร',
    type: 'ข้าราชการ' as Staff['type'],
    imageUrl: '',
    email: '',
    password: '',
    phone: '',
    education: '',
    uid: '',
    idCard: '',
    role: 'staff' as 'admin' | 'staff',
    status: 'approved' as 'pending' | 'approved' | 'rejected',
    order: 0,
    website: '',
    achievements: [] as any[],
    activities: [] as any[],
    certificates: [] as any[],
    bio: '',
    annualData: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await getAllStaff();
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('ไม่สามารถโหลดข้อมูลบุคลากรได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name || '',
        position: staff.position || '',
        department: staff.department || 'บริหาร',
        type: staff.type || 'ข้าราชการ',
        imageUrl: staff.imageUrl || '',
        email: staff.email || '',
        password: staff.password || '',
        phone: staff.phone || '',
        education: staff.education || '',
        uid: staff.uid || '',
        idCard: staff.idCard || '',
        role: staff.role || 'staff',
        status: staff.status || 'approved',
        order: staff.order || 0,
        website: staff.website || '',
        achievements: staff.achievements || [],
        activities: staff.activities || [],
        certificates: staff.certificates || [],
        bio: staff.bio || '',
        annualData: typeof staff.annualData === 'string' ? staff.annualData : (staff.annualData ? JSON.stringify(staff.annualData) : '')
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        position: '',
        department: 'บริหาร',
        type: 'ข้าราชการ',
        imageUrl: '',
        email: '',
        password: '',
        phone: '',
        education: '',
        uid: '',
        idCard: '',
        role: 'staff',
        status: 'approved',
        order: staffList.length,
        website: '',
        achievements: [],
        activities: [],
        certificates: [],
        bio: '',
        annualData: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading(editingStaff ? 'กำลังอัปเดตข้อมูล...' : 'กำลังบันทึกข้อมูล...');
    try {
      const dataToSubmit = { ...formData };
      
      // Try to parse annualData if it's a string
      if (typeof dataToSubmit.annualData === 'string' && dataToSubmit.annualData.trim()) {
        try {
          dataToSubmit.annualData = JSON.parse(dataToSubmit.annualData);
        } catch (e) {
          // If not valid JSON, keep as string or handle as needed
          console.warn('Annual data is not valid JSON, sending as string');
        }
      }

      if (editingStaff && editingStaff.id) {
        await updateStaff(editingStaff.id, dataToSubmit);
        toast.success('อัปเดตข้อมูลบุคลากรสำเร็จ', { id: toastId });
      } else {
        await createStaff(dataToSubmit);
        toast.success('เพิ่มบุคลากรใหม่สำเร็จ', { id: toastId });
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบุคลากรท่านนี้?')) {
      try {
        await deleteStaff(id);
        toast.success('ลบบุคลากรสำเร็จ');
        fetchStaff();
      } catch (error) {
        toast.error('ไม่สามารถลบข้อมูลได้');
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'ชื่อ-นามสกุล': 'นายสมชาย ใจดี',
        'ตำแหน่ง': 'ผู้อำนวยการโรงเรียน',
        'ฝ่าย/กลุ่มสาระ': 'บริหาร',
        'อีเมล': 'somchai@ksp.ac.th',
        'รหัสผ่าน': '123456',
        'เบอร์โทรศัพท์': '0812345678',
        'วุฒิการศึกษา': 'ปริญญาโท สาขาการศึกษาพิเศษ',
        'เลขบัตรประชาชน': '1234567890123',
        'ลำดับ': 1,
        'URL รูปภาพ': '',
        'เว็บไซต์ส่วนตัว': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff_Template");
    XLSX.writeFile(wb, "staff_import_template.xlsx");
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setImportData(data);
      setIsImportModalOpen(true);
    };
    reader.readAsBinaryString(file);
    // Reset input
    e.target.value = '';
  };

  const processImport = async () => {
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of importData) {
      try {
        const staffData = {
          name: item['ชื่อ-นามสกุล'] || '',
          position: item['ตำแหน่ง'] || '',
          department: item['ฝ่าย/กลุ่มสาระ'] || 'ครู',
          email: item['อีเมล'] || '',
          password: item['รหัสผ่าน'] || '',
          phone: item['เบอร์โทรศัพท์'] || '',
          education: item['วุฒิการศึกษา'] || '',
          idCard: String(item['เลขบัตรประชาชน'] || ''),
          order: parseInt(item['ลำดับ']) || 0,
          imageUrl: item['URL รูปภาพ'] || '',
          website: item['เว็บไซต์ส่วนตัว'] || '',
          role: 'staff',
          status: 'approved'
        };

        if (staffData.name) {
          await createStaff(staffData as any);
          successCount++;
        }
      } catch (error) {
        console.error('Import error for item:', item, error);
        failCount++;
      }
    }

    setIsImporting(false);
    setIsImportModalOpen(false);
    setImportData([]);
    toast.success(`นำเข้าข้อมูลสำเร็จ ${successCount} รายการ`, {
      description: failCount > 0 ? `ล้มเหลว ${failCount} รายการ` : undefined
    });
    fetchStaff();
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || staff.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">จัดการบุคลากร</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข หรือลบข้อมูลบุคลากรของโรงเรียน</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={downloadTemplate}
            className="bg-white text-gray-700 px-4 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm outline-none"
          >
            <FileDown size={20} /> ตัวอย่างไฟล์
          </button>
          <label className="bg-white text-indigo-600 px-4 py-3 rounded-xl font-bold border border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
            <FileUp size={20} /> นำเข้า Excel
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleFileImport}
            />
          </label>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 outline-none"
          >
            <Plus size={20} /> เพิ่มบุคลากรใหม่
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหรือตำแหน่ง..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="pl-12 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-medium text-gray-700 outline-none"
            >
              <option value="all">ทุกฝ่าย</option>
              <option value="บริหาร">ฝ่ายบริหาร</option>
              <option value="วิชาการ">ฝ่ายวิชาการ</option>
              <option value="ธุรการ">ฝ่ายธุรการ</option>
              <option value="บริการ">ฝ่ายบริการ</option>
              <option value="ครู">กลุ่มสาระการเรียนรู้</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-medium text-gray-700 outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ลำดับ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">บุคลากร</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ตำแหน่ง/ฝ่าย</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ติดต่อ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">สถานะ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-400">{staff.order || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          <img 
                            src={staff.imageUrl || "https://picsum.photos/seed/staff/100/100"} 
                            alt={staff.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{staff.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{staff.role === 'admin' ? 'ผู้ดูแลระบบ' : 'บุคลากร'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">{staff.position}</div>
                      <div className="text-xs text-indigo-600">{staff.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {staff.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={12} className="text-gray-400" /> {staff.email}
                          </div>
                        )}
                        {staff.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone size={12} className="text-gray-400" /> {staff.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {staff.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={10} /> อนุมัติแล้ว
                        </span>
                      ) : staff.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                          <AlertCircle size={10} /> รออนุมัติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                          <X size={10} /> ปฏิเสธ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(staff)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors outline-none"
                          title="แก้ไข"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => staff.id && handleDelete(staff.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors outline-none"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-gray-400">
                    <User size={48} className="mx-auto mb-4 opacity-20" />
                    <p>ไม่พบข้อมูลบุคลากร</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Preview Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">ตรวจสอบข้อมูลนำเข้า</h2>
                  <p className="text-gray-500 text-sm">พบข้อมูลทั้งหมด {importData.length} รายการ</p>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all outline-none">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">ตำแหน่ง</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">ฝ่าย</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">อีเมล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm">{item['ชื่อ-นามสกุล']}</td>
                        <td className="px-4 py-3 text-sm">{item['ตำแหน่ง']}</td>
                        <td className="px-4 py-3 text-sm">{item['ฝ่าย/กลุ่มสาระ']}</td>
                        <td className="px-4 py-3 text-sm">{item['อีเมล']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 outline-none"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={processImport}
                  disabled={isImporting}
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 outline-none"
                >
                  {isImporting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download size={20} />
                  )}
                  {isImporting ? 'กำลังนำเข้า...' : 'ยืนยันการนำเข้า'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    {editingStaff ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
                  </h2>
                  <p className="text-gray-500 text-sm">กรอกข้อมูลบุคลากรให้ครบถ้วนเพื่อแสดงบนหน้าบุคลากร</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm outline-none"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="เช่น นายสมชาย ใจดี"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ตำแหน่ง</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        required
                        type="text" 
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        placeholder="เช่น ผู้อำนวยการโรงเรียน"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ประเภทบุคลากร</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as Staff['type']})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none outline-none"
                    >
                      <option value="ข้าราชการ">ข้าราชการ</option>
                      <option value="พนักงานราชการ">พนักงานราชการ</option>
                      <option value="ลูกจ้าง">ลูกจ้าง</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ฝ่าย/กลุ่มสาระ</label>
                    <select 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none outline-none"
                    >
                      <option value="บริหาร">ฝ่ายบริหาร</option>
                      <option value="วิชาการ">ฝ่ายวิชาการ</option>
                      <option value="ธุรการ">ฝ่ายธุรการ</option>
                      <option value="บริการ">ฝ่ายบริการ</option>
                      <option value="ครู">กลุ่มสาระการเรียนรู้</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ลำดับการแสดงผล</label>
                    <input 
                      type="number" 
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ประวัติการศึกษา</label>
                    <textarea 
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      placeholder="ระบุประวัติการศึกษา..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-32 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">แนะนำตัวสั้นๆ (Bio)</label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="เขียนแนะนำตัวสั้นๆ..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-32 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">ข้อมูลรายปี (Annual Data)</label>
                    <textarea 
                      value={formData.annualData}
                      onChange={(e) => setFormData({...formData, annualData: e.target.value})}
                      placeholder="ระบุข้อมูลรายปี..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-32 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">เว็บไซต์ส่วนตัว (สำหรับผู้บริหาร)</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="url" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://example.com"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <FileUpload 
                      label="รูปภาพประจำตัว"
                      currentImageUrl={formData.imageUrl}
                      onUploadSuccess={(url) => setFormData(prev => ({...prev, imageUrl: url}))}
                      isCircle={true}
                    />
                    <div className="mt-2">
                      <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">หรือระบุ URL รูปภาพโดยตรง</label>
                      <div className="relative mt-1">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="url" 
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full pl-10 pr-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">อีเมล</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@ksp.ac.th"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">รหัสผ่าน (แอดมินดูได้)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="รหัสผ่าน"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">เบอร์โทรศัพท์</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="08x-xxx-xxxx"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">เลขบัตรประชาชน</label>
                    <input 
                      type="text" 
                      value={formData.idCard}
                      onChange={(e) => setFormData({...formData, idCard: e.target.value})}
                      placeholder="1234567890123"
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">สิทธิ์การใช้งาน</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'staff'})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none outline-none"
                    >
                      <option value="staff">บุคลากรทั่วไป (แก้ไขโปรไฟล์ตนเอง)</option>
                      <option value="admin">ผู้ดูแลระบบ (จัดการได้ทั้งหมด)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">สถานะการอนุมัติ</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'approved' | 'rejected'})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none outline-none"
                    >
                      <option value="pending">รอการอนุมัติ (Pending)</option>
                      <option value="approved">อนุมัติแล้ว (Approved)</option>
                      <option value="rejected">ปฏิเสธการเข้าใช้งาน (Rejected)</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Firebase UID (สำหรับให้เจ้าของแก้ไขข้อมูลเอง)</label>
                    <input 
                      type="text" 
                      value={formData.uid}
                      onChange={(e) => setFormData({...formData, uid: e.target.value})}
                      placeholder="วาง UID จาก Firebase Auth ที่นี่"
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium outline-none"
                    />
                    <p className="text-[10px] text-gray-400 ml-1">เจ้าของบัญชีสามารถดู UID ได้จากหน้าโปรไฟล์เมื่อเข้าสู่ระบบ</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl text-indigo-700 text-sm">
                  <AlertCircle size={18} />
                  <p>ข้อมูลบุคลากรจะถูกแสดงในหน้า "บุคลากร" ของเว็บไซต์</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all outline-none"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 outline-none disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={20} />
                    )}
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
