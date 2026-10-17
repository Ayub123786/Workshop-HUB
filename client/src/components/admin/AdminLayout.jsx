import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Workshops', path: '/admin/workshops', icon: Layers },
    { label: 'Submissions', path: '/admin/submissions', icon: FileText },
    { label: 'Image Library', path: '/admin/images', icon: ImageIcon },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-dark h-screen bg-[#0a0a0a] text-[#F5F5F0] flex flex-col md:flex-row font-sans overflow-hidden selection:bg-gold selection:text-black">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#101014] border-b border-white/10 shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold text-[#0a0a0a] flex items-center justify-center font-bold text-sm font-display shadow-gold-glow">
            WH
          </div>
          <span className="font-bold text-white text-sm font-display uppercase tracking-wider">Workshop Hub Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#101014] border-r border-white/10 flex flex-col justify-between z-30 shrink-0 h-full transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Header */}
          <div className="p-5 border-b border-white/10">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_0_15px_rgba(201,162,77,0.4)]">
                <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="block font-display font-extrabold text-white text-sm tracking-wider uppercase group-hover:text-gold transition-colors leading-tight">
                  {settings.platformName || 'Workshop Hub'}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold text-gold tracking-widest flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)] animate-pulse" />
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0a0a0a] stroke-[3]" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Actions */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0d0d10]">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white bg-white/[0.04] border border-white/10 hover:border-gold/40 transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold" /> Public Hub
            </span>
            <span className="text-[10px] text-white/40 font-mono">Open ↗</span>
          </Link>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 text-gold flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-white/40 capitalize font-mono flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-gold" /> {user?.role || 'admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col min-h-0 bg-[#0a0a0a]">
        <Outlet />
      </main>
    </div>
  );
}
