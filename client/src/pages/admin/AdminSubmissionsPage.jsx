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
} from 'lucide-react';
import api from '../../lib/api';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedWorkshop, searchTerm]);

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

  const handleExportCSV = () => {
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Registrations & Submissions</h1>
          <p className="text-xs text-muted mt-1">
            Review attendees, filter by workshop, and export data as CSV.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-2 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-cream text-navy text-xs focus:outline-none focus:border-gold"
          />
        </div>

        {/* Workshop Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted shrink-0">Workshop:</span>
          <select
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-border bg-cream text-navy text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Workshops</option>
            {workshops.map((w) => (
              <option key={w._id} value={w._id}>
                {w.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted">Loading registrations...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">
            No registrations match your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream border-b border-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Registrant</th>
                  <th className="py-3 px-4">Work Email</th>
                  <th className="py-3 px-4">Workshop</th>
                  <th className="py-3 px-4">Additional Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((sub) => {
                  const isDeleting = deletingId === sub._id;
                  const customFields = Object.entries(sub.data || {}).filter(
                    ([k]) => !['name', 'email', 'company', 'role'].includes(k)
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

                      <td className="py-3 px-4 font-medium text-navy">
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

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.formId, sub._id)}
                          disabled={isDeleting}
                          className="p-1.5 text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
