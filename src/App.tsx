import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JosueCoachWidget } from './components/JosueCoachWidget';
import { useAuth } from './context/AuthContext';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const SetupProfile = lazy(() => import('./pages/Auth/SetupProfile').then(m => ({ default: m.SetupProfile })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Courses = lazy(() => import('./pages/Courses').then(m => ({ default: m.Courses })));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer').then(m => ({ default: m.CoursePlayer })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount').then(m => ({ default: m.DeleteAccount })));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales').then(m => ({ default: m.MentionsLegales })));
const CGV = lazy(() => import('./pages/CGV').then(m => ({ default: m.CGV })));
const Confidentialite = lazy(() => import('./pages/Confidentialite').then(m => ({ default: m.Confidentialite })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Premium loading fallback for Suspense
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-obsidian flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 border-4 border-t-gold-500 border-zinc-800 rounded-full animate-spin" />
      <p className="text-sm text-zinc-500 font-medium animate-pulse">Chargement...</p>
    </div>
  </div>
);

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user profile setup is not completed, redirect to setup profile
  if (!user.setupCompleted && !user.setupPostponed && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }
  
  return <>{children}</>;
};

// Animated routes wrapper for page transitions
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Profile onboarding setup */}
          <Route path="/setup-profile" element={
            <ProtectedRoute>
              <SetupProfile />
            </ProtectedRoute>
          } />

          {/* Dashboard & related sub-views */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/tools" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/studio" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/practice" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/collaborations" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Course catalog & interactive player */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={
            <ProtectedRoute>
              <CoursePlayer />
            </ProtectedRoute>
          } />

          {/* Account configuration */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/delete-account" element={
            <ProtectedRoute>
              <DeleteAccount />
            </ProtectedRoute>
          } />

          {/* Public Legal & Contact routes */}
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/contact" element={<Contact />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen bg-obsidian text-zinc-100 font-sans antialiased">
              {/* Skip to content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-gold-500 focus:text-obsidian focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
              >
                Aller au contenu principal
              </a>

              <Navbar />
              
              <main id="main-content" className="flex-grow">
                <AnimatedRoutes />
              </main>

              <Footer />
              <JosueCoachWidget />
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
