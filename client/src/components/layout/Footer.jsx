import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070707] border-t border-white/[0.08] relative z-10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/[0.08]">
          {/* Logo & City Tag */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-gold group-hover:shadow-gold-glow">
              <img
                src={settings?.logo || '/Logo.png'}
                alt={settings?.platformName || 'Workshop Hub'}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-white uppercase group-hover:text-gold transition-colors block">
                {settings?.platformName || 'WORKSHOP HUB'}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">
                DELHI · DUBAI · 2026
              </span>
            </div>
          </Link>

          {/* Links in Monospace */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-wider text-white/50">
            <Link to="/workshops" className="hover:text-gold transition-colors">
              Workshops
            </Link>
            <Link to="/workshops?view=calendar" className="hover:text-gold transition-colors">
              Calendar
            </Link>
            <Link to="/#testimonials" className="hover:text-gold transition-colors">
              Alumni
            </Link>
            <Link to="/#faq" className="hover:text-gold transition-colors">
              FAQ
            </Link>
            <Link to="/admin" className="hover:text-violet transition-colors">
              Admin OS
            </Link>
          </div>

          {/* Back to top Button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 glass text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white hover:border-gold/50 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp size={12} className="text-gold" />
          </button>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-mono text-white/30 uppercase tracking-widest">
          <p>© 2026 WORKSHOP HUB OS · ALL RIGHTS RESERVED · INSTITUTIONAL PRIVATE USE</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white/60 transition-colors cursor-pointer">PRIVACY</span>
            <span>·</span>
            <span className="hover:text-white/60 transition-colors cursor-pointer">TERMS</span>
            <span>·</span>
            <span className="hover:text-white/60 transition-colors cursor-pointer">ENCRYPTED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
