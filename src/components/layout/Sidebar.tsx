import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Github, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Activity,
  Box
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserButton, OrganizationSwitcher } from "@clerk/react";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Intelligence Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Repositories', icon: Github, path: '/repos' },
    { name: 'Sequence History', icon: History, path: '/history' },
    { name: 'System Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-void-surface transition-all duration-500 ease-in-out flex flex-col relative z-40 border-r border-white/5",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        "p-6 flex items-center gap-4 border-b border-white/5",
        isCollapsed ? "justify-center" : ""
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container p-2 shadow-lg shadow-primary/20 shrink-0">
          <Shield className="w-full h-full text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base tracking-tight text-white leading-none">Inspectra</span>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1 pulse-soft">v4.2 PRO</span>
          </div>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-8">
        {!isCollapsed && (
          <div className="px-3 mb-4">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Core Systems</span>
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
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isCollapsed ? "mx-auto" : "")} />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Organization / Context Switcher (Placeholder/Optional) */}
      {!isCollapsed && (
        <div className="px-6 py-6 border-t border-white/5">
           <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                 <Activity className="w-4 h-4 text-secondary/50" />
                 <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">System Load</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-1/3 h-full bg-secondary" />
              </div>
           </div>
        </div>
      )}

      {/* User Actions & Profile */}
      <div className={cn(
        "p-4 border-t border-white/5 flex flex-col gap-4",
        isCollapsed ? "items-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-4 p-2 rounded-2xl transition-all",
          !isCollapsed && "bg-white/5 border border-white/5"
        )}>
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 rounded-xl",
                userButtonTrigger: "focus:shadow-none"
              }
            }}
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
               <span className="text-sm font-bold text-white truncate">{user?.name}</span>
               <span className="text-[10px] font-medium text-white/30 truncate">{user?.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-surface-container-low border border-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-primary/50 transition-all shadow-xl z-50 group"
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
