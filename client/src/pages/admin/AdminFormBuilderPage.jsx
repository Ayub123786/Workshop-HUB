import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  Sliders,
  Calendar,
  Users,
  Mail,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api';

export default function AdminFormBuilderPage() {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [wRes, fRes] = await Promise.all([
        api.get('/workshops/admin/all'),
        api.get(`/forms/${id}`),
      ]);
      const found = wRes.data.workshops?.find((w) => w._id === id);
      setWorkshop(found);
      setForm(fRes.data.form);
    } catch (err) {
      console.error('Failed to load form builder data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.put(`/forms/${form._id}`, form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Question',
      placeholder: 'Enter your answer...',
      required: false,
      options: [],
      order: (form.fields || []).length,
    };
    setForm({ ...form, fields: [...(form.fields || []), newField] });
  };

  const handleUpdateField = (index, key, value) => {
    const updated = [...(form.fields || [])];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, fields: updated });
  };

  const handleDeleteField = (index) => {
    const updated = (form.fields || []).filter((_, i) => i !== index);
    setForm({ ...form, fields: updated });
  };

  const handleMoveField = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= (form.fields || []).length) return;
    const updated = [...form.fields];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setForm({ ...form, fields: updated });
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-xs text-muted">Loading form configuration...</p>
      </div>
    );
  }

  if (!form) {
    return <div className="p-8 text-center text-sm text-muted">Form not found</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/workshops"
            className="p-2 rounded-xl border border-white/10 text-[#8A8A85] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-[10px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Form Architect · Field Logic</span>
            </div>
            <h1 className="text-2xl font-display uppercase tracking-wider text-white">
              Registration Form Builder
            </h1>
            <p className="text-xs text-[#8A8A85] font-sans">
              For: <strong className="text-gold font-mono tracking-tight">{workshop?.title || 'Workshop'}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs py-2 px-5 flex items-center gap-2 self-start sm:self-auto font-mono uppercase tracking-wider font-bold shadow-md shadow-gold/20"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-black" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Form'}
        </button>
      </div>

      {/* Grid: Editor Left & Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Configuration & Field Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* Form Settings */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-gold" /> Capacity & Submission Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Registration Capacity Limit
                </label>
                <input
                  type="number"
                  value={form.capacity || ''}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) || null })}
                  placeholder="e.g. 100 (blank = unlimited)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  value={form.deadline ? form.deadline.substring(0, 16) : ''}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Modal Success Message
              </label>
              <textarea
                rows={2}
                value={form.successMessage || ''}
                onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
                placeholder="Message shown after someone registers..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs resize-none"
              />
            </div>
          </div>

          {/* Form Fields List */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                  Form Fields ({form.fields?.length || 0})
                </h3>
                <p className="text-[11px] text-muted">
                  Custom fields collected in the registration modal
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field
              </button>
            </div>

            <div className="space-y-3">
              {(form.fields || []).map((field, idx) => (
                <div
                  key={field.id || idx}
                  className="p-4 rounded-xl border border-border bg-cream/50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted text-[11px]">#{idx + 1}</span>
                      <span className="font-bold text-navy">{field.label || 'Untitled Field'}</span>
                      {field.required && (
                        <span className="text-[10px] bg-gold/15 text-gold font-bold px-1.5 py-0.2 rounded">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded text-muted hover:text-navy disabled:opacity-20"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 1)}
                        disabled={idx === (form.fields.length - 1)}
                        title="Move Down"
                        className="p-1 rounded text-muted hover:text-navy disabled:opacity-20"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(idx)}
                        title="Delete Field"
                        className="p-1 rounded text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-muted uppercase font-semibold mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-muted uppercase font-semibold mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.type || 'text'}
                        onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                      >
                        <option value="text">Text Input</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Number</option>
                        <option value="dropdown">Dropdown Select</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="textarea">Text Area</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-muted uppercase font-semibold mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!field.required}
                          onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                          className="rounded border-border text-gold focus:ring-gold"
                        />
                        <span className="text-xs font-semibold text-navy">Required Field</span>
                      </label>
                    </div>
                  </div>

                  {field.type === 'dropdown' && (
                    <div>
                      <label className="block text-[10px] text-muted uppercase font-semibold mb-1">
                        Dropdown Options (comma separated)
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(field.options) ? field.options.join(', ') : ''}
                        onChange={(e) =>
                          handleUpdateField(
                            idx,
                            'options',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Form Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-[#121218] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-[#161622] p-5 border-b border-white/10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-[9px] uppercase tracking-wider mb-2">
                LIVE MODAL PREVIEW
              </div>
              <h3 className="text-base font-display uppercase tracking-wider text-white truncate">
                {workshop?.title || 'Workshop Title'}
              </h3>
              <p className="text-xs text-[#8A8A85] mt-1 font-sans">Live Registration Modal</p>
            </div>

            <div className="p-6 space-y-4">
              {(form.fields || []).map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                    {f.label} {f.required && <span className="text-gold">*</span>}
                  </label>
                  {f.type === 'dropdown' ? (
                    <select
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-muted text-xs"
                    >
                      <option>Select an option...</option>
                      {(f.options || []).map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      disabled
                      rows={2}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-muted text-xs resize-none"
                    />
                  ) : f.type === 'checkbox' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" disabled className="rounded text-gold" />
                      <span className="text-xs text-muted">{f.placeholder || f.label}</span>
                    </div>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      disabled
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-muted text-xs"
                    />
                  )}
                </div>
              ))}

              <button
                disabled
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold opacity-90 mt-2"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
