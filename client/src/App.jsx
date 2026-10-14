import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import { Loader2 } from 'lucide-react';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Shared Layouts & Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import HubPage from './pages/HubPage';
import WorkshopsPage from './pages/WorkshopsPage';
import WorkshopDetailPage from './pages/WorkshopDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminWorkshopsPage from './pages/admin/AdminWorkshopsPage';
import AdminWorkshopEditPage from './pages/admin/AdminWorkshopEditPage';
import AdminFormBuilderPage from './pages/admin/AdminFormBuilderPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';
import AdminImagesPage from './pages/admin/AdminImagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';



// Lenis smooth scroll provider
function SmoothScrollManager({ children }) {
  useEffect(() => {
    // Only enable Lenis if not in reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
    };
  }, []);

  return children;
}

// Scroll-to-top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected route wrapper for admin
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
        <p className="text-xs text-muted">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

// Public site layout wrapper (Navbar + Content + Footer)
function PublicLayout() {
  return (
    <SmoothScrollManager>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SmoothScrollManager>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Site Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HubPage />} />
                <Route path="/workshops" element={<WorkshopsPage />} />
                <Route path="/w/:slug" element={<WorkshopDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="workshops" element={<AdminWorkshopsPage />} />
                <Route path="workshops/new" element={<AdminWorkshopsPage />} />
                <Route path="workshops/:id/edit" element={<AdminWorkshopEditPage />} />
                <Route path="workshops/:id/form" element={<AdminFormBuilderPage />} />
                <Route path="submissions" element={<AdminSubmissionsPage />} />
                <Route path="images" element={<AdminImagesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
