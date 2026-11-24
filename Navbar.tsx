import { useState } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Home,
  BookOpen,
  Terminal,
  FlaskConical,
  ShieldCheck,
  GitBranch,
  BarChart3,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavPageId } from '../types/security';

export interface NavItem {
  id: NavPageId;
  label: string;
  icon: typeof Home;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn XSS', icon: BookOpen },
  { id: 'simulator', label: 'Live Simulator', icon: Terminal },
  { id: 'playground', label: 'Attack Playground', icon: FlaskConical },
  { id: 'protection', label: 'Protection Lab', icon: ShieldCheck },
  { id: 'paths', label: 'Happy & Exception Path', icon: GitBranch },
  { id: 'reports', label: 'Security Reports', icon: BarChart3 },
  { id: 'about', label: 'About Project', icon: Info },
];

interface NavbarProps {
  activePage: NavPageId;
  onNavigate: (page: NavPageId) => void;
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (page: NavPageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/15 bg-[#050814]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Logo & Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="XSS GUARD Home"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-gradient-to-br from-blue-600/25 via-cyan-500/20 to-purple-600/25 shadow-[0_0_20px_-4px_rgba(6,182,212,0.5)] transition-transform duration-150 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-cyan-300"
              aria-hidden="true"
            >
              <path
                d="M12 2.5L4.5 5.8v5.7c0 4.8 3.2 9.1 7.5 10.5 4.3-1.4 7.5-5.7 7.5-10.5V5.8L12 2.5z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4.2"
                stroke="#60A5FA"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            XSS{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              GUARD
            </span>
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden xl:flex items-center gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive
                    ? 'text-cyan-300'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Mobile Menu Trigger */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelect('simulator')}
            className="btn-primary-cyber hidden sm:inline-flex min-h-[40px] shrink-0 whitespace-nowrap px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <span>Launch Simulator</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white xl:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Tablet & Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-cyan-500/15 bg-[#060a18]/95 px-4 py-4 backdrop-blur-xl xl:hidden"
          >
            <nav aria-label="Mobile Navigation" className="grid gap-1.5 sm:grid-cols-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'border border-cyan-400/35 bg-cyan-500/15 text-cyan-200'
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <span className="text-xs font-semibold text-cyan-300">Active</span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="mt-3 border-t border-slate-800/80 pt-3 sm:hidden">
              <button
                type="button"
                onClick={() => handleSelect('simulator')}
                className="btn-primary-cyber w-full px-4 py-2.5 text-sm"
              >
                <span>Launch Simulator</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
