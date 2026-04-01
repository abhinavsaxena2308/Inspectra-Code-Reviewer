import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Zap } from 'lucide-react';

interface FinalCTAProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  handleAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function FinalCTA({ 
  repoUrl, 
  setRepoUrl, 
  handleAnalyze, 
  isAnalyzing 
}: FinalCTAProps) {
  return (
    <section className="px-6 md:px-10 max-w-5xl mx-auto mt-[120px] mb-32 relative z-20">
      <div className="relative p-12 md:p-20 rounded-3xl overflow-hidden bg-white/2 border border-white/5 backdrop-blur-xl text-center">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-cyan/10 via-transparent to-transparent opacity-50 -z-10"></div>
        
        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
            Ready to scale your <br/>
            <span className="font-cursive text-cyan inline-block -rotate-2 px-1">Integrity?</span>
          </h2>
          <p className="text-lg text-white/40 mb-12 font-medium">
            Join the elite developers who already use Inspectra to ship secure, high-performance code every single day.
          </p>

          {/* GitHub Input + CTA (Reused Hero Style) */}
          <div className="relative w-full group">
            <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-cyan transition-colors z-40" />
            <input
              className="w-full bg-black/40 border border-white/10 rounded-full pl-16 pr-52 py-6 text-sm font-mono focus:ring-1 focus:ring-cyan/50 focus:border-cyan outline-none transition-all placeholder:text-white/20 text-white backdrop-blur-md relative z-30"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              type="text"
              disabled={isAnalyzing}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing} 
              className="absolute right-2 top-1/2 -translate-y-1/2 ethereal-btn px-8 py-3.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white flex items-center justify-center gap-2 group z-40 h-[calc(100%-16px)]"
            >
              {isAnalyzing ? 'Initializing...' : 'Ship Code'}
              {!isAnalyzing && <Zap className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
