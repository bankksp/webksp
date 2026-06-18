import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, Phone, Mail, MapPin, Facebook, Globe, 
  LogIn, User, Settings, Search, ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useNewPostNotification } from '../hooks/useNewPostNotification';
import { getStaffByUid, getInfoDocuments } from '../services/dataService';
import { Staff } from '../types';
import { useSchoolInfo } from '../hooks/useSchoolInfo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { schoolInfo } = useSchoolInfo();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCategories, setCustomCategories] = useState<{ id: string, name: string }[]>(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_doc_categories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleUpdated = () => {
      try {
        const stored = localStorage.getItem('ksp_custom_doc_categories');
        setCustomCategories(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('ksp_categories_updated', handleUpdated);
    window.addEventListener('storage', handleUpdated);
    
    // Fetch info documents to discover custom categories for visitors who do not have localStorage
    const fetchCustomCategoriesFromDocs = async () => {
      try {
        const docs = await getInfoDocuments();
        if (docs && docs.length > 0) {
          const docCustomCategories = docs.reduce((acc, doc) => {
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

          if (docCustomCategories.length > 0) {
            setCustomCategories(prev => {
              const merged = [...prev];
              docCustomCategories.forEach(parsed => {
                const idx = merged.findIndex(c => c.id === parsed.id);
                if (idx >= 0) {
                  if (parsed.name && parsed.name !== parsed.id) {
                    merged[idx] = parsed;
                  }
                } else {
                  merged.push(parsed);
                }
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.error('Failed to pre-fetch custom categories on layout', err);
      }
    };

    fetchCustomCategoriesFromDocs();

    return () => {
      window.removeEventListener('ksp_categories_updated', handleUpdated);
      window.removeEventListener('storage', handleUpdated);
    };
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      if (user) {
        const staffData = await getStaffByUid(user.id);
        setStaff(staffData);
      } else {
        setStaff(null);
      }
    };
    fetchStaff();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/posts?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'nanthaphat@ksp.ac.th';

  const navLinks = [
    { name: 'หน้าแรก', href: '/' },
    { 
      name: 'ข้อมูลโรงเรียน', 
      href: '/about',
      sub: [
        { name: 'ประวัติโรงเรียน', href: '/about/history' },
        { name: 'วิสัยทัศน์และอัตลักษณ์', href: '/about/vision' },
        { name: 'ข้อมูลพื้นฐาน', href: '/about/basic' },
      ]
    },
    { 
      name: 'บุคลากร', 
      href: '/staff',
      sub: [
        { name: 'บอร์ดบริหาร', href: '/board' },
        { name: 'ทำเนียบผู้บริหาร', href: '/executives' },
        { name: 'ข้าราชการ', href: '/staff/civil-servants' },
        { name: 'พนักงานราชการ', href: '/staff/government-employees' },
        { name: 'ลูกจ้าง', href: '/staff/contract-employees' },
      ]
    },
    { 
      name: 'ผลงาน/ข่าวสาร', 
      href: '/posts',
      sub: [
        { name: 'ข่าวประชาสัมพันธ์', href: '/posts/news' },
        { name: 'การเผยแพร่ผลงาน', href: '/posts/publication' },
        { name: 'กิจกรรมโรงเรียน', href: '/posts/activity' },
        { name: 'Portfolio/ผลงาน', href: '/portfolio' },
      ]
    },
    { 
      name: 'สารสนเทศ', 
      href: '/info',
      sub: [
        { name: 'หลักสูตรโรงเรียน', href: '/info/curriculum' },
        { name: 'เอกสารดาวน์โหลด', href: '/info/download' },
        { name: 'สารสนเทศโรงเรียน', href: '/info/info' },
        { name: 'SAR ประจำปี', href: '/info/sar' },
        { name: 'แผนประจำปี', href: '/info/plan' },
        ...customCategories.map(c => ({ name: c.name, href: `/info/${c.id}` }))
      ]
    },
    { name: 'ติดต่อเรา', href: '/contact' },
    ...(isAdmin ? [{ name: 'จัดการระบบ', href: '/admin' }] : []),
  ];

  const handleLogin = () => navigate('/login');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';
  const shouldShowScrolled = scrolled || !isHomePage;

  return (
    <nav className={`sticky top-0 w-full z-50 bg-white shadow-md py-2 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl p-1 shadow-sm border border-gray-50 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src={schoolInfo?.logoUrl || "https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png"} 
                alt="Logo" 
                className="w-full h-full object-contain mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-shrink-0">
              <span className="font-bold text-xs sm:text-sm lg:text-[15px] xl:text-lg leading-tight text-gray-900 whitespace-nowrap">
                โรงเรียนกาฬสินธุ์ปัญญานุกูล
              </span>
              <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-medium uppercase tracking-wider text-indigo-600 whitespace-nowrap">
                kalasinpanyanukun school
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-3 h-16">
            {/* Search Button */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-1.5 xl:p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              title="ค้นหา"
            >
              <Search size={18} />
            </button>

            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group h-full flex items-center"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.href}
                  className="flex items-center gap-0.5 xl:gap-1 text-[12px] xl:text-sm font-bold transition-colors hover:text-indigo-500 whitespace-nowrap text-gray-700 h-full px-1 xl:px-2"
                >
                  {link.name}
                  {link.sub && <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </Link>
                {link.sub && activeDropdown === link.name && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 min-w-[14rem] max-w-[22rem] w-max pt-2 z-50"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 overflow-hidden ring-1 ring-black/5">
                      {link.sub.map((s) => (
                        <Link
                          key={s.name}
                          to={s.href}
                          className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold whitespace-nowrap truncate"
                          onClick={() => setActiveDropdown(null)}
                          title={s.name}
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
            
          <div className="flex items-center gap-4 ml-4">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all font-bold text-sm" title="จัดการระบบ">
                    <Settings size={18} />
                    <span>จัดการระบบ</span>
                  </Link>
                ) : (
                  <Link to="/staff/edit" className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors" title="แก้ไขข้อมูลส่วนตัว">
                    <User size={20} />
                  </Link>
                )}
                <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-600">
                  ออกระบบ
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/demo"
                  className="hidden sm:inline-flex text-indigo-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-50 transition-all border border-indigo-200"
                >
                  ดูตัวอย่าง
                </Link>
                <button 
                onClick={handleLogin}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
              >
                <LogIn size={16} /> เข้าสู่ระบบ
              </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-900 hover:text-indigo-500"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาข่าวสาร..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                  />
                </div>
              </form>

              {navLinks.map((link) => (
                <div key={link.name} className="border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.href}
                      className="flex-1 px-3 py-4 text-base font-bold text-gray-900 hover:text-indigo-600"
                      onClick={() => !link.sub && setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                    {link.sub && (
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                        className="p-4 text-gray-400 hover:text-indigo-600"
                      >
                        <ChevronDown size={20} className={`transition-transform duration-200 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  
                  {link.sub && activeDropdown === link.name && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pl-6 pb-4 space-y-1"
                    >
                      {link.sub.map((s) => (
                        <Link
                          key={s.name}
                          to={s.href}
                          className="block px-3 py-3 text-sm font-medium text-gray-500 hover:text-indigo-600 border-l-2 border-transparent hover:border-indigo-600 transition-all"
                          onClick={() => setIsOpen(false)}
                        >
                          {s.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
              <div className="pt-4 px-3">
                {user ? (
                  <div className="space-y-2">
                    {isAdmin ? (
                      <Link 
                        to="/admin" 
                        className="block w-full text-center bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold"
                        onClick={() => setIsOpen(false)}
                      >
                        จัดการระบบ
                      </Link>
                    ) : (
                      <Link 
                        to="/staff/edit" 
                        className="block w-full text-center bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold"
                        onClick={() => setIsOpen(false)}
                      >
                        แก้ไขข้อมูลส่วนตัว
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-center text-red-500 font-bold py-2"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-md"
                  >
                    เข้าสู่ระบบ
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">ค้นหาข้อมูล</h3>
                <button onClick={() => setSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="พิมพ์คำค้นหาที่นี่..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  ค้นหา
                </button>
              </form>
              <div className="mt-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">คำค้นหายอดนิยม</p>
                <div className="flex flex-wrap gap-2">
                  {['สมัครเรียน', 'ปฏิทินการศึกษา', 'ผลงานครู', 'กิจกรรมล่าสุด'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {setSearchQuery(tag);}}
                      className="px-4 py-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-sm font-bold transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-40 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:-translate-y-1"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const { schoolInfo } = useSchoolInfo();
  
  return (
    <footer className="bg-gray-900 text-white pt-8 md:pt-20 pb-6 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mb-8 md:mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-6 group">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg shadow-black/20 transition-transform group-hover:scale-110">
                <img 
                  src={schoolInfo?.logoUrl || "https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png"} 
                  alt="Logo" 
                  className="w-full h-full object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-base md:text-xl tracking-tighter">กาฬสินธุ์ปัญญานุกูล</span>
            </div>
            <p className="text-gray-400 text-[10px] md:text-sm leading-relaxed mb-4 md:mb-8">
              มุ่งมั่นพัฒนาศักยภาพผู้เรียนที่มีความต้องการจำเป็นพิเศษ ให้สามารถพึ่งพาตนเองและอยู่ในสังคมได้อย่างมีความสุขและมีคุณค่า
            </p>
            <div className="flex gap-3 md:gap-4">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors"><Facebook size={16} /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors"><Globe size={16} /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors"><Mail size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 md:mb-6 text-xs md:text-base">ลิงก์ที่สำคัญ</h4>
            <ul className="space-y-2 md:space-y-4 text-[10px] md:text-sm text-gray-400">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">หน้าแรก</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">เกี่ยวกับโรงเรียน</Link></li>
              <li><Link to="/posts" className="hover:text-indigo-400 transition-colors">ข่าวประชาสัมพันธ์</Link></li>
              <li><Link to="/staff" className="hover:text-indigo-400 transition-colors">บุคลากร</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 md:mb-6 text-xs md:text-base">ติดต่อเรา</h4>
            <ul className="space-y-2 md:space-y-4 text-[10px] md:text-sm text-gray-400">
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
                <span>เลขที่ 169 หมู่ 13 ตำบล ดอนสมบูรณ์ อำเภอ ยางตลาด จังหวัด กาฬสินธุ์ 46120</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Phone size={14} className="text-indigo-500 flex-shrink-0" />
                <span>043-840842</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Mail size={14} className="text-indigo-500 flex-shrink-0" />
                <span>kalasinpanyanukun@ksp.ac.th</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 md:mb-6 text-xs md:text-base">จดหมายข่าว</h4>
            <p className="text-[10px] md:text-sm text-gray-400 mb-3 md:mb-4">สมัครรับข่าวสารล่าสุดจากโรงเรียน</p>
            <div className="relative">
              <input type="email" placeholder="อีเมลของคุณ" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-[10px] md:text-sm" />
              <button className="absolute right-1.5 top-1.5 bg-indigo-600 text-white p-1 rounded-md hover:bg-indigo-700 transition-all">
                <Globe size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 md:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-[9px] md:text-xs text-gray-500 font-medium uppercase tracking-widest text-center">
          <p>© 2026 โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</p>
          <div className="flex gap-3 md:gap-6">
            <Link to="/privacy" className="hover:text-gray-300">นโยบายความเป็นส่วนตัว</Link>
            <Link to="/terms" className="hover:text-gray-300">ข้อกำหนดการใช้งาน</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};
