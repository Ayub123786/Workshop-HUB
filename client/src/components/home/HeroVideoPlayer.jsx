import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroVideoPlayer({
  videoUrl,
  posterUrl = '/uploads/hero-banner-1791990336348-dda05cba.webp',
  fallbackPoster = '/ayub-founder-full.jpg',
  title = 'PE Deal Flow Automation Master Class Walkthrough',
  subtitle = 'Watch Ayub build the end-to-end Due Diligence AI Agent stack in 90 minutes',
  duration = '01:45',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef(null);

  // Parse embed URL if it's YouTube or Vimeo
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('v=')) {
          videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('embed/')) {
          videoId = url.split('embed/')[1]?.split('?')[0];
        }
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;
      }
      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : null;
      }
      return url; // Direct MP4 or custom embed URL
    } catch (e) {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const isDirectVideo = embedUrl && (embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm'));

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleStopVideo = (e) => {
    e?.stopPropagation();
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div id="video-showcase" className="relative w-full max-w-4xl mx-auto my-6 sm:my-8 group">
      {/* Outer Decorative Frame with Subtle Gold Accent */}
      <div className="relative rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-[#E8E8E8] via-[#F3E8CE] to-[#E8E8E8] shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:shadow-[0_16px_48px_rgba(200,162,79,0.12)]">
        <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#0A0A0A]">
          {/* Active Video Player (Inline) */}
          {isPlaying ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {isDirectVideo ? (
                <video
                  ref={videoRef}
                  src={embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  poster={posterUrl || fallbackPoster}
                />
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                /* Built-in Interactive Preview Reel Demo */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0F172A] via-[#0A0A0A] to-[#1E293B] text-white">
                  <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-4 border border-gold/40 animate-pulse">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight mb-2 text-white">
                    Master Class Preview Video Space
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
                    Set your YouTube, Vimeo, or MP4 video URL in the Admin Settings (or platform settings) to stream directly here.
                  </p>
                  <button
                    onClick={handleStopVideo}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              )}

              {/* Close / Return to Poster button */}
              <button
                onClick={handleStopVideo}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all hover:scale-105 border border-white/20"
                title="Return to preview"
                aria-label="Close video"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            /* Poster View with Play Trigger */
            <div
              onClick={handlePlayClick}
              className="relative w-full h-full cursor-pointer select-none overflow-hidden"
            >
              {/* Poster Image */}
              <img
                src={posterUrl || fallbackPoster}
                onError={(e) => {
                  e.target.src = fallbackPoster;
                }}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Darkening Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 transition-opacity duration-300 group-hover:via-black/25" />

              {/* Top Meta Tag Pill */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-navy text-[11px] font-bold tracking-wide uppercase shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  PREVIEW REEL · {duration}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[11px] font-mono border border-white/10">
                  4K STREAM
                </span>
              </div>

              {/* Center Gold Circular Play Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center justify-center pointer-events-auto"
                >
                  {/* Subtle Ripple Wave */}
                  <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gold/30 animate-ping opacity-60" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold text-white flex items-center justify-center shadow-lg hover:bg-[#B38F3F] transition-colors border-2 border-white/40">
                    <Play size={24} className="fill-current translate-x-0.5" />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Caption & Title Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 text-left">
                <p className="text-xs sm:text-sm font-bold text-gold uppercase tracking-wider mb-1">
                  EXECUTIVE LAB SHOWCASE
                </p>
                <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight leading-snug drop-shadow-sm mb-1">
                  {title}
                </h3>
                <p className="hidden sm:block text-xs text-white/80 line-clamp-1 max-w-xl">
                  {subtitle}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Under-Player Micro Trust Line */}
      <div className="flex items-center justify-between text-[11px] text-muted px-2 pt-2.5">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live interactive stream with live screen architecture
        </span>
        <button
          onClick={handlePlayClick}
          className="text-gold font-semibold hover:underline flex items-center gap-1"
        >
          <Play size={11} className="fill-current" />
          <span>Click to watch overview ({duration})</span>
        </button>
      </div>
    </div>
  );
}
