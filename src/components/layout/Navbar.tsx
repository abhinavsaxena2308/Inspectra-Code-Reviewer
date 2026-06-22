import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '../ui/Input';
import { useNavigate } from 'react-router-dom';
import { UserButton, Show } from "@clerk/react";

export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-50">
      <div className="glass-nav rounded-full h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-8 flex-1">
          {/* Logo/Brand for Dashboard */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center p-1 bg-white/5 shadow-2xl relative group-hover:border-cyan/30 transition-all duration-500 overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg" fill="#b61693" stroke="#b61693">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path fill="none" stroke="#b80faa" strokeWidth="2" d="M5.5,21 C7.98528137,21 10,18.9852814 10,16.5 C10,14.0147186 7.98528137,12 5.5,12 C3.01471863,12 1,14.0147186 1,16.5 C1,18.9852814 3.01471863,21 5.5,21 Z M1,16 L1,7 L1,6.5 C1,4.01471863 3.01471863,2 5.5,2 L6,2 M23,16 L23,7 L23,6.5 C23,4.01471863 20.9852814,2 18.5,2 L18,2 M18.5,21 C20.9852814,21 23,18.9852814 23,16.5 C23,14.0147186 20.9852814,12 18.5,12 C16.0147186,12 14,14.0147186 14,16.5 C14,18.9852814 16.0147186,21 18.5,21 Z M10,17 C10,17 10,15 12,15 C14,15 14,17 14,17"></path>
                </g>
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
            <Show when="signed-in">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-full border border-white/10 hover:border-cyan/50 transition-all",
                    userButtonTrigger: "focus:shadow-none focus:outline-none"
                  }
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
};
