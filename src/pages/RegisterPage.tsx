import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { insforge } from '../lib/insforge';
import { useAuth } from '../hooks/useAuth';

type Step = 'register' | 'verify';

// ── OTP Input ────────────────────────────────────────────────────────────────
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const next = [...digits];
    next[index] = char.slice(-1);
    onChange(next.join('').trimEnd());
    if (char && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-11 h-12 text-center text-lg font-bold rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/70 focus:bg-white/8 transition-colors disabled:opacity-40 caret-transparent"
        />
      ))}
    </div>
  );
};

// ── RegisterPage ──────────────────────────────────────────────────────────────
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>('register');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordTooShort = password && password.length < 8;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setIsLoading(true);
    try {
      const { data, error: authError } = await insforge.auth.signUp({ email, password, name });
      if (authError) { setError(authError.message || 'Registration failed. Try again.'); return; }

      if (data) {
        // Account created — show OTP verification step
        setRegisteredEmail(email);
        setStep('verify');
        startResendCooldown();
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const { data, error: verifyError } = await insforge.auth.verifyEmail({
        email: registeredEmail,
        otp,
      });
      if (verifyError) { setError(verifyError.message || 'Invalid or expired code. Try again.'); return; }
      if (data?.user) {
        setUser(data.user);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await insforge.auth.resendVerificationEmail({ email: registeredEmail });
      startResendCooldown();
    } catch (err: any) {
      setError(err?.message || 'Could not resend email.');
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleGitHub = async () => {
    setIsOAuthLoading(true);
    try {
      await insforge.auth.signInWithOAuth({ provider: 'github', redirectTo: window.location.origin + '/dashboard' });
    } catch (err: any) {
      setError(err?.message || 'GitHub sign-in failed.');
      setIsOAuthLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsOAuthLoading(true);
    try {
      await insforge.auth.signInWithOAuth({ provider: 'google', redirectTo: window.location.origin + '/dashboard' });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
      setIsOAuthLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title={step === 'register' ? 'Create an account' : 'Verify your email'}
      subtitle={
        step === 'register'
          ? 'Start reviewing code with AI today'
          : `We sent a 6-digit code to ${registeredEmail}`
      }
    >
      <AnimatePresence mode="wait">

        {/* ── Step 1: Register ── */}
        {step === 'register' && (
          <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* OAuth Buttons */}
            <div className="flex flex-col gap-3 mb-5">
              <button
                onClick={handleGitHub}
                disabled={isOAuthLoading || isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOAuthLoading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Github className="w-4 h-4" />}
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

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required
                    className={`w-full pl-9 pr-10 py-2.5 rounded-md bg-white/5 border text-white text-sm placeholder-white/20 focus:outline-none transition-colors ${passwordTooShort ? 'border-red-500/40' : 'border-white/10 focus:border-blue-500/50'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required
                    className={`w-full pl-9 pr-10 py-2.5 rounded-md bg-white/5 border text-white text-sm placeholder-white/20 focus:outline-none transition-colors ${confirmPassword && !passwordsMatch ? 'border-red-500/40' : confirmPassword && passwordsMatch ? 'border-green-500/40' : 'border-white/10 focus:border-blue-500/50'}`} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {confirmPassword && passwordsMatch && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-white/20 hover:text-white/50 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading || isOAuthLoading}
                className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                {isLoading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account...</> : 'Create account'}
              </button>
            </form>

            <p className="mt-3 text-center text-[11px] text-white/20 leading-relaxed">
              By creating an account, you agree to our <span className="text-blue-400/70">Terms</span> and <span className="text-blue-400/70">Privacy Policy</span>.
            </p>
            <p className="mt-5 text-center text-xs text-white/30">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
            </p>
          </motion.div>
        )}

        {/* ── Step 2: Verify OTP ── */}
        {step === 'verify' && (
          <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

            {/* Mail icon */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Mail className="w-7 h-7 text-blue-400" />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{error}
              </motion.div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(''); }} disabled={isLoading} />

              <button type="submit" disabled={isLoading || otp.length < 6}
                className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Verifying...</> : 'Verify email'}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center">
              <p className="text-xs text-white/30 mb-2">Didn't receive the code?</p>
              <button onClick={handleResend} disabled={resendCooldown > 0}
                className="flex items-center gap-1.5 mx-auto text-xs text-blue-400 hover:text-blue-300 disabled:text-white/20 disabled:cursor-not-allowed transition-colors font-medium">
                <RefreshCw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>

            {/* Back */}
            <button onClick={() => { setStep('register'); setOtp(''); setError(''); }}
              className="flex items-center gap-1.5 mx-auto text-xs text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to registration
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </AuthLayout>
  );
};
