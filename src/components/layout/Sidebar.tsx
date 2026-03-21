import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Github, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Repositories', icon: Github, path: '/repos' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-gh-bg border-r border-gh-border transition-all duration-300 flex flex-col relative z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <Github className="w-8 h-8 text-gh-text" />
        {!isCollapsed && (
          <span className="font-semibold text-lg tracking-tight text-gh-text">AI Reviewer</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-100 group text-sm font-medium",
              isActive 
                ? "bg-gh-header text-gh-text border-l-2 border-gh-blue" 
                : "text-gh-muted hover:bg-gh-header/50 hover:text-gh-text"
            )}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className={cn("w-4 h-4", isCollapsed ? "mx-auto" : "")} />
                {!isCollapsed && <span>{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gh-border">
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-gh-muted hover:bg-gh-red/10 hover:text-gh-red transition-all duration-100 text-sm font-medium",
          isCollapsed ? "justify-center" : ""
        )}>
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-gh-bg border border-gh-border rounded-full flex items-center justify-center text-gh-muted hover:text-gh-text transition-colors shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};
