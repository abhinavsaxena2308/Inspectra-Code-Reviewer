import React, { useState, useEffect } from 'react';
import {
  User, Palette, Key, Shield, Moon, Monitor, Eye, EyeOff,
  ChevronRight, LogOut, AlertTriangle, Loader2, Save,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast'; // Force re-resolution

export const SettingsPage = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.profile?.name || user.email?.split('@')[0] || 'User');
      setEmail(user.email || '');
      // Try profile first, then metadata as fallback
      setGithubToken(user.profile?.github_token || user.metadata?.github_token || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      // 'name' is the standard field in InsForge profile schema
      await updateProfile({ name: name });
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveToken = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({ github_token: githubToken });
      addToast('GitHub token saved securely', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save token', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-10 max-w-7xl mx-auto w-full font-sans">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-on-surface">System Settings</h2>
          <p className="text-on-surface-variant text-sm max-w-2xl">
            Configure your analysis environment, authentication tokens, and interface preferences for the Inspectra AI engine.
          </p>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Profile — col-span-8 */}
        <section className="lg:col-span-8 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Profile</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-white/40 text-on-surface transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-white/40 text-on-surface transition-colors"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end pt-6 border-t border-white/10">
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : null}
                Update Profile
              </button>
            </div>
          </div>
        </section>

        {/* Appearance — col-span-4 */}
        <section className="lg:col-span-4 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Appearance</h3>
            </div>
            <div className="space-y-4 flex-1">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container border border-white/5 rounded-md">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-xs font-medium text-on-surface">Dark Mode</span>
                </div>
                <button
                  role="switch"
                  aria-checked={isDarkMode}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-white' : 'bg-surface-container-high'}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black shadow transition-transform ${isDarkMode ? 'translate-x-[18px]' : 'translate-x-[4px]'}`}
                  />
                </button>
              </div>
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container border border-white/5 rounded-md">
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-xs font-medium text-on-surface">High Contrast</span>
                </div>
                <button
                  role="switch"
                  aria-checked={isHighContrast}
                  onClick={() => setIsHighContrast(!isHighContrast)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isHighContrast ? 'bg-white' : 'bg-surface-container-high'}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black shadow transition-transform ${isHighContrast ? 'translate-x-[18px]' : 'translate-x-[4px]'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* API Integration — col-span-7 */}
        <section className="lg:col-span-7 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Key className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">API Integration</h3>
            </div>
            <div className="bg-surface-container border border-dashed border-white/10 rounded-xl p-6">
              {/* GitHub header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-[#24292f] rounded flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">GitHub Integration</h4>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">
                    Status: <span className={user?.profile?.github_token || user?.metadata?.github_token ? "text-emerald-500" : "text-amber-500"}>
                      {user?.profile?.github_token || user?.metadata?.github_token ? "CONNECTED" : "DISCONNECTED"}
                    </span>
                  </p>
                </div>
              </div>
              {/* Token input */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-2">
                    GitHub Personal Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={githubToken}
                      onChange={e => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-2.5 pr-12 text-sm font-mono placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/40 text-on-surface transition-colors"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-on-surface-variant italic">
                    Required for automated repo scanning.
                  </p>
                  <button 
                    onClick={handleSaveToken}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-black" /> : <Save className="w-3 h-3 text-black" />}
                    Save Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Management — col-span-5 */}
        <section className="lg:col-span-5 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Security & Sessions</h3>
            </div>
            <div className="space-y-4 mb-8 flex-1">
              {/* Session info */}
              <div className="p-4 bg-surface-container border border-white/5 rounded-md">
                <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Active Session</h4>
                <p className="text-xs text-on-surface">
                  Secure connection active. Last authenticated today.
                </p>
              </div>
              {/* Action buttons */}
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-3 text-xs font-medium hover:bg-surface-container rounded-md transition-colors group">
                  <span className="text-on-surface">Change Password</span>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-xs font-medium hover:bg-surface-container rounded-md transition-colors group text-red-500">
                  <span>Deactivate Account</span>
                  <AlertTriangle className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
            {/* Logout */}
            <div className="mt-auto pt-6 border-t border-white/10">
              <button 
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface border border-white/10 hover:bg-surface-container rounded-md text-xs font-semibold text-on-surface transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminate Session
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-4">
          <span>SYSTEM_VERSION: v4.2.0-stable</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>STATUS: NOMINAL</span>
        </div>
        <p className="text-[10px] text-on-surface-variant uppercase font-mono">
          © 2024 Inspectra AI Labs.
        </p>
      </footer>
    </div>
  );
};
