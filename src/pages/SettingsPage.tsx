import React, { useState, useEffect } from 'react';
import {
  User, Palette, Key, Shield, Moon, Monitor, Eye, EyeOff,
  ChevronRight, LogOut, AlertTriangle, Loader2, Save, Github, Link, Unlink, Bell, Database, Download, Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { exportUserData, clearUserHistory } from '../lib/api';
import { UserProfile, useUser, useAuth as useClerkAuth } from '@clerk/react';
import { dark } from '@clerk/themes';

export const SettingsPage = () => {
  const { signOut, updateProfile } = useAuth();
  const { getToken } = useClerkAuth();
  const { user } = useUser();
  const { addToast } = useToast();
  const { theme, setTheme, isHighContrast, setIsHighContrast } = useTheme();
  const isDarkMode = theme === 'dark';
  const setIsDarkMode = (dark: boolean) => setTheme(dark ? 'dark' : 'light');

  const isGithubConnected = user?.externalAccounts.some(acc => acc.provider === 'github');
  const githubAccount = user?.externalAccounts.find(acc => acc.provider === 'github');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Data Management states
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const notificationsState = (user?.unsafeMetadata?.notifications as any) || {
    scanCompletion: true,
    weeklyDigest: false,
    criticalAlerts: true
  };

  const handleToggleNotification = async (key: string) => {
    try {
      const newNotifications = { ...notificationsState, [key]: !notificationsState[key] };
      // Optimistic update would require local state, but we'll just update Clerk for simplicity
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          notifications: newNotifications
        }
      });
      addToast('Notification preferences updated', 'success');
    } catch (err: any) {
      addToast('Failed to update preferences', 'error');
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      await user?.update({ firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') });
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConnectGithub = async () => {
    try {
      setIsUpdating(true);
      await user?.createExternalAccount({
        strategy: 'oauth_github',
        redirectUrl: window.location.href,
      });
    } catch (err: any) {
      addToast(err.errors?.[0]?.message || 'Failed to connect GitHub', 'error');
      setIsUpdating(false);
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      setIsUpdating(true);
      if (githubAccount) {
        await githubAccount.destroy();
        addToast('GitHub disconnected successfully', 'success');
      }
    } catch (err: any) {
      addToast(err.errors?.[0]?.message || 'Failed to disconnect GitHub', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const token = await getToken();
      if (!token) return;
      
      const data = await exportUserData(token);
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspectra_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast('Data exported successfully', 'success');
    } catch (err: any) {
      addToast('Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setIsClearing(true);
      const token = await getToken();
      if (!token) return;
      
      await clearUserHistory(token);
      addToast('Historical data purged successfully', 'success');
      setShowClearConfirm(false);
    } catch (err: any) {
      addToast('Failed to clear history', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans">

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Profile — col-span-8 */}
        <section className="lg:col-span-8 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Profile</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-outline text-on-surface transition-colors"
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
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-outline text-on-surface transition-colors"
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
          <div className="p-4 md:p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Appearance</h3>
            </div>
            <div className="space-y-3 flex-1">
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

        {/* Data Management & Export */}
        <section className="lg:col-span-12 bg-surface border border-white/10 rounded-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="p-4 md:p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-on-surface tracking-tight">Data Management & Export</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-surface-container border border-outline-variant/30 transition-colors">
                <div>
                  <h3 className="font-medium text-on-surface mb-1 flex items-center gap-2">
                    <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Export Historical Data
                  </h3>
                  <p className="text-sm text-on-surface-variant">Download a complete JSON archive of all your past repository analysis results, scores, and detected issues.</p>
                </div>
                <button 
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-medium rounded-lg transition-colors border border-purple-500/20 hover:border-purple-500/40 shrink-0"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export Data
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                <div>
                  <h3 className="font-medium text-on-surface mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Clear Analysis History
                  </h3>
                  <p className="text-sm text-on-surface-variant">Permanently purge all historical scan results, ledgers, and cached repositories from Inspectra's servers. This does not delete your account.</p>
                </div>
                
                {showClearConfirm ? (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={handleClearHistory}
                      disabled={isClearing}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors border border-red-600"
                    >
                      {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Purge Data'}
                    </button>
                    <button 
                      onClick={() => setShowClearConfirm(false)}
                      disabled={isClearing}
                      className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-medium rounded-lg transition-colors border border-outline-variant"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>        {/* Notifications */}
        <section className="lg:col-span-7 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Notification Preferences</h3>
            </div>
            <div className="space-y-4">
              {/* Scan Completion */}
              <div className="flex items-center justify-between p-4 bg-surface-container border border-white/5 rounded-md">
                <div>
                  <h4 className="text-sm font-medium text-on-surface mb-1">Scan Completion</h4>
                  <p className="text-xs text-on-surface-variant">Email me when a deep-scan completes.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={notificationsState.scanCompletion}
                  onClick={() => handleToggleNotification('scanCompletion')}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${notificationsState.scanCompletion ? 'bg-white' : 'bg-surface-container-high'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black shadow transition-transform ${notificationsState.scanCompletion ? 'translate-x-[18px]' : 'translate-x-[4px]'}`} />
                </button>
              </div>
              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 bg-surface-container border border-white/5 rounded-md">
                <div>
                  <h4 className="text-sm font-medium text-on-surface mb-1">Weekly Digest</h4>
                  <p className="text-xs text-on-surface-variant">Send me a weekly digest of repository health and new vulnerabilities.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={notificationsState.weeklyDigest}
                  onClick={() => handleToggleNotification('weeklyDigest')}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${notificationsState.weeklyDigest ? 'bg-white' : 'bg-surface-container-high'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black shadow transition-transform ${notificationsState.weeklyDigest ? 'translate-x-[18px]' : 'translate-x-[4px]'}`} />
                </button>
              </div>
              {/* Critical Alerts */}
              <div className="flex items-center justify-between p-4 bg-surface-container border border-white/5 rounded-md">
                <div>
                  <h4 className="text-sm font-medium text-on-surface mb-1">Critical Alerts</h4>
                  <p className="text-xs text-on-surface-variant">Alert me immediately if a critical security vulnerability is found.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={notificationsState.criticalAlerts}
                  onClick={() => handleToggleNotification('criticalAlerts')}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${notificationsState.criticalAlerts ? 'bg-error' : 'bg-surface-container-high'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full ${notificationsState.criticalAlerts ? 'bg-white' : 'bg-black'} shadow transition-transform ${notificationsState.criticalAlerts ? 'translate-x-[18px]' : 'translate-x-[4px]'}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Management — col-span-5 */}
        <section className="lg:col-span-5 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">Security & Sessions</h3>
            </div>
            <div className="space-y-4 mb-4 flex-1">
              {/* Session info */}
              <div className="p-4 bg-surface-container border border-white/5 rounded-md">
                <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Active Session</h4>
                <p className="text-xs text-on-surface">
                  Secure connection active. Last authenticated today.
                </p>
              </div>
              {/* Action buttons */}
              <div className="space-y-1">
                <button 
                  onClick={() => setShowUserProfile(true)}
                  className="w-full flex items-center justify-between p-3 text-xs font-medium hover:bg-surface-container rounded-md transition-colors group"
                >
                  <span className="text-on-surface">Manage Password & Security</span>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                </button>
                <button 
                  onClick={() => setShowUserProfile(true)}
                  className="w-full flex items-center justify-between p-3 text-xs font-medium hover:bg-surface-container rounded-md transition-colors group text-red-500"
                >
                  <span>Deactivate Account</span>
                  <AlertTriangle className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
            {/* Logout */}
            <div className="mt-auto pt-4 border-t border-white/10">
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

        {/* API Integration — col-span-12 */}
        <section className="lg:col-span-12 bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-on-surface-variant" />
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">API Integration</h3>
            </div>
            <div className="bg-surface-container border border-dashed border-white/10 rounded-xl p-6">
              {/* GitHub header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-[#24292f] rounded flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">GitHub Integration</h4>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">
                    Status: <span className={
                      user?.externalAccounts?.some(acc => acc.provider === 'github') || (user as any)?.profile?.github_token || (user as any)?.metadata?.github_token 
                      ? "text-emerald-500" 
                      : "text-amber-500"
                    }>
                      {user?.externalAccounts?.some(acc => acc.provider === 'github') 
                        ? "CONNECTED (OAUTH)" 
                        : ((user as any)?.profile?.github_token || (user as any)?.metadata?.github_token) 
                        ? "CONNECTED (PAT)" 
                        : "DISCONNECTED"}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Connection Actions */}
              <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                {isGithubConnected ? (
                  <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-md border border-outline-variant/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface flex items-center justify-center">
                        {githubAccount?.imageUrl ? (
                          <img src={githubAccount.imageUrl} alt="GitHub avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Github className="w-4 h-4 text-on-surface-variant" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{githubAccount?.username || 'GitHub Account'}</p>
                        <p className="text-xs text-on-surface-variant">Connected</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDisconnectGithub}
                      disabled={isUpdating}
                      className="px-4 py-2 border border-error/50 text-error hover:bg-error/10 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-on-surface-variant mb-4">
                      Connect your GitHub account to automatically sync your repositories and enable one-click scanning.
                    </p>
                    <button 
                      onClick={handleConnectGithub}
                      disabled={isUpdating}
                      className="px-5 py-2.5 bg-[#24292f] hover:bg-[#24292f]/80 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                      Connect GitHub
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-4">
          <span>SYSTEM_VERSION: v4.2.0-stable</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>STATUS: NOMINAL</span>
        </div>
        <p className="text-[10px] text-on-surface-variant uppercase font-mono">
          © 2024 Inspectra AI Labs.
        </p>
      </footer>

      {/* Clerk UserProfile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl shadow-2xl border border-white/10">
             <button 
               onClick={() => setShowUserProfile(false)}
               className="absolute top-4 right-4 z-10 p-2 bg-surface border border-white/10 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
             <div className="flex justify-center bg-surface w-full py-4">
               <UserProfile 
                 appearance={{
                   baseTheme: dark,
                   elements: {
                     rootBox: "w-full mx-auto",
                     card: "bg-surface shadow-none w-full border-none",
                     navbar: "hidden", // We can hide navbar if we just want security section, but let's show all
                   }
                 }}
               />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
