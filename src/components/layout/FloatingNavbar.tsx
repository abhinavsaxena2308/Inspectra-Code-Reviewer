import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { SignInButton, SignUpButton, Show } from "@clerk/react";

export const FloatingNavbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Use Cases', href: '#use-cases' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-6xl z-50">
        <nav className="bg-surface-container/70 backdrop-blur-xl border border-outline-variant/20 rounded-full h-14 flex items-center justify-between px-4 md:px-6">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center p-1.5 bg-gradient-to-br from-surface-container-high to-surface-container">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z" className="stroke-on-surface-variant/50" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 6V18" className="stroke-outline-variant" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" className="fill-primary/50"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-on-surface hidden sm:block">
              Inspectra
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors relative group"
              >
                {link.name}
                <span className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
                >
                  Dashboard
                </button>
                <div className="relative group">
                   <button 
                      onClick={() => navigate('/dashboard')} // Link to profile/dashboard
                      className="w-9 h-9 rounded-full border border-outline-variant/30 flex items-center justify-center overflow-hidden bg-surface-container-high hover:border-primary/50 transition-all"
                   >
                      {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                         <User className="w-4 h-4 text-on-surface-variant" />
                      )}
                   </button>
                </div>
              </div>
            </Show>
            
            <Show when="signed-out">
              <div className="hidden md:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden absolute top-16 left-0 right-0 bg-surface-container/95 backdrop-blur-lg rounded-2xl p-4 flex flex-col gap-2 shadow-lg border border-outline-variant/20 mx-2"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-all px-4 py-3"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="h-px bg-outline-variant/20 w-full my-2" />
              <div className="flex flex-col gap-2">
                <Show when="signed-in">
                  <button 
                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-all px-4 py-3"
                  >
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 text-base font-medium text-error hover:bg-error-container/20 rounded-md transition-all px-4 py-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </Show>
                
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-all px-4 py-3 text-left"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-3 bg-primary text-on-primary rounded-lg text-base font-semibold mt-2"
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </Show>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default FloatingNavbar;
