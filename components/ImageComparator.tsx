import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal, Download, RefreshCw, Image as ImageIcon, Wand2, Share2, Check } from 'lucide-react';

interface ImageComparatorProps {
  originalSrc: string;
  processedSrc: string | null;
  onReset: () => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({
  originalSrc,
  processedSrc,
  onReset,
  onProcess,
  isProcessing
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  }, [isResizing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
     if (!isResizing || !containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const touch = e.touches[0];
     const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
     const percentage = (x / rect.width) * 100;
     setSliderPosition(percentage);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleTouchMove]);

  const handleDownload = () => {
    if (!processedSrc) return;
    const link = document.createElement('a');
    link.href = processedSrc;
    link.download = `cleaned-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const shareData = {
        title: 'ClearView AI',
        text: '快来看看这个超强的AI去水印工具！',
        url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            // Share cancelled
        }
    } else {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2 text-slate-300">
          <ImageIcon className="w-5 h-5" />
          <span className="font-medium">预览</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Share App"
          >
             {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
             <span>{copied ? '已复制' : '分享'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            disabled={isProcessing}
          >
            <RefreshCw className="w-4 h-4" />
            <span>上传新图</span>
          </button>

          {!processedSrc && (
            <button
              onClick={onProcess}
              disabled={isProcessing}
              className={`
                flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg
                transition-all transform hover:scale-105 active:scale-95
                ${isProcessing 
                  ? 'bg-blue-600/50 cursor-wait' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                }
              `}
            >
              {isProcessing ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>处理中...</span>
                 </>
              ) : (
                 <>
                   <Wand2 className="w-4 h-4" />
                   <span>一键去水印</span>
                 </>
              )}
            </button>
          )}

          {processedSrc && (
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-500 shadow-lg transition-all transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>下载图片</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full bg-[#020617] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none"
        style={{ height: 'min(70vh, 800px)' }}
      >
        
        {/* Layer 1: Original Image (Background) */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <img 
              src={originalSrc} 
              alt="Original" 
              className="max-w-full max-h-full object-contain pointer-events-none" 
            />
            {!processedSrc && !isProcessing && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/10">
                    原图
                </div>
            )}
        </div>

        {/* Layer 2: Processed Image (Foreground, clipped) */}
        {processedSrc && (
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ 
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
            }}
          >
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#020617]">
                <img 
                src={processedSrc} 
                alt="Processed" 
                className="max-w-full max-h-full object-contain pointer-events-none" 
                />
            </div>
            {/* Label for After */}
            <div className="absolute bottom-4 left-4 bg-blue-600/90 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                去水印后
            </div>
          </div>
        )}

        {/* Slider Handle */}
        {processedSrc && (
          <div 
            className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize hover:bg-blue-400 active:bg-white z-20 transition-colors"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <MoveHorizontal className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        )}
        
        {/* Label for Before (Only shows when processed exists to avoid confusion) */}
        {processedSrc && (
            <div className="absolute bottom-4 right-4 bg-slate-800/90 text-slate-300 text-xs px-2 py-1 rounded shadow-lg z-10">
                原图
            </div>
        )}
      </div>
      
      {processedSrc && (
        <p className="text-center mt-4 text-slate-500 text-sm">
          拖动滑块对比效果
        </p>
      )}
    </div>
  );
};