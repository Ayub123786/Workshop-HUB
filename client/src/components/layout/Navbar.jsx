import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar as CalendarIcon, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../lib/api';
import MagneticButton from '../animations/MagneticButton';

export default function Navbar({ onReserveSpot, onOpenSearch }) {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nextWorkshop, setNextWorkshop] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  // Scroll progress bar directly bound to navbar bottom edge
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Blur trigger
      setScrolled(currentScrollY > 20);

      // On workshop detail pages, keep navbar fixed at top without hiding on scroll
      if (location.pathname.startsWith('/w/')) {
        setHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide on scroll down, reveal on scroll up
      if (currentScrollY > 120 && currentScrollY > lastScrollY.current + 8) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current - 8 || currentScrollY <= 100) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

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

  // Close mobile menu and ensure navbar is visible on route change
  useEffect(() => {
    setMobileOpen(false);
    if (location.pathname.startsWith('/w/')) {
      setHidden(false);
    }
  }, [location.pathname, location.search]);

  const navLinks = [
    { label: 'Workshops', href: '/workshops' },
    { label: 'Calendar', href: '/workshops?view=calendar' },
    { label: 'Upcoming', href: '/workshops?status=upcoming' },
    { label: 'Past', href: '/#past' },
    { label: 'About', href: '/#about' },
  ];

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', href);
        }
      }
    }
  };

  const handleReserveClick = () => {
    if (onReserveSpot && nextWorkshop) {
      onReserveSpot(nextWorkshop);
      return;
    }
    // If currently on any workshop page (/w/:slug), trigger register modal on current page!
    if (location.pathname.startsWith('/w/')) {
      window.dispatchEvent(new CustomEvent('open-register-modal'));
      return;
    }
    if (nextWorkshop) {
      if (location.pathname === `/w/${nextWorkshop.slug}`) {
        window.dispatchEvent(new CustomEvent('open-register-modal', { detail: nextWorkshop }));
      } else {
        navigate(`/w/${nextWorkshop.slug}?reserve=true`);
      }
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
    <motion.header
      animate={{ y: hidden && !location.pathname.startsWith('/w/') ? '-100%' : '0%' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-[16px] border-b border-[#E8E8E8] shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
          : 'bg-white/95 md:bg-white/70 backdrop-blur-sm border-b border-[#E8E8E8]/60'
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
          <div
            className="hidden md:flex items-center gap-1 lg:gap-2"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              const isHovered = hoveredLink === link.label;

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onMouseEnter={() => setHoveredLink(link.label)}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative text-xs lg:text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${
                    active
                      ? 'text-navy font-semibold'
                      : 'text-muted hover:text-navy'
                  }`}
                >
                  {link.label}

                  {/* Active Gold Underline */}
                  {active && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover Floating Underline Indicator */}
                  {!active && isHovered && (
                    <motion.div
                      layoutId="hoverNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-gold/50 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 py-2 px-3 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-muted hover:text-navy hover:border-gold/50 transition-colors text-xs"
              title="Search masterclasses (⌘K)"
            >
              <Search size={13} className="text-navy/60" />
              <span className="hidden lg:inline text-xs font-medium">Search...</span>
              <kbd className="hidden lg:inline-block text-[10px] font-mono text-muted bg-white border border-[#E8E8E8] px-1 py-0.2 rounded">
                ⌘K
              </kbd>
            </button>

            <MagneticButton
              onClick={handleReserveClick}
              className="btn-primary text-xs lg:text-sm py-2 px-4 shadow-2xs hover:shadow-xs transition-all font-semibold rounded-full"
            >
              Reserve a Spot
            </MagneticButton>
          </div>

          {/* Mobile Right Controls: Search + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors"
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg border border-border text-navy hover:bg-cream transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
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
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleNavClick(e, link.href);
                    }}
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
    </motion.header>
  );
}
