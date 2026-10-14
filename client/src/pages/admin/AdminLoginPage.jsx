import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Lock, Mail, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@workshophub.com');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-sm">
              WH
            </div>
            <h1 className="text-2xl font-bold text-navy">Workshop Hub Admin</h1>
            <p className="text-xs text-muted mt-1">
              Sign in to manage workshops, sections, registrations, and forms
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@workshophub.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-navy text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm font-semibold mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </span>
              ) : (
                'Sign In to Console'
              )}
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="mt-6 p-3 bg-cream rounded-xl border border-border text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-navy mb-1">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>Default Admin Credentials:</span>
            </div>
            <p className="text-[11px] text-muted font-mono">
              admin@workshophub.com / Admin@123456
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-muted hover:text-navy underline transition-colors"
          >
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
