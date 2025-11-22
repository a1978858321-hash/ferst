import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isProcessing) return;
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect, isProcessing]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative group flex flex-col items-center justify-center w-full h-96 
        border-2 border-dashed rounded-2xl transition-all duration-300
        ${isProcessing 
          ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed opacity-50' 
          : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer bg-slate-800/30'
        }
      `}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleInputChange}
        accept="image/*"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        <div className={`p-4 rounded-full mb-4 transition-colors ${isProcessing ? 'bg-slate-700' : 'bg-slate-700 group-hover:bg-blue-500/20'}`}>
            {isProcessing ? (
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
            ) : (
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-400" />
            )}
        </div>
        
        <p className="mb-2 text-xl font-semibold text-slate-200">
          {isProcessing ? 'Processing...' : 'Click or Drag to Upload Image'}
        </p>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Supports JPG, PNG, WEBP. High resolution images are optimized for editing.
        </p>
      </div>

      {!isProcessing && (
          <div className="absolute bottom-6 flex items-center space-x-2 text-xs text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
            <AlertCircle className="w-3 h-3" />
            <span>Max file size: 10MB</span>
          </div>
      )}
    </div>
  );
};