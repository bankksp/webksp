import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Search, Filter, ArrowRight, 
  ChevronRight, Bookmark, Clock, User, Users, Tag,
  Image as ImageIcon, Film
} from 'lucide-react';
import { getPosts } from '../services/dataService';
import { createExcerpt } from '../lib/excerpt';
import { Post } from '../types';

const getPostLink = (post: Post) => {
  if (post.shortId) return `/${post.shortId}`;
  return `/post/${post.id}`;
};

export const Posts = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = category || 'all';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await getPosts(categoryParam === 'all' ? undefined : categoryParam);
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [categoryParam]);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.shortId && post.shortId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [
    { id: 'all', name: 'ทั้งหมด', color: 'bg-gray-100 text-gray-600' },
    { id: 'news', name: 'ข่าวประชาสัมพันธ์', color: 'bg-blue-100 text-blue-600' },
    { id: 'activity', name: 'กิจกรรมโรงเรียน', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'publication', name: 'วารสาร/ผลงาน', color: 'bg-purple-100 text-purple-600' },
    { id: 'info', name: 'สารสนเทศ', color: 'bg-orange-100 text-orange-600' },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"
              >
                <Tag size={16} />
                {categories.find(c => c.id === categoryParam)?.name || 'ข่าวสารและกิจกรรม'}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
              >
                ข่าวสารและ <br /> <span className="text-indigo-600">กิจกรรมล่าสุด</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-500 leading-relaxed"
              >
                ติดตามข่าวสารล่าสุด กิจกรรมที่น่าสนใจ และผลงานความสำเร็จของโรงเรียนกาฬสินธุ์ปัญญานุกูล
              </motion.p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/posts/${cat.id}`)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                    categoryParam === cat.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-1' 
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
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
              placeholder="ค้นหาข่าวสาร กิจกรรม หรือผลงาน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg outline-none"
            />
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 group flex flex-col h-full"
                >
                  <Link to={getPostLink(post)} className="relative h-72 overflow-hidden bg-gray-100 block">
                    <img 
                      src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/600`} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      style={{ objectPosition: post.imagePosition || 'center' }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-1.5 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg ${
                        categories.find(c => c.id === post.category)?.color || 'bg-white/90 text-indigo-600'
                      }`}>
                        {categories.find(c => c.id === post.category)?.name || post.category}
                      </span>
                    </div>
                    {post.album && post.album.length > 0 && (
                      <div className="absolute top-6 right-6 flex gap-2">
                        <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                          <ImageIcon size={12} />
                          <span>{post.album.filter(i => i.type === 'image').length}</span>
                        </div>
                        {post.album.some(i => i.type === 'video') && (
                          <div className="px-3 py-1.5 bg-indigo-600/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                            <Film size={12} />
                            <span>{post.album.filter(i => i.type === 'video').length}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-white text-xs font-bold flex items-center gap-2">
                        อ่านรายละเอียดเพิ่มเติม <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-6 font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-400" />
                        <span>{new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-indigo-400" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <Link to={getPostLink(post)}>
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                      {createExcerpt(post.content, 120)}
                    </p>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <Link to={getPostLink(post)} className="text-indigo-600 font-bold text-sm flex items-center gap-2 group/btn">
                        อ่านต่อ <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                            <img src={`https://picsum.photos/seed/user${i}/50/50`} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Bookmark size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลข่าวสาร</h3>
              <p className="text-gray-500">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / Subscription */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-6 leading-tight">ไม่พลาดทุกความเคลื่อนไหว <br /> <span className="text-indigo-400">ติดตามข่าวสารจากเรา</span></h2>
              <p className="text-gray-400 text-lg mb-10">รับข่าวสารประชาสัมพันธ์ กิจกรรม และผลงานของโรงเรียนส่งตรงถึงคุณ</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="กรอกอีเมลของคุณ..." 
                  className="flex-1 px-8 py-4 bg-white/10 border border-white/20 rounded-full focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder-gray-500"
                />
                <button className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">
                  สมัครรับข่าวสาร
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                    <Clock className="text-indigo-400 mb-4" size={32} />
                    <h4 className="font-bold text-xl mb-2">อัปเดตทุกวัน</h4>
                    <p className="text-gray-500 text-sm">ข่าวสารกิจกรรมที่เกิดขึ้นจริงในโรงเรียน</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm translate-x-12">
                    <Bookmark className="text-purple-400 mb-4" size={32} />
                    <h4 className="font-bold text-xl mb-2">คลังความรู้</h4>
                    <p className="text-gray-500 text-sm">รวบรวมวารสารและผลงานทางวิชาการ</p>
                  </div>
                </div>
                <div className="pt-12">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                    <Users className="text-emerald-400 mb-4" size={32} />
                    <h4 className="font-bold text-xl mb-2">ชุมชน</h4>
                    <p className="text-gray-500 text-sm">พื้นที่แห่งการแบ่งปันความสำเร็จของผู้เรียน</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
