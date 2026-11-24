import { ReactNode, useId } from 'react';
import { motion, useReducedMotion, MotionValue } from 'motion/react';

export const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.78, delay, ease: LUXURY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  tone?: 'default' | 'burgundy' | 'forest';
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  layoutId: string;
  surface?: 'light' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  layoutId,
  surface = 'light',
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  const trackClass =
    surface === 'dark'
      ? 'border-[rgba(244,239,230,0.14)] bg-[#0A1612]/90'
      : 'border-[rgba(20,17,15,0.1)] bg-[#EAE3D5]/75';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap items-center gap-1 rounded-full border p-1 ${trackClass} ${className}`}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        const indicatorColor =
          opt.tone === 'burgundy'
            ? 'bg-[#8C2F3F]'
            : opt.tone === 'forest'
            ? surface === 'dark'
              ? 'bg-[#B79B6B]'
              : 'bg-[#0F1F1A]'
            : surface === 'dark'
            ? 'bg-[#B79B6B]'
            : 'bg-[#14110F]';

        const activeTextClass =
          surface === 'dark' && (!opt.tone || opt.tone === 'forest')
            ? 'text-[#14110F]'
            : 'text-[#F4EFE6]';

        const inactiveTextClass =
          surface === 'dark'
            ? 'text-[rgba(244,239,230,0.68)] hover:text-[#F4EFE6]'
            : 'text-[rgba(20,17,15,0.64)] hover:text-[#14110F]';

        const paddingClass =
          size === 'sm'
            ? 'min-h-[34px] px-3.5 py-1 text-[13px]'
            : 'min-h-[40px] px-4 py-1.5 text-[14px]';

        return (
          <button
            key={opt.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`relative rounded-full font-medium whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79B6B] ${paddingClass} ${
              active ? activeTextClass : inactiveTextClass
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.34, ease: LUXURY_EASE }
                }
                className={`absolute inset-0 rounded-full ${indicatorColor}`}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface LuxuryMediaFrameProps {
  src: string;
  alt: string;
  aspectClassName?: string;
  className?: string;
  imgClassName?: string;
  parallaxY?: MotionValue<number>;
  revealOnScroll?: boolean;
  onError?: () => void;
  children?: ReactNode;
}

export function LuxuryMediaFrame({
  src,
  alt,
  aspectClassName = 'aspect-[4/3]',
  className = '',
  imgClassName = '',
  parallaxY,
  revealOnScroll = true,
  onError,
  children,
}: LuxuryMediaFrameProps) {
  const filterId = useId().replace(/:/g, '');
  const shouldReduceMotion = useReducedMotion();
  const animateReveal = revealOnScroll && !shouldReduceMotion;

  return (
    <motion.div
      initial={
        animateReveal
          ? { opacity: 0, clipPath: 'inset(6% 0% 6% 0% round 24px)' }
          : false
      }
      whileInView={
        animateReveal
          ? { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 24px)' }
          : undefined
      }
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.9, ease: LUXURY_EASE }}
      className={`relative overflow-hidden rounded-[24px] border border-[rgba(20,17,15,0.08)] bg-[#E8E1D4] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.14)] ${className}`}
    >
      <div className={`relative w-full overflow-hidden ${aspectClassName}`}>
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={onError}
          initial={animateReveal ? { scale: 1.07 } : false}
          whileInView={animateReveal ? { scale: 1.0 } : undefined}
          viewport={{ once: true, amount: 0.14 }}
          transition={{ duration: 1.15, ease: LUXURY_EASE }}
          style={parallaxY ? { y: parallaxY } : undefined}
          className={`h-full w-full object-cover sepia-[0.06] contrast-[1.03] saturate-[0.95] ${imgClassName}`}
        />

        {/* Consistent warm color-grade + soft directional depth vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(244,239,230,0.04) 0%, rgba(20,17,15,0.08) 65%, rgba(20,17,15,0.42) 100%)',
          }}
        />

        {/* Subtle SVG feTurbulence film-grain overlay at 0.05 opacity */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay"
        >
          <filter id={`grain-${filterId}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${filterId})`} />
        </svg>

        {children}
      </div>
    </motion.div>
  );
}
