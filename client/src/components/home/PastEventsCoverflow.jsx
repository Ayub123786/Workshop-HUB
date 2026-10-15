import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
  Share2,
  Check,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import api from '../../lib/api';

// Curated 11 executive demo day / summit highlights matching screenshot specs
const DEFAULT_PAST_EVENTS = [
  {
    id: 'evt-01',
    badge: 'DEMO DAY HIGHLIGHT',
    subBadge: 'Live Preview',
    title: 'INVESTORS ROUNDTABLE & DEMO DAY',
    subtitle: 'Annual institutional allocators & emerging GP presentation day',
    category: 'Venture Capital & PE',
    date: 'OCT 12, 2025',
    duration: '48 mins',
    attendees: '450+ Allocators',
    location: 'New York & Global Stream',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    title: 'DEMO DAY PITCHES & FAST-TRACK MATCHING',
    subtitle: '1-on-1 bilateral deal rooms and structured syndicate pitches',
    category: 'Direct Dealmaking',
    date: 'SEP 28, 2025',
    duration: '62 mins',
    attendees: '320+ Investors',
    location: 'San Francisco & Hybrid',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
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
    title: 'BREAKTHROUGH MOMENTS DEMO DAY',
    subtitle: 'High-conviction pitches in growth equity and enterprise infrastructure',
    category: 'Growth Equity & AI',
    date: 'AUG 18, 2025',
    duration: '55 mins',
    attendees: '280+ Dealmakers',
    location: 'London Mayfair & Live Stream',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
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
    title: 'FAMILY OFFICE DIRECT DEAL SOURCING',
    subtitle: 'Off-market proprietary deal origination and club-deal syndication',
    category: 'Family Office',
    date: 'JUL 22, 2025',
    duration: '90 mins',
    attendees: '190+ Principals',
    location: 'Zurich Executive Room',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
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
    title: 'CROSS-BORDER LBO MODELING & VALUE CREATION',
    subtitle: 'Advanced debt sculpting, return sensitivity, and waterfall math',
    category: 'Private Equity',
    date: 'JUN 14, 2025',
    duration: '110 mins',
    attendees: '210+ PE Associates',
    location: 'New York Wall Street Lab',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
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
    title: 'AI-POWERED DUE DILIGENCE AGENT ARCHITECTURE',
    subtitle: 'Autonomous document parsing, financial reconciliation, and red-flags',
    category: 'AI & FinTech',
    date: 'MAY 30, 2025',
    duration: '75 mins',
    attendees: '510+ Delegates',
    location: 'Singapore Marina Bay',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
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
    title: 'GLOBAL REAL ASSETS & LOGISTICS SYNDICATION',
    subtitle: 'Underwriting industrial logistics and core-plus infrastructure',
    category: 'Real Assets',
    date: 'APR 19, 2025',
    duration: '80 mins',
    attendees: '340+ Delegates',
    location: 'Dubai DIFC Center',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    description: 'Syndication forum examining port-adjacent logistics facilities, cold-chain fulfillment assets, and clean power data center developments.',
    keyTakeaways: [
      'Triple-net lease escalation modeling amidst sticky interest rates',
      'Power availability underwriting for hyper-scale AI data campuses',
      'Sharia-compliant and tax-exempt cross-border capital packaging'
    ],
  },
  {
    id: 'evt-08',
    badge: 'SECTOR FOCUS',
    subBadge: 'Live Preview',
    title: 'HEALTHCARE & MED-TECH M&A ROUNDTABLE',
    subtitle: 'Regulatory pathway appraisal and buy-and-build rollups',
    category: 'Healthcare PE',
    date: 'MAR 25, 2025',
    duration: '65 mins',
    attendees: '175+ Fund Partners',
    location: 'Boston Innovation District',
    image: 'https://images.unsplash.com/photo-1576089172869-4f5f6f315665?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    description: 'Clinical trial risk evaluation, FDA compliance hurdles, and enterprise value expansion via add-on acquisitions in specialty outpatient care.',
    keyTakeaways: [
      'Post-merger integration playbooks for physician practice management',
      'Payer reimbursement risk modeling and Medicare policy shifts',
      'Valuation multiples across diagnostics vs medical device manufacturers'
    ],
  },
  {
    id: 'evt-09',
    badge: 'MARKET BRIEFING',
    subBadge: 'Live Preview',
    title: 'SECONDARIES & GP-LED CONTINUATION VEHICLES',
    subtitle: 'Pricing tail-end funds, NAV loans, and preferred equity',
    category: 'Secondaries',
    date: 'FEB 17, 2025',
    duration: '50 mins',
    attendees: '260+ Secondary Buyers',
    location: 'Frankfurt Financial Hub',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    description: 'Practical guide to structuring single-asset and multi-asset continuation funds to retain trophy portfolio companies while providing LP liquidity.',
    keyTakeaways: [
      'Fairness opinion guidelines and conflict mitigation protocols',
      'Discount-to-NAV trends across US and European venture portfolios',
      'Using structured equity and NAV financing to bridge valuation gaps'
    ],
  },
  {
    id: 'evt-10',
    badge: 'STRATEGIC BRIEF',
    subBadge: 'Live Preview',
    title: 'DUAL-USE DEFENSE TECH & SOVEREIGN CAPITAL',
    subtitle: 'National security clearances, procurement cycles, and defense syndicates',
    category: 'DeepTech & Defense',
    date: 'JAN 21, 2025',
    duration: '70 mins',
    attendees: '390+ Delegates',
    location: 'Washington D.C. Forum',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'Deep dive into defense procurement acceleration, SBIR transition to Phase III programs of record, and NATO innovation fund collaboration.',
    keyTakeaways: [
      'Navigating the valley of death between R&D and defense procurement',
      'Foreign ownership control and influence (FOCI) compliance for global LPs',
      'Dual-use commercial satellite and autonomous drone economics'
    ],
  },
  {
    id: 'evt-11',
    badge: 'ANNUAL GALA',
    subBadge: 'Live Preview',
    title: 'GLOBAL CHAIRS & CHIEF ALLOCATORS GALA',
    subtitle: 'Macroeconomic forecast, private credit expansion, and annual awards',
    category: 'Executive Leadership',
    date: 'DEC 05, 2024',
    duration: '95 mins',
    attendees: '600+ Global Allocators',
    location: 'Geneva Lakeside Palace',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    description: 'Celebration of dealmaking milestones, keynote address on geopolitical macro trends, and exclusive preview of the 2025 executive workshop calendar.',
    keyTakeaways: [
      'Global macroeconomic outlook on interest rates and inflation curves',
      'Private debt versus syndicated loan market share dynamics',
      'Top allocator awards for governance and sustainable returns'
    ],
  },
];

export default function PastEventsCoverflow({ pastWorkshops = [] }) {
  // Combine real past workshops with curated demo day highlights
  const items = useMemo(() => {
    // If backend has completed past workshops, map them into the beginning of the list
    if (pastWorkshops && pastWorkshops.length > 0) {
      const realItems = pastWorkshops.map((w, idx) => ({
        id: w._id || w.id || `real-${idx}`,
        badge: w.category ? `${w.category.toUpperCase()} MASTERCLASS` : 'COHORT RECORDING',
        subBadge: 'Live Preview',
        title: (w.title || 'Executive Masterclass').toUpperCase(),
        subtitle: w.shortDescription || 'Completed cohort recording & deal model archive',
        category: w.category || 'Executive Finance',
        date: w.startDate ? new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'RECENT COHORT',
        duration: w.duration || '90 mins',
        attendees: `${w.seatsBooked || 120}+ Enrolled`,
        location: w.location || 'Virtual Executive Studio',
        image: w.bannerImage || DEFAULT_PAST_EVENTS[idx % DEFAULT_PAST_EVENTS.length].image,
        videoUrl: w.videoUrl || DEFAULT_PAST_EVENTS[idx % DEFAULT_PAST_EVENTS.length].videoUrl,
        slug: w.slug,
        description: w.description || w.shortDescription || 'Archived workshop session with complete course toolkit and replay.',
        keyTakeaways: (w.learningOutcomes && w.learningOutcomes.length > 0)
          ? w.learningOutcomes
          : [
              'Complete financial models and scenario workbooks',
              'Recorded Q&A session with industry practitioners',
              'Comprehensive executive summary and diligence pack'
            ]
      }));

      // Deduplicate and fill up to 11 items
      const combined = [...realItems];
      DEFAULT_PAST_EVENTS.forEach((def) => {
        if (combined.length < 11 && !combined.some(c => c.title === def.title)) {
          combined.push(def);
        }
      });
      return combined;
    }
    return DEFAULT_PAST_EVENTS;
  }, [pastWorkshops]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Email notify state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);

  // Auto rotation effect when enabled
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

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
      // Fail gracefully or show success
      setNotifySuccess(true);
    } finally {
      setNotifySubmitting(false);
    }
  };

  const currentItem = items[currentIndex];

  return (
    <section
      id="past"
      className="relative bg-tech-grid py-20 sm:py-24 border-t border-b border-[#1E2538] overflow-hidden select-none"
    >
      {/* Background ambient radial glow matching high-tech aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-[#C8A24F]/10 via-[#FACC15]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── 1. TOP BADGE & HEADLINE (Exact MyRisingTime style) ─── */}
        <div className="flex flex-col items-center text-center">
          {/* Live Event Previews Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#111726]/90 border border-white/10 backdrop-blur shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse shadow-[0_0_8px_#FACC15]" />
            <span className="tracking-[0.2em] text-[11px] font-mono font-bold text-gray-200 uppercase">
              LIVE EVENT PREVIEWS
            </span>
          </div>

          {/* Block Futuristic Title (OUR PAST EVENTS) */}
          <h2 className="font-orbitron font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-[0.16em] uppercase mt-5 leading-tight">
            OUR PAST <br className="hidden sm:inline" /> EVENTS
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl mx-auto mt-3.5 leading-relaxed font-sans">
            Explore live keynote highlights, speed pitches, and investor roundtables from our global gatherings. Click any panel to view in full resolution.
          </p>

          {/* ─── 2. CONTROLS STRIP (Numbered Pills + Triangle Chevrons + Count) ─── */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {/* Numbered Pills container */}
            <div className="bg-[#0D121F]/90 border border-white/10 backdrop-blur rounded-full px-2.5 py-1.5 flex items-center gap-1 shadow-lg max-w-full overflow-x-auto scrollbar-none">
              {items.map((item, idx) => {
                const isActive = idx === currentIndex;
                const numberLabel = String(idx + 1).padStart(2, '0');
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-[#FACC15] text-[#0A0A0A] shadow-[0_0_12px_rgba(250,204,21,0.5)] scale-105'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={item.title}
                    aria-label={`Jump to event ${numberLabel}`}
                  >
                    {numberLabel}
                  </button>
                );
              })}
            </div>

            {/* Triangle Chevrons & Fraction Count */}
            <div className="flex items-center gap-3">
              {/* Left Triangle Chevron */}
              <button
                onClick={goToPrev}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
                aria-label="Previous event"
              >
                <svg
                  width="18"
                  height="22"
                  viewBox="0 0 18 22"
                  fill="none"
                  className="transition-all duration-200"
                >
                  <polygon
                    points="16,2 2,11 16,20"
                    className="fill-[#FACC15] group-hover:fill-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                  />
                </svg>
              </button>

              {/* Right Triangle Chevron */}
              <button
                onClick={goToNext}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
                aria-label="Next event"
              >
                <svg
                  width="18"
                  height="22"
                  viewBox="0 0 18 22"
                  fill="none"
                  className="transition-all duration-200"
                >
                  <polygon
                    points="2,2 16,11 2,20"
                    className="fill-[#FACC15] group-hover:fill-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                  />
                </svg>
              </button>

              {/* Fraction Display: 1 / 11 */}
              <span className="font-mono text-xs sm:text-sm font-bold text-gray-300 tracking-wider ml-1">
                {currentIndex + 1} / {items.length}
              </span>
            </div>
          </div>
        </div>

        {/* ─── 3. 3D COVERFLOW CAROUSEL CONTAINER ─── */}
        <div className="relative mt-12 sm:mt-16 h-[520px] sm:h-[580px] w-full flex items-center justify-center perspective-1200 preserve-3d">
          {items.map((item, index) => {
            // Circular offset calculation
            const total = items.length;
            let offset = index - currentIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            // Only render items within visual range (-2 to +2) for performance
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            const isActive = offset === 0;
            const isLeft = offset < 0;
            const isRight = offset > 0;

            // Compute dynamic 3D transforms
            let xOffset = 0;
            let rotateY = 0;
            let scale = 1;
            let zIndex = 20;
            let opacity = 1;

            if (isActive) {
              xOffset = 0;
              rotateY = 0;
              scale = 1.04;
              zIndex = 30;
              opacity = 1;
            } else if (Math.abs(offset) === 1) {
              xOffset = offset * (window.innerWidth < 640 ? 210 : 330);
              rotateY = offset < 0 ? 22 : -22;
              scale = 0.86;
              zIndex = 20;
              opacity = 0.65;
            } else if (Math.abs(offset) === 2) {
              xOffset = offset * (window.innerWidth < 640 ? 320 : 540);
              rotateY = offset < 0 ? 35 : -35;
              scale = 0.72;
              zIndex = 10;
              opacity = 0.25;
            }

            return (
              <motion.div
                key={item.id}
                className="absolute top-0 bottom-0 my-auto cursor-pointer"
                animate={{
                  x: xOffset,
                  rotateY: rotateY,
                  scale: scale,
                  zIndex: zIndex,
                  opacity: opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                  mass: 0.8,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => handleCardClick(index)}
              >
                {/* Individual Card */}
                <div
                  className={`relative w-[280px] sm:w-[340px] md:w-[380px] h-[460px] sm:h-[520px] rounded-[26px] overflow-hidden transition-all duration-300 group ${
                    isActive
                      ? 'border-2 border-[#FACC15] shadow-[0_0_35px_rgba(250,204,21,0.4),0_25px_50px_rgba(0,0,0,0.9)] ring-1 ring-[#FACC15]/40'
                      : 'border border-white/10 hover:border-white/30 shadow-2xl'
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlays for contrast & legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 transition-colors" />
                  )}

                  {/* ─── CARD HEADER BADGES ─── */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                    <span className="bg-black/75 backdrop-blur border border-white/15 px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white">
                      {item.badge}
                    </span>
                    <span className="bg-[#FACC15]/20 backdrop-blur border border-[#FACC15]/40 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#FACC15] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-ping" />
                      {item.subBadge}
                    </span>
                  </div>

                  {/* ─── CARD CENTER ACTION (ACTIVE CARD ONLY) ─── */}
                  {isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                      {/* Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalItem(item);
                        }}
                        className="pointer-events-auto w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#FACC15] text-[#0A0A0A] flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.6)] group-hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-[#FACC15]/30 cursor-pointer"
                        aria-label={`Watch ${item.title}`}
                      >
                        <Play size={26} fill="currentColor" className="ml-1 text-[#0A0A0A]" />
                      </button>

                      {/* Click to Watch Fullscreen pill */}
                      <div className="mt-3.5 px-3.5 py-1 rounded-full bg-black/85 backdrop-blur border border-white/20 text-[#FACC15] text-[11px] font-mono font-bold tracking-wide flex items-center gap-1.5 shadow-md">
                        <Maximize2 size={12} className="text-[#FACC15]" />
                        <span>Click to Watch Fullscreen</span>
                      </div>
                    </div>
                  )}

                  {/* ─── CARD BOTTOM CONTENT ─── */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/90 to-transparent">
                    {/* Meta info strip */}
                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono text-gray-400 mb-2">
                      <span className="text-[#FACC15] font-bold uppercase">{item.category}</span>
                      <span>•</span>
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>

                    {/* Futuristic Title */}
                    <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-white tracking-wide uppercase line-clamp-2 leading-snug group-hover:text-[#FACC15] transition-colors">
                      {item.title}
                    </h3>

                    {/* Subtitle description */}
                    <p className="text-xs text-gray-300 line-clamp-1 mt-1 font-sans">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── 4. BOTTOM ACTION & NOTIFY BAR ─── */}
        <div className="mt-14 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FACC15] block mb-1">
              ARCHIVE NOTIFICATIONS & NEW RELEASES
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Get notified when new keynote recordings and cohorts go live
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Receive full recording replays, diligence decks, and financial models directly in your inbox.
            </p>
          </div>

          {/* Email Capture Form */}
          <div className="w-full max-w-md shrink-0">
            {notifySuccess ? (
              <div className="bg-[#111726] border border-emerald-500/40 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-emerald-300 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>You're on the list! We'll alert you as soon as new recordings publish.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex gap-2">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="name@fund.com"
                  required
                  className="flex-1 bg-[#0D121F] border border-white/15 focus:border-[#FACC15] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={notifySubmitting}
                  className="bg-[#FACC15] hover:bg-amber-300 text-[#0A0A0A] font-bold text-xs px-5 py-2 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] shrink-0 disabled:opacity-50"
                >
                  {notifySubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Notify Me'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. FULLSCREEN VIDEO / LIGHTBOX MODAL ─── */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setActiveModalItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#0B0F19] border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-[#FACC15] hover:text-black text-white flex items-center justify-center border border-white/20 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Video Player Container */}
              <div className="relative aspect-video bg-black overflow-hidden border-b border-white/10">
                <video
                  src={activeModalItem.videoUrl}
                  poster={activeModalItem.image}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Modal Body Info */}
              <div className="p-5 sm:p-7 max-h-[45vh] overflow-y-auto">
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-[#FACC15] text-[#0A0A0A] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono">
                    {activeModalItem.badge}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    {activeModalItem.date} · {activeModalItem.location} · {activeModalItem.attendees}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-orbitron font-black text-lg sm:text-2xl text-white uppercase tracking-wide">
                  {activeModalItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                  {activeModalItem.description}
                </p>

                {/* Key Takeaways */}
                {activeModalItem.keyTakeaways && activeModalItem.keyTakeaways.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <span className="text-[11px] font-mono font-bold text-[#FACC15] uppercase tracking-wider block mb-2.5">
                      Session Key Takeaways & Diligence Assets
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeModalItem.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                          <Check size={14} className="text-[#FACC15] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {activeModalItem.slug && (
                      <Link
                        to={`/w/${activeModalItem.slug}`}
                        className="bg-[#FACC15] hover:bg-amber-300 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
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
                      className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Share2 size={13} />
                      <span>{copiedId === activeModalItem.id ? 'Link Copied!' : 'Share Highlight'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-gray-500">
                    Resolution: 4K UHD Replay
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
