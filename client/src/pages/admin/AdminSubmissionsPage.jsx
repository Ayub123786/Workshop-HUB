import { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Trash2,
  Calendar,
  Users,
  Filter,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Mail,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Check,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api';
import BroadcastEmailModal from '../../components/admin/BroadcastEmailModal';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [promotingId, setPromotingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'confirmed' | 'waitlist' | 'subscribers'
  const [broadcastWorkshop, setBroadcastWorkshop] = useState(null);
  const [promoteSuccessMsg, setPromoteSuccessMsg] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedWorkshop, searchTerm]);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWorkshop !== 'all') params.append('workshopId', selectedWorkshop);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/forms/admin/submissions?${params.toString()}`);
      setSubmissions(res.data.submissions || []);
      setWorkshops(res.data.workshops || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await api.get('/subscribers');
      setSubscribers(res.data.subscribers || []);
    } catch (err) {
      console.error('Failed to load subscribers', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleExportCSV = () => {
    if (activeTab === 'subscribers') {
      window.open(`${api.defaults.baseURL}/subscribers/export`, '_blank');
      return;
    }
    const query = selectedWorkshop !== 'all' ? `?workshopId=${selectedWorkshop}` : '';
    window.open(`${api.defaults.baseURL}/forms/admin/submissions/export${query}`, '_blank');
  };

  const handleDelete = async (formId, subId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    setDeletingId(subId);
    try {
      await api.delete(`/forms/${formId || 'form'}/submissions/${subId}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== subId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePromote = async (sub) => {
    setPromotingId(sub._id);
    try {
      await api.put(`/forms/admin/submissions/${sub._id}/promote`);
      setPromoteSuccessMsg(`Promoted ${sub.data?.name || sub.email} to confirmed attendee.`);
      setTimeout(() => setPromoteSuccessMsg(null), 4000);

      // Update state locally
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === sub._id
            ? { ...s, data: { ...(s.data || {}), isWaitlist: false, promotedAt: new Date().toISOString() } }
            : s
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote waitlist attendee');
    } finally {
      setPromotingId(null);
    }
  };

  // Filtered registrations
  const confirmedSubmissions = submissions.filter((s) => !s.data?.isWaitlist);
  const waitlistSubmissions = submissions.filter((s) => Boolean(s.data?.isWaitlist));

  const displayedSubmissions =
    activeTab === 'confirmed'
      ? confirmedSubmissions
      : activeTab === 'waitlist'
      ? waitlistSubmissions
      : submissions;

  // Filtered subscribers by search term
  const displayedSubscribers = subscribers.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.email?.toLowerCase().includes(term) ||
      s.source?.toLowerCase().includes(term) ||
      s.workshopSlug?.toLowerCase().includes(term)
    );
  });

  // Workshop to email
  const targetEmailWorkshop =
    selectedWorkshop !== 'all'
      ? workshops.find((w) => w._id === selectedWorkshop) || workshops[0]
      : workshops[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {promoteSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-white px-4 py-3 rounded-xl border border-gold/40 shadow-lg flex items-center gap-2 text-xs animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{promoteSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-[10px] uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Audience Pipeline · Attendance Data</span>
          </div>
          <h1 className="text-2xl font-display uppercase tracking-wider text-white">Registrations & Waitlist</h1>
          <p className="text-xs text-[#8A8A85] mt-1 font-sans">
            Review confirmed attendees, manage cohort waitlists, broadcast announcements, and monitor newsletter subscribers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {workshops.length > 0 && (
            <button
              onClick={() => setBroadcastWorkshop(targetEmailWorkshop)}
              className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#161622] text-white font-mono uppercase text-xs hover:border-gold hover:text-gold transition-colors flex items-center gap-2"
              title="Broadcast email to registrants"
            >
              <Mail className="w-3.5 h-3.5 text-gold" />
              <span>Email Registrants</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 uppercase font-mono tracking-wider font-bold shadow-md shadow-gold/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export {activeTab === 'subscribers' ? 'Subscribers' : 'Registrations'} CSV</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-3.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'all'
              ? 'border-b-2 border-gold text-gold font-bold'
              : 'text-[#8A8A85] hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registrations</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#181824] border border-white/10 text-white font-mono">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`pb-2.5 px-3.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'confirmed'
              ? 'border-b-2 border-gold text-gold font-bold'
              : 'text-[#8A8A85] hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Confirmed Attendees</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#181824] border border-white/10 text-emerald-400 font-mono">
            {confirmedSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`pb-2.5 px-3.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'waitlist'
              ? 'border-b-2 border-gold text-gold font-bold'
              : 'text-[#8A8A85] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Waitlist</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
            {waitlistSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-2.5 px-3.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'subscribers'
              ? 'border-b-2 border-gold text-gold font-bold'
              : 'text-[#8A8A85] hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-violet-400" />
          <span>Newsletter Subscribers</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#181824] border border-white/10 text-violet-400 font-mono">
            {subscribers.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121218] rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A8A85] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'subscribers'
                ? 'Search subscriber emails or source...'
                : 'Search by name, email, or company...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-[#161622] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold"
          />
        </div>

        {/* Workshop Filter Dropdown (Hidden for Subscribers tab) */}
        {activeTab !== 'subscribers' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8A8A85] shrink-0 font-medium">Workshop:</span>
            <select
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-white/10 bg-[#161622] text-white text-xs font-mono uppercase tracking-wider font-semibold focus:outline-none focus:border-gold"
            >
              <option value="all">All Workshops ({workshops.length})</option>
              {workshops.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content: Registrations Table or Subscribers Table */}
      {activeTab === 'subscribers' ? (
        /* SUBSCRIBERS TABLE */
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          {loadingSubscribers ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
              <p className="text-xs text-muted">Loading subscribers...</p>
            </div>
          ) : displayedSubscribers.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted">
              No newsletter subscribers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream border-b border-border text-muted font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Subscribed At</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Capture Source</th>
                    <th className="py-3 px-4">Associated Workshop</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedSubscribers.map((sub) => (
                    <tr key={sub.id || sub._id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-4 text-muted whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-navy">
                        <a href={`mailto:${sub.email}`} className="hover:text-gold hover:underline">
                          {sub.email}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-cream border border-border text-[11px] font-mono text-muted">
                          {sub.source || 'hub_newsletter'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted font-mono text-[11px]">
                        {sub.workshopSlug ? `/w/${sub.workshopSlug}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          <Check className="w-3 h-3" /> Subscribed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* REGISTRATIONS TABLE */
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
              <p className="text-xs text-muted">Loading registrations...</p>
            </div>
          ) : displayedSubmissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted">
              {activeTab === 'waitlist'
                ? 'No waitlisted attendees for this cohort.'
                : 'No registrations match your search filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream border-b border-border text-muted font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registrant</th>
                    <th className="py-3 px-4">Work Email</th>
                    <th className="py-3 px-4">Workshop</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedSubmissions.map((sub) => {
                    const isDeleting = deletingId === sub._id;
                    const isPromoting = promotingId === sub._id;
                    const isWaitlist = Boolean(sub.data?.isWaitlist);
                    const customFields = Object.entries(sub.data || {}).filter(
                      ([k]) => !['name', 'email', 'company', 'role', 'isWaitlist', 'promotedAt'].includes(k)
                    );

                    return (
                      <tr key={sub._id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4 text-muted whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {isWaitlist ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              <Clock className="w-3 h-3" /> Waitlist
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Confirmed
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <strong className="text-navy block">{sub.data?.name || 'Anonymous'}</strong>
                          <span className="text-muted text-[11px]">
                            {sub.data?.company} {sub.data?.role && `· ${sub.data.role}`}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-muted">
                          <a href={`mailto:${sub.email}`} className="hover:text-gold hover:underline">
                            {sub.email}
                          </a>
                        </td>

                        <td className="py-3 px-4 font-medium text-navy max-w-xs truncate">
                          {sub.workshopId?.title || 'Workshop'}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-muted max-w-xs">
                          {customFields.length > 0 ? (
                            customFields.map(([k, v]) => (
                              <span key={k} className="inline-block mr-2">
                                <strong>{k}:</strong> {String(v)}
                              </span>
                            ))
                          ) : (
                            <span>—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {isWaitlist && (
                              <button
                                onClick={() => handlePromote(sub)}
                                disabled={isPromoting}
                                className="px-2.5 py-1 rounded-lg bg-navy text-white text-[11px] font-semibold hover:bg-navy/90 flex items-center gap-1 transition-all shadow-xs"
                                title="Promote to confirmed attendee"
                              >
                                {isPromoting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3 h-3 text-gold" />
                                )}
                                <span>Promote</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(sub.formId, sub._id)}
                              disabled={isDeleting}
                              className="p-1.5 text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Registration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Broadcast Email Modal */}
      {broadcastWorkshop && (
        <BroadcastEmailModal
          isOpen={Boolean(broadcastWorkshop)}
          workshop={broadcastWorkshop}
          onClose={() => setBroadcastWorkshop(null)}
        />
      )}
    </div>
  );
}
