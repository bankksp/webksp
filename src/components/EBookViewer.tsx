import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, Maximize2, 
  Minimize2, Download, X, Loader2, ZoomIn, ZoomOut,
  FileText, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface EBookViewerProps {
  pdfUrl: string;
  title: string;
  onClose?: () => void;
}

export const EBookViewer: React.FC<EBookViewerProps> = ({ pdfUrl, title, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const flipBookRef = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('PDF Load Error:', err);
    setLoading(false);
    setError('ไม่สามารถโหลด E-Book ได้ในขณะนี้ กรุณาเปิดไฟล์ PDF โดยตรง');
  };

  const nextButton = () => {
    flipBookRef.current.pageFlip().flipNext();
  };

  const prevButton = () => {
    flipBookRef.current.pageFlip().flipPrev();
  };

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-gray-900/95 backdrop-blur-md transition-all ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Maximize2 size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest">E-Book Viewer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-white/10 rounded-xl p-1 mr-4">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"><ZoomOut size={18} /></button>
            <span className="px-3 text-white text-xs font-bold">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"><ZoomIn size={18} /></button>
          </div>
          
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <a 
            href={pdfUrl} 
            download 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
            title="Download PDF"
          >
            <Download size={20} />
          </a>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all ml-2"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-white font-bold animate-pulse">กำลังโหลดเนื้อหา E-Book...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 px-4 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
              <FileText size={40} />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold mb-2">{error}</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                ขออภัยในความไม่สะดวก ระบบ E-Book อาจมีปัญหากับไฟล์นี้ คุณสามารถเปิดอ่านไฟล์ PDF ได้โดยตรงผ่านปุ่มด้านล่าง
              </p>
            </div>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl flex items-center gap-2"
            >
              <Eye size={20} />
              เปิดไฟล์ PDF โดยตรง
            </a>
          </div>
        )}

        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex items-center justify-center"
          >
            {numPages && (
              <HTMLFlipBook
                width={500}
                height={700}
                size="stretch"
                minWidth={300}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1533}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={onPage}
                className="shadow-2xl"
                ref={flipBookRef}
                style={{}}
                startPage={0}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={false}
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="bg-white shadow-inner overflow-hidden">
                    <Page 
                      pageNumber={index + 1} 
                      width={500} 
                      scale={scale}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      className="max-w-full h-auto"
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      หน้า {index + 1} จาก {numPages}
                    </div>
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>

        {/* Navigation Controls */}
        {!loading && numPages && (
          <>
            <button 
              onClick={prevButton}
              disabled={currentPage === 0}
              className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl border border-white/10 z-20"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={nextButton}
              disabled={currentPage >= numPages - 1}
              className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl border border-white/10 z-20"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* Footer / Progress */}
      {!loading && numPages && (
        <div className="mt-6 px-4 pb-4">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">
              <span>จุดเริ่มต้น</span>
              <span>{currentPage + 1} / {numPages}</span>
              <span>จุดสิ้นสุด</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentPage + 1) / numPages) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
