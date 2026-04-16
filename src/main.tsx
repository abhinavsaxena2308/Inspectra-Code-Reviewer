import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from "@clerk/react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* @ts-ignore - publishableKey is picked up from VITE_CLERK_PUBLISHABLE_KEY as per guidelines */}
    <ClerkProvider 
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
