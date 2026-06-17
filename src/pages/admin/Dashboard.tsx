import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Eye, TrendingUp, 
  Calendar, ArrowUpRight,
  PlusCircle, Settings, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPosts, getStaff, getExecutives, getInfoDocuments } from '../../services/dataService';
import { Post } from '../../types';
import { motion } from 'motion/react';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    staff: 0,
    executives: 0,
    documents: 0,
    views: 1240, // Mock for now
    growth: 12.5
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [posts, staff, executives, documents] = await Promise.all([
        getPosts(),
        getStaff(),
        getExecutives(),
        getInfoDocuments()
      ]);
      setStats(prev => ({
        ...prev,
        posts: posts?.length || 0,
        staff: staff?.length || 0,
        executives: executives?.length || 0,
        documents: documents?.length || 0
      }));
      setRecentPosts(posts?.slice(0, 5) || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'ข่าวสารทั้งหมด', value: stats.posts, icon: <FileText className="text-blue-600" />, growth: '+5.2%', color: 'blue' },
    { title: 'บุคลากร', value: stats.staff, icon: <Users className="text-indigo-600" />, growth: '+2.1%', color: 'indigo' },
    { title: 'ทำเนียบผู้บริหาร', value: stats.executives, icon: <TrendingUp className="text-purple-600" />, growth: '+0.5%', color: 'purple' },
    { title: 'เอกสาร/E-Book', value: stats.documents, icon: <Eye className="text-emerald-600" />, growth: '+1.2%', color: 'emerald' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ยินดีต้อนรับกลับมา!</h1>
          <p className="text-gray-500">นี่คือภาพรวมของเว็บไซต์โรงเรียนในวันนี้</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/posts" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
            <PlusCircle size={20} /> เพิ่มข่าวใหม่
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <ExternalLink size={20} /> ดูหน้าเว็บ
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}-50 group-hover:bg-${card.color}-600 group-hover:text-white transition-colors`}>
                {card.icon}
              </div>
              <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> {card.growth}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">ข่าวสารล่าสุด</h2>
            <Link to="/admin/posts" className="text-indigo-600 text-sm font-bold hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={post.imageUrl || "https://picsum.photos/seed/news/200/200"} 
                      alt={post.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold truncate mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {post.category === 'news' ? 'ข่าวสาร' : 'กิจกรรม'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                  <Link to={`/admin/posts`} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Settings size={20} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>ยังไม่มีข่าวสารในระบบ</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h2 className="text-2xl font-bold mb-4 relative z-10">จัดการหน้าแรก</h2>
            <p className="text-indigo-100 mb-8 relative z-10 leading-relaxed">ปรับแต่งรูปภาพ Hero, ข้อความต้อนรับ และวิดีโอแนะนำโรงเรียนได้ที่นี่</p>
            <Link to="/admin/home-editor" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all inline-block relative z-10">
              เริ่มปรับแต่ง
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">สถานะระบบ</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Google Sheets API</span>
                <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Authentication System</span>
                <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Google Drive Storage</span>
                <span className="text-gray-900 text-sm font-bold">Active</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-600 h-full w-[100%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
