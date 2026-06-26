import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, User, ArrowLeft, Share2, 
  Bookmark, Clock, ChevronRight, Facebook, 
  Twitter, Link as LinkIcon, MessageCircle,
  Image as ImageIcon, Film, Maximize2, ExternalLink, Globe,
  Check, Eye, X, Phone, Mail, MessageSquare, PanelRightOpen, LayoutTemplate
} from 'lucide-react';
import { toast } from 'sonner';
import { getPostById, getPosts, getPostByShortId, incrementPostView, trackVisit, getSchoolInfo, fixDriveUrl, getNewsletterUrl, invalidatePostsCache } from '../services/dataService';
import { Post, SchoolInfo } from '../types';
import { SampleBadge, SampleBanner } from '../components/SampleBadge';
import { SITE_URL } from '../config';
import { createMetaDescription } from '../lib/excerpt';
import {
  NEWSLETTER_OG_WIDTH,
  NEWSLETTER_OG_HEIGHT,
  fetchNewsletterBlob,
  triggerNewsletterDownload,
} from '../lib/shareNewsletter';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getPostLink = (item: Post) => (item.shortId ? `/${item.shortId}` : `/p/${item.id}`);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      
      // Decode the ID in case it comes encoded from the URL
      const decodedId = decodeURIComponent(id);
      
      // Fetch school info for sidebar
      getSchoolInfo().then(setSchoolInfo);

      invalidatePostsCache();
      const looksLikeShortId = /^[a-z0-9\u0E00-\u0E7F_-]+$/i.test(decodedId) && !decodedId.includes('-');

      let data = looksLikeShortId
        ? await getPostByShortId(decodedId, { fresh: true })
        : await getPostById(decodedId, { fresh: true });
      if (!data) {
        data = looksLikeShortId
          ? await getPostById(decodedId, { fresh: true })
          : await getPostByShortId(decodedId, { fresh: true });
      }
      if (data?.id && !getNewsletterUrl(data)) {
        const byId = await getPostById(data.id, { fresh: true });
        if (byId && getNewsletterUrl(byId)) data = byId;
      }
      
      if (!data) {
        navigate('/posts');
        return;
      }
      setPost(data);
      
      // Increment view count & track visit (skip sample posts)
      if (data.id && !(data as { _isSample?: boolean })._isSample) {
        incrementPostView(data.id).then(res => {
          if (res?.success && res.views) {
            setPost(prev => prev ? { ...prev, views: res.views } : null);
          }
        });
        trackVisit(`Post: ${data.title.substring(0, 20)}...`);
      }
      
      const allPosts = await getPosts(data.category);
      setRecentPosts(allPosts?.filter(p => p.id !== data?.id && String(p.shortId ?? '') !== id).slice(0, 3) || []);
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (!post) return '';
    const origin = SITE_URL.replace(/\/$/, '') || window.location.origin;
    if (post.shortId) {
      return `${origin}/${post.shortId}`;
    }
    return `${origin}/p/${post.id}`;
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=520');
  };

  const shareOnFacebook = async () => {
    if (!post) return;
    const url = getShareUrl();
    const newsletter = getNewsletterUrl(post);
    const caption = `${post.title}\n\nอ่านต่อ: ${url}`;

    if (newsletter) {
      const imageUrl = fixMetaImageUrl(newsletter);
      const blob = await fetchNewsletterBlob(imageUrl);

      if (blob && typeof navigator.canShare === 'function') {
        const file = new File([blob], `newsletter-${post.shortId || 'ksp'}.jpg`, {
          type: blob.type || 'image/jpeg',
        });
        const shareData = { title: post.title, text: caption, files: [file] };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            toast.success('เลือก Facebook เพื่อโพสต์แผ่นข่าวแนวตั้ง');
            return;
          } catch (err) {
            if ((err as Error).name === 'AbortError') return;
          }
        }
      }

      try {
        await navigator.clipboard.writeText(caption);
        triggerNewsletterDownload(imageUrl, `newsletter-${post.shortId || 'ksp'}.jpg`);
        openShareWindow('https://www.facebook.com/');
        toast.message(
          'ดาวน์โหลดแผ่นข่าวแล้ว — สร้างโพสต์ใหม่ อัปโหลดรูปแนวตั้ง แล้ววางลิงก์จากคลิปบอร์ด',
          { duration: 10000 },
        );
        return;
      } catch {
        /* fallback to link share */
      }
    }

    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(post.title)}`,
    );
    toast.message('กำลังเปิดหน้าแชร์ลิงก์ Facebook');
  };

  const shareOnTwitter = () => {
    if (!post) return;
    const url = getShareUrl();
    openShareWindow(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`,
    );
    toast.message('กำลังเปิดหน้าแชร์ X (Twitter)');
  };

  const shareOnLine = () => {
    if (!post) return;
    const url = getShareUrl();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const lineUrl = isMobile
      ? `https://line.me/R/msg/text/?${encodeURIComponent(`${post.title}\n${url}`)}`
      : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`;
    openShareWindow(lineUrl);
    toast.message('กำลังเปิดหน้าแชร์ LINE');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return null;

  const isSample = Boolean((post as { _isSample?: boolean })._isSample);
  const newsletterUrl = getNewsletterUrl(post);

  const getNewsletterDisplayUrl = (url: string) => {
    const fixed = fixDriveUrl(url);
    if (fixed.includes('lh3.googleusercontent.com/d/') && !fixed.includes('=')) {
      return `${fixed}=w1200`;
    }
    return fixed;
  };

  const getDriveFolderId = (url: string) => {
    if (!url) return null;
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  };

  const driveFolderId = post.driveLink ? getDriveFolderId(post.driveLink) : null;

  const fixMetaImageUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return url;
    const driveRegex = /(?:drive\.google\.com\/(?:uc\?.*id=|file\/d\/|open\?.*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const metaDescription = createMetaDescription(post.content);
  const shareUrl = getShareUrl();
  const siteOrigin = SITE_URL.replace(/\/$/, '');
  const metaImageUrl = newsletterUrl
    ? post.shortId
      ? `${siteOrigin}/share-img/${post.shortId}`
      : post.id
        ? `${siteOrigin}/share-img/p/${post.id}`
        : fixMetaImageUrl(newsletterUrl)
    : post.imageUrl
      ? fixMetaImageUrl(post.imageUrl)
      : `${siteOrigin}/logo.png`;
  const metaImageIsNewsletter = Boolean(newsletterUrl);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: metaDescription,
    image: [metaImageUrl],
    datePublished: post.createdAt,
    author: {
      '@type': 'Organization',
      name: post.author || 'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์',
    },
    publisher: {
      '@type': 'Organization',
      name: 'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL.replace(/\/$/, '')}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': shareUrl,
    },
    inLanguage: 'th',
  };

  return (
    <div className="pt-20 bg-white min-h-screen">
      <Helmet>
        <title>{post.title} | โรงเรียนกาฬสินธุ์ปัญญานุกูล</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`โรงเรียนกาฬสินธุ์ปัญญานุกูล, ${post.category}, ${post.title}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="th_TH" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={post.title} />
        {metaImageIsNewsletter && (
          <>
            <meta property="og:image:width" content={String(NEWSLETTER_OG_WIDTH)} />
            <meta property="og:image:height" content={String(NEWSLETTER_OG_HEIGHT)} />
          </>
        )}
        <meta property="og:site_name" content="โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
        {post.createdAt && <meta property="article:published_time" content={post.createdAt} />}
        {post.author && <meta property="article:author" content={post.author} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={shareUrl} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImageUrl} />

        <link rel="canonical" href={shareUrl} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>
      {isSample && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <SampleBanner>เนื้อหานี้เป็นตัวอย่างสำหรับแสดงหน้าตาเว็บไซต์</SampleBanner>
        </div>
      )}
      {/* Hero Header */}
      <section className="relative h-[60vh] overflow-hidden">
        <img 
          src={post.imageUrl || "https://picsum.photos/seed/news/1920/1080"} 
          alt={post.title} 
          className="w-full h-full object-cover animate-pulse-slow"
          style={{ objectPosition: post.imagePosition || 'center' }}
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                {post.category}
              </span>
              {isSample && <SampleBadge className="!text-white !bg-amber-500/90 !ring-amber-300" />}
              <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Eye size={14} />
                  <span>{post.views || 0} เข้าชม</span>
                </div>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-8"
            >
              {post.title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 border-t border-white/20 pt-8"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <p className="text-white font-bold">{post.author}</p>
                <p className="text-white/60 text-sm">ผู้เขียนข่าวสาร</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content — full width */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
              <div className="flex items-center justify-between py-6 border-y border-gray-100 mb-12">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={20} /> ย้อนกลับ
                </button>
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100/50">
                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline ml-2">แชร์ข่าวนี้</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={shareOnFacebook}
                      title="แชร์แผ่นข่าวแนวตั้งบน Facebook"
                      className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-xl hover:shadow-blue-100 transition-all duration-500 transform hover:-translate-y-1.5 active:scale-95 group"
                    >
                      <Facebook size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={shareOnTwitter}
                      title="แชร์ไปยัง Twitter"
                      className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-black hover:bg-black hover:text-white hover:border-black hover:shadow-xl hover:shadow-gray-200 transition-all duration-500 transform hover:-translate-y-1.5 active:scale-95 group"
                    >
                      <Twitter size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={shareOnLine}
                      title="แชร์ไปยัง Line"
                      className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#06C755] hover:bg-[#06C755] hover:text-white hover:border-[#06C755] hover:shadow-xl hover:shadow-emerald-100 transition-all duration-500 transform hover:-translate-y-1.5 active:scale-95 group"
                    >
                      <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      title="คัดลอกลิงก์"
                      className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition-all duration-500 transform hover:-translate-y-1.5 active:scale-95 group ${
                        copied 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                          : 'bg-white border-gray-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100'
                      }`}
                    >
                      {copied ? <Check size={22} /> : <LinkIcon size={22} className="group-hover:scale-110 transition-transform" />}
                    </button>
                  </div>
                </div>
              </div>

              <div 
                className={`prose prose-indigo max-w-none text-gray-700 font-sarabun ql-editor-custom`}
                style={{ 
                  fontSize: 
                    post.fontSize === '1' ? '14px' :
                    post.fontSize === '2' ? '16px' :
                    post.fontSize === '3' ? '18px' :
                    post.fontSize === '4' ? '20px' :
                    post.fontSize === '5' ? '24px' :
                    post.fontSize === '6' ? '32px' :
                    post.fontSize === '7' ? '48px' : 
                    post.fontSize === '8' ? '60px' :
                    post.fontSize === '9' ? '72px' : 
                    post.fontSize === 'small' ? '14px' :
                    post.fontSize === 'large' ? '20px' : '16px',
                  lineHeight:
                    post.lineHeight === '-2' ? '1.0' :
                    post.lineHeight === '-1' ? '1.2' :
                    post.lineHeight === '0' ? '1.5' :
                    post.lineHeight === '1' ? '1.8' :
                    post.lineHeight === '2' ? '2.0' :
                    post.lineHeight === '3' ? '2.5' :
                    post.lineHeight === 'tight' ? '1.2' :
                    post.lineHeight === 'relaxed' ? '1.8' : '1.5'
                }}
              >
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    pre: ({node, ref, ...props}: any) => <div className="whitespace-pre-wrap font-sans text-inherit bg-transparent p-0 m-0" {...props} />,
                    code: ({node, ref, ...props}: any) => <span className="font-sans text-inherit bg-transparent p-0" {...props} />,
                    span: ({node, style, ref, ...props}: any) => {
                      let styleObj: any = style;
                      if (typeof style === 'string') {
                        try {
                          styleObj = (style as string).split(';').reduce((acc, rule) => {
                            const [key, value] = rule.split(':');
                            if (key && value) {
                              const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                              acc[camelKey] = value.trim();
                            }
                            return acc;
                          }, {} as Record<string, string>);
                        } catch (e) {
                          styleObj = {};
                        }
                      }
                      return <span style={styleObj} {...props} />;
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {newsletterUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="mt-10"
                >
                  <div className="rounded-[2rem] border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-center gap-3 mb-5">
                      <div className="h-px flex-1 bg-emerald-200/60" />
                      <p className="text-sm font-extrabold text-emerald-800 flex items-center gap-2 shrink-0">
                        <LayoutTemplate size={16} className="text-emerald-600" />
                        แผ่นข่าวพร้อมแชร์
                      </p>
                      <div className="h-px flex-1 bg-emerald-200/60" />
                    </div>
                    <div className="max-w-2xl mx-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedImage(getNewsletterDisplayUrl(newsletterUrl))}
                        className="group relative w-full block rounded-2xl overflow-hidden border border-emerald-100 bg-white shadow-md hover:shadow-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        aria-label="ขยายดูแผ่นข่าว"
                      >
                        <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/5 transition-colors z-10 pointer-events-none" />
                        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                          <Maximize2 size={12} /> ขยาย
                        </div>
                        <img
                          src={getNewsletterDisplayUrl(newsletterUrl)}
                          alt={`แผ่นประชาสัมพันธ์ - ${post.title}`}
                          className="relative z-0 w-full max-h-[min(85vh,780px)] object-contain mx-auto bg-gray-50"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.retried) {
                              img.dataset.retried = '1';
                              img.src = fixDriveUrl(newsletterUrl);
                            }
                          }}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-600/80 text-center mt-4 font-medium">
                      คลิกที่ภาพเพื่อดูแผ่นข่าวขนาดเต็ม
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Album Section */}
              {post.album && post.album.length > 0 && (
                <div className="pt-16 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                      <ImageIcon className="text-indigo-600" /> อัลบั้มรูปภาพและวิดีโอ
                    </h3>
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {post.album.map((item, index) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="group relative rounded-[2rem] overflow-hidden shadow-xl shadow-gray-100 aspect-video bg-gray-100 cursor-pointer"
                        onClick={() => item.type === 'image' && setSelectedImage(item.url)}
                      >
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                            <video 
                              src={item.url} 
                              controls
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="absolute top-4 right-4 z-10">
                          {item.type === 'image' ? (
                            <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg">
                              <ImageIcon size={16} className="text-indigo-600" />
                            </div>
                          ) : (
                            <div className="bg-indigo-600/90 backdrop-blur-md p-2 rounded-xl shadow-lg">
                              <Film size={16} className="text-white" />
                            </div>
                          )}
                        </div>

                        {item.type === 'image' && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                              <Maximize2 size={24} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Drive Album Section */}
              {post.driveLink && (
                <div className="pt-16 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                      <ImageIcon className="text-indigo-600" /> อัลบั้มรูปภาพเพิ่มเติม
                    </h3>
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </div>

                  <div className="bg-gray-50 rounded-[2.5rem] p-6 md:p-10 border border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                          <ImageIcon size={32} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">คลังรูปภาพและวิดีโอ</h4>
                          <p className="text-gray-500">แสดงไฟล์สื่อมัลติมีเดียทั้งหมดที่เกี่ยวข้อง</p>
                        </div>
                      </div>
                    </div>

                    {driveFolderId ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-inner h-[600px]">
                        <iframe 
                          src={`https://drive.google.com/embeddedfolderview?id=${driveFolderId}#grid`} 
                          width="100%" 
                          height="100%" 
                          frameBorder="0"
                          title="Media Album"
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">ไม่สามารถแสดงตัวอย่างอัลบั้มได้ในขณะนี้</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags/Footer */}
              <div className="pt-12 border-t border-gray-100 flex flex-wrap gap-4">
                <span className="text-gray-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                  <Bookmark size={16} /> แท็ก:
                </span>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all">
                  #{post.category}
                </span>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all">
                  #โรงเรียนกาฬสินธุ์ปัญญานุกูล
                </span>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all">
                  #การศึกษาพิเศษ
                </span>
              </div>
          </div>
        </div>
      </section>

      {/* Slide-out: related news + contact */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-indigo-600 text-white pl-3 pr-2 py-4 rounded-l-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:pl-4 transition-all flex flex-col items-center gap-1.5"
        aria-label="เปิดข่าวที่เกี่ยวข้องและติดต่อเรา"
      >
        <PanelRightOpen size={20} />
        <span className="text-[10px] font-bold tracking-wide [writing-mode:vertical-rl] rotate-180">
          ข่าวที่เกี่ยวข้อง
        </span>
      </button>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[90] bg-gray-900/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 z-[95] w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                <h2 className="font-extrabold text-gray-900">ข่าว & ติดต่อเรา</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  aria-label="ปิด"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-5 space-y-8">
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={20} /> ข่าวสารที่เกี่ยวข้อง
                  </h3>
                  <div className="space-y-6">
                    {recentPosts.map((item) => (
                      <Link
                        key={item.id}
                        to={getPostLink(item)}
                        onClick={() => setDrawerOpen(false)}
                        className="flex gap-4 group"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-200">
                          <img
                            src={item.imageUrl || 'https://picsum.photos/seed/news/200/200'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 font-bold text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            <Calendar size={10} />
                            {new Date(item.createdAt).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {recentPosts.length === 0 && (
                      <p className="text-gray-400 text-sm italic">ไม่มีข่าวสารที่เกี่ยวข้อง</p>
                    )}
                  </div>
                  <Link
                    to="/posts"
                    onClick={() => setDrawerOpen(false)}
                    className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all"
                  >
                    ดูข่าวทั้งหมด <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <h3 className="text-xl font-bold mb-3 relative z-10">ติดต่อหาเรา</h3>
                  <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">
                    หากคุณมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม สามารถติดต่อเราได้ทันทีผ่านช่องทางออนไลน์
                  </p>
                  <div className="space-y-3 relative z-10">
                    <a
                      href={schoolInfo?.facebook || 'https://www.facebook.com/kalasin.panyanukul'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white text-indigo-600 px-5 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                      <Facebook size={20} />
                      ติดต่อผ่าน Facebook
                    </a>
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${schoolInfo?.phone}`}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
                      >
                        <Phone size={16} /> โทรหาเรา
                      </a>
                      <a
                        href={`mailto:${schoolInfo?.email}`}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
                      >
                        <Mail size={16} /> อีเมล
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </motion.button>
            
            <motion.img
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
