import React from 'react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full flex justify-center pt-4 px-6 pointer-events-none">
      <div className="glass-nav rounded-full w-full max-w-7xl h-14 flex items-center justify-between px-6 pointer-events-auto">
        <div className="flex items-center gap-8 flex-1">
          <div className="w-80 group relative">
            <Input 
              placeholder="Search or jump to..." 
              icon={<Search className="w-3.5 h-3.5 text-on-surface-variant transition-colors group-focus-within:text-primary" />}
              className="bg-surface-container-low/50 h-8 text-[11px] border border-outline-variant/10 focus:border-primary/30 focus:bg-background/80 transition-all rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 rounded-full transition-all duration-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
          </button>
          
          <div className="h-4 w-px bg-outline-variant/20 mx-1" />
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 pl-1 pr-3 py-1 nav-item hover:bg-surface-container-high/30 rounded-full group">
              <div className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center overflow-hidden border border-outline-variant/10 group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(162,201,255,0.2)] transition-all">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="text-left hidden sm:flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-on-surface tracking-tight">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-on-surface-variant group-hover:text-primary transition-colors" />
              </div>
            </button>

            <button 
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="ml-1 flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-error/70 hover:text-error hover:bg-error-container/10 rounded-full transition-all border border-error/10 hover:border-error/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

