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
    <section className="px-6 md:px-10 max-w-7xl mx-auto mt-24 md:mt-32 mb-24 relative z-20">
      <div className="relative p-12 md:p-20 rounded-3xl overflow-hidden bg-gradient-to-br from-surface-container to-surface-container-low border border-outline-variant/20 text-center">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 -z-10"></div>
        
        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6 leading-tight">
            Ready to Scale Your Integrity?
          </h2>
          <p className="text-lg text-on-surface-variant mb-12">
            Join the elite developers who already use Inspectra to ship secure, high-performance code every single day.
          </p>

          {/* GitHub Input + CTA */}
          <div className="relative w-full group">
            <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors z-10" />
            <input
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-full pl-16 pr-52 py-5 text-sm font-mono focus:ring-1 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface relative"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 group h-[calc(100%-16px)] hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-[55%]"
            >
              {isAnalyzing ? 'Initializing...' : 'Ship Code'}
              {!isAnalyzing && <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
