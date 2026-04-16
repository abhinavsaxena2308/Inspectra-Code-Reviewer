import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { GradientBlinds } from '../ui/GradientBlinds';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/auth-bg.png" 
          alt="Backdrop" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10 mt-10"
      >
        {/* Logo/Brand Header */}
        {/* <div className="flex flex-col items-center mb-10 text-center">
          {/* <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container p-3.5 mb-6 shadow-2xl shadow-primary/20 flex items-center justify-center"
          >
            {/* <Shield className="w-full h-full text-on-primary" /> */}
          {/* </motion.div> */}
          {/* <h1 className="text-4xl font-heading font-bold tracking-tight text-white mb-3">
            {title}
          </h1>
          <p className="text-white/40 font-medium">
            {subtitle}
          </p>
        </div> */} 

        {/* Auth Card Content */}
        <div className="glass-card p-1 rounded-3xl backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
           <div className="bg-void/40 rounded-[22px] p-6 md:p-8">
              {children}
           </div>
        </div>

        {/* Footer Link (Optional Branding) */}
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 select-none">
          Secure Infrastructure System v4.2
        </p>
      </motion.div>

      {/* Decorative Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};
