import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RefreshCw, ExternalLink, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { getPostByShortId, getNewsletterUrl, fixDriveUrl } from '../services/dataService';
import { createMetaDescription } from '../lib/excerpt';
import { SITE_URL } from '../config';
import { NEWSLETTER_OG_WIDTH, NEWSLETTER_OG_HEIGHT } from '../lib/shareNewsletter';
import { Post } from '../types';

function buildShareImageUrl(post: Post): string {
  const origin = SITE_URL.replace(/\/$/, '');
  if (getNewsletterUrl(post)) {
    if (post.shortId) return `${origin}/share-img/${post.shortId}`;
    if (post.id) return `${origin}/share-img/p/${post.id}`;
  }
  return '';
}

function buildSharePageUrl(post: Post): string {
  const origin = SITE_URL.replace(/\/$/, '');
  if (post.shortId) return `${origin}/${post.shortId}`;
  if (post.id) return `${origin}/p/${post.id}`;
  return origin;
}

export const LineSharePreview = () => {
  const [params, setParams] = useSearchParams();
  const shortId = params.get('id') || '32';
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageOk, setImageOk] = useState<boolean | null>(null);
  const [shareImgOk, setShareImgOk] = useState<boolean | null>(null);

  const load = async (id: string) => {
    setLoading(true);
    setImageOk(null);
    setShareImgOk(null);
    const data = await getPostByShortId(id, { fresh: true });
    setPost(data);
    setLoading(false);

    if (data) {
      const newsletter = getNewsletterUrl(data);
      if (newsletter) {
        const img = new Image();
        img.onload = () => setImageOk(true);
        img.onerror = () => setImageOk(false);
        img.src = fixDriveUrl(newsletter);
      }
      const shareUrl = buildShareImageUrl(data);
      if (shareUrl) {
        const img2 = new Image();
        img2.onload = () => setShareImgOk(true);
        img2.onerror = () => setShareImgOk(false);
        img2.src = shareUrl;
      }
    }
  };

  useEffect(() => {
    load(shortId);
  }, [shortId]);

  const newsletterUrl = post ? getNewsletterUrl(post) : undefined;
  const ogImage = post ? buildShareImageUrl(post) : '';
  const pageUrl = post ? buildSharePageUrl(post) : '';
  const ogTitle = post?.title || '';
  const ogDescription = post ? createMetaDescription(post.content) : '';

  return (
    <div className="min-h-screen bg-[#8cabd9] pt-20 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="mb-6 text-center">
          <span className="inline-block px-3 py-1 bg-white/90 text-green-800 text-xs font-bold rounded-full mb-3">
            ตัวอย่างก่อน Deploy — ยังไม่ขึ้นเว็บจริง
          </span>
          <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <MessageCircle size={22} /> ตัวอย่างแชร์ LINE
          </h1>
          <p className="text-white/80 text-sm mt-1">จำลองการ์ดลิงก์ที่ Linespider ควรเห็น</p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={shortId}
            onChange={(e) => setParams({ id: e.target.value })}
            placeholder="shortId เช่น 32"
            className="flex-1 px-4 py-2 rounded-xl border-0 text-sm font-medium"
          />
          <button
            type="button"
            onClick={() => load(shortId)}
            className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">กำลังโหลดข่าว…</div>
        ) : !post ? (
          <div className="bg-white rounded-2xl p-8 text-center text-red-500 font-medium">
            ไม่พบข่าว shortId &quot;{shortId}&quot;
          </div>
        ) : (
          <>
            {/* LINE chat bubble mock */}
            <div className="flex justify-end mb-6">
              <div className="max-w-[85%]">
                <p className="text-[10px] text-white/70 text-right mb-1">คุณ · ตอนนี้</p>
                <div className="bg-[#86e291] rounded-2xl rounded-tr-sm overflow-hidden shadow-lg">
                  <p className="px-3 pt-2 pb-1 text-[11px] text-gray-800 break-all">{pageUrl}</p>

                  {ogImage && shareImgOk !== false ? (
                    <div className="bg-white mx-1 mb-1 rounded-xl overflow-hidden border border-gray-100">
                      <img
                        src={ogImage.startsWith('http') && window.location.hostname === 'localhost'
                          ? fixDriveUrl(newsletterUrl!)
                          : ogImage}
                        alt={ogTitle}
                        className="w-full object-contain bg-gray-50"
                        style={{ maxHeight: '420px' }}
                        referrerPolicy="no-referrer"
                        onError={() => setShareImgOk(false)}
                      />
                      <div className="px-3 py-2.5 border-t border-gray-100">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2">{ogTitle}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ogDescription}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white mx-1 mb-1 rounded-xl px-3 py-3 border border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{ogTitle || 'โรงเรียนกาฬสินธุ์ปัญญานุกูล'}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                        {ogDescription || 'ไม่มีคำอธิบาย'}
                      </p>
                      {!newsletterUrl && (
                        <p className="text-xs text-amber-600 mt-2 font-medium">⚠ ข่าวนี้ยังไม่มีแผ่นข่าว</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnostics */}
            <div className="bg-white rounded-2xl p-5 space-y-3 text-sm shadow-lg">
              <h2 className="font-bold text-gray-900 border-b pb-2">ตรวจสอบก่อน Deploy</h2>

              <DiagRow
                ok={Boolean(newsletterUrl)}
                label="มีแผ่นข่าว (newsletterUrl)"
                detail={newsletterUrl ? 'พร้อมแชร์' : 'ต้องสร้าง/อัปโหลดแผ่นข่าวใน Admin ก่อน'}
              />
              <DiagRow
                ok={imageOk === true}
                label="โหลดรูปแผ่นข่าวได้"
                detail={newsletterUrl ? fixDriveUrl(newsletterUrl).slice(0, 60) + '…' : '—'}
              />
              <DiagRow
                ok={Boolean(ogImage)}
                label="og:image URL (หลัง deploy)"
                detail={ogImage || '—'}
              />
              <DiagRow
                ok={shareImgOk === true || (window.location.hostname === 'localhost' && imageOk === true)}
                label="/share-img/ endpoint"
                detail={
                  window.location.hostname === 'localhost'
                    ? 'ทดสอบบน localhost ใช้รูปต้นทางแทน — หลัง deploy จะใช้ ' + ogImage
                    : shareImgOk ? 'โหลดรูปผ่าน ksp.ac.th ได้' : 'รอ deploy หรือตรวจ /share-img/'
                }
              />

              <div className="pt-2 border-t space-y-1.5 text-xs text-gray-500 font-mono break-all">
                <p><span className="text-gray-400">og:title</span> → {ogTitle}</p>
                <p><span className="text-gray-400">og:description</span> → {ogDescription.slice(0, 80)}…</p>
                <p><span className="text-gray-400">og:image:size</span> → {NEWSLETTER_OG_WIDTH}×{NEWSLETTER_OG_HEIGHT}</p>
                <p><span className="text-gray-400">og:url</span> → {pageUrl}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {post.shortId && (
                <Link
                  to={`/${post.shortId}`}
                  className="flex items-center justify-center gap-2 py-3 bg-white rounded-xl text-sm font-bold text-indigo-600 hover:bg-gray-50"
                >
                  เปิดหน้าข่าวจริง <ExternalLink size={14} />
                </Link>
              )}
              <p className="text-center text-white/70 text-xs">
                หลัง deploy แล้ว แชร์ลิงก์ใหม่ใน LINE (หรือใส่ ?v=2 ท้าย URL เพื่อล้าง cache)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function DiagRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex gap-2 items-start">
      {ok ? (
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 break-all">{detail}</p>
      </div>
    </div>
  );
}
