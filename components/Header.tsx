import React from 'react';
import { Eraser, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Eraser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              ClearView AI
              <span className="text-[10px] font-normal px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">BETA</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            How it works
          </a>
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Pricing
          </a>
           <div className="hidden md:flex items-center px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Sparkles className="w-3 h-3 text-indigo-400 mr-2" />
            <span className="text-xs text-indigo-300 font-medium">Powered by Gemini 2.5</span>
          </div>
        </div>
      </div>
    </header>
  );
};