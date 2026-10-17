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
    <div className="admin-dark min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-[#121218]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-[10px] uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Console Access · v2.4</span>
            </div>
            
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 via-[#1a1a24] to-black border border-gold/40 text-gold flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-gold/10">
              WH
            </div>
            <h1 className="text-2xl font-display uppercase tracking-wider text-white">Workshop Hub</h1>
            <p className="text-xs text-[#8A8A85] mt-1.5 font-sans">
              Sign in to manage workshops, cohorts, registrations, and forms
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-start gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A8A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@workshophub.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#161622] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A0A09A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A8A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#161622] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-xs uppercase tracking-wider font-bold mt-2 shadow-lg shadow-gold/20"
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
          <div className="mt-6 p-3.5 bg-[#161620] rounded-xl border border-white/5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mb-1">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#A0A09A]">Default Admin Credentials:</span>
            </div>
            <p className="text-[11px] text-gold/90 font-mono tracking-tight">
              admin@workshophub.com / Admin@123456
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-[#8A8A85] hover:text-gold transition-colors font-mono tracking-wider"
          >
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
