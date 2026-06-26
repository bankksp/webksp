import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Users, BookOpen, Award, Bell, 
  Calendar, ChevronRight, Play, Globe, Search, Settings, X, ExternalLink,
  Star, Smile, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHomeConfig, getPosts, getSchoolInfo, trackVisit, getDetailedStats, loadDemoPageData } from '../services/dataService';
import { HomeConfig, Post, SchoolInfo } from '../types';
import { useAuth } from '../hooks/useAuth';
import { isSiteAdmin } from '../lib/auth';
import { getYoutubeId } from '../lib/utils';
import { createExcerpt } from '../lib/excerpt';
import { SampleBadge, SampleBanner } from '../components/SampleBadge';

const AnnouncementPopup = ({ config }: { config: HomeConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (config.announcementEnabled && config.announcementImageUrl) {
      // Check if already shown in this session (optional, but usually better)
      const hasShown = sessionStorage.getItem('announcement_shown');
      if (!hasShown) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('announcement_shown', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [config]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col">
            {/* Image Section */}
            <div className="relative overflow-hidden group bg-gray-100">
              {config.announcementLink ? (
                <a href={config.announcementLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <img 
                    src={config.announcementImageUrl} 
                    alt={config.announcementTitle || "Announcement"} 
                    className="w-full h-auto max-h-[90vh] object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                    <div className="bg-white/90 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-xl">
                      <ExternalLink className="text-indigo-600" size={24} />
                    </div>
                  </div>
                </a>
              ) : (
                <img 
                  src={config.announcementImageUrl} 
                  alt={config.announcementTitle || "Announcement"} 
                  className="w-full h-auto max-h-[90vh] object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Content Section - Only show if there's a title or link */}
            {(config.announcementTitle || config.announcementLink) && (
              <div className="p-6 text-center border-t border-gray-100">
                {config.announcementTitle && (
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    {config.announcementTitle}
                  </h2>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {config.announcementLink && (
                    <a 
                      href={config.announcementLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      ดูรายละเอียดเพิ่มเติม <ArrowRight size={18} />
                    </a>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center justify-center"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const getPostLink = (post: Post) => {
  if (post.shortId) return `/${post.shortId}`;
  return `/post/${post.id}`;
};

export const Home = ({ demoMode = false }: { demoMode?: boolean }) => {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [news, setNews] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Post[]>([]);
  const [publications, setPublications] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSampleBanner, setShowSampleBanner] = useState(demoMode);
  const { user } = useAuth();

  useEffect(() => {
    if (demoMode) {
      const demo = loadDemoPageData();
      setConfig(demo.config);
      setSchoolInfo(demo.schoolInfo);
      setNews(demo.news);
      setActivities(demo.activities);
      setPublications(demo.publications);
      setShowSampleBanner(true);
      setLoading(false);
      return;
    }

    const fetchCriticalData = async () => {
      try {
        const [homeConfig, info] = await Promise.all([
          getHomeConfig(),
          getSchoolInfo()
        ]);
        setConfig(homeConfig);
        setSchoolInfo(info);
        setShowSampleBanner(
          Boolean((homeConfig as { _isSample?: boolean })?._isSample) ||
            Boolean((info as { _isSample?: boolean })?._isSample),
        );
        setLoading(false);
        
        // Fetch secondary data in background
        fetchSecondaryData();
      } catch (error) {
        console.error('Error fetching critical home data:', error);
        setLoading(false);
      }
    };

    const fetchSecondaryData = async () => {
      try {
        const [newsPosts, activityPosts, publicationPosts] = await Promise.all([
          getPosts('news'),
          getPosts('activity'),
          getPosts('publication'),
        ]);

        setNews(newsPosts.slice(0, 6));
        setActivities(activityPosts.slice(0, 6));
        setPublications(publicationPosts.slice(0, 6));

        if (
          newsPosts.some((p) => (p as { _isSample?: boolean })._isSample) ||
          activityPosts.some((p) => (p as { _isSample?: boolean })._isSample)
        ) {
          setShowSampleBanner(true);
        }
        
        if (user) {
          setIsAdmin(isSiteAdmin(user));
        }
      } catch (error) {
        console.error('Error fetching secondary home data:', error);
      }
    };

    fetchCriticalData();
  }, [demoMode, user]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  // Video Modal
  const heroVideoId = config?.heroVideoUrl ? getYoutubeId(config.heroVideoUrl) : '';
  
  // Dynamic slides from config or fallback to defaults
  const slides = Array.isArray(config?.bannerSlides) && config.bannerSlides.length > 0 
    ? [...config.bannerSlides].sort((a, b) => (a.order || 0) - (b.order || 0)).map(slide => ({
        url: slide.imageUrl,
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        link: slide.link
      }))
    : [
        {
          url: config?.heroImageUrl || "https://picsum.photos/seed/school1/1920/580",
          title: config?.heroTitle || "",
          subtitle: config?.heroSubtitle || "",
          link: undefined
        }
      ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>หน้าแรก | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</title>
        <meta name="description" content="ยินดีต้อนรับสู่โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์ มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ" />
        <meta property="og:title" content="หน้าแรก | โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์" />
        <meta property="og:description" content="ยินดีต้อนรับสู่โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์ มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ" />
        <meta property="og:url" content={window.location.origin} />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>
      {config && <AnnouncementPopup config={config} />}
      {showSampleBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <SampleBanner />
        </div>
      )}
      {/* Hero Slider Section */}
      <section className="relative w-full overflow-hidden bg-gray-950 group">
        <div className="relative w-full aspect-video sm:aspect-[1920/580] max-h-[580px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={slides[currentSlide].url || "https://picsum.photos/seed/school1/1920/580"}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover bg-black"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              
              {/* Clickable overlay for the whole slide if link exists */}
              {slides[currentSlide].link && (
                slides[currentSlide].link.startsWith('http') ? (
                  <a 
                    href={slides[currentSlide].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
                    aria-label={slides[currentSlide].title || "Link to more info"}
                  />
                ) : (
                  <Link 
                    to={slides[currentSlide].link}
                    className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
                    aria-label={slides[currentSlide].title || "Link to more info"}
                  />
                )
              )}
              
              {/* Gradient overlay - only when text is present */}
              {(slides[currentSlide].title || slides[currentSlide].subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/60 sm:to-transparent z-10"></div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 z-30 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end sm:items-center pb-8 sm:pb-0 pointer-events-none">
            <AnimatePresence mode="wait">
              {(slides[currentSlide].title || slides[currentSlide].subtitle) && (
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="max-w-3xl w-full pointer-events-auto"
                >
                  <div className="inline-flex items-center gap-2 bg-indigo-600/60 backdrop-blur-md border border-indigo-500/30 text-white px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold mb-3 md:mb-6 shadow-lg">
                    <Bell size={14} className="flex-shrink-0" />
                    <span className="line-clamp-1">ข่าวสารล่าสุด: {news[0]?.title || 'เปิดรับสมัครนักเรียนใหม่ ปีการศึกษา 2569'}</span>
                  </div>
                  {slides[currentSlide].title && (
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-2 md:mb-6 drop-shadow-2xl">
                      {slides[currentSlide].title}
                    </h1>
                  )}
                  {slides[currentSlide].subtitle && (
                    <p className="text-xs sm:text-lg md:text-xl text-gray-100 mb-5 md:mb-10 leading-relaxed max-w-2xl drop-shadow-lg line-clamp-2 md:line-clamp-none">
                      {slides[currentSlide].subtitle}
                    </p>
                  )}
                  <div className="flex flex-row gap-3 md:gap-4">
                    {slides[currentSlide].link ? (
                      slides[currentSlide].link.startsWith('http') ? (
                        <a 
                          href={slides[currentSlide].link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-600 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 group relative z-30"
                        >
                          อ่านเพิ่มเติม <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                      ) : (
                        <Link 
                          to={slides[currentSlide].link}
                          className="bg-indigo-600 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 group relative z-30"
                        >
                          อ่านเพิ่มเติม <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )
                    ) : (
                      <button className="bg-indigo-600 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 group relative z-30">
                        อ่านเพิ่มเติม <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoOpen(true);
                      }}
                      className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 relative z-30"
                    >
                      <Play size={16} fill="currentColor" /> <span className="hidden sm:inline">ชมวิดีโอแนะนำ</span><span className="sm:hidden">วิดีโอ</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10 pointer-events-auto"
              >
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10 pointer-events-auto"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3 pointer-events-auto">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-10 bg-indigo-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setVideoOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${heroVideoId}?autoplay=1`} 
                title="School Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats/Features */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Users className="text-indigo-600" />, title: 'ทักษะชีวิต', desc: 'เน้นการฝึกทักษะการดำรงชีวิตประจำวันเพื่อพึ่งพาตนเอง' },
              { icon: <BookOpen className="text-purple-600" />, title: 'วิชาการ', desc: 'หลักสูตรที่ปรับให้เหมาะสมกับศักยภาพของผู้เรียนแต่ละคน' },
              { icon: <Award className="text-orange-600" />, title: 'อาชีพ', desc: 'เตรียมความพร้อมสู่การประกอบอาชีพตามความถนัด' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-4">
            <div>
              <span className="text-indigo-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 md:mb-4 block">ข่าวสารล่าสุด</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">ข่าวประชาสัมพันธ์</h2>
            </div>
            <Link to="/posts/news" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline text-sm md:text-base">
              ดูข่าวทั้งหมด <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {news.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <Link to={getPostLink(item)} className="relative h-56 block">
                  <img 
                    src={item.imageUrl || "https://picsum.photos/seed/news/600/400"} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: item.imagePosition || 'center' }}
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                      {item.category === 'news' ? 'ข่าวสาร' : 'กิจกรรม'}
                    </div>
                    {(item as { _isSample?: boolean })._isSample && <SampleBadge />}
                  </div>
                </Link>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Calendar size={14} />
                    <span>{new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <Link to={getPostLink(item)}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {createExcerpt(item.content, 120)}
                  </p>
                  <Link to={getPostLink(item)} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    อ่านต่อ <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      {activities.length > 0 && (
        <section className="py-12 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-4">
              <div>
                <span className="text-indigo-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 md:mb-4 block">กิจกรรมล่าสุด</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">กิจกรรมโรงเรียน</h2>
              </div>
              <Link to="/posts/activity" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline text-sm md:text-base">
                ดูกิจกรรมทั้งหมด <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {activities.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -10 }}
                  className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <Link to={getPostLink(item)} className="relative h-56 block">
                    <img 
                      src={item.imageUrl || "https://picsum.photos/seed/activity/600/400"} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                      style={{ objectPosition: item.imagePosition || 'center' }}
                      referrerPolicy="no-referrer" 
                      loading="lazy"
                    />
                  </Link>
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Calendar size={14} />
                      <span>{new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <Link to={getPostLink(item)}>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {createExcerpt(item.content, 120)}
                    </p>
                    <Link to={getPostLink(item)} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      อ่านต่อ <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Publications Section */}
      {publications.length > 0 && (
        <section className="py-12 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-4">
              <div>
                <span className="text-indigo-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 md:mb-4 block">ผลงานทางวิชาการ</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">การเผยแพร่ผลงาน</h2>
              </div>
              <Link to="/posts/publication" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline text-sm md:text-base">
                ดูผลงานทั้งหมด <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {publications.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <Link to={getPostLink(item)} className="relative h-56 block">
                    <img 
                      src={item.imageUrl || "https://picsum.photos/seed/pub/600/400"} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                      style={{ objectPosition: item.imagePosition || 'center' }}
                      referrerPolicy="no-referrer" 
                    />
                  </Link>
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Calendar size={14} />
                      <span>{new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <Link to={getPostLink(item)}>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {createExcerpt(item.content, 120)}
                    </p>
                    <Link to={getPostLink(item)} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      อ่านต่อ <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YouTube Videos Section */}
      {Array.isArray(config?.youtubeVideos) && config.youtubeVideos.length > 0 && (
        <section className="py-12 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">วิดีโอแนะนำ</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">วิดีโอกิจกรรมและผลงาน</h2>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...config.youtubeVideos]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((video, idx) => {
                  const videoId = getYoutubeId(video.url);
                  
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                    >
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{video.title}</h3>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Quick Links / Info */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative">
              <img 
                src={config?.quickInfoImageUrl || "https://picsum.photos/seed/school-life/800/600"} 
                alt="School Life" 
                className="rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full aspect-[4/3] object-cover" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute -bottom-4 md:-bottom-8 -right-4 md:-right-8 bg-indigo-600 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl">
                <h4 className="text-2xl md:text-3xl font-bold mb-0.5 md:mb-1">{config?.quickInfoStatsValue1 || "25+"}</h4>
                <p className="text-indigo-100 text-[10px] md:text-xs font-medium uppercase tracking-wider">{config?.quickInfoStatsLabel1 || "ปีแห่งการสร้างโอกาส"}</p>
              </div>
            </div>
            <div>
              <span className="text-indigo-600 font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-2 md:mb-3 block">ข้อมูลสารสนเทศ</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 leading-snug">
                {config?.quickInfoTitle || "เป้าหมายของเราคือ"}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-indigo-600 italic mb-5 md:mb-6 leading-snug">
                {config?.quickInfoSubtitle || "การสร้างอนาคตที่เท่าเทียม"}
              </p>
              <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
                {config?.quickInfoDescription || "โรงเรียนกาฬสินธุ์ปัญญานุกูล มุ่งเน้นการพัฒนาผู้เรียนอย่างรอบด้าน ทั้งทางร่างกาย จิตใจ สังคม และสติปัญญา เพื่อให้ผู้เรียนสามารถดำรงชีวิตอยู่ในสังคมได้อย่างมีความสุข"}
              </p>
              <div className="grid grid-cols-2 gap-3 md:gap-5 mb-6 md:mb-8">
                <div className="p-3 md:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-xl md:text-2xl font-bold text-indigo-600 mb-0.5">{config?.statsStudents || 0}+</h4>
                  <p className="text-gray-500 text-[10px] md:text-xs">นักเรียนปัจจุบัน</p>
                </div>
                <div className="p-3 md:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-xl md:text-2xl font-bold text-purple-600 mb-0.5">{config?.statsTeachers || 0}+</h4>
                  <p className="text-gray-500 text-[10px] md:text-xs">บุคลากรผู้เชี่ยวชาญ</p>
                </div>
              </div>
              <Link to="/info" className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-gray-900 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full text-sm md:text-base font-bold hover:bg-gray-800 transition-all shadow-lg">
                ดูข้อมูลสารสนเทศทั้งหมด <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Programs / Brands */}
      {config?.recommendedPrograms && config.recommendedPrograms.length > 0 && (
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">ลิงก์ที่เกี่ยวข้อง</span>
              <h2 className="text-3xl font-extrabold text-gray-900">ลิงก์ภายนอกและโปรแกรมที่เกี่ยวข้อง</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-12 items-center">
              {Array.isArray(config?.recommendedPrograms) && config.recommendedPrograms.map((program, idx) => (
                <motion.a
                  key={idx}
                  href={program.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="group flex flex-col items-center gap-4"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center justify-center group-hover:shadow-xl transition-all overflow-hidden">
                    <img 
                      src={program.imageUrl} 
                      alt={program.title} 
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-indigo-600 transition-colors">{program.title}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      <VisitorStats config={config} />
    </div>
  );
};

const VisitorStats = ({ config }: { config: HomeConfig | null }) => {
  const [stats, setStats] = useState<any>(null);
  const [accurateStats, setAccurateStats] = useState({ today: 0, month: 0, year: 0 });

  useEffect(() => {
    if (!config) return;
    const fetchStats = async () => {
      try {
        const [trackResult, detailedStats] = await Promise.all([
          trackVisit('Home'),
          getDetailedStats()
        ]);

        if (trackResult) setStats(trackResult);
        
        if (Array.isArray(detailedStats)) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const monthStr = now.toISOString().slice(0, 7);
          const yearStr = now.getFullYear().toString();

          const todayCount = detailedStats.filter((item: any) => item.timestamp && item.timestamp.startsWith(todayStr)).length;
          const monthCount = detailedStats.filter((item: any) => item.timestamp && item.timestamp.startsWith(monthStr)).length;
          const yearCount = detailedStats.filter((item: any) => item.timestamp && item.timestamp.includes(yearStr)).length;
          
          setAccurateStats({ today: todayCount, month: monthCount, year: yearCount });
        }
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-indigo-600 font-black tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-3 block"
          >
            Statistics & Activity
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter"
          >
            ข้อมูลสถิติจำนวนบุคลากรและนักเรียน
          </motion.h2>
        </div>

        <div className="space-y-8 md:space-y-12">
          {/* School Basic Stats - Minimalist & Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'ครูและบุคลากร', value: config?.statsTeachers || 0, icon: <Users size={18} /> },
              { label: 'ลูกจ้าง', value: config?.statsEmployees || 0, icon: <Star size={18} /> },
              { label: 'นักเรียน', value: config?.statsStudents || 0, icon: <BookOpen size={18} /> }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-indigo-50/30 backdrop-blur-md border border-indigo-100/50 rounded-2xl p-4 flex items-center justify-center gap-4 transition-all hover:bg-white hover:shadow-xl hover:border-indigo-200"
              >
                <div className="text-indigo-400 flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                    <Counter value={stat.value} />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visitor Stats Implementation Area */}
          <div className="space-y-8">
            <div className="text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter mb-4"
              >
                สถิติการเข้าชมเว็บไซต์
              </motion.h2>
              <div className="flex justify-center">
                <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {[
                { label: 'วันนี้', value: accurateStats.today || parseInt(stats.today || stats.today_visits) || 0, textColor: 'text-rose-500', borderColor: 'border-rose-200' },
                { label: 'เดือนนี้', value: accurateStats.month || 0, textColor: 'text-pink-500', borderColor: 'border-pink-200' },
                { label: 'ปีนี้', value: accurateStats.year || 0, textColor: 'text-purple-500', borderColor: 'border-purple-200' },
                { label: 'ทั้งหมด', value: parseInt(stats.total || stats.total_visits) || 0, textColor: 'text-blue-500', borderColor: 'border-blue-200' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ y: -3 }}
                  className={`bg-white/40 backdrop-blur-xl border ${stat.borderColor} rounded-[2rem] p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all shadow-sm hover:shadow-lg hover:bg-white/60 hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Users className={`${stat.textColor} opacity-80`} size={20} />
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                        <Counter value={stat.value} />
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">IP</span>
                    </div>
                  </div>
                  <div className="h-px w-6 bg-gray-100 mb-3"></div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Counter component for animated numbers
const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 2000; // 2 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};
