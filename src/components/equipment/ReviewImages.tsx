'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ReviewImagesProps {
  images: string[];
  className?: string;
}

export default function ReviewImages({ images, className = '' }: ReviewImagesProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') previousImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  return (
    <>
      {/* 图片网格 */}
      <div className={`grid gap-2 ${className}`}>
        {images.length === 1 && (
          <div className="w-full max-w-sm">
            <img
              src={images[0]}
              alt="评论配图"
              className="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openLightbox(0)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center justify-center w-full h-32 bg-gray-700 rounded-lg">
              <ImageIcon className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        )}

        {images.length === 2 && (
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {images.map((image, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={image}
                  alt={`评论配图 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(index)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex items-center justify-center w-full h-full bg-gray-700 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 3 && (
          <div className="grid grid-cols-3 gap-2 max-w-lg">
            {images.map((image, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={image}
                  alt={`评论配图 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(index)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex items-center justify-center w-full h-full bg-gray-700 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length >= 4 && (
          <div className="max-w-lg">
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 3).map((image, index) => (
                <div key={index} className={`aspect-square ${index === 0 ? 'col-span-2' : ''}`}>
                  <img
                    src={image}
                    alt={`评论配图 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openLightbox(index)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden flex items-center justify-center w-full h-full bg-gray-700 rounded-lg">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              ))}
              {images.length > 4 && (
                <div 
                  className="aspect-square relative cursor-pointer"
                  onClick={() => openLightbox(3)}
                >
                  <img
                    src={images[3]}
                    alt="更多图片"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">+{images.length - 3}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 灯箱弹窗 */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* 关闭按钮 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 图片计数器 */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm z-10">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* 当前图片 */}
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentImageIndex]}
              alt={`评论配图 ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center justify-center w-64 h-64 bg-gray-700 rounded-lg">
              <ImageIcon className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}