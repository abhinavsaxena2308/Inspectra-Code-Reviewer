import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Github, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { insforge } from '../lib/insforge';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setIsLoading(true);
    try {
      const { data, error: authError } = await insforge.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message || 'Invalid email or password.');
        return;
      }
      if (data?.user) {
        setUser(data.user);
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHub = async () => {
    setIsOAuthLoading(true);
    try {
      await insforge.auth.signInWithOAuth({
        provider: 'github',
        redirectTo: window.location.origin + '/dashboard',
      });
    } catch (err: any) {
      setError(err?.message || 'GitHub sign-in failed.');
      setIsOAuthLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsOAuthLoading(true);
    try {
      await insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: window.location.origin + '/dashboard',
      });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
      setIsOAuthLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Inspectra"
    >
      {/* OAuth Buttons */}
      <div className="flex flex-col gap-3 mb-5">
        <button
          onClick={handleGitHub}
          disabled={isOAuthLoading || isLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOAuthLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          Continue with GitHub
        </button>

        <button
          onClick={handleGoogle}
          disabled={isOAuthLoading || isLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOAuthLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30">or with email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isOAuthLoading}
          className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in...</>
          ) : 'Sign in'}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-white/30">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};
