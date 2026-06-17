import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Download, Eye, Calendar, 
  Search, Filter, FileText, ChevronRight,
  Bookmark, Award, Layout, Book
} from 'lucide-react';
import { getInfoDocuments, fixDriveUrl } from '../services/dataService';
import { InfoDocument } from '../types';

export const Information = () => {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<InfoDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const categoryParam = category || 'all';

  const [customCategories, setCustomCategories] = useState<{ id: string, name: string }[]>(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_doc_categories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_doc_categories');
      setCustomCategories(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error(e);
    }
  }, [categoryParam]);

  const defaultCategories = [
    { id: 'all', name: 'ทั้งหมด', icon: <Layout size={18} />, color: 'bg-gray-100 text-gray-600' },
    { id: 'curriculum', name: 'หลักสูตรโรงเรียน', icon: <Book size={18} />, color: 'bg-blue-100 text-blue-600' },
    { id: 'download', name: 'เอกสารดาวน์โหลด', icon: <Download size={18} />, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'info', name: 'สารสนเทศโรงเรียน', icon: <FileText size={18} />, color: 'bg-purple-100 text-purple-600' },
    { id: 'sar', name: 'SAR ประจำปี', icon: <Award size={18} />, color: 'bg-orange-100 text-orange-600' },
    { id: 'plan', name: 'แผนประจำปี', icon: <Calendar size={18} />, color: 'bg-indigo-100 text-indigo-600' },
  ];

  // Dynamically discover more custom categories and names from documents array
  const docCustomCategories = documents.reduce((acc, doc) => {
    const cat = doc.category || '';
    if (cat.startsWith('custom-')) {
      let id = cat;
      let name = cat;
      if (cat.includes(':')) {
        const parts = cat.split(':');
        id = parts[0];
        name = parts.slice(1).join(':');
      }
      if (!acc.some(c => c.id === id)) {
        acc.push({ id, name });
      }
    }
    return acc;
  }, [] as { id: string, name: string }[]);

  // Merge local storage categories & parsed custom categories (preferring parsed names from files)
  const mergedCustomCategories = [...customCategories];
  docCustomCategories.forEach(parsed => {
    const existingIdx = mergedCustomCategories.findIndex(c => c.id === parsed.id);
    if (existingIdx >= 0) {
      if (parsed.name && parsed.name !== parsed.id) {
        mergedCustomCategories[existingIdx] = parsed;
      }
    } else {
      mergedCustomCategories.push(parsed);
    }
  });

  const categories = [
    ...defaultCategories,
    ...mergedCustomCategories.map(c => ({
      id: c.id,
      name: c.name,
      icon: <FileText size={18} />,
      color: 'bg-teal-100 text-teal-600'
    }))
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getInfoDocuments();
      setDocuments(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const activeDocs = categoryParam === 'all' 
    ? documents 
    : documents.filter(doc => {
        const docCat = doc.category || '';
        if (docCat === categoryParam) return true;
        if (docCat.startsWith(categoryParam + ':')) return true;
        return false;
      });

  const filteredDocs = activeDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getThumbnail = (doc: InfoDocument) => {
    if (doc.thumbnailUrl) return doc.thumbnailUrl;
    if (doc.pdfUrl) {
      const thumb = fixDriveUrl(doc.pdfUrl, false);
      // If fixDriveUrl returned a different URL (meaning it matched Drive), use it
      if (thumb !== doc.pdfUrl) return thumb;
    }
    return `https://picsum.photos/seed/${doc.id}/600/800`;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const getTitle = () => {
    const cat = categories.find(c => c.id === categoryParam);
    return cat ? cat.name : 'สารสนเทศและเอกสาร';
  };

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <Helmet>
        <title>{getTitle()} | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="คลังข้อมูลและเอกสารเผยแพร่ รวบรวมหลักสูตร แผนงาน รายงานประจำปี และเอกสารสำคัญต่างๆ ของโรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:title" content={`${getTitle()} | โรงเรียนกาฬสินธุ์ปัญญานุกูล`} />
        <meta property="og:description" content="คลังข้อมูลและเอกสารเผยแพร่ รวบรวมหลักสูตร แผนงาน รายงานประจำปี และเอกสารสำคัญต่างๆ ของโรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 skew-x-12 translate-x-1/2 hidden lg:block" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 lg:gap-12">
            <div className="w-full lg:max-w-xl xl:max-w-2xl flex-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs sm:text-sm font-bold mb-5"
              >
                <BookOpen size={16} />
                สารสนเทศและเอกสาร
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight break-words"
              >
                คลังข้อมูล <span className="text-indigo-600">และเอกสารเผยแพร่</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl"
              >
                รวบรวมหลักสูตร แผนงาน รายงานประจำปี และเอกสารสำคัญต่างๆ ในรูปแบบไฟล์ PDF ที่เข้าถึงง่ายและรวดเร็ว
              </motion.p>
            </div>
            
            <div className="w-full lg:max-w-xl xl:max-w-2xl lg:ml-auto flex-shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/info/${cat.id}`)}
                    className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-3 border text-left min-w-0 ${
                      categoryParam === cat.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-indigo-600 -translate-y-0.5' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-100 hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <span className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                      categoryParam === cat.id ? 'bg-indigo-500 text-white' : cat.color || 'bg-gray-100 text-gray-600'
                    }`}>
                      {cat.icon}
                    </span>
                    <span className="truncate flex-1 whitespace-nowrap min-w-0" title={cat.name}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาเอกสารหรือสารสนเทศ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg outline-none"
            />
          </div>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc, idx) => (
                <motion.div
                  layout
                  key={doc.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 group flex flex-col h-full"
                >
                  <a 
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-[3/4] overflow-hidden bg-gray-100 block group/img"
                  >
                    <img 
                      src={getThumbnail(doc)} 
                      alt={doc.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-1.5 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg ${
                        categories.find(c => c.id === doc.category)?.color || 'bg-white/90 text-indigo-600'
                      }`}>
                        {categories.find(c => c.id === doc.category)?.name || doc.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-xl hover:scale-110 transition-transform">
                        <Eye size={28} />
                      </div>
                    </div>
                  </a>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-gray-400 text-[10px] mb-4 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-indigo-400" />
                        <span>{doc.year || new Date(doc.createdAt).getFullYear() + 543}</span>
                      </div>
                    </div>
                    <a 
                      href={doc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-extrabold text-gray-900 mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight block"
                    >
                      {doc.title}
                    </a>
                    <p className="text-gray-500 text-xs mb-8 line-clamp-2 leading-relaxed flex-1">
                      {doc.description || 'คลิกเพื่อเปิดอ่านเนื้อหาในรูปแบบไฟล์ PDF'}
                    </p>
                    <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                      <a 
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 group/btn"
                      >
                        <FileText size={14} />
                        เปิดอ่านเอกสาร <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                      <div className="flex items-center justify-end px-1">
                        <a 
                          href={doc.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-[10px] font-bold"
                          title="เปิดอ่าน PDF"
                        >
                          <Download size={18} />
                          เปิดอ่าน PDF
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Bookmark size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลเอกสาร</h3>
              <p className="text-gray-500">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
            </div>
          )}
        </div>
      </section>

      {/* Document Viewer Modal removed as requested */}
    </div>
  );
};
