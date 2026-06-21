import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, Settings, LayoutDashboard, Database, History, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-surface-container rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <Command
          className="flex flex-col w-full h-full text-on-surface"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="w-5 h-5 text-on-surface-variant mr-3 shrink-0" />
            <Command.Input 
              autoFocus
              placeholder="Type a command or search..." 
              className="flex-1 h-14 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/50 font-sans text-lg"
            />
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-surface-container-high rounded text-xs font-mono text-on-surface-variant border border-white/5">esc</kbd>
            </div>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-on-surface-variant">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 p-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/dashboard'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 cursor-pointer text-sm font-medium hover:text-primary transition-colors mt-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/repos'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 cursor-pointer text-sm font-medium hover:text-primary transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Repositories</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/history'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 cursor-pointer text-sm font-medium hover:text-primary transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Analysis History</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/settings'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 cursor-pointer text-sm font-medium hover:text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 p-2 mt-4">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/repos'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 cursor-pointer text-sm font-medium hover:text-primary transition-colors mt-2"
              >
                <Terminal className="w-4 h-4" />
                <span>Trigger New Analysis</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => toggleTheme())}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 cursor-pointer text-sm font-medium hover:text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </Command.Item>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
    </div>
  );
};
