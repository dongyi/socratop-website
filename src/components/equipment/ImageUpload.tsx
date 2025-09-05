'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  disabled = false 
}: ImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('review-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from('review-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled || uploading) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`最多只能上传${maxImages}张图片`);
      return;
    }

    // 验证文件类型和大小
    const validFiles = filesToUpload.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`"${file.name}" 不是有效的图片文件`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert(`"${file.name}" 文件过大，请选择小于5MB的图片`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(file => uploadImage(file));
      const newImageUrls = await Promise.all(uploadPromises);
      
      onImagesChange([...images, ...newImageUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (disabled || uploading) return;
    
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          disabled || uploading
            ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
            : 'border-gray-600 hover:border-gray-500 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Loader className="w-8 h-8 animate-spin" />
            <p className="text-sm">上传中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload className="w-8 h-8" />
            <p className="text-sm">
              点击或拖拽图片到此处上传
            </p>
            <p className="text-xs text-gray-500">
              支持 JPG、PNG、WebP 格式，单个文件最大 5MB，最多 {maxImages} 张
            </p>
          </div>
        )}
      </div>

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden"
            >
              <img
                src={imageUrl}
                alt={`上传的图片 ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              
              {/* 图片加载失败时的占位符 */}
              <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-700">
                <ImageIcon className="w-6 h-6 text-gray-500" />
              </div>

              {/* 删除按钮 */}
              {!disabled && !uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 图片数量提示 */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          已上传 {images.length}/{maxImages} 张图片
        </p>
      )}
    </div>
  );
}