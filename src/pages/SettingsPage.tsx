import React, { useState } from 'react';
import { User, Bell, Shield, Github, Key, Moon, Sun, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-gh-border pb-6">
        <h1 className="text-2xl font-semibold text-gh-text mb-1">Settings</h1>
        <p className="text-gh-muted text-sm">Manage your account preferences and integrations.</p>
      </div>

      <div className="grid gap-10">
        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gh-text">
            <User className="w-5 h-5 text-gh-muted" />
            <h2 className="font-semibold text-lg">Public profile</h2>
          </div>
          <div className="gh-box">
            <div className="gh-box-header">Profile Information</div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gh-header flex items-center justify-center border border-gh-border">
                  <User className="w-10 h-10 text-gh-muted" />
                </div>
                <div>
                  <Button variant="secondary" size="sm" className="bg-gh-header border-gh-border">Edit Avatar</Button>
                  <p className="text-xs text-gh-muted mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Name" defaultValue="Abhinav Saxena" className="bg-gh-bg border-gh-border" />
                <Input label="Public email" defaultValue="abhinav@example.com" className="bg-gh-bg border-gh-border" />
              </div>
              <div className="flex justify-start">
                <Button size="sm">Update profile</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Security & API */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gh-text">
            <Shield className="w-5 h-5 text-gh-muted" />
            <h2 className="font-semibold text-lg">Security & API</h2>
          </div>
          <div className="gh-box">
            <div className="gh-box-header">GitHub Integration</div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gh-text">Connected Account</p>
                  <p className="text-sm text-gh-muted">Connected as @abhinav-saxena</p>
                </div>
                <Button variant="secondary" size="sm" className="text-gh-red border-gh-border hover:bg-gh-red/10">Disconnect</Button>
              </div>
              <div className="h-[1px] bg-gh-border" />
              <div className="space-y-4">
                <p className="font-bold text-gh-text">Personal Access Tokens</p>
                <div className="flex gap-3">
                  <Input 
                    type="password" 
                    value="sk_test_51Mz9X2S..." 
                    readOnly 
                    className="font-mono text-xs bg-gh-header border-gh-border"
                    icon={<Key className="w-4 h-4" />}
                  />
                  <Button variant="secondary" size="sm" className="bg-gh-header border-gh-border">Copy</Button>
                </div>
                <p className="text-xs text-gh-muted italic">Use this token to integrate with your CI/CD pipeline.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gh-red">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Danger Zone</h2>
          </div>
          <div className="gh-box border-gh-red/30">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-gh-text">Delete account</p>
                <p className="text-sm text-gh-muted">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <Button variant="secondary" size="sm" className="text-gh-red border-gh-red/30 hover:bg-gh-red hover:text-white">Delete account</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
