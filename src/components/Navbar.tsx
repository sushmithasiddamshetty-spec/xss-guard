import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NavPageId } from '../types/security';
import { LUXURY_EASE } from './LuxuryPrimitives';

export interface NavItem {
  id: NavPageId;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'learn', label: 'Learn' },
  { id: 'playground', label: 'Playground' },
  { id: 'protection', label: 'Protection' },
  { id: 'results', label: 'Results' },
];

interface NavbarProps {
  activePage: NavPageId;
  onNavigate: (page: NavPageId) => void;
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleSelect = (page: NavPageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-[rgba(20,17,15,0.08)]"
      style={{
        backgroundColor: 'rgba(244, 239, 230, 0.72)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      }}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-6 py-4 sm:px-10">
        {/* Zone 1: Architectural Monogram + Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap rounded-md py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79B6B]"
          aria-label="XSS Guard Home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B79B6B]/55 bg-[#14110F] text-[#F4EFE6] shadow-[inset_0_1px_0_rgba(244,239,230,0.16)]"
          >
            <svg viewBox="0 0 28 28" fill="none" className="h-4 w-4">
              <circle
                cx="14"
                cy="14"
                r="11.25"
                stroke="#B79B6B"
                strokeOpacity="0.45"
                strokeWidth="0.9"
              />
              <path
                d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5"
                stroke="#F4EFE6"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M14 5.5V22.5"
                stroke="#B79B6B"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-normal tracking-[-0.01em] text-[#14110F]">
            XSS Guard
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group relative whitespace-nowrap shrink-0 rounded py-2 text-[15px] font-medium transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79B6B] ${
                  isActive
                    ? 'text-[#14110F]'
                    : 'text-[rgba(20,17,15,0.62)] hover:text-[#14110F]'
                }`}
              >
                <span>{item.label}</span>
                {isActive ? (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.32, ease: LUXURY_EASE }
                    }
                    className="absolute inset-x-0 -bottom-[17px] h-[1.5px] bg-[#B79B6B]"
                  />
                ) : (
                  <span className="absolute inset-x-0 -bottom-[17px] h-[1px] scale-x-0 bg-[#14110F]/25 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Trigger */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelect('playground')}
            className="btn-primary hidden sm:inline-flex min-h-[40px] px-5 py-2 text-[14px]"
          >
            <span>Explore simulator</span>
            <ArrowRight className="btn-arrow h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(20,17,15,0.16)] bg-[#FBF8F2]/80 text-[#14110F] transition-colors hover:border-[#14110F] md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79B6B]"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: LUXURY_EASE }}
            className="border-t border-[rgba(20,17,15,0.08)] bg-[#FBF8F2] px-6 py-5 md:hidden"
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex min-h-[44px] items-center justify-between rounded-xl px-4 py-2.5 text-left text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0F1F1A] text-[#F4EFE6]'
                        : 'text-[rgba(20,17,15,0.68)] hover:bg-[#F4EFE6] hover:text-[#14110F]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#B79B6B]">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
