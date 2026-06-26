import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, 
  Home, ChevronLeft, Menu, Bell, User, History, BookOpen,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

import { useSchoolInfo } from '../hooks/useSchoolInfo';
import { getSiteLogo } from '../constants/branding';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { schoolInfo } = useSchoolInfo();

  const menuItems = [
    { name: 'แดชบอร์ด', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'จัดการสมาชิก', icon: <User size={20} />, path: '/admin/users' },
    { name: 'จัดการข่าวสาร/ผลงาน', icon: <FileText size={20} />, path: '/admin/posts' },
    { name: 'จัดการบุคลากร', icon: <Users size={20} />, path: '/admin/staff' },
    { name: 'ทำเนียบผู้บริหาร', icon: <History size={20} />, path: '/admin/executives' },
    { name: 'จัดการสารสนเทศ/E-Book', icon: <BookOpen size={20} />, path: '/admin/info' },
    { name: 'สถิติการเข้าชม', icon: <BarChart3 size={20} />, path: '/admin/statistics' },
    { name: 'แก้ไขหน้าแรก', icon: <Home size={20} />, path: '/admin/home-editor' },
    { name: 'ข้อมูลโรงเรียน', icon: <Settings size={20} />, path: '/admin/school-info' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50 h-full"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden border border-indigo-100 p-0.5">
                  <img 
                    src={getSiteLogo(schoolInfo?.logoUrl)} 
                    alt="Logo" 
                    className="w-full h-full object-contain mix-blend-multiply" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-bold text-gray-900">Admin Panel</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">ออกจากระบบ</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium">
              <ChevronLeft size={16} /> กลับสู่หน้าเว็บ
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
