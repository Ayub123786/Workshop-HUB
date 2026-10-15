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
    title: 'Demo Day Pitches & Fast-Track Matching',
    subtitle: '1-on-1 bilateral deal rooms and structured syndicate pitches',
    category: 'Direct Dealmaking',
    date: 'Sep 28, 2025',
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
    title: 'Breakthrough Moments Demo Day',
    subtitle: 'High-conviction pitches in growth equity and enterprise infrastructure',
    category: 'Growth Equity & AI',
    date: 'Aug 18, 2025',
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
    title: 'Family Office Direct Deal Sourcing',
    subtitle: 'Off-market proprietary deal origination and club-deal syndication',
    category: 'Family Office',
    date: 'Jul 22, 2025',
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
    title: 'Cross-Border LBO Modeling & Value Creation',
    subtitle: 'Advanced debt sculpting, return sensitivity, and waterfall math',
    category: 'Private Equity',
    date: 'Jun 14, 2025',
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
    title: 'AI-Powered Due Diligence Agent Architecture',
    subtitle: 'Autonomous document parsing, financial reconciliation, and red-flags',
    category: 'AI & FinTech',
    date: 'May 30, 2025',
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
    title: 'Global Real Assets & Logistics Syndication',
    subtitle: 'Underwriting industrial logistics and core-plus infrastructure',
    category: 'Real Assets',
    date: 'Apr 19, 2025',
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
    title: 'Healthcare & Med-Tech M&A Roundtable',
    subtitle: 'Regulatory pathway appraisal and buy-and-build rollups',
    category: 'Healthcare PE',
    date: 'Mar 25, 2025',
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
    title: 'Secondaries & GP-Led Continuation Vehicles',
    subtitle: 'Pricing tail-end funds, NAV loans, and preferred equity',
    category: 'Secondaries',
    date: 'Feb 17, 2025',
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
    title: 'Dual-Use Defense Tech & Sovereign Capital',
    subtitle: 'National security clearances, procurement cycles, and defense syndicates',
    category: 'DeepTech & Defense',
    date: 'Jan 21, 2025',
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
    title: 'Global Chairs & Chief Allocators Gala',
    subtitle: 'Macroeconomic forecast, private credit expansion, and annual awards',
    category: 'Executive Leadership',
    date: 'Dec 05, 2024',
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
  const { settings } = useSettings();
  // Combine real past workshops with curated demo day highlights
  const items = useMemo(() => {
    if (pastWorkshops && pastWorkshops.length > 0) {
      const realItems = pastWorkshops.map((w, idx) => ({
        id: w._id || w.id || `real-${idx}`,
        badge: w.category ? `${w.category.toUpperCase()} MASTERCLASS` : 'COHORT RECORDING',
        subBadge: 'Live Preview',
        title: w.title || 'Executive Masterclass',
        subtitle: w.shortDescription || 'Completed cohort recording & deal model archive',
        category: w.category || 'Executive Finance',
        date: w.startDate ? new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Cohort',
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
      setNotifySuccess(true);
    } finally {
      setNotifySubmitting(false);
    }
  };

  const currentItem = items[currentIndex];

  return (
    <section
      id="past"
      className="relative bg-white py-16 sm:py-20 border-b border-[#E8E8E8] overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── 1. TOP BADGE & HEADLINE (Minimal Light Design System) ─── */}
        <div className="flex flex-col items-center text-center">
          {/* Live Event Previews Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] border border-[#E8E8E8] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="tracking-[0.16em] text-[11px] font-mono font-bold text-navy uppercase">
              {settings?.pastEventsSettings?.badge || 'LIVE EVENT PREVIEWS'}
            </span>
          </div>

          {/* Minimal Light Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight uppercase mt-4 leading-tight">
            {settings?.pastEventsSettings?.title || 'OUR PAST EVENTS'}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-muted max-w-2xl mx-auto mt-2.5 leading-relaxed">
            {settings?.pastEventsSettings?.subtitle ||
              'Explore live keynote highlights, speed pitches, and investor roundtables from our global gatherings. Click any panel to view in full resolution.'}
          </p>

          {/* ─── 2. CONTROLS STRIP (Numbered Pills + Triangle Chevrons + Count) ─── */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-7">
            {/* Numbered Pills container */}
            <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-full px-2.5 py-1.5 flex items-center gap-1 shadow-2xs max-w-full overflow-x-auto scrollbar-none">
              {items.map((item, idx) => {
                const isActive = idx === currentIndex;
                const numberLabel = String(idx + 1).padStart(2, '0');
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-gold text-white shadow-xs scale-105'
                        : 'text-muted hover:text-navy hover:bg-white'
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
                    className="fill-gold group-hover:fill-gold-dark transition-colors"
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
                    className="fill-gold group-hover:fill-gold-dark transition-colors"
                  />
                </svg>
              </button>

              {/* Fraction Display: 1 / 11 */}
              <span className="font-mono text-xs sm:text-sm font-bold text-navy tracking-wider ml-1">
                {currentIndex + 1} / {items.length}
              </span>
            </div>
          </div>
        </div>

        {/* ─── 3. 3D COVERFLOW CAROUSEL CONTAINER (Minimal Light Theme) ─── */}
        <div className="relative mt-10 sm:mt-14 h-[500px] sm:h-[550px] w-full flex items-center justify-center perspective-1200 preserve-3d">
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
              scale = 1.04;
              zIndex = 30;
              opacity = 1;
            } else if (Math.abs(offset) === 1) {
              xOffset = offset * (window.innerWidth < 640 ? 210 : 330);
              rotateY = offset < 0 ? 22 : -22;
              scale = 0.88;
              zIndex = 20;
              opacity = 0.7;
            } else if (Math.abs(offset) === 2) {
              xOffset = offset * (window.innerWidth < 640 ? 320 : 540);
              rotateY = offset < 0 ? 35 : -35;
              scale = 0.74;
              zIndex = 10;
              opacity = 0.3;
            }

            const blur = isActive ? 0 : Math.abs(offset) * 2;

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
                  filter: `blur(${blur}px)`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 26,
                  mass: 0.8,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset: dragOffset, velocity }) => {
                  if (dragOffset.x < -40 || velocity.x < -300) {
                    goToNext();
                  } else if (dragOffset.x > 40 || velocity.x > 300) {
                    goToPrev();
                  }
                }}
                data-cursor="Play"
                onClick={() => handleCardClick(index)}
              >
                {/* Individual Card */}
                <div
                  className={`relative w-[280px] sm:w-[340px] md:w-[380px] h-[450px] sm:h-[500px] rounded-2xl overflow-hidden transition-all duration-300 group bg-white ${
                    isActive
                      ? 'border-2 border-gold shadow-[0_16px_48px_rgba(201,162,77,0.22)] scale-[1.01]'
                      : 'border border-[#E8E8E8] hover:border-gold/60 shadow-card'
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlays for contrast & legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent" />
                  {!isActive && (
                    <div className="absolute inset-0 bg-navy/30 group-hover:bg-navy/15 transition-colors" />
                  )}

                  {/* ─── CARD HEADER BADGES ─── */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                    <span className="bg-navy/85 backdrop-blur px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white">
                      {item.badge}
                    </span>
                    <span className="bg-gold text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      {item.subBadge}
                    </span>
                  </div>

                  {/* ─── CARD CENTER ACTION (ACTIVE CARD ONLY) ─── */}
                  {isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                      {/* Play Button in Signature Gold */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalItem(item);
                        }}
                        className="pointer-events-auto w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gold text-white flex items-center justify-center shadow-lg shadow-gold/40 group-hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-gold/25 cursor-pointer"
                        aria-label={`Watch ${item.title}`}
                      >
                        <Play size={26} fill="currentColor" className="ml-1 text-white" />
                      </button>

                      {/* Click to Watch Fullscreen pill */}
                      <div className="mt-3.5 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur border border-[#E8E8E8] text-navy text-[11px] font-mono font-bold tracking-wide flex items-center gap-1.5 shadow-md">
                        <Maximize2 size={12} className="text-gold" />
                        <span>Click to Watch Fullscreen</span>
                      </div>
                    </div>
                  )}

                  {/* ─── CARD BOTTOM CONTENT ─── */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end bg-gradient-to-t from-navy via-navy/90 to-transparent">
                    {/* Meta info strip */}
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-gray-300 mb-1.5">
                      <span className="text-gold-light font-bold uppercase">{item.category}</span>
                      <span>•</span>
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-tight line-clamp-2 leading-snug group-hover:text-gold-light transition-colors">
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

        {/* ─── 4. BOTTOM ACTION & NOTIFY BAR (Minimal Light) ─── */}
        <div className="mt-14 bg-[#FAF9F6] border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold block mb-1">
              ARCHIVE NOTIFICATIONS & NEW RELEASES
            </span>
            <h4 className="text-base sm:text-lg font-bold text-navy tracking-tight">
              Get notified when new keynote recordings and cohorts go live
            </h4>
            <p className="text-xs text-muted mt-1 max-w-lg">
              Receive full recording replays, diligence decks, and financial models directly in your inbox.
            </p>
          </div>

          {/* Email Capture Form */}
          <div className="w-full max-w-md shrink-0">
            {notifySuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
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
                  className="flex-1 bg-white border border-[#E8E8E8] focus:border-gold rounded-xl px-3.5 py-2 text-xs text-navy placeholder-muted focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={notifySubmitting}
                  className="btn-primary text-xs py-2 px-5 font-semibold shrink-0 disabled:opacity-50"
                >
                  {notifySubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Notify Me'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. FULLSCREEN VIDEO / LIGHTBOX MODAL (Minimal Light Theme) ─── */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy/80 backdrop-blur-md"
            onClick={() => setActiveModalItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white border border-[#E8E8E8] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-navy flex items-center justify-center border border-[#E8E8E8] shadow-md transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Video Player Container */}
              <div className="relative aspect-video bg-black overflow-hidden border-b border-[#E8E8E8]">
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
              <div className="p-5 sm:p-7 max-h-[45vh] overflow-y-auto bg-white">
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-gold/15 text-gold border border-gold/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono">
                    {activeModalItem.badge}
                  </span>
                  <span className="text-muted text-xs font-mono">
                    {activeModalItem.date} · {activeModalItem.location} · {activeModalItem.attendees}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg sm:text-2xl text-navy">
                  {activeModalItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                  {activeModalItem.description}
                </p>

                {/* Key Takeaways */}
                {activeModalItem.keyTakeaways && activeModalItem.keyTakeaways.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#E8E8E8]">
                    <span className="text-[11px] font-mono font-bold text-gold uppercase tracking-wider block mb-2.5">
                      Session Key Takeaways & Diligence Assets
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeModalItem.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-navy/80">
                          <Check size={14} className="text-gold shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="mt-6 pt-4 border-t border-[#E8E8E8] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {activeModalItem.slug && (
                      <Link
                        to={`/w/${activeModalItem.slug}`}
                        className="btn-primary text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
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
                      className="bg-[#FAF9F6] hover:bg-cream border border-[#E8E8E8] hover:border-gold text-navy font-medium text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Share2 size={13} />
                      <span>{copiedId === activeModalItem.id ? 'Link Copied!' : 'Share Highlight'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-muted">
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
