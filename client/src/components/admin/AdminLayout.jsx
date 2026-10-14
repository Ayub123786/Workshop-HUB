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
    <div className="h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-bold text-sm">
            W
          </div>
          <span className="font-bold text-navy text-sm">Workshop Hub Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-border text-navy"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-border flex flex-col justify-between z-30 shrink-0 h-full transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-border">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cream-dark border border-border flex items-center justify-center p-1.5 shadow-xs">
                <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="block font-bold text-navy text-sm tracking-tight leading-tight">
                  {settings.platformName || 'Workshop Hub'}
                </span>
                <span className="text-[10px] uppercase font-semibold text-gold tracking-widest">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-muted hover:text-navy hover:bg-cream'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-gold" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Actions */}
        <div className="p-4 border-t border-border space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-navy bg-cream border border-border transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold" /> Public Hub
            </span>
            <span className="text-[10px] text-muted">Open ↗</span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-navy truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-muted capitalize flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-emerald-600" /> {user?.role || 'admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
