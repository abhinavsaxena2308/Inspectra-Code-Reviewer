import React from 'react';
import { SignIn, Show } from "@clerk/react";
import { AuthLayout } from '../components/auth/AuthLayout';
import { Navigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  return (
    <>
      <Show when="signed-in">
        <Navigate to="/dashboard" replace />
      </Show>
      
      <Show when="signed-out">
        <AuthLayout
          title="Sign In"
          subtitle="Access your precision analysis toolkit"
        >
          <div className="flex justify-center -m-4">
            <SignIn 
              appearance={{
                layout: {
                  socialButtonsPlacement: "bottom",
                  showOptionalFields: false,
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-none shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all rounded-xl h-11",
                  socialButtonsBlockButtonText: "text-white font-medium",
                  dividerLine: "bg-white/10",
                  dividerText: "text-white/30 text-[10px] uppercase font-bold tracking-widest",
                  formFieldLabel: "text-white/50 text-xs font-semibold mb-2 ml-1 uppercase tracking-wider",
                  formFieldInput: "bg-black/20 border-white/10 text-white focus:border-primary/50 transition-all rounded-xl h-11 placeholder:text-white/10",
                  formFieldAction: "text-primary hover:text-primary-container text-xs font-bold transition-all",
                  formButtonPrimary: "bg-primary hover:bg-primary-container text-on-primary font-bold rounded-xl h-11 shadow-lg shadow-primary/20 transition-all",
                  footerActionText: "text-white/30 text-xs",
                  footerActionLink: "text-primary hover:text-primary-container font-bold transition-all",
                  formResendCodeLink: "text-primary hover:text-primary-container font-bold transition-all",
                  identityPreviewText: "text-white",
                  identityPreviewEditButtonIcon: "text-primary",
                  otpCodeFieldInput: "bg-black/20 border-white/10 text-white rounded-xl"
                }
              }}
              routing="path"
              path="/login"
              signUpUrl="/register"
              forceRedirectUrl="/dashboard"
            />
          </div>
        </AuthLayout>
      </Show>
    </>
  );
};
