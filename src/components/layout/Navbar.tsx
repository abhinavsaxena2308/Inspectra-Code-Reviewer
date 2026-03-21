import React from 'react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="h-16 border-b border-gh-border bg-gh-header px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="w-96">
        <Input 
          placeholder="Search or jump to..." 
          icon={<Search className="w-4 h-4" />}
          className="bg-gh-bg border-gh-border h-8 text-xs"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-1.5 text-gh-muted hover:text-gh-text transition-colors border border-gh-border rounded-md hover:bg-gh-bg">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gh-blue rounded-full border border-gh-header" />
        </button>
        
        <div className="h-6 w-[1px] bg-gh-border mx-1" />
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 pl-2 group transition-all">
            <div className="w-7 h-7 rounded-full bg-gh-border flex items-center justify-center overflow-hidden border border-gh-border group-hover:border-gh-blue/50 transition-colors">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gh-muted group-hover:text-gh-blue transition-colors" />
              )}
            </div>
            <div className="text-left hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-gh-text group-hover:text-gh-blue transition-colors">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="w-3 h-3 text-gh-muted group-hover:text-gh-blue transition-colors" />
            </div>
          </button>

          <button 
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gh-muted hover:text-rose-400 hover:bg-rose-400/5 rounded-md transition-all border border-transparent hover:border-rose-400/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
