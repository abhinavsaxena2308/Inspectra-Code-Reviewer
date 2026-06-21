import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { HistoryPage } from './pages/HistoryPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Sidebar } from './components/layout/Sidebar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'sonner';
import { CommandPalette } from './components/ui/CommandPalette';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider, useToast } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';
import { AnimatePresence, motion } from 'motion/react';
import { ChatWidget } from './components/ui/ChatWidget';

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { toasts, removeToast } = useToast();
  return (
    <>
      {children}
      <Toaster theme="system" position="bottom-right" richColors toastOptions={{
        style: { background: 'var(--color-surface)', border: '1px solid var(--color-outline)', color: 'var(--color-on-surface)' }
      }} />
    </>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const authRoutes = ['/', '/login', '/register'];
  const isPublicPage = authRoutes.includes(location.pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-void text-on-surface overflow-hidden font-sans">
      <CommandPalette />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Cinematic Backdrop for internal pages */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(82,39,255,0.05),transparent_40%)] pointer-events-none" />
        
        <main className="flex-1 overflow-y-auto relative z-10 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Global Chat Widget */}
        {!isPublicPage && <ChatWidget />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent>
              <AppLayout>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes — must be authenticated */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/analysis/:id" element={<AnalysisPage />} />
                    <Route path="/architecture" element={<ArchitecturePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/repos" element={<RepositoriesPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </AppContent>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </Router>
  );
}
