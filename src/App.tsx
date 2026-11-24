import { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { INITIAL_SECURITY_REPORTS } from './data/xssContent';
import { NavPageId, SecurityReportEntry } from './types/security';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import LearnXssView from './components/LearnXssView';
import PlaygroundView from './components/PlaygroundView';
import ProtectionView from './components/ProtectionView';
import ResultsView from './components/ResultsView';
import CinematicIntro from './components/CinematicIntro';
import { LUXURY_EASE } from './components/LuxuryPrimitives';

const INTRO_SEEN_KEY = 'xss_guard_intro_seen';

const HASH_ALIASES: Record<string, NavPageId> = {
  home: 'home',
  learn: 'learn',
  playground: 'playground',
  simulator: 'playground',
  paths: 'playground',
  protection: 'protection',
  results: 'results',
  reports: 'results',
  about: 'home',
};

function getInitialPage(): NavPageId {
  const hash = window.location.hash.replace('#', '');
  return HASH_ALIASES[hash] ?? 'home';
}

function shouldShowIntroInitially(): boolean {
  if (getInitialPage() !== 'home') return false;
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [activePage, setActivePage] = useState<NavPageId>(getInitialPage);
  const [showIntro, setShowIntro] = useState<boolean>(shouldShowIntroInitially);
  const [sharedPayload, setSharedPayload] = useState<string>(
    `<script>alert('XSS Demo')</script>`
  );
  const [reports, setReports] = useState<SecurityReportEntry[]>(
    INITIAL_SECURITY_REPORTS
  );

  const idCounterRef = useRef<number>(1);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scrolling when motion is permitted and main app is visible
  useEffect(() => {
    if (shouldReduceMotion || showIntro) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [shouldReduceMotion, showIntro]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const mapped = HASH_ALIASES[hash];
      if (mapped) {
        setActivePage(mapped);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, []);

  const handleReplayIntro = useCallback(() => {
    setActivePage('home');
    window.history.replaceState(null, '', '#home');
    window.scrollTo({ top: 0, behavior: 'auto' });
    setShowIntro(true);
  }, []);

  const handleNavigate = (page: NavPageId) => {
    setActivePage(page);
    window.history.replaceState(null, '', `#${page}`);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: !!shouldReduceMotion });
    } else {
      window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  const handleLogRun = (
    entry: Omit<SecurityReportEntry, 'id' | 'timestamp'>
  ) => {
    const now = new Date();
    const timestamp = now.toTimeString().slice(0, 8);
    const newEntry: SecurityReportEntry = {
      ...entry,
      id: `rep-${Date.now()}-${idCounterRef.current++}`,
      timestamp,
    };
    setReports((prev) => [newEntry, ...prev]);
  };

  const handleClearReports = () => {
    setReports([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4EFE6] text-[#14110F]">
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3, ease: LUXURY_EASE }}
          >
            {activePage === 'home' && (
              <HomeView
                onNavigate={handleNavigate}
                reports={reports}
                sharedPayload={sharedPayload}
                onPayloadChange={setSharedPayload}
                onLogRun={handleLogRun}
                onReplayIntro={handleReplayIntro}
              />
            )}
            {activePage === 'learn' && <LearnXssView onNavigate={handleNavigate} />}
            {activePage === 'playground' && (
              <PlaygroundView
                sharedPayload={sharedPayload}
                onPayloadChange={setSharedPayload}
                onLogRun={handleLogRun}
              />
            )}
            {activePage === 'protection' && (
              <ProtectionView
                sharedPayload={sharedPayload}
                onPayloadChange={setSharedPayload}
                onLogRun={handleLogRun}
              />
            )}
            {activePage === 'results' && (
              <ResultsView
                reports={reports}
                onClearReports={handleClearReports}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} onReplayIntro={handleReplayIntro} />
    </div>
  );
}
