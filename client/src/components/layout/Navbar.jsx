import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, Search, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../lib/api';
import MagneticButton from '../animations/MagneticButton';
import { useScramble } from '../../lib/useScramble';

function ScrambleNavLink({ link, active, isHovered, onHover, onClick }) {
  const { displayText, trigger, reset } = useScramble(link.label);

  return (
    <Link
      to={link.href}
      onMouseEnter={() => {
        onHover(link.label);
        trigger();
      }}
      onMouseLeave={() => {
        onHover(null);
        reset();
      }}
      onClick={(e) => onClick(e, link.href)}
      className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
        active
          ? 'text-[#0a0a0a] font-bold z-10'
          : 'text-white/60 hover:text-white'
      }`}
    >
      <span className="relative z-10">{displayText}</span>

      {active && (
        <motion.div
          layoutId="activeNavPill"
          className="absolute inset-0 bg-gold rounded-full shadow-[0_0_15px_rgba(201,162,77,0.5)] -z-0"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}

      {!active && isHovered && (
        <motion.div
          layoutId="hoverNavPill"
          className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/10 -z-0"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}
    </Link>
  );
}

export default function Navbar({ onReserveSpot, onOpenSearch, hasAnnouncement = false }) {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nextWorkshop, setNextWorkshop] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Top window scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch next upcoming workshop for Reserve button
  useEffect(() => {
    async function loadNextWorkshop() {
      try {
        const res = await api.get('/workshops?upcoming=true&limit=1');
        if (res.data?.workshops?.length > 0) {
          setNextWorkshop(res.data.workshops[0]);
        }
      } catch (e) {
        // graceful fallback
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
    <>
      {/* ─── Ultra-thin Gold/Violet Global Scroll Progress Bar ─── */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold via-violet to-gold origin-left z-[100] pointer-events-none"
      />

      {/* ─── Full-Size Fixed Header Navbar ─── */}
      <header
        className={`fixed left-0 right-0 z-50 w-full transition-all duration-300 border-b ${
          hasAnnouncement && !scrolled ? 'top-[35px]' : 'top-0'
        } ${
          scrolled
            ? 'bg-[#0a0a0c]/95 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
            : 'bg-[#0a0a0c]/85 backdrop-blur-xl border-white/[0.08]'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between py-3 sm:py-3.5 transition-all duration-300">
          {/* Brand Logo & Pill Indicator */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 shrink-0 focus:outline-none"
            data-cursor="HUB"
          >
            <div className="w-8 h-8 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_0_15px_rgba(201,162,77,0.4)]">
              <img
                src={settings?.logo || '/Logo.png'}
                alt={settings?.platformName || 'Workshop Hub'}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm tracking-wider text-white uppercase group-hover:text-gold transition-colors flex items-center gap-1.5">
                {settings?.platformName || 'WORKSHOP HUB'}
                <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)] animate-pulse" />
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase hidden sm:inline">
                DUBAI · NYC · LDN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Scramble Decode */}
          <div
            className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/[0.06]"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => (
              <ScrambleNavLink
                key={link.label}
                link={link}
                active={isActiveLink(link.href)}
                isHovered={hoveredLink === link.label}
                onHover={setHoveredLink}
                onClick={handleNavClick}
              />
            ))}
          </div>

          {/* Desktop Right Actions: Search (⌘K) & Magnetic Gold Reserve */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-gold/40 transition-all text-xs font-mono"
              title="Quick Search (⌘K)"
              data-cursor="FIND"
            >
              <Search size={12} className="text-gold" />
              <span className="text-[11px] font-mono uppercase tracking-wider hidden lg:inline">Search</span>
              <kbd className="text-[10px] font-mono text-white/40 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full">
                ⌘K
              </kbd>
            </button>

            <MagneticButton
              onClick={handleReserveClick}
              className="btn-primary text-[11px] font-mono py-2 px-5 font-bold tracking-wider rounded-full shadow-gold-glow flex items-center gap-1.5 group"
              data-cursor="RESERVE"
            >
              <span>Reserve a Spot</span>
              <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>
          </div>

          {/* Mobile Right Controls: Search + Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Search"
            >
              <Search size={15} />
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile Slide-Down Drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed ${hasAnnouncement && !scrolled ? 'top-[112px]' : 'top-[74px]'} left-4 right-4 z-50 md:hidden overflow-hidden rounded-3xl glass-strong border border-white/15 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] transition-all duration-300`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
                NAVIGATION
              </span>
              <span className="font-mono text-[10px] text-white/40 uppercase">
                DUBAI · 2026
              </span>
            </div>

            <div className="space-y-1.5">
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
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-mono uppercase tracking-wider transition-colors ${
                      active
                        ? 'bg-gold text-[#0a0a0a] font-extrabold shadow-gold-glow'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={13} className={active ? 'text-[#0a0a0a]' : 'text-white/30'} />
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 mt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleReserveClick();
                }}
                className="btn-primary w-full justify-center text-xs font-mono py-3"
              >
                Reserve a Spot →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
