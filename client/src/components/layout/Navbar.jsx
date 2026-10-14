import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';

export default function Navbar() {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const defaultLinks = [
    { label: 'Workshops', href: '/workshops' },
    { label: 'Upcoming', href: '/workshops?filter=upcoming' },
    { label: 'Past', href: '/workshops?filter=past' },
  ];

  const navLinks = settings?.navbarLinks?.length > 0 ? settings.navbarLinks : defaultLinks;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-card' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        {/* Scroll progress bar */}
        <div
          id="scroll-progress"
          className="absolute bottom-0 left-0 h-px bg-gold origin-left transition-transform duration-150 ease-linear"
          style={{ width: '100%', transform: 'scaleX(0)' }}
        />

        <nav className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src={settings?.logo || '/Logo.png'}
                alt={settings?.platformName || 'Workshop Hub'}
                className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-bold text-navy text-lg tracking-tight">
                {settings?.platformName || 'Workshop Hub'}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-cream-dark text-navy'
                        : 'text-muted hover:text-navy hover:bg-cream-dark'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/workshops" className="btn-primary text-sm py-2.5 px-5">
                Register
                <ExternalLink size={14} />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-cream-dark transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-border shadow-card-hover md:hidden"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium px-4 py-3 rounded-lg transition-all ${
                      isActive ? 'bg-cream-dark text-navy' : 'text-muted hover:text-navy hover:bg-cream-dark'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 pt-2 border-t border-border">
                <Link to="/workshops" className="btn-primary w-full justify-center text-sm">
                  Register
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
