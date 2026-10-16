import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Share2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Users,
  User,
  CheckCircle2,
  Download,
  Mail,
  ChevronDown,
  Globe,
  ArrowRight,
  Check,
  Copy,
  MessageCircle,
  Bookmark,
  Video,
} from 'lucide-react';
import api from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import { useBookmarks } from '../lib/bookmarks';
import { recordRecentlyViewed } from '../lib/recentlyViewed';

// Section components
import HeroSection from '../components/sections/HeroSection';
import BenefitsSection from '../components/sections/BenefitsSection';
import LogosSection from '../components/sections/LogosSection';
import CommunitySection from '../components/sections/CommunitySection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import StagesSection from '../components/sections/StagesSection';
import AudienceSection from '../components/sections/AudienceSection';
import TrainerSection from '../components/sections/TrainerSection';
import WorkshopFooter from '../components/sections/WorkshopFooter';
import PlatformFaqSection from '../components/sections/PlatformFaqSection';

// Modals & Calendar
import RegistrationModal from '../components/workshop/RegistrationModal';
import AddToCalendarMenu from '../components/calendar/AddToCalendarMenu';
import WorkshopCard from '../components/workshop/WorkshopCard';
import { getWorkshopStatus, getStatusBadgeConfig } from '../lib/workshopStatus';
import {
  TIMEZONE_OPTIONS,
  getSavedTimezone,
  setSavedTimezone,
  formatInTimezone,
} from '../lib/calendarExport';

// Share Bar Component
function ShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors text-xs inline-flex items-center gap-1"
        title="Copy Link"
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-[#E8E8E8] text-[#0077B5] hover:bg-cream transition-colors"
        title="Share on LinkedIn"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors"
        title="Share on X"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-[#E8E8E8] text-[#25D366] hover:bg-cream transition-colors"
        title="Share on WhatsApp"
      >
        <MessageCircle size={13} />
      </a>

      <a
        href={`mailto:?subject=${encodedTitle}&body=Check out this live executive masterclass: ${encodedUrl}`}
        className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors"
        title="Share via Email"
      >
        <Mail size={13} />
      </a>
    </div>
  );
}

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { settings } = useSettings();

  const [workshop, setWorkshop] = useState(null);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(null);
  const [relatedWorkshops, setRelatedWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [currentTimezone, setCurrentTimezone] = useState(getSavedTimezone);

  // Notify rerun state for completed sessions
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);

  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  // Auto-open registration modal if requested via URL (?reserve=true) or hash (#reserve / #register)
  useEffect(() => {
    const shouldReserve =
      searchParams.get('reserve') === 'true' ||
      searchParams.get('reserve') === '1' ||
      location.hash === '#reserve' ||
      location.hash === '#register';

    if (shouldReserve && workshop && !loading) {
      setIsRegisterOpen(true);
    }
  }, [searchParams, location.hash, workshop, loading]);

  // Global listener for navbar or card trigger events
  useEffect(() => {
    const handleOpenModal = () => {
      setIsRegisterOpen(true);
    };
    window.addEventListener('open-register-modal', handleOpenModal);
    return () => window.removeEventListener('open-register-modal', handleOpenModal);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/workshops/${slug}`),
      api.get('/workshops?limit=6').catch(() => ({ data: { workshops: [] } })),
    ])
      .then(([res, relatedRes]) => {
        if (!isMounted) return;
        const wData = res.data.workshop;
        setWorkshop(wData);
        if (wData) recordRecentlyViewed(wData);
        setSections(res.data.sections || []);
        setForm(res.data.form || null);
        const related = (relatedRes.data?.workshops || []).filter(
          (w) => w.slug !== slug && getWorkshopStatus(w) !== 'completed'
        );
        setRelatedWorkshops(related);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Master class not found');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Scroll-spy observer for sticky subnav
  useEffect(() => {
    const handleScroll = () => {
      const anchors = ['overview', 'agenda', 'speaker', 'reviews', 'faq'];
      const scrollY = window.scrollY + 140;

      for (let i = anchors.length - 1; i >= 0; i--) {
        const el = document.getElementById(anchors[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(anchors[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTimezoneChange = (e) => {
    const tz = e.target.value;
    setCurrentTimezone(tz);
    setSavedTimezone(tz);
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;
    setNotifySubmitting(true);
    try {
      await api.post('/subscribers', {
        email: notifyEmail.trim(),
        source: 'completed_workshop_rerun',
        workshopSlug: slug,
      });
      setNotifySuccess(true);
      setNotifyEmail('');
    } catch (e) {
      // Handled
    } finally {
      setNotifySubmitting(false);
    }
  };

  const handleRegistered = () => {
    setWorkshop((prev) =>
      prev ? { ...prev, seatsBooked: (prev.seatsBooked || 0) + 1 } : prev
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-28">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-muted text-xs font-semibold">Loading master class...</p>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-28 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">Master Class Not Found</h2>
        <p className="text-muted text-xs max-w-sm mx-auto mb-6">
          The requested session could not be located or may have been unlisted.
        </p>
        <Link to="/workshops" className="btn-primary text-xs py-2 px-4">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Workshops
        </Link>
      </div>
    );
  }

  const status = getWorkshopStatus(workshop);
  const badge = getStatusBadgeConfig(status);
  const isPast = status === 'completed';
  const isSoldOut = status === 'sold-out';
  const ctaLabel = isPast ? 'Get Resources' : isSoldOut ? 'Join Waitlist' : 'Reserve Spot';

  const seatsTotal = Number(workshop.seatsTotal ?? 100);
  const seatsBooked = Number(workshop.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
  const fillPercentage = seatsTotal > 0 ? Math.min(100, Math.round((seatsBooked / seatsTotal) * 100)) : 0;

  const currentUrl = `${window.location.origin}/w/${workshop.slug}`;
  const startDateFormatted = formatInTimezone(workshop.startDate, currentTimezone, 'full');

  // JSON-LD Structured Event Schema
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: workshop.title,
    description: workshop.shortDescription || workshop.title,
    startDate: workshop.startDate || new Date().toISOString(),
    endDate: workshop.endDate || workshop.startDate || new Date().toISOString(),
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: isPast
      ? 'https://schema.org/EventMovedOnline'
      : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: currentUrl,
    },
    image: [workshop.bannerImage || `${window.location.origin}/Logo.png`],
    organizer: {
      '@type': 'Organization',
      name: settings?.platformName || 'Workshop Hub',
      url: window.location.origin,
    },
    offers: {
      '@type': 'Offer',
      price: workshop.price || 0,
      priceCurrency: 'USD',
      availability: isSoldOut
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      url: currentUrl,
      validFrom: workshop.createdAt || new Date().toISOString(),
    },
    performer: {
      '@type': 'Person',
      name: 'Ayub',
      jobTitle: 'Founder & Principal, Due Diligence Lab',
    },
  };

  // Sort sections by order
  const sortedSections = [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const navAnchors = [
    { id: 'overview', label: 'Overview' },
    { id: 'agenda', label: 'Curriculum & Agenda' },
    { id: 'speaker', label: 'Trainer' },
    { id: 'reviews', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
  ];

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── SEO Metadata & JSON-LD Event Schema ─── */}
      <Helmet>
        <title>{workshop.title} | Executive Master Class</title>
        <meta name="description" content={workshop.shortDescription || workshop.title} />
        <meta property="og:title" content={workshop.title} />
        <meta property="og:description" content={workshop.shortDescription || workshop.title} />
        {workshop.bannerImage && <meta property="og:image" content={workshop.bannerImage} />}
        <meta property="og:type" content="event" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
      </Helmet>

      {/* ─── Sticky Sub-Navigation with Scroll-Spy Highlighting ─── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8E8] py-2.5 px-4 sm:px-6 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Breadcrumb back */}
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">All Master Classes</span>
          </Link>

          {/* Anchor Links with Scroll-Spy Gold Underline */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            {navAnchors.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToAnchor(item.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors relative ${
                    isActive
                      ? 'text-navy font-bold'
                      : 'text-muted hover:text-navy hover:bg-cream'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action: Share & CTA */}
          <div className="flex items-center gap-2">
            <ShareBar title={workshop.title} url={currentUrl} />

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="btn-primary text-xs py-1.5 px-4 font-semibold shrink-0"
            >
              {isPast ? 'Get Resources' : isSoldOut ? 'Join Waitlist' : 'Reserve Spot'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Full-Screen Main Content Flow (Original Mode) ─── */}
      <main className="w-full">
        {/* Dynamic CMS Sections */}
        {sortedSections
          .filter((section) => section.type !== 'footer')
          .map((section) => {
            switch (section.type) {
              case 'hero':
                return (
                  <div key={section._id || 'hero'} id="overview" className="scroll-mt-32">
                    <HeroSection
                      content={{
                        ...section.content,
                        ctaLabel: isSoldOut ? 'Join Waitlist' : isPast ? 'Get Resources' : section.content?.ctaLabel || ctaLabel,
                      }}
                      workshop={workshop}
                      onRegister={() => setIsRegisterOpen(true)}
                    />
                  </div>
                );

              case 'benefits':
                return (
                  <BenefitsSection
                    key={section._id || 'benefits'}
                    content={section.content}
                  />
                );

              case 'logos':
                return (
                  <LogosSection
                    key={section._id || 'logos'}
                    content={section.content}
                  />
                );

              case 'community':
                return (
                  <CommunitySection
                    key={section._id || 'community'}
                    content={section.content}
                  />
                );

              case 'stages':
                return (
                  <div key={section._id || 'stages'} id="agenda" className="scroll-mt-32">
                    <StagesSection content={section.content} />
                  </div>
                );

              case 'trainer':
                return (
                  <div key={section._id || 'trainer'} id="speaker" className="scroll-mt-32">
                    <TrainerSection content={section.content} />
                  </div>
                );

              case 'testimonials':
                return (
                  <div key={section._id || 'testimonials'} id="reviews" className="scroll-mt-32">
                    <TestimonialsSection content={section.content} />
                  </div>
                );

              case 'audience':
                return (
                  <AudienceSection
                    key={section._id || 'audience'}
                    content={{
                      ...section.content,
                      ctaLabel: isSoldOut ? 'Join Waitlist' : isPast ? 'Get Resources' : section.content?.ctaLabel || ctaLabel,
                    }}
                    onRegister={() => setIsRegisterOpen(true)}
                  />
                );

              default:
                return null;
            }
          })}

        {/* Dynamic Curriculum / Agenda Timetable (if configured on workshop) */}
        {workshop.agenda && workshop.agenda.length > 0 && !sortedSections.some((s) => s.type === 'stages') && (
          <section id="agenda" className="py-20 bg-[#FAF9F6] border-y border-[#E8E8E8] scroll-mt-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2 font-mono">
                TIMETABLE & MODULE BREAKDOWN
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-8">
                Detailed Curriculum Schedule
              </h3>
              <div className="divide-y divide-[#E8E8E8] bg-white border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-2xs">
                {workshop.agenda.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-4">
                    <span className="bg-[#FAF9F6] border border-[#E8E8E8] text-navy font-mono text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 sm:w-36 text-center">
                      {item.time || `Module ${idx + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-navy mb-1">{item.title}</h4>
                      <p className="text-xs text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Learning Outcomes Checklist */}
        {workshop.learningOutcomes && workshop.learningOutcomes.length > 0 && (
          <section className="py-20 bg-white border-b border-[#E8E8E8]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2 font-mono">
                WHAT YOU WILL MASTER
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-8">
                Core Learning Outcomes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workshop.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E8E8] text-sm text-navy font-medium shadow-2xs">
                    <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Prerequisites & Requirements */}
        {workshop.prerequisites && (workshop.prerequisites.whoItsFor || workshop.whoItsFor) && (
          <section className="py-16 bg-[#FAF9F6] border-b border-[#E8E8E8]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-2 font-mono">
                EXECUTIVE LAB PREREQUISITES
              </span>
              <h3 className="text-2xl font-bold text-navy mb-6">
                Who Should Attend & Requirements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted">
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-2xs">
                  <strong className="text-navy block mb-1 text-sm font-bold">Who It's For</strong>
                  <span>{workshop.prerequisites?.whoItsFor || workshop.whoItsFor}</span>
                </div>
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-2xs">
                  <strong className="text-navy block mb-1 text-sm font-bold">Technical Level</strong>
                  <span>{workshop.prerequisites?.technicalLevel || workshop.technicalLevel || 'No deep engineering background required.'}</span>
                </div>
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-2xs">
                  <strong className="text-navy block mb-1 text-sm font-bold">Take-Home Deliverables</strong>
                  <span>{workshop.prerequisites?.deliverables || workshop.deliverables || 'Production agent blueprints & code templates.'}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Video Player for Past Cohorts / Preview Reel */}
        {(workshop.videoUrl || workshop.recordingUrl) && (
          <section className="py-20 bg-white border-b border-[#E8E8E8]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest font-mono">
                  {isPast ? 'FULL SESSION RECORDING' : 'EXECUTIVE PREVIEW REEL'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy">
                {isPast ? 'Watch On-Demand Lab Recording' : 'Executive Master Class Walkthrough'}
              </h3>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-card border border-[#E8E8E8]">
                <video
                  src={workshop.videoUrl || workshop.recordingUrl}
                  poster={workshop.bannerImage}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* Platform FAQ Section */}
        {!sortedSections.some((s) => s.type === 'faq') && (
          <div id="faq" className="scroll-mt-32">
            <PlatformFaqSection faqs={workshop?.faqs?.length > 0 ? workshop.faqs : null} />
          </div>
        )}

        {/* Completed Workshop State: Priority Rerun Notification */}
        {isPast && (
          <section className="py-20 bg-[#FAF9F6] border-b border-[#E8E8E8]">
            <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-4">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest block font-mono">
                ARCHIVED MASTER CLASS
              </span>
              <h3 className="text-2xl font-bold text-navy">
                Looking to catch the next run of this session?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Enter your email below. Our team notifies alumni and verified sponsors as soon as a new cohort date is scheduled.
              </p>

              {notifySuccess ? (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 font-semibold max-w-sm mx-auto">
                  ✓ You're on the priority notify list!
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="max-w-sm mx-auto flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="your@firm.com"
                    required
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs text-navy focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={notifySubmitting}
                    className="btn-primary text-xs py-2 px-4 font-semibold shrink-0"
                  >
                    {notifySubmitting ? 'Submitting...' : 'Notify Me'}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* Related Workshops Carousel at the Bottom */}
        {relatedWorkshops.length > 0 && (
          <section className="py-20 bg-white border-t border-[#E8E8E8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[11px] font-bold text-gold uppercase tracking-widest block mb-1 font-mono">
                    MORE IN THIS SERIES
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
                    Related Master Classes & Labs
                  </h3>
                </div>
                <Link
                  to="/workshops"
                  className="text-xs font-semibold text-navy hover:text-gold transition-colors flex items-center gap-1"
                >
                  <span>View all ({relatedWorkshops.length + 1})</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedWorkshops.slice(0, 3).map((w) => (
                  <WorkshopCard key={w._id || w.id} workshop={w} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ─── Mobile Sticky Bottom CTA Bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E8E8] p-3 shadow-card-hover flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-navy truncate leading-tight">{workshop.title}</p>
          <p className="text-[10px] text-muted font-mono">
            {isPast ? 'Completed' : isSoldOut ? 'Capacity reached' : `${seatsLeft} spots left`}
          </p>
        </div>
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="btn-primary text-xs py-2 px-4 shrink-0 font-semibold"
        >
          {isPast ? 'Resources' : isSoldOut ? 'Waitlist' : 'Reserve Spot'}
        </button>
      </div>

      {/* Footer */}
      {sortedSections
        .filter((s) => s.type === 'footer')
        .map((section) => (
          <WorkshopFooter key={section._id} content={section.content} />
        ))}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        workshop={workshop}
        form={form}
        onRegistered={handleRegistered}
      />
    </div>
  );
}
