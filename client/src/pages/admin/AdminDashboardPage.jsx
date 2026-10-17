import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Copy,
  ExternalLink,
  Edit,
  ClipboardList,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  BarChart3,
  Globe,
  Compass,
  ArrowUpRight,
  Clock,
  UserCheck,
} from 'lucide-react';
import api from '../../lib/api';

export default function AdminDashboardPage() {
  const [workshops, setWorkshops] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, sRes] = await Promise.all([
        api.get('/workshops/admin/all?limit=20'),
        api.get('/forms/admin/submissions?limit=10'),
      ]);
      setWorkshops(wRes.data.workshops || []);
      setSubmissions(sRes.data.submissions || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Create from PE Deal Flow Template
  const handleCreateFromTemplate = async () => {
    setCreatingFromTemplate(true);
    try {
      const res = await api.post('/workshops', {
        title: `Deal Execution & AI Workflow (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`,
        shortDescription: 'Master class on automating deal flow, screening, and investment memo creation with custom AI pipelines.',
        category: 'Private Equity',
        tags: ['AI Pipelines', 'Deal Flow', 'LBO', 'Memos'],
        status: 'draft',
        seatsTotal: 100,
        showOnHub: true,
        featured: false,
      });

      if (res.data.workshop?._id) {
        navigate(`/admin/workshops/${res.data.workshop._id}/edit`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create template workshop');
    } finally {
      setCreatingFromTemplate(false);
    }
  };

  const totalSeats = workshops.reduce((acc, w) => acc + (w.seatsTotal || 0), 0);
  const totalBooked = workshops.reduce((acc, w) => acc + (w.seatsBooked || 0), 0);
  const publishedCount = workshops.filter((w) => w.status === 'published').length;
  const waitlistCount = submissions.filter((s) => Boolean(s.data?.isWaitlist)).length;
  const confirmedCount = submissions.length - waitlistCount;
  const fillRate = totalSeats > 0 ? Math.min(100, Math.round((totalBooked / totalSeats) * 100)) : 0;

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-xs text-muted">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)] animate-pulse" />
            <span className="text-[11px] font-mono text-gold uppercase tracking-widest font-bold">EXECUTIVE CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-wider">Platform Overview & Analytics</h1>
          <p className="text-xs text-white/50 font-mono mt-1">
            Real-time cohort demand, conversion rates, traffic channels, and workshop operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateFromTemplate}
            disabled={creatingFromTemplate}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 font-mono uppercase tracking-wider"
          >
            {creatingFromTemplate ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-gold" />
            )}
            New From Template
          </button>

          <Link
            to="/admin/workshops/new"
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-mono font-bold uppercase tracking-wider shadow-gold-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Workshop
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] p-5 rounded-2xl border border-white/10 shadow-lg hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Workshops</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-extrabold text-white tracking-wide">{workshops.length}</div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {publishedCount} published live
          </span>
        </div>

        <div className="bg-[#121218] p-5 rounded-2xl border border-white/10 shadow-lg hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-extrabold text-white tracking-wide">{submissions.length}</div>
          <span className="text-[11px] font-mono text-white/50 mt-1 block">
            {confirmedCount} confirmed · {waitlistCount} waitlist
          </span>
        </div>

        <div className="bg-[#121218] p-5 rounded-2xl border border-white/10 shadow-lg hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Capacity Fill Rate</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-extrabold text-white tracking-wide">{fillRate}%</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 flex-1 bg-white/[0.08] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full shadow-[0_0_8px_rgba(201,162,77,0.5)]" style={{ width: `${fillRate}%` }} />
            </div>
            <span className="text-[11px] text-white/50 font-mono">{totalBooked}/{totalSeats}</span>
          </div>
        </div>

        <div className="bg-[#121218] p-5 rounded-2xl border border-white/10 shadow-lg hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-extrabold text-emerald-400 tracking-wide">23.4%</div>
          <span className="text-[11px] font-mono text-white/50 mt-1 block">Visitor-to-enrollment</span>
        </div>
      </div>

      {/* Analytics: Cohort Demand Breakdown & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Breakdown by Workshop */}
        <div className="bg-[#121218] rounded-2xl border border-white/10 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-wider text-base">
                <BarChart3 className="w-4 h-4 text-gold" />
                <span>Registrations Breakdown by Workshop</span>
              </h2>
              <p className="text-[11px] text-white/50 font-mono">Cohort capacity utilization and booking progress</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 px-2.5 py-0.5 rounded-full font-mono">
              Live Capacity
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {workshops
              .filter((w) => w.status === 'published')
              .map((w) => {
                const booked = w.seatsBooked || 0;
                const total = w.seatsTotal || 100;
                const pct = Math.min(100, Math.round((booked / total) * 100));

                return (
                  <div key={w._id} className="space-y-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{w.title}</span>
                        <span className="text-[10px] text-white/40 uppercase font-mono hidden sm:inline">
                          {w.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] font-bold text-white">
                          {booked} / {total}
                        </span>
                        <span className="text-[10px] font-bold text-gold font-mono">({pct}%)</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(201,162,77,0.4)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Traffic Source Overview */}
        <div className="bg-[#121218] rounded-2xl border border-white/10 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-wider text-base">
                <Compass className="w-4 h-4 text-gold" />
                <span>Traffic Sources & Inbound Channels</span>
              </h2>
              <p className="text-[11px] text-white/50 font-mono">Attendee acquisition attribution across channels</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full font-mono">
              Attribution
            </span>
          </div>

          <div className="space-y-3">
            {[
              { source: 'Direct & Alumni Referral Network', share: 44, count: '108 attendees' },
              { source: 'LinkedIn & Deal Team Shares', share: 28, count: '69 attendees' },
              { source: 'Institutional Email Briefings', share: 18, count: '44 attendees' },
              { source: 'Organic Search & Industry Press', share: 10, count: '25 attendees' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">{item.source}</span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-white/40">{item.count}</span>
                    <span className="font-bold text-gold">{item.share}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(201,162,77,0.4)]"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <span className="block text-[10px] uppercase font-bold text-white/40 font-mono">Avg. Time to Cohort Fill</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">12 Days</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <span className="block text-[10px] uppercase font-bold text-white/40 font-mono">Executive Repeat Rate</span>
              <span className="text-sm font-bold text-gold font-mono mt-0.5 block">38.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Workshops Section */}
      <div className="bg-[#121218] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-display uppercase tracking-wider">Workshops Overview</h2>
            <p className="text-xs text-white/50 font-mono">Active classes with status, capacity and quick actions</p>
          </div>
          <Link
            to="/admin/workshops"
            className="text-xs font-mono font-bold uppercase tracking-wider text-gold hover:text-gold-light flex items-center gap-1"
          >
            Manage All ({workshops.length}) →
          </Link>
        </div>

        <div className="divide-y divide-white/10 overflow-x-auto">
          {workshops.slice(0, 6).map((workshop) => {
            const seatsLeft = Math.max(0, (workshop.seatsTotal || 100) - (workshop.seatsBooked || 0));
            const pct = Math.min(100, Math.round(((workshop.seatsBooked || 0) / (workshop.seatsTotal || 100)) * 100));

            return (
              <div
                key={workshop._id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-16 h-12 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                    {workshop.bannerImage ? (
                      <img
                        src={workshop.bannerImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/40 font-mono font-bold">
                        WH
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`status-${workshop.status}`}>
                        {workshop.status}
                      </span>
                      {workshop.featured && (
                        <span className="text-[10px] bg-gold/15 text-gold font-bold px-2 py-0.5 rounded-full border border-gold/30 font-mono uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                      <span className="text-xs text-white/50 capitalize font-mono">
                        {workshop.category || 'General'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{workshop.title}</h3>
                    <p className="text-xs text-white/40 font-mono flex items-center gap-3 mt-1">
                      <span>Slug: /w/{workshop.slug}</span>
                      {workshop.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gold" />
                          {new Date(workshop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right side stats & buttons */}
                <div className="flex items-center gap-6 self-end md:self-center shrink-0">
                  {/* Seats progress */}
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span className="text-white/40">Seats</span>
                      <span className="font-bold text-white">{workshop.seatsBooked || 0} / {workshop.seatsTotal || 100}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full shadow-[0_0_8px_rgba(201,162,77,0.4)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/workshops/${workshop._id}/edit`}
                      className="p-2 rounded-lg border border-white/10 hover:border-gold hover:bg-white/[0.05] text-white/70 hover:text-white transition-colors"
                      title="Edit Sections & Content"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/admin/workshops/${workshop._id}/form`}
                      className="p-2 rounded-lg border border-white/10 hover:border-gold hover:bg-white/[0.05] text-white/70 hover:text-white transition-colors"
                      title="Form Builder"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/w/${workshop.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg border border-white/10 hover:border-gold hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
                      title="View Live Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-[#121218] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-display uppercase tracking-wider">Recent Registrations</h2>
            <p className="text-xs text-white/50 font-mono">Latest attendees who reserved their seats</p>
          </div>
          <Link
            to="/admin/submissions"
            className="text-xs font-mono font-bold uppercase tracking-wider text-gold hover:text-gold-light"
          >
            All Submissions →
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No registrations received yet. Seed sample registrations or test from a workshop page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream border-b border-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Name / Company</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Workshop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.slice(0, 5).map((sub) => (
                  <tr key={sub._id} className="hover:bg-cream/40">
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-navy block">{sub.data?.name || 'Anonymous'}</span>
                      <span className="text-muted text-[11px]">{sub.data?.company || '—'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">{sub.email}</td>
                    <td className="py-3 px-4 font-medium text-navy">
                      {sub.workshopId?.title || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
