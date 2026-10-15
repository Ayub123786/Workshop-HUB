import { useEffect, useRef } from 'react';
import { isReducedMotion } from '../../lib/motion';

/**
 * GoldParticles - Lightweight (<4KB) 60fps Canvas 2D ambient gold constellation
 * Features mouse parallax, offscreen auto-pause, and prefers-reduced-motion handling.
 */
export default function GoldParticles({ className = '', particleCount = 38 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isReducedMotion()) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = true;
    let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight || 500);

    // Track mouse with damping for gentle parallax
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize particles
    const particles = [];
    const colors = [
      'rgba(201, 162, 77, 0.45)', // Primary gold
      'rgba(218, 185, 114, 0.35)', // Light gold
      'rgba(180, 140, 50, 0.25)',  // Deep gold
      'rgba(235, 215, 165, 0.5)',  // Champagne highlight
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseVal: Math.random() * Math.PI,
      });
    }

    // Auto-pause when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          render();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // 60fps render loop
    const render = () => {
      if (!isVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Subtle mouse influence
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 0.6;
          p.y -= (dy / dist) * force * 0.6;
        }

        // Boundary wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Pulsing radius
        p.pulseVal += p.pulseSpeed;
        const currentRadius = p.radius + Math.sin(p.pulseVal) * 0.5;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.2, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(201, 162, 77, 0.4)';
        ctx.fill();

        // Connect nearby particles with subtle gold web lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ldx = p.x - p2.x;
          const ldy = p.y - p2.y;
          const lineDist = Math.sqrt(ldx * ldx + ldy * ldy);
          if (lineDist < 95) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201, 162, 77, ${0.12 * (1 - lineDist / 95)})`;
            ctx.lineWidth = 0.6;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ willChange: 'transform, opacity' }}
    />
  );
}
