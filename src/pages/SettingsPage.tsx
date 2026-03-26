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
    <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto min-h-full font-sans">

      {/* Header */}
      <header className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">System Settings</h2>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Configure your analysis environment, authentication tokens, and interface preferences for the Inspectra AI engine.
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Profile — col-span-8 */}
        <section className="lg:col-span-8 bg-surface-container rounded-xl relative overflow-hidden">
          <div className="severity-monolith bg-primary" />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold tracking-tight text-on-surface">Profile</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
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
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-bright text-primary text-xs font-bold uppercase tracking-widest rounded transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Update Profile
              </button>
            </div>
          </div>
        </section>

        {/* Appearance — col-span-4 */}
        <section className="lg:col-span-4 bg-surface-container rounded-xl relative overflow-hidden">
          <div className="severity-monolith bg-secondary" />
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <Palette className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-semibold tracking-tight text-on-surface">Appearance</h3>
            </div>
            <div className="space-y-4 flex-1">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest/50 rounded-lg border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface">Dark Mode</span>
                </div>
                <button
                  role="switch"
                  aria-checked={isDarkMode}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isDarkMode ? 'bg-secondary' : 'bg-surface-container-highest'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                  />
                </button>
              </div>
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest/50 rounded-lg border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface">High Contrast</span>
                </div>
                <button
                  role="switch"
                  aria-checked={isHighContrast}
                  onClick={() => setIsHighContrast(!isHighContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isHighContrast ? 'bg-secondary' : 'bg-surface-container-highest'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${isHighContrast ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* API Integration — col-span-7 */}
        <section className="lg:col-span-7 bg-surface-container rounded-xl relative overflow-hidden">
          <div className="severity-monolith bg-tertiary" />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-tertiary" />
              <h3 className="text-lg font-semibold tracking-tight text-on-surface">API Integration</h3>
            </div>
            <div className="bg-surface-container-lowest border border-dashed border-outline-variant/20 rounded-xl p-6">
              {/* GitHub header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-[#24292f] rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">GitHub Integration</h4>
                  <p className="text-xs text-on-surface-variant font-mono">
                    Status: <span className={user?.profile?.github_token || user?.metadata?.github_token ? "text-secondary" : "text-error"}>
                      {user?.profile?.github_token || user?.metadata?.github_token ? "Connected" : "Disconnected"}
                    </span>
                  </p>
                </div>
              </div>
              {/* Token input */}
              <div className="space-y-4">
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
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 pr-12 text-sm font-mono placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none text-on-surface transition-all"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-tertiary transition-colors"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant italic">
                  Required for automated repo scanning and PR auditing capabilities.
                </p>
                <button 
                  onClick={handleSaveToken}
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary text-xs font-bold uppercase tracking-widest rounded transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 text-tertiary" />}
                  Connect GitHub
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Management — col-span-5 */}
        <section className="lg:col-span-5 bg-surface-container rounded-xl relative overflow-hidden">
          <div className="severity-monolith bg-error" />
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-5 h-5 text-error" />
              <h3 className="text-lg font-semibold tracking-tight text-on-surface">Account Management</h3>
            </div>
            <div className="space-y-6 mb-8 flex-1">
              {/* Session info */}
              <div className="p-4 bg-error/5 border border-error/10 rounded-lg">
                <h4 className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Session Security</h4>
                <p className="text-sm text-on-surface-variant">
                  Your current session is active. Last login was today.
                </p>
              </div>
              {/* Action buttons */}
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-3 text-sm hover:bg-surface-container-high rounded-lg transition-colors group">
                  <span className="font-medium text-on-surface">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-sm hover:bg-surface-container-high rounded-lg transition-colors group text-error">
                  <span className="font-medium">Deactivate Account</span>
                  <AlertTriangle className="w-4 h-4 text-error/60 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            {/* Logout */}
            <div className="mt-auto">
              <button 
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:bg-error/10 hover:text-error hover:border-error/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout Session
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs font-mono text-on-surface-variant flex items-center gap-4">
          <span>API Version: v4.2.0-stable</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span>System Health: Nominal</span>
        </div>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
          © 2024 Inspectra AI Labs. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
