import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, LogOut, LayoutDashboard, Settings, User } from 'lucide-react';

export const FloatingNavbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Infrastructure', href: '#' },
    { name: 'Observability', href: '#' },
    { name: 'Security', href: '#' },
  ];

  return (
    <>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-5xl z-50">
        <nav className="glass-nav rounded-full h-14 flex items-center justify-between px-4 md:px-6 relative overflow-hidden">
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_5s_infinite] pointer-events-none" />
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center p-1.5 bg-gradient-to-br from-white/5 to-transparent shadow-2xl relative group-hover:border-cyan/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <svg viewBox="0 0 24 24" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z" className="stroke-white/40 group-hover:stroke-white transition-colors duration-500" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 6V18" className="stroke-white/20 group-hover:stroke-cyan transition-colors duration-500" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" className="fill-cyan/40 group-hover:fill-cyan animate-pulse transition-colors duration-500"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-white hidden sm:block" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
              Inspectra
            </span>
          </div>

          {/* Desktop Nav Links (Centered) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold hover:text-white transition-colors py-2 px-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-full h-px bg-cyan scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-5 py-2 glass-nav-btn text-[9px] uppercase tracking-widest font-bold text-white hover:bg-white hover:text-black transition-all rounded-full border border-white/10"
                >
                  Dashboard
                </button>
                <div className="relative group">
                   <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-white/5 hover:border-cyan/50 transition-all">
                      {user.avatarUrl ? (
                         <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                         <User className="w-4 h-4 text-white/60" />
                      )}
                   </button>
                   {/* Tooltip/Dropdown Placeholder */}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[10px] uppercase text-white/60 tracking-[0.2em] font-bold hover:text-white transition-all mr-2"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-white text-black rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-cyan hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white/70 p-1.5 hover:bg-white/5 rounded-full transition-colors ml-1"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="md:hidden absolute top-20 left-0 right-0 glass-nav rounded-2xl p-6 flex flex-col gap-6 shadow-2xl z-40 border border-white/5 mx-2"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <button 
                      onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan" />
                      Dashboard
                    </button>
                    <button 
                      onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                    >
                      <Settings className="w-4 h-4 text-cyan" />
                      Settings
                    </button>
                    <button 
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                      className="text-xs font-bold uppercase tracking-[0.2em] text-white/60"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-[0.2em]"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default FloatingNavbar;
