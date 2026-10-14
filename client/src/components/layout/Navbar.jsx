import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../lib/api';

export default function Navbar({ onReserveSpot }) {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nextWorkshop, setNextWorkshop] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll progress bar directly bound to navbar bottom edge
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch next upcoming workshop for "Reserve a Spot" button
  useEffect(() => {
    async function loadNextWorkshop() {
      try {
        const res = await api.get('/workshops?upcoming=true&limit=1');
        if (res.data?.workshops?.length > 0) {
          setNextWorkshop(res.data.workshops[0]);
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
    loadNextWorkshop();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const navLinks = [
    { label: 'Workshops', href: '/workshops' },
    { label: 'Calendar', href: '/workshops?view=calendar' },
    { label: 'Upcoming', href: '/workshops?status=upcoming' },
    { label: 'Past', href: '/workshops?status=completed' },
    { label: 'About', href: '/#about' },
  ];

  const handleReserveClick = () => {
    if (onReserveSpot && nextWorkshop) {
      onReserveSpot(nextWorkshop);
      return;
    }
    // Dispatch global reserve event for HubPage or detail pages
    if (nextWorkshop) {
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: nextWorkshop }));
    } else {
      navigate('/workshops');
      const el = document.getElementById('workshops') || document.getElementById('explore');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActiveLink = (href) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.replace('/', '');
    }
    const [path, query] = href.split('?');
    if (location.pathname !== path) return false;
    if (!query) return !location.search || location.search === '';
    return location.search.includes(query);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 transition-all duration-200 bg-white/85 backdrop-blur-md border-b border-[#E8E8E8] ${
        scrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.05)]' : ''
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={settings?.logo || '/Logo.png'}
              alt={settings?.platformName || 'Workshop Hub'}
              className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-bold text-navy text-base md:text-lg tracking-tight">
              {settings?.platformName || 'Workshop Hub'}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative text-xs lg:text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${
                    active
                      ? 'text-navy font-semibold'
                      : 'text-muted hover:text-navy hover:bg-cream/80'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Reserve Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleReserveClick}
              className="btn-primary text-xs lg:text-sm py-2 px-4 shadow-2xs hover:shadow-xs transition-all"
            >
              Reserve a Spot
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg border border-border text-navy hover:bg-cream transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-white border-b border-[#E8E8E8] shadow-card-hover"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-cream text-navy font-semibold border-l-2 border-gold pl-2.5'
                        : 'text-muted hover:text-navy hover:bg-cream'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-2 mt-2 border-t border-[#E8E8E8]">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleReserveClick();
                  }}
                  className="btn-primary w-full justify-center text-sm py-2.5"
                >
                  Reserve a Spot
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2px Gold Scroll Progress Bar pinned to navbar bottom edge */}
      <motion.div
        style={{ scaleX }}
        className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gold origin-left pointer-events-none z-50"
      />
    </header>
  );
}
