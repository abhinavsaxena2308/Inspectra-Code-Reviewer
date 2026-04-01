import React from 'react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-50">
      <div className="glass-nav rounded-full h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-8 flex-1">
          {/* Logo/Brand for Dashboard */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center p-1 bg-white/5 shadow-2xl relative group-hover:border-cyan/30 transition-all duration-500 overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z" className="stroke-white/40 group-hover:stroke-white transition-colors duration-500" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" className="fill-cyan/40 group-hover:fill-cyan animate-pulse transition-colors duration-500"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/60 group-hover:text-white transition-colors hidden sm:block">Inspectra</span>
          </div>

          <div className="w-64 group relative hidden md:block">
            <Input 
              placeholder="Search or jump to..." 
              icon={<Search className="w-3.5 h-3.5 text-white/40 transition-colors group-focus-within:text-cyan" />}
              className="bg-white/5 h-8 text-[11px] border border-white/5 focus:border-cyan/30 focus:bg-void/80 transition-all rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-cyan rounded-full ring-2 ring-void" />
          </button>
          
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 pl-1 pr-3 py-1 nav-item hover:bg-white/5 rounded-full group transition-all">
              <div className="w-6 h-6 rounded-full bg-void/50 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-cyan/50 group-hover:shadow-[0_0_10px_rgba(82,39,255,0.2)] transition-all">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan transition-colors" />
                )}
              </div>
              <div className="text-left hidden sm:flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-white/80 tracking-tight group-hover:text-white transition-colors">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-cyan transition-colors" />
              </div>
            </button>

            <button 
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="ml-1 flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-full transition-all border border-red-500/10 hover:border-red-500/30 tracking-widest"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

