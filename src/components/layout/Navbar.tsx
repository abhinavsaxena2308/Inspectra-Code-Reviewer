import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '../ui/Input';

export const Navbar = () => {
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
        
        <button className="flex items-center gap-2 pl-2 group">
          <div className="w-7 h-7 rounded-full bg-gh-border flex items-center justify-center overflow-hidden border border-gh-border">
            <User className="w-4 h-4 text-gh-muted" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gh-text group-hover:text-gh-blue transition-colors">abhinav-saxena</p>
          </div>
        </button>
      </div>
    </header>
  );
};
