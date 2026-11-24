import { NavPageId } from '../types/security';
import { NAV_ITEMS } from './Navbar';

interface FooterProps {
  onNavigate: (page: NavPageId) => void;
  onReplayIntro?: () => void;
}

export default function Footer({ onNavigate, onReplayIntro }: FooterProps) {
  return (
    <footer className="border-t border-[rgba(20,17,15,0.08)] bg-[#0F1F1A] text-[#F4EFE6]">
      <div className="brass-rule w-full" aria-hidden="true" />
      <div className="mx-auto max-w-[1240px] px-6 pt-20 pb-16 sm:px-10 lg:pt-28 lg:pb-20">
        {/* Oversized Editorial Serif Wordmark */}
        <div className="overflow-hidden border-b border-[rgba(244,239,230,0.12)] pb-10 lg:pb-14">
          <div className="font-display text-[clamp(3.75rem,14.5vw,12.5rem)] font-normal leading-[0.88] tracking-[-0.03em] text-[#F4EFE6]/90 select-none">
            XSS <span className="italic text-[#B79B6B]/85">Guard</span>
          </div>
        </div>

        {/* Links & Notices Arranged Neatly Under Wordmark */}
        <div className="mt-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-xl space-y-3">
            <div className="editorial-label-dark">Interactive Security Atelier</div>
            <p className="text-[16px] leading-[1.7] text-[rgba(244,239,230,0.72)]">
              An interactive studio for studying Cross-Site Scripting behavior, boundary validation, and modern defensive rendering.
            </p>
            <p className="text-[15px] leading-[1.65] text-[rgba(244,239,230,0.58)]">
              Educational simulation notice: all inspection and escaping runs locally in React without executing submitted markup or scripts.
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="min-h-[40px] text-[15px] font-medium text-[rgba(244,239,230,0.74)] transition-colors duration-250 hover:text-[#F4EFE6] underline decoration-transparent underline-offset-8 hover:decoration-[#B79B6B] whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="min-h-[40px] text-[15px] font-medium text-[#B79B6B] transition-colors duration-250 hover:text-[#F4EFE6] underline decoration-[#B79B6B]/45 underline-offset-8 whitespace-nowrap"
              >
                Replay Opening
              </button>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
