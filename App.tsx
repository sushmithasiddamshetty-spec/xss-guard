import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_SECURITY_REPORTS } from './data/xssContent';
import { NavPageId, SecurityReportEntry } from './types/security';
import ParticleBackground from './components/ParticleBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import LearnXssView from './components/LearnXssView';
import LiveSimulatorView from './components/LiveSimulatorView';
import AttackPlaygroundView from './components/AttackPlaygroundView';
import ProtectionLabView from './components/ProtectionLabView';
import ExecutionPathsView from './components/ExecutionPathsView';
import SecurityReportsView from './components/SecurityReportsView';
import AboutProjectView from './components/AboutProjectView';

const VALID_PAGES: NavPageId[] = [
  'home',
  'learn',
  'simulator',
  'playground',
  'protection',
  'paths',
  'reports',
  'about',
];

function getInitialPage(): NavPageId {
  const hash = window.location.hash.replace('#', '') as NavPageId;
  return VALID_PAGES.includes(hash) ? hash : 'home';
}

export default function App() {
  const [activePage, setActivePage] = useState<NavPageId>(getInitialPage);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(true);
  const [sharedPayload, setSharedPayload] = useState<string>(
    `<script>alert('XSS Demo')</script>`
  );
  const [reports, setReports] = useState<SecurityReportEntry[]>(
    INITIAL_SECURITY_REPORTS
  );

  const routeTimerRef = useRef<number | null>(null);
  const idCounterRef = useRef<number>(1);

  // Brief non-blocking top progress bar animation on initial mount
  useEffect(() => {
    routeTimerRef.current = window.setTimeout(() => setIsRouteLoading(false), 380);
    return () => {
      if (routeTimerRef.current !== null) {
        window.clearTimeout(routeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavPageId;
      if (VALID_PAGES.includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (page: NavPageId) => {
    if (routeTimerRef.current !== null) {
      window.clearTimeout(routeTimerRef.current);
    }
    setIsRouteLoading(true);
    setActivePage(page);
    window.history.replaceState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    routeTimerRef.current = window.setTimeout(() => setIsRouteLoading(false), 260);
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
    <div className="relative flex min-h-screen flex-col bg-[#050814] text-slate-100">
      <ParticleBackground />

      {/* Polished top loading progress bar */}
      <AnimatePresence>
        {isRouteLoading && (
          <motion.div
            key="top-loader"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
            aria-hidden="true"
            className="fixed inset-x-0 top-0 z-[60] h-[2.5px] bg-gradient-to-r from-blue-500 via-cyan-300 to-purple-500 shadow-[0_0_12px_rgba(34,211,238,0.85)]"
          />
        )}
      </AnimatePresence>

      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activePage === 'home' && (
              <HomeView
                onNavigate={handleNavigate}
                totalLogsCount={reports.length}
              />
            )}
            {activePage === 'learn' && <LearnXssView onNavigate={handleNavigate} />}
            {activePage === 'simulator' && (
              <LiveSimulatorView
                sharedPayload={sharedPayload}
                onPayloadChange={setSharedPayload}
                onLogRun={handleLogRun}
              />
            )}
            {activePage === 'playground' && (
              <AttackPlaygroundView
                sharedPayload={sharedPayload}
                onPayloadChange={setSharedPayload}
                onNavigate={handleNavigate}
              />
            )}
            {activePage === 'protection' && (
              <ProtectionLabView
                sharedPayload={sharedPayload}
                onPayloadChange={setSharedPayload}
                onLogRun={handleLogRun}
              />
            )}
            {activePage === 'paths' && (
              <ExecutionPathsView onLogRun={handleLogRun} />
            )}
            {activePage === 'reports' && (
              <SecurityReportsView
                reports={reports}
                onClearReports={handleClearReports}
              />
            )}
            {activePage === 'about' && (
              <AboutProjectView onNavigate={handleNavigate} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
