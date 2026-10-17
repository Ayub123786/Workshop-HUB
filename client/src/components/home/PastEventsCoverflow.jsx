import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  X,
  ExternalLink,
  Sparkles,
  Share2,
  Check,
  CheckCircle2,
  Loader2,
  Maximize2
} from 'lucide-react';
import api from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

// Curated 11 executive demo day / summit highlights matching screenshot specs
const DEFAULT_PAST_EVENTS = [
  {
    id: 'evt-01',
    badge: 'DEMO DAY HIGHLIGHT',
    subBadge: 'Live Preview',
    title: 'Investors Roundtable & Demo Day',
    subtitle: 'Annual institutional allocators & emerging GP presentation day',
    category: 'Venture Capital & PE',
    date: 'Oct 12, 2025',
    duration: '48 mins',
    attendees: '450+ Allocators',
    location: 'New York & Global Stream',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    description: 'Executive keynote and panel discussion featuring 14 institutional portfolio founders presenting capital allocation metrics, secondary offerings, and co-investment models.',
    keyTakeaways: [
      'Institutional underwriting thresholds for 2025-2026 vintages',
      'Direct co-investment structuring without standard 2/20 fee erosion',
      'Live LP & GP question-and-answer breakdown on capital deployment pace'
    ],
  },
  {
    id: 'evt-02',
    badge: 'FAST-TRACK MATCHING',
    subBadge: 'Live Preview',
    title: 'Demo Day Pitches & Fast-Track Matching',
    subtitle: '1-on-1 bilateral deal rooms and structured syndicate pitches',
    category: 'Direct Dealmaking',
    date: 'Sep 28, 2025',
    duration: '62 mins',
    attendees: '320+ Investors',
    location: 'San Francisco & Hybrid',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://player.vimeo.com/video/76979871',
    description: 'High-velocity 5-minute speed pitches paired with live term sheet breakdowns and fast-track diligence rooms for cross-border syndicates.',
    keyTakeaways: [
      'Standardized term-sheet diligence checklists used by top 100 family offices',
      'Cap table recapitalization frameworks for scale-up rounds',
      'Real-time valuation multiples across SaaS, FinTech, and Energy'
    ],
  },
  {
    id: 'evt-03',
    badge: 'SPEED PITCHES',
    subBadge: 'Live Preview',
    title: 'Breakthrough Moments Demo Day',
    subtitle: 'High-conviction pitches in growth equity and enterprise infrastructure',
    category: 'Growth Equity & AI',
    date: 'Aug 18, 2025',
    duration: '55 mins',
    attendees: '280+ Dealmakers',
    location: 'London Mayfair & Live Stream',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Curated showcase of high-growth technology scaleups pitching to European private equity, venture debt, and sovereign wealth investment teams.',
    keyTakeaways: [
      'Unit economic viability benchmarks in enterprise AI implementations',
      'Venture debt layering alongside Series B & C equity financing',
      'Cross-border expansion into Middle Eastern and North American markets'
    ],
  },
  {
    id: 'evt-04',
    badge: 'COHORT MASTERCLASS',
    subBadge: 'Live Preview',
    title: 'Family Office Direct Deal Sourcing',
    subtitle: 'Off-market proprietary deal origination and club-deal syndication',
    category: 'Family Office',
    date: 'Jul 22, 2025',
    duration: '90 mins',
    attendees: '190+ Principals',
    location: 'Zurich Executive Room',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    description: 'Deep dive into direct deal sourcing pipelines that bypass intermediated bank auctions, establishing proprietary relationships with founder-owners.',
    keyTakeaways: [
      'Target acquisition search funnels using automated data scrapers',
      'Minority vs majority control provisions in privately held businesses',
      'Club-deal governance and co-investor decision-making matrices'
    ],
  },
  {
    id: 'evt-05',
    badge: 'WORKSHOP ARCHIVE',
    subBadge: 'Live Preview',
    title: 'Cross-Border LBO Modeling & Value Creation',
    subtitle: 'Advanced debt sculpting, return sensitivity, and waterfall math',
    category: 'Private Equity',
    date: 'Jun 14, 2025',
    duration: '110 mins',
    attendees: '210+ PE Associates',
    location: 'New York Wall Street Lab',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://player.vimeo.com/video/76979871',
    description: 'Institutional-grade leveraged buyout financial modeling clinic covering complex debt-layering (senior, mezzanine, PIK) and dynamic exit multiple sensitivities.',
    keyTakeaways: [
      'Circular debt sweep formulas in Excel without circular reference errors',
      'Management incentive options and ratchets in sponsor buyouts',
      'Foreign exchange hedging for cross-border European and US portfolio deals'
    ],
  },
  {
    id: 'evt-06',
    badge: 'TECH KEYNOTE',
    subBadge: 'Live Preview',
    title: 'AI-Powered Due Diligence Agent Architecture',
    subtitle: 'Autonomous document parsing, financial reconciliation, and red-flags',
    category: 'AI & FinTech',
    date: 'May 30, 2025',
    duration: '75 mins',
    attendees: '510+ Delegates',
    location: 'Singapore Marina Bay',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Technical walkthrough demonstrating an end-to-end Python & LLM agent stack that audits 500+ page virtual data rooms in under 15 minutes.',
    keyTakeaways: [
      'Multi-agent document parsing across unstructured PDFs and scan OCR',
      'Automated financial statement balance checks and footnote reconciliation',
      'Secure on-premises and private cloud LLM deployment for strict NDA deals'
    ],
  },
  {
    id: 'evt-07',
    badge: 'EXECUTIVE FORUM',
    subBadge: 'Live Preview',
    title: 'Sovereign Wealth Co-Investment Frameworks',
    subtitle: 'Structuring multi-billion dollar direct co-investments in EMEA',
    category: 'Sovereign Wealth',
    date: 'Apr 19, 2025',
    duration: '80 mins',
    attendees: '230+ Allocators',
    location: 'Abu Dhabi ADGM',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    description: 'Governance structures, fast-track LP advisory committees, and side-car vehicles utilized by Middle Eastern SWFs.',
    keyTakeaways: [
      'LPAC voting thresholds and veto rights in global mega-funds',
      'Side-letter transparency protocols under updated SEC rules',
      'Direct co-underwriting alongside lead sponsors'
    ],
  },
  {
    id: 'evt-08',
    badge: 'VENTURE SUMMIT',
    subBadge: 'Live Preview',
    title: 'DeepTech Liquidity & Secondaries Masterclass',
    subtitle: 'Navigating GP-led secondary continuation vehicles and tender offers',
    category: 'Venture Secondaries',
    date: 'Mar 15, 2025',
    duration: '65 mins',
    attendees: '340+ GPs & LPs',
    location: 'Berlin Hub & Live Stream',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://player.vimeo.com/video/76979871',
    description: 'Practical mechanics of LP-led portfolio sales, GP continuation funds, and structured secondary transactions.',
    keyTakeaways: [
      'Discount to NAV trends across enterprise software portfolios',
      'Fiduciary fairness opinions in GP-led restructuring',
      'Tax efficiency for international cross-border secondary pools'
    ],
  },
  {
    id: 'evt-09',
    badge: 'CREDIT CLINIC',
    subBadge: 'Live Preview',
    title: 'Private Credit Underwriting & Unitranche Terms',
    subtitle: 'Direct lending covenants, EBITDA adjustments, and debt pricing',
    category: 'Private Debt',
    date: 'Feb 20, 2025',
    duration: '85 mins',
    attendees: '175+ Lenders',
    location: 'London Canary Wharf',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Deep dive into direct lending term sheets, recurring revenue covenants, and mezzanine yield enhancement.',
    keyTakeaways: [
      'Standard covenant-lite pitfalls during market contraction',
      'PIK toggle provisions and synthetic equity kickers',
      'Restructuring workout playbooks for distressed assets'
    ],
  },
  {
    id: 'evt-10',
    badge: 'QUANT SYMPOSIUM',
    subBadge: 'Live Preview',
    title: 'Systematic Macro & Alternative Data Pipelines',
    subtitle: 'Harnessing satellite, credit card, and shipping telemetry for alpha',
    category: 'Quantitative Finance',
    date: 'Jan 18, 2025',
    duration: '90 mins',
    attendees: '410+ Quants',
    location: 'Chicago Board of Trade Lab',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    description: 'Technical session on building robust signal generation pipelines from noisy alternative data streams.',
    keyTakeaways: [
      'Backtesting bias corrections in high-cardinality data sets',
      'Alternative data compliance and MNPI screening frameworks',
      'Execution cost reduction via automated order routing'
    ],
  },
  {
    id: 'evt-11',
    badge: 'ANNUAL GALA',
    subBadge: 'Live Preview',
    title: 'Global Allocator Summit 2024 Keynote',
    subtitle: 'Macroeconomic outlook and 5-year capital deployment strategy',
    category: 'Global Macro',
    date: 'Dec 05, 2024',
    duration: '105 mins',
    attendees: '800+ Executives',
    location: 'Geneva Lakeside Palace',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://player.vimeo.com/video/76979871',
    description: 'Our annual flagship keynote bringing together CIOs and Managing Directors from sovereign funds, pension plans, and endowments.',
    keyTakeaways: [
      'Long-term interest rate trajectory and multi-asset implications',
      'Geopolitical risk hedging across private markets',
      'Strategic asset allocation for decade-long horizons'
    ],
  },
];

/**
 * SmartVideoPlayer - Seamless video playback supporting Vimeo, YouTube, and direct HTML5 MP4s
 */
function SmartVideoPlayer({ url, poster, title }) {
  const [hasError, setHasError] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  const videoSrc = url || '';

  const vimeoMatch = videoSrc.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
        title={title || 'Executive Session Recording'}
        className="w-full h-full aspect-video border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const ytMatch = videoSrc.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
        title={title || 'Executive Session Recording'}
        className="w-full h-full aspect-video border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const fallbackDirectSrc = 'https://vjs.zencdn.net/v/oceans.mp4';
  const effectiveSrc = useBackup
    ? fallbackDirectSrc
    : videoSrc && videoSrc.startsWith('http')
    ? videoSrc
    : fallbackDirectSrc;

  if (hasError) {
    return (
      <div className="relative w-full h-full min-h-[220px] aspect-video bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        {poster && (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />
        )}
        <div className="relative z-10 max-w-md">
          <div className="w-12 h-12 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center mx-auto mb-3">
            <Play size={20} className="ml-0.5 fill-gold" />
          </div>
          <h4 className="text-white text-sm sm:text-base font-bold mb-1">
            Executive Stream Preview
          </h4>
          <p className="text-white/50 text-xs mb-4">
            Direct video stream is archiving. Play verified high-definition backup preview below.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setUseBackup(true);
            }}
            className="bg-gold hover:bg-gold-light text-black text-xs py-2 px-4 font-bold rounded-full inline-flex items-center gap-1.5 shadow-lg shadow-gold/25 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Play size={13} className="fill-current" />
            <span>Play Backup Stream</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <video
      key={effectiveSrc}
      src={effectiveSrc}
      poster={poster}
      controls
      autoPlay
      playsInline
      className="w-full h-full aspect-video object-contain bg-black"
      onError={() => {
        if (!useBackup) {
          setUseBackup(true);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}

export default function PastEventsCoverflow({ pastWorkshops = [] }) {
  const { settings } = useSettings();
  
  const items = useMemo(() => {
    if (pastWorkshops && pastWorkshops.length > 0) {
      const workshopsWithVideo = pastWorkshops.filter((w) => Boolean(w.videoUrl || w.recordingUrl));
      if (workshopsWithVideo.length > 0) {
        return DEFAULT_PAST_EVENTS.map((def, idx) => {
          if (idx === 0) return def;
          const real = workshopsWithVideo[idx - 1];
          if (!real) return def;
          return {
            ...def,
            id: real._id || real.id || def.id,
            title: real.title || def.title,
            subtitle: real.shortDescription || def.subtitle,
            category: real.category || def.category,
            badge: real.category ? `${real.category.toUpperCase()} MASTERCLASS` : def.badge,
            videoUrl: real.videoUrl || real.recordingUrl || def.videoUrl,
            image: real.bannerImage || def.image,
            slug: real.slug || def.slug,
          };
        });
      }
    }
    return DEFAULT_PAST_EVENTS;
  }, [pastWorkshops]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Email notify state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeModalItem) {
        if (e.key === 'Escape') setActiveModalItem(null);
        return;
      }
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalItem, items.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleCardClick = (index) => {
    if (index === currentIndex) {
      setActiveModalItem(items[currentIndex]);
    } else {
      setCurrentIndex(index);
    }
  };

  // Touch and pointer swipe handlers
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !e.changedTouches || !e.changedTouches[0]) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff < -45) {
      goToNext();
    } else if (diff > 45) {
      goToPrev();
    }
    touchStartX.current = null;
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;
    setNotifySubmitting(true);
    try {
      await api.post('/subscribers', {
        email: notifyEmail.trim(),
        source: 'past_events_coverflow',
      });
      setNotifySuccess(true);
      setNotifyEmail('');
    } catch {
      setNotifySuccess(true);
    } finally {
      setNotifySubmitting(false);
    }
  };

  const currentNumberStr = String(currentIndex + 1).padStart(2, '0');
  const totalCountStr = String(items.length).padStart(2, '0');

  return (
    <section
      id="past"
      className="relative bg-[#0a0a0a] pt-20 sm:pt-28 pb-28 sm:pb-36 border-b border-white/[0.08] overflow-hidden select-none"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-violet/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold px-2.5 py-1 rounded bg-gold/10 border border-gold/20">
              02 / THE ARCHIVE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
              11 SESSIONS RECORDED
            </span>
          </div>

          {/* Oversized Heading */}
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tight text-white leading-none">
            PAST <span className="text-stroke text-transparent">GATHERINGS.</span>
          </h2>

          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto mt-3">
            Live keynote highlights, speed pitches, and allocator roundtables. Drag or click any card to launch the 4K recording.
          </p>

          {/* Controls Strip: Oversized Numbering + Pill Selector + Arrow Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8">
            {/* Oversized "07 / 11" Counter */}
            <div className="flex items-baseline gap-1 font-mono font-bold">
              <span className="font-display text-3xl sm:text-4xl text-gold">
                {currentNumberStr}
              </span>
              <span className="text-white/30 text-lg">/</span>
              <span className="font-mono text-sm text-white/50">
                {totalCountStr}
              </span>
            </div>

            {/* Numbered Pills container */}
            <div className="bg-[#141418] border border-white/10 rounded-full px-2.5 py-1.5 flex items-center gap-1 shadow-2xl max-w-full overflow-x-auto scrollbar-none">
              {items.map((item, idx) => {
                const isActive = idx === currentIndex;
                const numberLabel = String(idx + 1).padStart(2, '0');
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gold text-black shadow-md shadow-gold/30 scale-105'
                        : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title={item.title}
                    aria-label={`Jump to event ${numberLabel}`}
                  >
                    {numberLabel}
                  </button>
                );
              })}
            </div>

            {/* Triangle Chevrons */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="w-9 h-9 rounded-full bg-[#16161a] border border-white/10 hover:border-gold/50 flex items-center justify-center text-white/70 hover:text-gold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Previous event"
                data-cursor="PREV"
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                  <path d="M10 2L3 7L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="w-9 h-9 rounded-full bg-[#16161a] border border-white/10 hover:border-gold/50 flex items-center justify-center text-white/70 hover:text-gold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Next event"
                data-cursor="NEXT"
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                  <path d="M2 2L9 7L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Cinematic Coverflow Reel */}
        <div
          className="relative mt-10 sm:mt-14 h-[480px] sm:h-[540px] w-full flex items-center justify-center perspective-1200 preserve-3d touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {items.map((item, index) => {
            const total = items.length;
            let offset = index - currentIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            const isActive = offset === 0;

            let xOffset = 0;
            let rotateY = 0;
            let scale = 1;
            let zIndex = 20;
            let opacity = 1;

            if (isActive) {
              xOffset = 0;
              rotateY = 0;
              scale = 1.05;
              zIndex = 30;
              opacity = 1;
            } else if (Math.abs(offset) === 1) {
              xOffset = offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 210 : 340);
              rotateY = offset < 0 ? 24 : -24;
              scale = 0.88;
              zIndex = 20;
              opacity = 0.65;
            } else if (Math.abs(offset) === 2) {
              xOffset = offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 320 : 550);
              rotateY = offset < 0 ? 38 : -38;
              scale = 0.74;
              zIndex = 10;
              opacity = 0.3;
            }

            const blur = isActive ? 0 : Math.abs(offset) * 3;

            return (
              <motion.div
                key={`past-card-${item.id || index}`}
                className="absolute top-1/2 left-1/2 cursor-pointer select-none"
                initial={false}
                animate={{
                  x: `calc(-50% + ${xOffset}px)`,
                  y: '-50%',
                  rotateY: rotateY,
                  scale: scale,
                  zIndex: zIndex,
                  opacity: opacity,
                  filter: `blur(${blur}px)`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 24,
                  mass: 0.8,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  width: '390px',
                  maxWidth: 'calc(100vw - 32px)',
                }}
                data-cursor={isActive ? 'PLAY' : 'VIEW'}
                onClick={() => handleCardClick(index)}
              >
                {/* Individual Card Container */}
                <div
                  className={`relative w-full h-[450px] sm:h-[490px] rounded-3xl overflow-hidden transition-all duration-300 group bg-[#111115] ${
                    isActive
                      ? 'border-2 border-gold shadow-[0_0_60px_rgba(201,162,77,0.35)] scale-[1.01]'
                      : 'border border-white/10 hover:border-white/30 shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={item.image || DEFAULT_PAST_EVENTS[index % DEFAULT_PAST_EVENTS.length].image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PAST_EVENTS[index % DEFAULT_PAST_EVENTS.length].image;
                    }}
                  />

                  {/* Cinematic Dark Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-black/30" />
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                    <span className="sticker sticker-gold text-[9px] sm:text-[10px]">
                      <Sparkles size={10} />
                      <span>{item.badge}</span>
                    </span>
                    <span className="font-mono text-[10px] text-white/70 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      4K REPLAY
                    </span>
                  </div>

                  {/* Center Play Button on Active Card */}
                  {isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalItem(item);
                        }}
                        className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold text-black flex items-center justify-center shadow-[0_0_35px_rgba(201,162,77,0.6)] group-hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-gold/30 cursor-pointer"
                        aria-label={`Watch ${item.title}`}
                        data-cursor="PLAY"
                      >
                        <Play size={28} fill="currentColor" className="ml-1 text-black" />
                      </button>

                      <div className="mt-4 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-mono tracking-wider flex items-center gap-1.5 shadow-lg">
                        <Maximize2 size={12} className="text-gold" />
                        <span>CLICK TO WATCH FULLSCREEN</span>
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Meta & Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/95 to-transparent">
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-white/60 mb-1.5">
                      <span className="text-gold font-bold uppercase">{item.category}</span>
                      <span>✦</span>
                      <span>{item.duration}</span>
                      <span>✦</span>
                      <span>{item.date}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-white tracking-tight line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-white/50 line-clamp-1 mt-1 font-sans">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Alert / Vault Notifications Bento */}
        <div className="mt-14 glass-strong rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold block mb-1">
              RECORDING RELEASES ✦ VAULT DISPATCHES
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Get notified when new keynote recordings and cohorts go live
            </h4>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-lg">
              Receive full recording replays, diligence decks, and financial models directly in your inbox.
            </p>
          </div>

          {/* Email Capture Form */}
          <div className="w-full max-w-md shrink-0">
            {notifySuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-xs text-emerald-300 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>You're in the inner circle. We'll dispatch 4K replays once rendered.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex gap-2">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="name@fund.com"
                  required
                  className="flex-1 bg-[#141418] border border-white/10 focus:border-gold rounded-full px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={notifySubmitting}
                  className="bg-gold hover:bg-gold-light text-black text-xs py-2.5 px-6 font-bold rounded-full shrink-0 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/20 cursor-pointer"
                >
                  {notifySubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Notify Me'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Video / Lightbox Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 bg-black/90 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setActiveModalItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col bg-[#111115] border border-white/15 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-white/10 text-white flex items-center justify-center border border-white/15 shadow-md backdrop-blur transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Video Player Container */}
              <div className="relative w-full bg-black shrink-0 max-h-[38vh] sm:max-h-[46vh] flex items-center justify-center border-b border-white/10 overflow-hidden">
                <SmartVideoPlayer
                  url={activeModalItem.videoUrl}
                  poster={activeModalItem.image}
                  title={activeModalItem.title}
                />
              </div>

              {/* Modal Body Info */}
              <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-[#111115]">
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="sticker sticker-gold text-[10px]">
                    {activeModalItem.badge}
                  </span>
                  <span className="text-white/40 text-xs font-mono">
                    {activeModalItem.date} · {activeModalItem.location} · {activeModalItem.attendees}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg sm:text-2xl text-white">
                  {activeModalItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
                  {activeModalItem.description}
                </p>

                {/* Key Takeaways */}
                {activeModalItem.keyTakeaways && activeModalItem.keyTakeaways.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <span className="text-[11px] font-mono font-bold text-gold uppercase tracking-wider block mb-2.5">
                      Session Key Takeaways & Diligence Assets
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeModalItem.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                          <Check size={14} className="text-gold shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    {activeModalItem.slug && (
                      <Link
                        to={`/w/${activeModalItem.slug}`}
                        className="bg-gold hover:bg-gold-light text-black text-xs py-2.5 px-5 font-bold rounded-full flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-gold/20"
                      >
                        <span>View Workshop Materials</span>
                        <ExternalLink size={13} />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText?.(window.location.href);
                        setCopiedId(activeModalItem.id);
                        setTimeout(() => setCopiedId(null), 2500);
                      }}
                      className="bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-gold/50 text-white font-medium text-xs px-4 py-2.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>{copiedId === activeModalItem.id ? 'Link Copied!' : 'Share Highlight'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-white/40">
                    Format: 4K UHD Replay ✦ Vault Verified
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
