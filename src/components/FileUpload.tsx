import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Loader2, FileText } from 'lucide-react';
import { uploadFile, fixDriveUrl } from '../services/dataService';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  currentImageUrl?: string;
  isCircle?: boolean;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  label = "อัปโหลดรูปภาพ",
  currentImageUrl,
  isCircle = false,
  accept = "image/*,image/heic,image/heif,.heic,.heif"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previewUrl with currentImageUrl when it changes (e.g. after data fetch)
  React.useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    const isImage = fileType.startsWith('image/') || 
                    fileName.endsWith('.heic') || 
                    fileName.endsWith('.heif') ||
                    fileName.endsWith('.hevc');
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
    
    if (accept.includes('image') && !isImage && !isPdf) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    
    if (accept.includes('application/pdf') && !isPdf) {
      toast.error('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return;
    }

    // Validate file size (max 20MB for GAS/Drive, bypass limit for PDF as requested)
    if (!isPdf && file.size > 20 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 20MB');
      return;
    }

    try {
      setIsUploading(true);
      
      let fileToUpload = file;

      // Compress and convert images (including HEIC/HEIF)
      if (isImage) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
          fileType: 'image/jpeg' // This handles HEIC to JPEG conversion
        };
        
        try {
          const compressedFile = await imageCompression(file, options);
          // Ensure the name is preserved but with .jpg if it was HEIC
          const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
          fileToUpload = new File([compressedFile], fileName, { type: 'image/jpeg' });
        } catch (compressionError) {
          console.warn('Compression failed, uploading original:', compressionError);
        }
      }

      const url = await uploadFile(fileToUpload);
      setPreviewUrl(url);
      onUploadSuccess(url);
      toast.success(isPdf ? 'อัปโหลดไฟล์ PDF สำเร็จ' : 'อัปโหลดรูปภาพสำเร็จ');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDisplayUrl = (url: string | null) => {
    if (!url) return undefined;
    return fixDriveUrl(url, accept === 'application/pdf');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="flex flex-col sm:flex-row gap-4">
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative flex-1 h-32 border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-2 overflow-hidden
            ${isCircle ? 'rounded-full w-32 flex-none' : 'rounded-2xl flex-1'}
            ${isUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 
              previewUrl ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 
              'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-indigo-300'}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
              <span className="text-xs font-medium text-indigo-600">กำลังอัปโหลด...</span>
            </div>
          ) : previewUrl ? (
            <>
              {(previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('application/pdf') || accept === 'application/pdf') ? (
                <div className="flex flex-col items-center gap-1">
                  <FileText className="text-indigo-600" size={24} />
                  <span className="text-xs font-bold text-indigo-700">ไฟล์ PDF อัปโหลดแล้ว</span>
                </div>
              ) : (
                <>
                  <img 
                    src={getDisplayUrl(previewUrl)} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Check className="text-indigo-600" size={24} />
                    <span className="text-xs font-bold text-indigo-700">เปลี่ยนไฟล์</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Upload className="text-gray-400" size={24} />
              <div className="text-center px-4">
                <span className="text-xs font-bold text-gray-500 block">คลิกเพื่อเลือกไฟล์</span>
                <span className="text-[10px] text-gray-400 block">
                  {accept.includes('pdf') ? 'ไฟล์ PDF ไม่จำกัดขนาด' : 'PNG, JPG, GIF ไม่เกิน 20MB'}
                </span>
              </div>
            </>
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {previewUrl && (
          <div className={`relative w-32 h-32 overflow-hidden border-2 border-white shadow-md group ${isCircle ? 'rounded-full' : 'rounded-2xl'}`}>
            {(previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('application/pdf') || accept === 'application/pdf') ? (
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-1">
                <FileText className="text-red-500" size={32} />
                <span className="text-[10px] font-bold text-gray-500">PDF FILE</span>
              </div>
            ) : (
              <img 
                src={getDisplayUrl(previewUrl)} 
                alt="Final Preview" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            )}
            <button 
              type="button"
              onClick={clearImage}
              className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
