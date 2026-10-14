import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-cream-dark border-t border-border">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={settings?.logo || '/Logo.png'}
              alt={settings?.platformName || 'Workshop Hub'}
              className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-semibold text-navy/80 text-sm">
              {settings?.platformName || 'Workshop Hub'}
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link to="/workshops" className="text-sm text-muted hover:text-navy transition-colors">Workshops</Link>
            <Link to="/workshops?filter=upcoming" className="text-sm text-muted hover:text-navy transition-colors">Upcoming</Link>
            <Link to="/workshops?filter=past" className="text-sm text-muted hover:text-navy transition-colors">Past Sessions</Link>
            <Link to="/admin" className="text-sm text-muted hover:text-navy transition-colors">Admin</Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-subtle text-center">
            {settings?.footerText || '© 2026 Workshop Hub. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
