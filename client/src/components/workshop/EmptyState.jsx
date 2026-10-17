import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function EmptyState({ onReset, onCategorySelect, categories = [] }) {
  return (
    <div className="glass-strong bg-[#141418] border border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div className="w-14 h-14 bg-gold/10 border border-gold/25 rounded-2xl flex items-center justify-center mx-auto text-gold">
        <Search size={24} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white tracking-tight">
          No master classes match your current filters
        </h3>
        <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed font-sans">
          We couldn't find any sessions matching your criteria. Reset filters or explore alternative curriculum tracks.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="bg-gold hover:bg-gold-light text-black text-xs py-2.5 px-5 rounded-full inline-flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-gold/20 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-2.5">
            Suggested Core Tracks
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => onCategorySelect && onCategorySelect(cat)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-white/10 text-white/70 hover:border-gold hover:text-gold transition-colors font-mono bg-white/[0.03] cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
