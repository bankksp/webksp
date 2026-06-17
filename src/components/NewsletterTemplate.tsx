import React, { forwardRef } from 'react';
import { Post, SchoolInfo, Executive } from '../types';
import parse from 'html-react-parser';

interface NewsletterTemplateProps {
  post: Post;
  schoolInfo: SchoolInfo | null;
  executives: Executive[];
  customText?: string;
  customDirectorName?: string;
  customDirectorImage?: string;
  customDirectorPosition?: string;
}

// Image proxy to bypass CORS for canvas screenshot
const getProxyUrl = (url: string) => {
  if (!url) return 'https://placehold.co/600x400/png';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.includes('wsrv.nl')) return url;
  
  // If it's an lh3.googleusercontent.com/d/url, it might be low res. 
  // Let's proxy it via wsrv.nl by converting it back to a drive uc URL or just letting wsrv.nl handle the lh3 URL.
  let targetUrl = url;
  if (url.includes('lh3.googleusercontent.com/d/')) {
    const fileId = url.split('/').pop()?.split('=')[0];
    if (fileId) {
      targetUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  } else if (url.includes('lh3.googleusercontent.com')) {
    // Other lh3 urls might support =s1600
    if (!url.includes('=')) {
      return url + '=s1600';
    }
    return url;
  }
  
  // Add a unique query param to bypass cache if it's not from our bypass list
  const cacheBuster = `&t=${Date.now()}`;
  return `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}&output=jpeg&q=95&w=1600&fit=cover${cacheBuster}`;
};

export const NewsletterTemplate = forwardRef<HTMLDivElement, NewsletterTemplateProps>(({ post, schoolInfo, executives, customText, customDirectorName, customDirectorImage, customDirectorPosition }, ref) => {
  // We need to format the post date
  const dateObj = new Date(post.createdAt || new Date());
  const formattedDate = dateObj.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const year = dateObj.getFullYear() + 543;

  // Filter 1 director
  let dir = executives.find(e => e.position && e.position.includes('ผู้อำนวยการ') && !e.position.includes('รอง'));
  
  // Fallback if no specific director found
  if (!dir && executives.length > 0) {
    dir = executives[0];
  }

  const finalDirectorName = customDirectorName || dir?.name || '';
  const finalDirectorImage = customDirectorImage || dir?.imageUrl || '';
  const finalDirectorPosition = customDirectorPosition || dir?.position || 'ผู้อำนวยการสถานศึกษา';

  const displayExecs = finalDirectorImage ? [{ id: 'dir', name: finalDirectorName, position: finalDirectorPosition, imageUrl: finalDirectorImage }] : [];

  // Use the first image from the album as the cover, fallback to post cover or schoolInfo banner
  const bannerBg = (post.album && post.album.length > 0 && post.album[0].url) 
    ? post.album[0].url 
    : (post.imageUrl || schoolInfo?.aboutImageUrl || "https://images.unsplash.com/photo-1592289901416-52c6f39cd5ea?auto=format&fit=crop&q=80&w=1200&h=400");
  const logo = schoolInfo?.logoUrl || "https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png";

  return (
    <div 
      ref={ref} 
      className="bg-white" 
      style={{
        width: '1200px',
        height: '1697px', // A4 ratio 1:1.414 (1200x1697)
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Sarabun', sans-serif"
      }}
    >
      {/* Top Banner section */}
      <div className="relative h-[530px] shrink-0 bg-white">
        
        {/* Background Image & Executives (Top 440px) */}
        <div className="absolute top-0 left-0 right-0 h-[440px] overflow-hidden">
          <img 
            src={getProxyUrl(bannerBg)} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Background" 
            crossOrigin="anonymous" 
            style={{ filter: 'contrast(1.05) saturate(1.2)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-indigo-900/10 to-transparent h-[200px]"></div>
          
          {/* Logo and School Name (Top Leftish Center) */}
          <div className="absolute top-10 left-10 flex items-center gap-5 z-40 max-w-fit bg-black/60 p-4 rounded-3xl border border-white/20">
            <div className="bg-white rounded-2xl p-2 shrink-0">
              <img src={getProxyUrl(logo)} alt="Logo" className="w-[90px] h-[90px] object-contain" crossOrigin="anonymous" />
            </div>
            <div className="text-white mt-1 whitespace-nowrap" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <h1 className="text-[36px] font-black mb-0 tracking-tight leading-[1.1]">{schoolInfo?.name || "โรงเรียนกาฬสินธุ์ปัญญานุกูล"}</h1>
              <p className="text-[18px] font-bold text-yellow-300 mt-1">{schoolInfo?.slogan || "มุ่งมั่นพัฒนาวิชาการ สร้างเสริมคุณธรรม"}</p>
            </div>
          </div>

          {/* Executive Photos Row */}
          <div className="absolute bottom-[90px] right-12 flex justify-end items-end z-30 pointer-events-none">
            {displayExecs.map((exec, index) => {
              return (
                <div key={exec.id || index} className="relative flex flex-col items-center z-50 mx-1">
                  <div className="w-[240px] h-[240px] rounded-full overflow-hidden border-[6px] border-yellow-400 ring-[6px] ring-[#1e2a5e] shadow-[0_15px_30px_rgba(0,0,0,0.4)] bg-gradient-to-b from-blue-50 to-white relative mb-2">
                    <img src={getProxyUrl(exec.imageUrl)} className="w-full h-full object-cover object-top" crossOrigin="anonymous" alt={exec.name} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ribbons */}
        <div className="absolute bottom-0 left-0 right-0 h-[170px] z-40 flex items-end">
          {/* Left Dark Blue Ribbon */}
          <div className="w-[62%] h-[130px] bg-[#1e2a5e] relative pt-4 pl-12 shadow-[10px_0_20px_rgba(0,0,0,0.4)] z-20 flex flex-col justify-center pb-2" style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)' }}>
             <h2 className="text-[80px] font-black text-white mb-0 tracking-tighter leading-none" style={{ fontFamily: 'Sarabun, sans-serif', textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>จดหมายข่าว</h2>
             <div className="text-white/90 text-xl font-medium tracking-wide mt-2 ml-2">
               ฉบับที่ {post.shortId || "1"} | วันที่ {formattedDate}
             </div>
          </div>
          
          {/* Right Yellow/Orange Ribbon Base */}
          <div className="absolute right-0 bottom-0 h-[90px] w-[50%] z-10" style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffbf00] to-[#ff9800] shadow-inner"></div>
            {/* Decorative slashes */}
            <div className="absolute top-0 bottom-0 left-[12%] w-3 bg-[#e68a00] transform -skew-x-[20deg]"></div>
            <div className="absolute top-0 bottom-0 left-[15%] w-1 bg-[#e68a00] transform -skew-x-[20deg]"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pl-16 pr-6 text-[#1e2a5e] pt-1">
              <p className="text-[26px] font-black leading-tight tracking-tight">{finalDirectorName}</p>
              <p className="text-[18px] font-bold tracking-tight">{finalDirectorPosition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white p-16 pt-12 flex flex-col items-center">
        <h3 className="text-4xl font-bold text-center text-indigo-950 mb-12 w-[90%] leading-snug">
          {post.title}
        </h3>

        {/* Images Grid */}
        <div className="w-full mb-12 z-10 relative">
          {post.album && post.album.length > 1 ? (
            <div className={`grid gap-4 ${post.album.length >= 5 ? 'grid-cols-3' : (post.album.length === 4 ? 'grid-cols-3' : 'grid-cols-2')}`}>
              {post.album.slice(1, 7).map((media, idx) => (
                <div key={idx} className="h-48 rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100 flex items-center justify-center">
                  <img src={getProxyUrl(media.url)} className="w-full h-full object-cover" crossOrigin="anonymous" alt={`Gallery ${idx}`} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Post Text snippet */}
        <div className="w-full text-[22px] text-gray-800 leading-relaxed font-sarabun text-justify flex-1 z-10 relative" style={{ whiteSpace: 'pre-wrap' }}>
          {customText !== undefined ? customText : parse(post.content || '')}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 h-24 relative overflow-hidden flex items-center justify-between text-white font-bold px-12 gap-6 shadow-inner mt-auto bg-[#1e2a5e] border-t-8 border-yellow-400">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 opacity-10"></div>
        <div className="relative z-10 whitespace-nowrap shrink-0">
          <p className="text-[22px]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>งานประชาสัมพันธ์ ksp</p>
        </div>
        <div className="relative z-10 flex items-center justify-end gap-5 flex-1 text-[16px]">
           <p className="flex items-center gap-1.5 whitespace-nowrap">🌐 ksp.ac.th</p>
           <p className="flex items-center gap-1.5 whitespace-nowrap">📞 043-840842</p>
           <p className="flex items-center gap-1.5 whitespace-nowrap">✉️ kalasinpanyanukun@ksp.ac.th</p>
        </div>
      </div>
    </div>
  );
});

NewsletterTemplate.displayName = 'NewsletterTemplate';
