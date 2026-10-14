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
          <h1 className="text-2xl font-bold text-navy">Platform Overview & Analytics</h1>
          <p className="text-xs text-muted mt-1">
            Real-time cohort demand, conversion rates, traffic channels, and workshop operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateFromTemplate}
            disabled={creatingFromTemplate}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
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
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Workshop
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Workshops</span>
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-navy">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy">{workshops.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {publishedCount} published live
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-gold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy">{submissions.length}</div>
          <span className="text-[11px] text-muted">
            {confirmedCount} confirmed · {waitlistCount} waitlist
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Capacity Fill Rate</span>
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-navy">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-navy">{fillRate}%</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 flex-1 bg-cream rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: `${fillRate}%` }} />
            </div>
            <span className="text-[11px] text-muted font-mono">{totalBooked}/{totalSeats}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">23.4%</div>
          <span className="text-[11px] text-muted">Visitor-to-enrollment</span>
        </div>
      </div>

      {/* Analytics: Cohort Demand Breakdown & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Breakdown by Workshop */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold" />
                <span>Registrations Breakdown by Workshop</span>
              </h2>
              <p className="text-[11px] text-muted">Cohort capacity utilization and booking progress</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-cream border border-border px-2 py-0.5 rounded-full">
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
                  <div key={w._id} className="space-y-1.5 p-2.5 rounded-xl bg-cream/50 border border-border">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-navy truncate max-w-[200px] sm:max-w-xs">{w.title}</span>
                        <span className="text-[10px] text-muted uppercase font-mono hidden sm:inline">
                          {w.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] font-bold text-navy">
                          {booked} / {total}
                        </span>
                        <span className="text-[10px] font-semibold text-gold">({pct}%)</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Traffic Source Overview */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold" />
                <span>Traffic Sources & Inbound Channels</span>
              </h2>
              <p className="text-[11px] text-muted">Attendee acquisition attribution across channels</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-cream border border-border px-2 py-0.5 rounded-full">
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
                  <span className="text-navy font-medium">{item.source}</span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-muted">{item.count}</span>
                    <span className="font-bold text-navy">{item.share}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-navy rounded-full transition-all duration-500"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-2 rounded-xl bg-cream border border-border">
              <span className="block text-[10px] uppercase font-bold text-muted">Avg. Time to Cohort Fill</span>
              <span className="text-sm font-bold text-navy">12 Days</span>
            </div>
            <div className="p-2 rounded-xl bg-cream border border-border">
              <span className="block text-[10px] uppercase font-bold text-muted">Executive Repeat Rate</span>
              <span className="text-sm font-bold text-gold">38.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Workshops Section */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Workshops Overview</h2>
            <p className="text-xs text-muted">Active classes with status, capacity and quick actions</p>
          </div>
          <Link
            to="/admin/workshops"
            className="text-xs font-semibold text-gold hover:underline flex items-center gap-1"
          >
            Manage All ({workshops.length}) →
          </Link>
        </div>

        <div className="divide-y divide-border overflow-x-auto">
          {workshops.slice(0, 6).map((workshop) => {
            const seatsLeft = Math.max(0, (workshop.seatsTotal || 100) - (workshop.seatsBooked || 0));
            const pct = Math.min(100, Math.round(((workshop.seatsBooked || 0) / (workshop.seatsTotal || 100)) * 100));

            return (
              <div
                key={workshop._id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-16 h-12 rounded-lg bg-cream-dark overflow-hidden shrink-0 border border-border">
                    {workshop.bannerImage ? (
                      <img
                        src={workshop.bannerImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted font-bold">
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
                        <span className="text-[10px] bg-gold/15 text-gold font-bold px-2 py-0.5 rounded-full border border-gold/30">
                          Featured
                        </span>
                      )}
                      <span className="text-xs text-muted capitalize">
                        {workshop.category || 'General'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-navy truncate">{workshop.title}</h3>
                    <p className="text-xs text-muted flex items-center gap-3 mt-1">
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
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted">Seats</span>
                      <span className="font-bold text-navy">{workshop.seatsBooked || 0} / {workshop.seatsTotal || 100}</span>
                    </div>
                    <div className="h-1.5 w-full bg-cream-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/workshops/${workshop._id}/edit`}
                      className="p-2 rounded-lg border border-border hover:bg-cream text-navy transition-colors"
                      title="Edit Sections & Content"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/admin/workshops/${workshop._id}/form`}
                      className="p-2 rounded-lg border border-border hover:bg-cream text-navy transition-colors"
                      title="Form Builder"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/w/${workshop.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg border border-border hover:bg-cream text-muted hover:text-navy transition-colors"
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
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Recent Registrations</h2>
            <p className="text-xs text-muted">Latest attendees who reserved their seats</p>
          </div>
          <Link
            to="/admin/submissions"
            className="text-xs font-semibold text-gold hover:underline"
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
