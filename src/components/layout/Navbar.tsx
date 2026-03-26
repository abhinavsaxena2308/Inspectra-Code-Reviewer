import React from 'react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="h-16 bg-surface-container px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="w-96">
        <Input 
          placeholder="Search or jump to..." 
          icon={<Search className="w-4 h-4" />}
          className="bg-surface-container-low h-8 text-xs"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded-md hover:bg-surface-container-high">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        
        <div className="h-6 w-[1px] bg-surface-container-high mx-1" />
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 pl-2 group transition-all">
            <div className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center overflow-hidden ghost-border group-hover:ring-primary transition-colors">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="text-left hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
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
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-md transition-all border border-transparent hover:border-error/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

