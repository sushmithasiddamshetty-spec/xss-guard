import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const palette = [
      'rgba(56, 189, 248, 0.55)',
      'rgba(59, 130, 246, 0.5)',
      'rgba(139, 92, 246, 0.45)',
    ];

    const count = Math.min(48, Math.max(20, Math.floor((width * height) / 34000)));
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: Math.random() * 1.6 + 0.9,
      color: palette[i % palette.length],
      alpha: Math.random() * 0.45 + 0.25,
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 135) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
            ctx.globalAlpha = (1 - dist / 135) * 0.65;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      if (!reduce) {
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Subtle moving electric blue, purple, and cyan radial gradient fields */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, 40, -25, 0], y: [0, 24, -18, 0], scale: [1, 1.06, 0.96, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-48 left-1/4 h-[540px] w-[540px] -translate-x-1/2 rounded-full opacity-25 blur-[135px]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.58) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, -35, 25, 0], y: [0, -28, 20, 0], scale: [1, 0.95, 1.07, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full opacity-20 blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.58) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, 28, -28, 0], y: [0, -20, 14, 0] }
        }
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 left-1/2 h-[440px] w-[640px] -translate-x-1/2 rounded-full opacity-20 blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.48) 0%, transparent 70%)' }}
      />
      <div className="cyber-grid-bg absolute inset-0 opacity-60" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
