import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImageComparator } from './components/ImageComparator';
import { removeWatermark } from './services/gemini';
import { EditSession, ProcessingStatus, ImageAsset } from './types';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<EditSession | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    // 1. Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size too large. Please upload an image smaller than 10MB.');
        return;
    }

    // 2. Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Create new session
      setSession({
        id: Date.now().toString(),
        original: {
          id: 'orig_' + Date.now(),
          dataUrl: dataUrl,
          mimeType: file.type,
          timestamp: Date.now(),
        },
        result: null,
        status: ProcessingStatus.IDLE,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProcess = async () => {
    if (!session || !session.original) return;

    setSession(prev => prev ? { ...prev, status: ProcessingStatus.PROCESSING, error: undefined } : null);

    try {
      const resultBase64 = await removeWatermark(session.original.dataUrl, session.original.mimeType);
      
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: ProcessingStatus.SUCCESS,
          result: {
            id: 'res_' + Date.now(),
            dataUrl: resultBase64,
            mimeType: 'image/png', // Gemini usually returns PNG for generated content
            timestamp: Date.now(),
          }
        };
      });

    } catch (error: any) {
      setSession(prev => prev ? { 
        ...prev, 
        status: ProcessingStatus.ERROR, 
        error: error.message || "An unexpected error occurred." 
      } : null);
    }
  };

  const handleReset = () => {
    setSession(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Intro Text */}
        {!session && (
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 tracking-tight">
              Remove Watermarks in Seconds
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Use advanced AI to automatically detect and erase watermarks, logos, and unwanted text from your images while perfectly reconstructing the background.
            </p>
          </div>
        )}

        {/* Error Message */}
        {session?.error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400 animate-shake">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{session.error}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="transition-all duration-500 ease-in-out">
          {!session ? (
             <div className="max-w-3xl mx-auto">
                <UploadZone 
                  onFileSelect={handleFileSelect} 
                  isProcessing={false}
                />
                
                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                  {[
                    { title: 'AI Powered', desc: 'Uses Gemini 2.5 Flash for intelligent context awareness.' },
                    { title: 'High Quality', desc: 'Preserves original resolution and details.' },
                    { title: 'Secure', desc: 'Images are processed in memory and not stored.' }
                  ].map((feature, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <h3 className="font-semibold text-slate-200 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          ) : (
            <div className="w-full">
               {/* Progress Indicator */}
               {session.status === ProcessingStatus.PROCESSING && (
                  <div className="max-w-xl mx-auto mb-8 text-center">
                     <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-semibold">Processing image...</span>
                     </div>
                     <p className="text-sm text-slate-500">This usually takes 5-10 seconds.</p>
                  </div>
               )}

               <ImageComparator
                  originalSrc={session.original.dataUrl}
                  processedSrc={session.result?.dataUrl || null}
                  onReset={handleReset}
                  onProcess={handleProcess}
                  isProcessing={session.status === ProcessingStatus.PROCESSING}
               />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ClearView AI. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;