import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Loader2, Image as ImageIcon, Film, Plus } from 'lucide-react';
import { uploadFile, fixDriveUrl } from '../services/dataService';
import { toast } from 'sonner';
import { MediaItem } from '../types';
import { motion, Reorder } from 'motion/react';
import imageCompression from 'browser-image-compression';

interface AlbumUploadProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  label?: string;
}

export const AlbumUpload: React.FC<AlbumUploadProps> = ({ 
  items = [] as MediaItem[], 
  onChange, 
  label = "อัลบั้มรูปภาพและวิดีโอ" 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploading(true);
    const newItems = [...items];

    for (const file of files) {
      // Validate file size (max 20MB for GAS/Drive)
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 20MB`);
        continue;
      }

      const fileType = file.type || '';
      const fileName = file.name.toLowerCase();
      const isVideo = fileType.startsWith('video/');
      const isImage = fileType.startsWith('image/') || 
                      fileName.endsWith('.heic') || 
                      fileName.endsWith('.heif') ||
                      fileName.endsWith('.hevc');

      if (!isVideo && !isImage) {
        toast.error(`ไฟล์ ${file.name} ไม่ใช่รูปภาพหรือวิดีโอ`);
        continue;
      }

      try {
        let fileToUpload = file;

        // Compress and convert images (including HEIC/HEIF)
        if (isImage) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.8,
            fileType: 'image/jpeg'
          };
          
          try {
            const compressedFile = await imageCompression(file, options);
            const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            fileToUpload = new File([compressedFile], fileName, { type: 'image/jpeg' });
          } catch (compressionError) {
            console.warn('Compression failed, uploading original:', compressionError);
          }
        }

        const url = await uploadFile(fileToUpload);
        newItems.push({
          type: isVideo ? 'video' : 'image',
          url: url
        });
        toast.success(`อัปโหลด ${file.name} สำเร็จ`);
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`เกิดข้อผิดพลาดในการอัปโหลด ${file.name}: ` + error.message);
      }
    }

    onChange(newItems);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
        <span className="text-xs text-gray-400 font-medium">{items.length} รายการ</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div 
            layout
            key={item.url + index}
            className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group bg-gray-100"
          >
            {item.type === 'image' ? (
              <img 
                src={fixDriveUrl(item.url)} 
                alt="" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <Film className="text-white/50" size={32} />
                <video 
                  src={item.url} 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => removeItem(index)}
                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                title="ลบ"
              >
                <X size={16} />
              </button>
            </div>

            <div className="absolute bottom-2 left-2">
              {item.type === 'image' ? (
                <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                  <ImageIcon size={12} className="text-indigo-600" />
                </div>
              ) : (
                <div className="bg-indigo-600/90 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                  <Film size={12} className="text-white" />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        <button
          type="button"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          disabled={isUploading}
          className={`
            aspect-square rounded-2xl border-2 border-dashed transition-all
            flex flex-col items-center justify-center gap-2
            ${isUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 
              'bg-gray-50 border-gray-200 hover:bg-white hover:border-indigo-300 hover:shadow-md'}
          `}
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-indigo-600" size={24} />
          ) : (
            <>
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Plus className="text-indigo-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">เพิ่มสื่อ</span>
            </>
          )}
        </button>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        multiple
        accept="image/*,video/*,image/heic,image/heif,.heic,.heif"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-[10px] text-gray-400 ml-1">
        * รองรับรูปภาพและวิดีโอ (MP4) ขนาดไม่เกิน 20MB ต่อไฟล์
      </p>
    </div>
  );
};
