import React from 'react';
import { Search, RotateCcw, Sparkles } from 'lucide-react';

export default function EmptyState({ onReset, onCategorySelect, categories = [] }) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-5">
      <div className="w-14 h-14 bg-cream border border-[#E8E8E8] rounded-2xl flex items-center justify-center mx-auto text-gold">
        <Search size={24} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-navy tracking-tight">
          No masterclasses match your current filters
        </h3>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          We couldn't find any sessions matching all your selected criteria. Try resetting filters or explore other core curriculum tracks.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 font-semibold"
          >
            <RotateCcw size={13} />
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="pt-4 border-t border-[#E8E8E8]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">
            Suggested Core Tracks
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => onCategorySelect && onCategorySelect(cat)}
                className="text-xs px-2.5 py-1 rounded-full border border-[#E8E8E8] text-navy hover:border-gold hover:text-gold transition-colors font-medium bg-[#FAFAFA]"
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
