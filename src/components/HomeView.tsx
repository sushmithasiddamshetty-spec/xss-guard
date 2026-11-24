import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, CheckCircle2, Play, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { NavPageId, SecurityReportEntry } from '../types/security';
import {
  analyzePayload,
  encodeHtmlEntities,
  inspectSanitization,
} from '../utils/xssEngine';
import {
  HeroInputJourneyVisual,
  ProblemFlowDiagram,
  ThreatIllustration,
  ProtectionPipelineDiagram,
} from './EditorialDiagrams';
import {
  LUXURY_EASE,
  LuxuryMediaFrame,
  Reveal,
  SegmentedControl,
} from './LuxuryPrimitives';

import heroPrismImg from '../assets/images/hero_security_prism_1795542573366.jpg';
import invisibleThreatImg from '../assets/images/story_invisible_threat_1795544895191.jpg';
import threatMonolithImg from '../assets/images/story_threat_monolith_1795540314897.jpg';
import defenseShieldImg from '../assets/images/story_defense_shield_1795540315234.jpg';
import storedVaultImg from '../assets/images/threat_stored_vault_1795542573790.jpg';
import reflectedMirrorImg from '../assets/images/threat_reflected_mirror_1795542574221.jpg';
import domLayersImg from '../assets/images/threat_dom_layers_1795542574723.jpg';
import playgroundAtelierImg from '../assets/images/story_playground_atelier_1795544897396.jpg';
import protectionPrismImg from '../assets/images/story_protection_prism_1795544897487.jpg';
import closingSanctuaryImg from '../assets/images/story_closing_sanctuary_1795544898408.jpg';

interface HomeViewProps {
  onNavigate: (page: NavPageId) => void;
  reports: SecurityReportEntry[];
  sharedPayload: string;
  onPayloadChange: (value: string) => void;
  onLogRun?: (entry: Omit<SecurityReportEntry, 'id' | 'timestamp'>) => void;
  onReplayIntro?: () => void;
}

const HERO_PRESETS = [
  {
    id: 'normal' as const,
    label: 'Normal Text',
    value: 'Great workshop! Always encode user text before rendering.',
  },
  {
    id: 'image' as const,
    label: 'Image Event',
    value: '<img src="x" onerror="alert(\'XSS\')">',
  },
  {
    id: 'script' as const,
    label: 'Script Tag',
    value: `<script>alert('XSS Demo')</script>`,
  },
];

const INVISIBLE_THREAT_CHAPTERS = [
  {
    id: 0,
    index: '01 · Arrival',
    title: 'Untrusted input looks indistinguishable from ordinary prose.',
    body: 'Every form field, profile bio, and search parameter enters the application as raw text characters—including structural angle brackets and event attributes.',
    image: invisibleThreatImg,
    imageAlt:
      'Architectural dark smoked glass panels and deep forest stone monoliths divided by a warm brass seam',
    unsafeLine: '<script>alert("XSS")</script>',
    safeLine: 'Captured as untrusted user string',
  },
  {
    id: 1,
    index: '02 · Crossing',
    title: 'Without boundary encoding, data slips into executable context.',
    body: 'When an application concatenates raw strings directly into HTML templates or innerHTML sinks, structural delimiters escape the text boundary.',
    image: threatMonolithImg,
    imageAlt:
      'Three dark glass monoliths pierced by a crimson light beam and fine brass geometry',
    unsafeLine: 'element.innerHTML = rawInput',
    safeLine: 'escapeHtml(rawInput) -> &lt;script&gt;',
  },
  {
    id: 2,
    index: '03 · Resolution',
    title: 'Escaped delimiters stay inert inside the document tree.',
    body: 'When rendered through safe text bindings or allowlist sanitizers, the browser displays the exact characters visibly without evaluating any script.',
    image: defenseShieldImg,
    imageAlt:
      'Translucent architectural glass shield illuminated by a calm champagne light sweep',
    unsafeLine: 'Browser parses active <script> node',
    safeLine: 'Browser renders harmless DOM Text Node',
  },
];

const THREAT_OVERVIEW = [
  {
    id: 'stored' as const,
    title: 'Stored XSS',
    image: storedVaultImg,
    imageAlt:
      'Architectural study of a matte obsidian storage vessel beside three frosted glass reader panels on warm porcelain stone',
    explanation:
      'Untrusted text is persisted in storage and delivered raw to every future reader who visits the page.',
    sample: `<img src="x" onerror="alert(1)">`,
    safeNote: 'Rendered via text nodes or allowlist-sanitized.',
  },
  {
    id: 'reflected' as const,
    title: 'Reflected XSS',
    image: reflectedMirrorImg,
    imageAlt:
      'Architectural study of a deep forest ceramic monolith facing a beveled optical mirror on warm porcelain stone',
    explanation:
      'A query parameter or search string is echoed straight into the immediate server response without encoding.',
    sample: `?q=<script>alert('XSS')</script>`,
    safeNote: 'HTML delimiters escaped into &lt; and &gt; entities.',
  },
  {
    id: 'dom' as const,
    title: 'DOM-Based XSS',
    image: domLayersImg,
    imageAlt:
      'Architectural study of layered frosted glass planes supported by brushed champagne pins on an obsidian plinth',
    explanation:
      'Client-side scripts read browser sources such as location.hash and assign them into an unsafe DOM sink.',
    sample: `element.innerHTML = location.hash`,
    safeNote: 'Replaced unsafe sink with element.textContent.',
  },
];

const PROTECTION_STORY_BEATS = [
  {
    index: '01 · Input Enters',
    stageIdx: 0,
    title: 'Raw text enters from the client.',
    description:
      'Whether a friendly workshop comment or an injected markup string, every submission begins as unverified text.',
  },
  {
    index: '02 · Boundary Inspection',
    stageIdx: 1,
    title: 'Happy Path and Exception Path diverge.',
    description:
      'Happy Path: ordinary text passes validation cleanly. Exception Path: empty or suspicious input is intercepted before reaching any HTML sink.',
  },
  {
    index: '03 · Pattern Identification',
    stageIdx: 1,
    title: 'Active markup and attributes are isolated.',
    description:
      'Lexical inspection flags <script> tags, inline on* event handlers, quote breakouts, and executable javascript: URIs.',
  },
  {
    index: '04 · Sanitization & Encoding',
    stageIdx: 2,
    title: 'Delimiters are stripped or escaped.',
    description:
      'Input sanitization removes unsafe elements while output encoding converts <, >, &, and quotes into inert HTML entities.',
  },
  {
    index: '05 · Safe Output',
    stageIdx: 3,
    title: 'Rendered strictly as a DOM text node.',
    description:
      'React JSX bindings and textContent guarantee the browser prints literal text—never executable code.',
  },
];

export default function HomeView({
  onNavigate,
  reports,
  sharedPayload,
  onPayloadChange,
  onLogRun,
  onReplayIntro,
}: HomeViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const heroStageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroStageRef,
    offset: ['start end', 'end start'],
  });
  const heroImageParallaxY = useTransform(scrollYProgress, [0, 1], [-20, 24]);

  const [problemMode, setProblemMode] = useState<'unsafe' | 'safe'>('unsafe');
  const [activeThreatChapter, setActiveThreatChapter] = useState<number>(0);
  const [activeProtectionBeat, setActiveProtectionBeat] = useState<number>(0);
  const [defenseView, setDefenseView] = useState<'encode' | 'sanitize'>('encode');
  const [sandboxLoggedNotice, setSandboxLoggedNotice] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [failedThreats, setFailedThreats] = useState<Record<string, boolean>>({});

  const threatRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const protectionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const noticeTimerRef = useRef<number | null>(null);

  // IntersectionObserver for Scene 2 Sticky Threat Narrative
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-chapter-idx'));
            if (!Number.isNaN(idx)) setActiveThreatChapter(idx);
          }
        });
      },
      { rootMargin: '-38% 0px -38% 0px', threshold: 0.1 }
    );
    threatRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver for Scene 5 Sticky Protection Narrative
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-beat-idx'));
            if (!Number.isNaN(idx)) setActiveProtectionBeat(idx);
          }
        });
      },
      { rootMargin: '-36% 0px -40% 0px', threshold: 0.1 }
    );
    protectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const analysis = analyzePayload(sharedPayload);
  const encoded = encodeHtmlEntities(sharedPayload);
  const sanitized = inspectSanitization(sharedPayload);

  const matchedPreset = HERO_PRESETS.find((p) => p.value === sharedPayload);
  const activePresetId = (matchedPreset?.id ?? 'custom') as
    | 'normal'
    | 'image'
    | 'script'
    | 'custom';

  const currentThreatChapter =
    INVISIBLE_THREAT_CHAPTERS[activeThreatChapter] ?? INVISIBLE_THREAT_CHAPTERS[0];
  const currentProtectionBeat =
    PROTECTION_STORY_BEATS[activeProtectionBeat] ?? PROTECTION_STORY_BEATS[0];

  const handleQuickSandboxRun = () => {
    const trimmed = sharedPayload.trim();
    const isEmpty = !trimmed;
    const isSuspicious = !isEmpty && (analysis.isMalicious || analysis.severity !== 'Safe');

    onLogRun?.({
      sourceModule: 'Playground',
      context: 'Stored',
      payload: isEmpty ? '(empty input)' : sharedPayload,
      severity: isEmpty ? 'Low' : analysis.severity,
      outcome: isEmpty ? 'Blocked' : isSuspicious ? 'Blocked' : 'Allowed',
      defenseMode: isEmpty ? 'Input Validation Guard' : 'Safe Plain-Text Rendering',
      ruleTriggered: isEmpty
        ? 'Empty input rejected before rendering'
        : analysis.triggeredRules[0] ?? 'None (Valid plaintext)',
      inputCategory: isEmpty ? 'Invalid' : isSuspicious ? 'Suspicious' : 'Normal',
      protectionPassed: true,
    });

    setSandboxLoggedNotice(
      isEmpty
        ? 'Exception Path logged: empty input blocked before render.'
        : isSuspicious
        ? 'Exception Path logged: payload neutralized & recorded in Results.'
        : 'Happy Path logged: safe plaintext verified & recorded in Results.'
    );
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => setSandboxLoggedNotice(null), 4000);
  };

  const totalTests = reports.length;
  const normalCount = reports.filter((r) => r.severity === 'Safe').length;
  const suspiciousCount = reports.filter(
    (r) =>
      r.severity !== 'Safe' &&
      r.inputCategory !== 'Invalid' &&
      !r.payload.startsWith('(empty')
  ).length;
  const passedCount = reports.filter((r) => r.outcome !== 'Simulated Execution').length;
  const passRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

  return (
    <div className="space-y-0">
      {/* SCENE 1 — THE INTRODUCTION (Cream #F4EFE6) */}
      <section className="relative overflow-hidden bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] px-6 pt-20 pb-24 sm:px-10 sm:pt-28 sm:pb-28 lg:pt-32 lg:pb-[160px]">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, ease: LUXURY_EASE }}
              className="space-y-8 lg:col-span-5"
            >
              <div className="editorial-label">Scene 01 · Interactive Security Laboratory</div>

              <h1 className="font-display text-[2.75rem] font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] [text-wrap:balance] sm:text-6xl lg:text-[4.25rem]">
                Every input has a <span className="italic text-[#0F1F1A]">story.</span>
              </h1>

              <p className="max-w-md text-[17px] leading-[1.7] text-[rgba(20,17,15,0.62)] sm:text-[18px]">
                Understand how cross-site scripting works. Experiment with vulnerable inputs. Discover how modern applications protect themselves.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('playground')}
                  className="btn-primary px-7 py-3.5 text-[15px]"
                >
                  <span>Explore the simulator</span>
                  <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('learn')}
                  className="btn-secondary px-7 py-3.5 text-[15px]"
                >
                  <span>Understand XSS</span>
                </button>
              </div>

              {onReplayIntro && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onReplayIntro}
                    className="inline-flex min-h-[36px] items-center gap-2 text-[15px] font-medium text-[rgba(20,17,15,0.62)] underline decoration-[#B79B6B]/70 underline-offset-[6px] transition-colors duration-250 hover:text-[#14110F]"
                  >
                    <span>Replay opening film</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Oversized Bleeding Hero Visual + Slow Scroll Parallax + Frosted Inspection Panel */}
            <motion.div
              ref={heroStageRef}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: LUXURY_EASE }}
              className="space-y-5 lg:col-span-7 lg:-mr-12 xl:-mr-20"
            >
              {!heroImgFailed ? (
                <LuxuryMediaFrame
                  src={heroPrismImg}
                  alt="Sculptural frosted glass prism and deep forest monolith with champagne brass inlay on warm porcelain stone"
                  aspectClassName="aspect-[16/10]"
                  revealOnScroll={false}
                  onError={() => setHeroImgFailed(true)}
                  parallaxY={shouldReduceMotion ? undefined : heroImageParallaxY}
                  imgClassName="scale-[1.08]"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(20,17,15,0) 42%, rgba(20,17,15,0.58) 100%)',
                    }}
                  />

                  <div className="hero-glass-panel absolute inset-x-4 bottom-4 z-10 rounded-[16px] p-4 sm:inset-x-6 sm:bottom-6 sm:p-5">
                    <div className="grid items-center gap-4 sm:grid-cols-3">
                      <div className="space-y-1">
                        <div className="editorial-label">01 · Source String</div>
                        <div className="truncate font-mono text-[13px] text-[#14110F]">
                          {sharedPayload || '(empty)'}
                        </div>
                      </div>

                      <div className="space-y-1 border-y border-[rgba(20,17,15,0.1)] py-2.5 sm:border-x sm:border-y-0 sm:px-5 sm:py-0">
                        <div className="editorial-label">02 · Inspection Gate</div>
                        <div
                          className={`text-[15px] font-semibold ${
                            analysis.isMalicious ? 'text-[#8C2F3F]' : 'text-[#1D4D3C]'
                          }`}
                        >
                          {analysis.isMalicious
                            ? `${analysis.vectorCategory} Flagged`
                            : 'Clean Plaintext'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="editorial-label text-[#1D4D3C]">03 · Safe Output</div>
                        <div className="truncate font-mono text-[13px] text-[#14110F]">
                          {encoded || '(empty)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </LuxuryMediaFrame>
              ) : (
                <HeroInputJourneyVisual
                  rawInput={sharedPayload}
                  analysis={analysis}
                  encodedPreview={encoded}
                />
              )}

              <div className="flex flex-col gap-3.5 px-1 sm:flex-row sm:items-center sm:justify-between lg:pr-12 xl:pr-20">
                <SegmentedControl
                  ariaLabel="Hero input sample presets"
                  layoutId="hero-preset-indicator"
                  size="sm"
                  value={activePresetId}
                  onChange={(id) => {
                    const found = HERO_PRESETS.find((p) => p.id === id);
                    if (found) onPayloadChange(found.value);
                  }}
                  options={HERO_PRESETS.map((p) => ({
                    id: p.id,
                    label: p.label,
                  }))}
                />

                <div className="flex-1 sm:max-w-xs">
                  <label htmlFor="hero-string-input" className="sr-only">
                    Test live input string
                  </label>
                  <input
                    id="hero-string-input"
                    type="text"
                    value={sharedPayload}
                    onChange={(e) => onPayloadChange(e.target.value)}
                    placeholder="Type any string to inspect..."
                    className="min-h-[42px] w-full rounded-full border border-[rgba(20,17,15,0.12)] bg-[#FBF8F2] px-4 py-2 font-mono text-[13px] text-[#14110F] placeholder:text-[rgba(20,17,15,0.45)] focus:border-[#B79B6B] focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCENE 2 — THE INVISIBLE THREAT (Full-Width Deep Forest #0F1F1A · Sticky Scroll Storytelling) */}
      <section className="border-t border-[rgba(244,239,230,0.12)] bg-[#0F1F1A] text-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-16 px-6 py-24 sm:px-10 sm:py-28 lg:py-[160px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label-dark">Scene 02 · The Invisible Threat</div>
                <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#F4EFE6] [text-wrap:balance] sm:text-5xl lg:text-[3.75rem]">
                  When text crosses unescaped, the browser treats data as{' '}
                  <span className="italic text-[#B79B6B]">code.</span>
                </h2>
              </div>

              <SegmentedControl
                ariaLabel="Problem execution mode"
                layoutId="home-problem-mode"
                surface="dark"
                value={problemMode}
                onChange={setProblemMode}
                options={[
                  { id: 'unsafe', label: 'Handled Incorrectly', tone: 'burgundy' },
                  { id: 'safe', label: 'Handled Safely', tone: 'forest' },
                ]}
              />
            </div>
          </Reveal>

          {/* Sticky Scroll-Reactive Story Split */}
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              {INVISIBLE_THREAT_CHAPTERS.map((chapter, idx) => {
                const isActive = activeThreatChapter === idx;
                return (
                  <button
                    key={chapter.id}
                    ref={(el) => {
                      threatRefs.current[idx] = el;
                    }}
                    data-chapter-idx={idx}
                    type="button"
                    onClick={() => setActiveThreatChapter(idx)}
                    className={`w-full rounded-[16px] border p-7 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'border-[#B79B6B] bg-[#162923] shadow-[inset_0_1px_0_rgba(183,155,107,0.35),0_24px_48px_-12px_rgba(0,0,0,0.4)]'
                        : 'border-[rgba(244,239,230,0.1)] bg-transparent opacity-70 hover:border-[rgba(244,239,230,0.22)] hover:opacity-100'
                    }`}
                  >
                    <div className="editorial-label-dark">{chapter.index}</div>
                    <h3 className="mt-3 font-display text-2xl font-normal leading-snug text-[#F4EFE6]">
                      {chapter.title}
                    </h3>
                    <p className="mt-3 text-[16px] leading-[1.7] text-[rgba(244,239,230,0.72)]">
                      {chapter.body}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Sticky Photographic & Code Stage */}
            <div className="lg:sticky lg:top-28 lg:col-span-7">
              <div className="luxury-card-dark overflow-hidden p-4 sm:p-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#14110F]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentThreatChapter.id}
                      src={currentThreatChapter.image}
                      alt={currentThreatChapter.imageAlt}
                      referrerPolicy="no-referrer"
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.65, ease: LUXURY_EASE }}
                      className="h-full w-full object-cover sepia-[0.06] contrast-[1.03]"
                    />
                  </AnimatePresence>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(15,31,26,0.05) 35%, rgba(15,31,26,0.88) 100%)',
                    }}
                  />

                  <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="editorial-label-dark">
                        {currentThreatChapter.index} ·{' '}
                        {problemMode === 'unsafe' ? 'Unprotected Path' : 'Protected Boundary'}
                      </div>
                      <div
                        className={`inline-block rounded-lg px-3 py-1.5 font-mono text-[13px] ${
                          problemMode === 'unsafe'
                            ? 'code-danger-highlight'
                            : 'code-safe-highlight'
                        }`}
                      >
                        {problemMode === 'unsafe'
                          ? currentThreatChapter.unsafeLine
                          : currentThreatChapter.safeLine}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Reveal delay={0.1}>
            <ProblemFlowDiagram mode={problemMode} />
          </Reveal>
        </div>
      </section>

      {/* SCENE 3 — UNDERSTAND THE PROBLEM (Cream #F4EFE6) */}
      <section className="border-t border-[rgba(20,17,15,0.08)] bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-16 px-6 py-24 sm:px-10 sm:py-28 lg:py-[160px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 border-b border-[rgba(20,17,15,0.08)] pb-10 lg:flex-row lg:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label">Scene 03 · Understand the Problem</div>
                <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] [text-wrap:balance] sm:text-5xl lg:text-[3.75rem]">
                  Three ways untrusted scripts reach the{' '}
                  <span className="italic text-[#0F1F1A]">screen.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="btn-secondary self-start px-6 py-3 text-[15px]"
              >
                <span>Inspect detailed flows</span>
                <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {THREAT_OVERVIEW.map((threat, idx) => (
              <Reveal key={threat.id} delay={idx * 0.1}>
                <article className="luxury-card luxury-card-hover group flex h-full flex-col justify-between space-y-7 p-6">
                  <div className="space-y-6">
                    {!failedThreats[threat.id] ? (
                      <LuxuryMediaFrame
                        src={threat.image}
                        alt={threat.imageAlt}
                        aspectClassName="aspect-[4/3]"
                        onError={() =>
                          setFailedThreats((prev) => ({ ...prev, [threat.id]: true }))
                        }
                        imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="rounded-[20px] border border-[rgba(20,17,15,0.08)] bg-[#F4EFE6] p-5">
                        <ThreatIllustration variant={threat.id} />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="editorial-label">0{idx + 1} · Threat Study</div>
                      <h3 className="font-display text-[1.75rem] font-normal leading-tight text-[#14110F]">
                        {threat.title}
                      </h3>
                      <p className="text-[16px] leading-[1.7] text-[rgba(20,17,15,0.62)]">
                        {threat.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-[rgba(20,17,15,0.08)] pt-5">
                    <div className="luxury-code-block px-4 py-3 text-[13px] break-all">
                      <span className="code-danger-highlight inline-block rounded px-1.5 py-0.5">
                        {threat.sample}
                      </span>
                    </div>
                    <div className="text-[15px] leading-relaxed text-[#1D4D3C]">
                      Defense: {threat.safeNote}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SCENE 4 — EXPERIENCE THE PLAYGROUND (Paper Atelier + Live Sandbox Preview) */}
      <section className="border-t border-[rgba(20,17,15,0.08)] bg-[#FBF8F2]">
        <div className="mx-auto max-w-[1240px] space-y-14 px-6 py-24 sm:px-10 sm:py-28 lg:py-[160px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 border-b border-[rgba(20,17,15,0.08)] pb-10 lg:flex-row lg:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label">Scene 04 · Experience the Playground</div>
                <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] [text-wrap:balance] sm:text-5xl lg:text-[3.75rem]">
                  Test untrusted inputs inside a live{' '}
                  <span className="italic text-[#0F1F1A]">sandbox.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('playground')}
                className="btn-primary self-start px-6 py-3 text-[15px]"
              >
                <span>Open Full Playground</span>
                <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          {/* Editorial Atelier Banner Image */}
          <Reveal delay={0.06}>
            <div className="lg:-mx-8 xl:-mx-12">
              <LuxuryMediaFrame
                src={playgroundAtelierImg}
                alt="Minimalist architectural studio desk in walnut and travertine with smoked optical glass monitor and brass tools"
                aspectClassName="aspect-[16/7]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(20,17,15,0.68) 0%, rgba(20,17,15,0.12) 60%, rgba(20,17,15,0) 100%)',
                  }}
                />
                <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-6 sm:p-10">
                  <div className="max-w-md space-y-2 text-[#F4EFE6]">
                    <div className="editorial-label-dark">Zero-Execution Sandbox</div>
                    <p className="font-display text-2xl font-normal leading-snug sm:text-3xl">
                      Inspect live lexical rules without mounting untrusted scripts.
                    </p>
                  </div>
                </div>
              </LuxuryMediaFrame>
            </div>
          </Reveal>

          {/* Live Interactive Sandbox Widget Wired Directly to xssEngine + Reports */}
          <Reveal delay={0.12}>
            <div className="luxury-card grid gap-8 bg-[#F4EFE6] p-7 lg:grid-cols-12 lg:p-10">
              <div className="space-y-5 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <label htmlFor="home-sandbox-input" className="editorial-label">
                    Live Input Buffer
                  </label>
                  <span className="font-mono text-[12px] text-[rgba(20,17,15,0.62)]">
                    {analysis.severity}
                  </span>
                </div>

                <textarea
                  id="home-sandbox-input"
                  rows={3}
                  value={sharedPayload}
                  onChange={(e) => onPayloadChange(e.target.value)}
                  placeholder="Enter text, HTML, or script syntax..."
                  className="w-full rounded-xl border border-[rgba(20,17,15,0.14)] bg-[#FBF8F2] p-4 font-mono text-[13px] leading-relaxed text-[#14110F] focus:border-[#B79B6B] focus:outline-none"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleQuickSandboxRun}
                    className="btn-primary px-6 py-2.5 text-[15px]"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Run &amp; Log Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('playground')}
                    className="btn-secondary px-5 py-2.5 text-[15px]"
                  >
                    <span>Advanced Controls</span>
                  </button>
                </div>

                {sandboxLoggedNotice && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#1D4D3C]/30 bg-[#FBF8F2] px-4 py-2.5 text-[15px] font-medium text-[#1D4D3C]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{sandboxLoggedNotice}</span>
                  </div>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                <div className="luxury-code-block space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#E2A4AE]">
                      <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                      <span>Unsafe DOM (Conceptual)</span>
                    </span>
                  </div>
                  <div className="code-danger-highlight rounded-lg p-3.5 font-mono text-[12.5px] break-all">
                    {analysis.isMalicious
                      ? analysis.simulatedAlertText ?? analysis.vectorCategory
                      : 'No executable vector triggered'}
                  </div>
                  <p className="font-sans text-[15px] leading-[1.65] text-[rgba(244,239,230,0.68)]">
                    {analysis.simulatedImpact}
                  </p>
                </div>

                <div className="luxury-card space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1D4D3C]">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      <span>Secure React Binding</span>
                    </span>
                  </div>
                  <div className="luxury-code-block p-3.5 text-[12.5px] break-all">
                    <span className="code-safe-highlight inline-block rounded px-2 py-0.5">
                      {sharedPayload || '(empty)'}
                    </span>
                  </div>
                  <p className="text-[15px] leading-[1.65] text-[rgba(20,17,15,0.62)]">
                    Rendered strictly as literal text. Escaped characters:{' '}
                    <code className="font-mono text-[12px] text-[#14110F]">
                      {encoded.slice(0, 42)}
                      {encoded.length > 42 ? '...' : ''}
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SCENE 5 — THE ART OF PROTECTION (Full-Width Deep Forest #0F1F1A · Sticky Storytelling #2) */}
      <section className="border-t border-[rgba(244,239,230,0.12)] bg-[#0F1F1A] text-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-16 px-6 py-24 sm:px-10 sm:py-28 lg:py-[160px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label-dark">Scene 05 · The Art of Protection</div>
                <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#F4EFE6] [text-wrap:balance] sm:text-5xl lg:text-[3.75rem]">
                  Layered defense before anything{' '}
                  <span className="italic text-[#B79B6B]">renders.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('protection')}
                className="btn-primary-dark self-start px-6 py-3 text-[15px]"
              >
                <span>Open Protection Lab</span>
                <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          {/* Sticky 5-Step Protection Progression */}
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              {PROTECTION_STORY_BEATS.map((beat, idx) => {
                const isActive = activeProtectionBeat === idx;
                return (
                  <button
                    key={beat.index}
                    ref={(el) => {
                      protectionRefs.current[idx] = el;
                    }}
                    data-beat-idx={idx}
                    type="button"
                    onClick={() => setActiveProtectionBeat(idx)}
                    className={`w-full rounded-[16px] border p-6 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'border-[#B79B6B] bg-[#162923] shadow-[inset_0_1px_0_rgba(183,155,107,0.35)]'
                        : 'border-[rgba(244,239,230,0.1)] bg-transparent opacity-70 hover:border-[rgba(244,239,230,0.25)] hover:opacity-100'
                    }`}
                  >
                    <div className="editorial-label-dark">{beat.index}</div>
                    <h3 className="mt-2 font-display text-xl font-normal text-[#F4EFE6]">
                      {beat.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.68] text-[rgba(244,239,230,0.72)]">
                      {beat.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-6 lg:sticky lg:top-28 lg:col-span-7">
              <LuxuryMediaFrame
                src={protectionPrismImg}
                alt="Macro study of interlocking beveled optical glass shield plates trimmed in brushed brass resting on deep forest slate"
                aspectClassName="aspect-[16/10]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(15,31,26,0.06) 30%, rgba(15,31,26,0.86) 100%)',
                  }}
                />
                <div className="absolute inset-x-6 bottom-6 space-y-1.5 text-[#F4EFE6]">
                  <div className="editorial-label-dark">{currentProtectionBeat.index}</div>
                  <div className="font-display text-2xl font-normal">
                    {currentProtectionBeat.title}
                  </div>
                </div>
              </LuxuryMediaFrame>

              <ProtectionPipelineDiagram
                surface="dark"
                activeStageIndex={currentProtectionBeat.stageIdx}
                onSelectStage={(stageIdx) => {
                  const found = PROTECTION_STORY_BEATS.findIndex(
                    (b) => b.stageIdx === stageIdx
                  );
                  if (found !== -1) setActiveProtectionBeat(found);
                }}
              />

              <div className="luxury-card-dark space-y-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(244,239,230,0.12)] pb-4">
                  <span className="text-[16px] font-medium text-[#F4EFE6]">
                    Live Pipeline Transformation
                  </span>

                  <SegmentedControl
                    ariaLabel="Protection transformation view"
                    layoutId="home-defense-view"
                    surface="dark"
                    size="sm"
                    value={defenseView}
                    onChange={setDefenseView}
                    options={[
                      { id: 'encode', label: 'Output Encoding' },
                      { id: 'sanitize', label: 'Input Sanitization' },
                    ]}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-[15px] font-medium text-[rgba(244,239,230,0.68)]">
                      Raw Input
                    </div>
                    <div className="luxury-code-block p-4 text-[13px] break-all">
                      <span className="code-danger-highlight inline-block rounded px-2 py-0.5">
                        {sharedPayload || '(empty input)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[15px] font-medium text-[rgba(244,239,230,0.68)]">
                      <span>
                        {defenseView === 'encode' ? 'Encoded Entities' : 'Sanitized Markup'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#8FBFA6]">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Neutralized</span>
                      </span>
                    </div>
                    <div className="luxury-code-block p-4 text-[13px] break-all">
                      <span className="code-safe-highlight inline-block rounded px-2 py-0.5">
                        {defenseView === 'encode'
                          ? encoded || '(empty)'
                          : sanitized.cleaned || '(all active markup removed)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 6 — THE RESULTS (Cream #F4EFE6) */}
      <section className="border-t border-[rgba(20,17,15,0.08)] bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-12 px-6 py-24 sm:px-10 sm:py-28 lg:py-[148px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 border-b border-[rgba(20,17,15,0.08)] pb-10 sm:flex-row sm:items-end">
              <div className="space-y-3">
                <div className="editorial-label">Scene 06 · The Results</div>
                <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] sm:text-5xl lg:text-[3.5rem]">
                  Verified simulation <span className="italic text-[#0F1F1A]">outcomes.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="btn-secondary self-start px-6 py-3 text-[15px]"
              >
                <span>View test history</span>
                <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="luxury-card grid grid-cols-2 divide-y divide-[rgba(20,17,15,0.08)] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              <div className="space-y-2 p-7">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Tests Run
                </div>
                <div className="font-display text-4xl font-normal text-[#14110F] tabular-nums">
                  {totalTests}
                </div>
              </div>
              <div className="space-y-2 p-7">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Normal Inputs
                </div>
                <div className="font-display text-4xl font-normal text-[#1D4D3C] tabular-nums">
                  {normalCount}
                </div>
              </div>
              <div className="space-y-2 p-7">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Suspicious Flagged
                </div>
                <div className="font-display text-4xl font-normal text-[#8C2F3F] tabular-nums">
                  {suspiciousCount}
                </div>
              </div>
              <div className="space-y-2 p-7">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Checks Passed
                </div>
                <div className="font-display text-4xl font-normal text-[#14110F] tabular-nums">
                  {totalTests > 0 ? `${passRate}%` : '—'}
                </div>
              </div>
            </div>
          </Reveal>

          {reports.length > 0 && (
            <Reveal delay={0.14}>
              <div className="luxury-card divide-y divide-[rgba(20,17,15,0.08)] overflow-hidden">
                {reports.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-7 py-4 text-[15px]"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-[12px] text-[rgba(20,17,15,0.52)] tabular-nums">
                        {entry.timestamp}
                      </span>
                      <span className="truncate font-mono text-[13px] text-[#14110F]">
                        {entry.payload}
                      </span>
                    </div>
                    <span className="text-[15px] font-medium text-[#1D4D3C]">
                      {entry.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* SCENE 7 — FINAL IMPRESSION (Wide Architectural Closing Composition) */}
      <section className="border-t border-[rgba(20,17,15,0.08)] bg-[#FBF8F2]">
        <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-28 lg:py-[156px]">
          <Reveal>
            <div className="relative overflow-hidden rounded-[24px]">
              <LuxuryMediaFrame
                src={closingSanctuaryImg}
                alt="Serene architectural travertine colonnade and dark timber alcove bathed in golden afternoon light"
                aspectClassName="aspect-[16/9] min-h-[420px]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(15,31,26,0.28) 0%, rgba(15,31,26,0.82) 100%)',
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 lg:p-16">
                  <div className="max-w-2xl space-y-5 text-[#F4EFE6]">
                    <div className="editorial-label-dark">Scene 07 · Final Impression</div>
                    <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]">
                      Every input deserves{' '}
                      <span className="italic text-[#B79B6B]">protection.</span>
                    </h2>
                    <p className="text-[17px] leading-[1.7] text-[rgba(244,239,230,0.82)] sm:text-[18px]">
                      Understand cross-site scripting. Explore how attacks work. Experience how modern web applications protect their users.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('learn')}
                        className="btn-primary-dark px-7 py-3.5 text-[15px]"
                      >
                        <span>Explore the Experience</span>
                        <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate('playground')}
                        className="btn-secondary-dark px-7 py-3.5 text-[15px]"
                      >
                        <span>Enter Playground</span>
                      </button>
                    </div>
                  </div>
                </div>
              </LuxuryMediaFrame>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
