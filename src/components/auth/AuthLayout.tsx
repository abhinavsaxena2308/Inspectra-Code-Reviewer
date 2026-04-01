import React from 'react';
import { motion } from 'motion/react';
import { Github } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0d1117]">

      {/* ── Left Panel (Desktop only, visual only) ── */}
      <div className="hidden md:flex md:w-3/4 relative flex-col items-center justify-center overflow-hidden border-r border-white/5">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />
        
        {/* Overlays for depth and contrast */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(88, 101, 242, 0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(88, 166, 255, 0.12) 0%, transparent 55%),
              linear-gradient(to right, #0d1117 0%, transparent 40%, transparent 60%, #0d1117 100%)
            `,
          }}
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(88,166,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(88,166,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-[20%] left-[30%] w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] animate-pulse" />
        <div className="absolute bottom-[25%] right-[20%] w-56 h-56 rounded-full bg-blue-500/10 blur-[60px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[55%] left-[15%] w-40 h-40 rounded-full bg-violet-500/10 blur-[50px] animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* ── Mobile background (only visible on small screens) ── */}
      <div className="md:hidden absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-40"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/80 to-[#0d1117]" />
      </div>

      {/* ── Right Panel (form) — 1/4 desktop, full-width mobile ── */}
      <div className="relative z-10 w-full md:w-1/4 min-w-0 md:min-w-[380px] flex items-center justify-center p-6 md:p-8 bg-[#0d1117]/90 backdrop-blur-md">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-white/10 flex items-center justify-center p-1.5 group-hover:border-blue-500/50 transition-all">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z" className="stroke-white" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" className="fill-blue-500 animate-pulse"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Inspectra</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/40">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};