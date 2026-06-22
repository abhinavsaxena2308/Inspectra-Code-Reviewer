import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home,
  LayoutDashboard, 
  Github, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Activity,
  Box,
  Network
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserButton, OrganizationSwitcher } from "@clerk/react";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Intelligence Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Repositories', icon: Github, path: '/repos' },
    { name: 'Architecture', icon: Network, path: '/architecture' },
    { name: 'Sequence History', icon: History, path: '/history' },
    { name: 'System Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-void-surface transition-all duration-500 ease-in-out flex flex-col relative z-40 border-r border-outline-variant/30",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        "p-6 flex items-center gap-4 border-b border-outline-variant/30",
        isCollapsed ? "justify-center" : ""
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container p-2 shadow-lg shadow-primary/20 shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path fill="none" stroke="#ffffff" strokeWidth="2" d="M5.5,21 C7.98528137,21 10,18.9852814 10,16.5 C10,14.0147186 7.98528137,12 5.5,12 C3.01471863,12 1,14.0147186 1,16.5 C1,18.9852814 3.01471863,21 5.5,21 Z M1,16 L1,7 L1,6.5 C1,4.01471863 3.01471863,2 5.5,2 L6,2 M23,16 L23,7 L23,6.5 C23,4.01471863 20.9852814,2 18.5,2 L18,2 M18.5,21 C20.9852814,21 23,18.9852814 23,16.5 C23,14.0147186 20.9852814,12 18.5,12 C16.0147186,12 14,14.0147186 14,16.5 C14,18.9852814 16.0147186,21 18.5,21 Z M10,17 C10,17 10,15 12,15 C14,15 14,17 14,17"></path>
            </g>
          </svg>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base tracking-tight text-on-surface leading-none">Inspectra</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 pulse-soft">v4.2 PRO</span>
          </div>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-8">
        {!isCollapsed && (
          <div className="px-3 mb-4">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em]">Core Systems</span>
          </div>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group text-sm font-medium",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isCollapsed ? "mx-auto" : "")} />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Organization / Context Switcher (Placeholder/Optional) */}
      {!isCollapsed && (
        <div className="px-6 py-6 border-t border-outline-variant/30">
           <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30">
              <div className="flex items-center gap-3 mb-3">
                 <Activity className="w-4 h-4 text-secondary/50" />
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">System Load</span>
              </div>
              <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                 <div className="w-1/3 h-full bg-secondary" />
              </div>
           </div>
        </div>
      )}

      {/* User Actions & Profile */}
      <div className={cn(
        "p-4 border-t border-outline-variant/30 flex flex-col gap-4",
        isCollapsed ? "items-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-4 p-2 rounded-2xl transition-all",
          !isCollapsed && "bg-surface-container-low border border-outline-variant/30"
        )}>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 rounded-xl",
                userButtonTrigger: "focus:shadow-none"
              }
            }}
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
               <span className="text-sm font-bold text-on-surface truncate">{user?.name}</span>
               <span className="text-[10px] font-medium text-on-surface-variant truncate">{user?.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-surface-container-low border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-primary/50 transition-all shadow-xl z-50 group"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>
    </aside>
  );
};
