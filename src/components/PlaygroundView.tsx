import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Send,
  Eraser,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { analyzePayload } from '../utils/xssEngine';
import { PRESET_PAYLOADS } from '../data/xssContent';
import { SecurityReportEntry, XssAnalysisResult } from '../types/security';
import { LUXURY_EASE, LuxuryMediaFrame, Reveal, SegmentedControl } from './LuxuryPrimitives';
import playgroundAtelierImg from '../assets/images/story_playground_atelier_1795544897396.jpg';

interface PlaygroundViewProps {
  sharedPayload: string;
  onPayloadChange: (value: string) => void;
  onLogRun: (entry: Omit<SecurityReportEntry, 'id' | 'timestamp'>) => void;
}

interface SimulatedComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  analysis: XssAnalysisResult;
}

type OutputMode = 'compare' | 'unsafe' | 'secure';
type PathTraceType = 'idle' | 'happy' | 'exception-suspicious' | 'exception-empty';

function HighlightedTokens({ analysis }: { analysis: XssAnalysisResult }) {
  if (analysis.tokens.length === 0) {
    return <span className="text-[rgba(244,239,230,0.62)]">(empty)</span>;
  }

  return (
    <span className="font-mono text-[13px] leading-[1.7] break-all">
      {analysis.tokens.map((tok, idx) => {
        if (tok.kind === 'safe-text') {
          return (
            <span key={idx} className="text-[#F4EFE6]">
              {tok.text}
            </span>
          );
        }

        const tokenStyle =
          tok.kind === 'dangerous-tag' || tok.kind === 'dangerous-uri'
            ? 'code-danger-highlight'
            : tok.kind === 'event-handler' || tok.kind === 'attribute-breakout'
            ? 'bg-[#B79B6B]/22 text-[#F0D9AE] border border-[#B79B6B]/45'
            : 'bg-[rgba(244,239,230,0.08)] text-[#F4EFE6] border border-[rgba(244,239,230,0.2)]';

        return (
          <mark
            key={idx}
            title={tok.reason ?? 'Suspicious pattern'}
            className={`mx-0.5 inline rounded px-1.5 py-0.5 ${tokenStyle}`}
          >
            {tok.text}
          </mark>
        );
      })}
    </span>
  );
}

export default function PlaygroundView({
  sharedPayload,
  onPayloadChange,
  onLogRun,
}: PlaygroundViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [authorName, setAuthorName] = useState<string>('Ananya Rao');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<OutputMode>('compare');
  const [traceType, setTraceType] = useState<PathTraceType>('idle');
  const [revealedStep, setRevealedStep] = useState<number>(4);
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  const commentCounterRef = useRef<number>(1);
  const bannerTimerRef = useRef<number | null>(null);
  const stepTimersRef = useRef<number[]>([]);

  const clearStepTimers = () => {
    stepTimersRef.current.forEach((t) => window.clearTimeout(t));
    stepTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current !== null) {
        window.clearTimeout(bannerTimerRef.current);
      }
      clearStepTimers();
    };
  }, []);

  const animateTraceSteps = () => {
    clearStepTimers();
    if (shouldReduceMotion) {
      setRevealedStep(4);
      return;
    }
    setRevealedStep(1);
    [2, 3, 4].forEach((stepNum, idx) => {
      const id = window.setTimeout(() => setRevealedStep(stepNum), (idx + 1) * 180);
      stepTimersRef.current.push(id);
    });
  };

  const initialPreview = sharedPayload.trim()
    ? sharedPayload
    : `<script>alert('XSS Demo')</script>`;

  const [activeSubmission, setActiveSubmission] = useState<SimulatedComment>({
    id: 'cmt-initial',
    author: 'Ananya Rao',
    text: initialPreview,
    timestamp: 'Ready',
    analysis: analyzePayload(initialPreview),
  });

  const [commentsFeed, setCommentsFeed] = useState<SimulatedComment[]>([
    {
      id: 'cmt-seed-1',
      author: 'Workshop Lead',
      text: 'Submit plain text, HTML markup, or script patterns to compare browser behavior safely.',
      timestamp: '10:00',
      analysis: analyzePayload(
        'Submit plain text, HTML markup, or script patterns to compare browser behavior safely.'
      ),
    },
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = authorName.trim();
    const trimmedComment = sharedPayload.trim();

    if (!trimmedName || !trimmedComment) {
      const msg =
        !trimmedName && !trimmedComment
          ? 'Enter both a name and a comment before submitting.'
          : !trimmedName
          ? 'Name field cannot be empty.'
          : 'Comment field cannot be empty.';

      setValidationError(msg);
      setTraceType('exception-empty');
      animateTraceSteps();
      setSubmitBanner('Exception Path: Validation rejected empty input before rendering.');

      onLogRun({
        sourceModule: 'Playground',
        context: 'Validation',
        payload: trimmedComment || '(empty comment field)',
        severity: 'Low',
        outcome: 'Blocked',
        defenseMode: 'Input Validation Guard',
        ruleTriggered: msg,
        inputCategory: 'Invalid',
        protectionPassed: true,
      });
      return;
    }

    setValidationError(null);
    const analysis = analyzePayload(sharedPayload);
    const isSuspicious = analysis.isMalicious || analysis.severity !== 'Safe';

    const newComment: SimulatedComment = {
      id: `cmt-${Date.now()}-${commentCounterRef.current++}`,
      author: trimmedName,
      text: sharedPayload,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      analysis,
    };

    setActiveSubmission(newComment);
    setCommentsFeed((prev) => [newComment, ...prev.slice(0, 4)]);
    setTraceType(isSuspicious ? 'exception-suspicious' : 'happy');
    animateTraceSteps();
    setSubmitBanner(
      isSuspicious
        ? 'Exception Path: Suspicious syntax neutralized and rendered as plain text.'
        : 'Happy Path: Valid input verified and displayed safely.'
    );

    if (bannerTimerRef.current !== null) {
      window.clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = window.setTimeout(() => setSubmitBanner(null), 4500);

    onLogRun({
      sourceModule: 'Playground',
      context: 'Stored',
      payload: sharedPayload,
      severity: analysis.severity,
      outcome: isSuspicious ? 'Blocked' : 'Allowed',
      defenseMode: 'Safe Plain-Text Rendering',
      ruleTriggered: analysis.triggeredRules[0] ?? 'None (Valid plaintext)',
      inputCategory: isSuspicious ? 'Suspicious' : 'Normal',
      protectionPassed: true,
    });
  };

  const handleClear = () => {
    clearStepTimers();
    setAuthorName('');
    onPayloadChange('');
    setValidationError(null);
    setTraceType('idle');
    setRevealedStep(4);
    setSubmitBanner(null);
  };

  const currentAnalysis = activeSubmission.analysis;
  const flaggedTokens = currentAnalysis.tokens.filter((t) => t.kind !== 'safe-text');

  const executionSteps = [
    {
      step: 1,
      label: '01 Capture',
      status: traceType === 'idle' ? 'pending' : 'pass',
      detail: 'Input captured',
    },
    {
      step: 2,
      label: '02 Validate',
      status:
        traceType === 'idle'
          ? 'pending'
          : traceType === 'exception-empty'
          ? 'fail'
          : 'pass',
      detail: traceType === 'exception-empty' ? 'Empty field halted' : 'Fields valid',
    },
    {
      step: 3,
      label: '03 Inspect',
      status:
        traceType === 'idle' || traceType === 'exception-empty'
          ? 'pending'
          : traceType === 'exception-suspicious'
          ? 'warn'
          : 'pass',
      detail:
        traceType === 'exception-suspicious'
          ? 'Syntax flagged'
          : 'Clean text verified',
    },
    {
      step: 4,
      label: '04 Render',
      status:
        traceType === 'idle'
          ? 'pending'
          : traceType === 'exception-empty'
          ? 'fail'
          : 'pass',
      detail:
        traceType === 'exception-empty'
          ? 'Skipped render'
          : 'Safe plain text',
    },
  ];

  const renderUnsafePanel = () => (
    <div className="luxury-code-block space-y-4 p-6">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#E2A4AE]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          <span>Unsafe Rendering (Conceptual)</span>
        </span>
        <span className="editorial-label-dark text-[#E2A4AE]">
          {currentAnalysis.severity}
        </span>
      </div>

      {currentAnalysis.isMalicious ? (
        <div className="space-y-3">
          <div className="code-danger-highlight rounded-xl p-4 font-sans text-[15px] leading-[1.6]">
            <span className="font-semibold">Browser would parse: </span>
            <code className="font-mono text-[13px]">
              {flaggedTokens.map((t) => t.text).join(' ')}
            </code>
            {currentAnalysis.simulatedAlertText
              ? ` — triggering "${currentAnalysis.simulatedAlertText}".`
              : '.'}
          </div>
          <p className="font-sans text-[15px] leading-[1.65] text-[rgba(244,239,230,0.68)]">
            {currentAnalysis.simulatedImpact}
          </p>
        </div>
      ) : (
        <p className="font-sans text-[15px] leading-[1.65] text-[rgba(244,239,230,0.68)]">
          No active script tokens detected in this input. Plain text displays normally, though unescaped HTML sinks remain exposed to future markup delimiters.
        </p>
      )}
    </div>
  );

  const renderSecurePanel = () => (
    <div className="luxury-card space-y-4 p-6 text-[#14110F]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1D4D3C]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Secure Rendering (Safe Text Node)</span>
        </span>
        <span className="editorial-label text-[#1D4D3C]">Protected</span>
      </div>

      <div className="luxury-code-block px-4 py-3 text-[13px] break-all">
        <span className="code-safe-highlight inline-block rounded px-2 py-0.5">
          {activeSubmission.text}
        </span>
      </div>

      <div className="text-[15px] leading-relaxed text-[rgba(20,17,15,0.68)] break-all">
        Encoded entities:{' '}
        <code className="font-mono text-[13px] text-[#14110F]">
          {currentAnalysis.htmlEncoded}
        </code>
      </div>
    </div>
  );

  return (
    <div className="space-y-0">
      {/* 1. HEADER — Cream (#F4EFE6) */}
      <section className="bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-12 px-6 pt-20 pb-20 sm:px-10 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label">Interactive Playground</div>
                <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] sm:text-5xl lg:text-[4rem]">
                  Experiment with live <span className="italic text-[#0F1F1A]">inputs.</span>
                </h1>
                <p className="text-[17px] leading-[1.7] text-[rgba(20,17,15,0.62)] sm:text-[18px]">
                  Submit ordinary comments, empty fields, or script-like strings to inspect validation paths, lexical pattern detection, and safe plain-text rendering.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-[15px] font-medium text-[#1D4D3C]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Zero DOM execution · Local simulation</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="lg:-mx-8 xl:-mx-12">
              <LuxuryMediaFrame
                src={playgroundAtelierImg}
                alt="Architectural studio desk in matte walnut and travertine stone with smoked optical glass display and brass instruments"
                aspectClassName="aspect-[16/6]"
                revealOnScroll={false}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. DEVELOPER WORKBENCH — Full-Width Deep Forest (#0F1F1A) */}
      <section className="border-t border-[rgba(244,239,230,0.12)] bg-[#0F1F1A] text-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] px-6 py-20 sm:px-10 sm:py-28 lg:py-[144px]">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: User Input + Integrated Path Trace + Comment Feed */}
            <div className="space-y-8 lg:col-span-5">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="luxury-card space-y-6 p-7 text-[#14110F]"
              >
                <div className="flex items-center justify-between border-b border-[rgba(20,17,15,0.08)] pb-4">
                  <h2 className="font-display text-3xl font-normal text-[#14110F]">
                    User <span className="italic text-[#0F1F1A]">Input</span>
                  </h2>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[rgba(20,17,15,0.62)] hover:text-[#14110F]"
                  >
                    <Eraser className="h-4 w-4" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>

                <div>
                  <label htmlFor="pg-name" className="editorial-label block">
                    Author Name
                  </label>
                  <input
                    id="pg-name"
                    type="text"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Enter name..."
                    className="mt-2 min-h-[44px] w-full rounded-xl border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] px-4 py-2.5 text-[15px] text-[#14110F] placeholder:text-[rgba(20,17,15,0.45)] focus:border-[#B79B6B] focus:bg-[#FBF8F2] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="pg-comment" className="editorial-label block">
                    Comment or Payload
                  </label>
                  <textarea
                    id="pg-comment"
                    rows={3}
                    value={sharedPayload}
                    onChange={(e) => {
                      onPayloadChange(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Type plain text or an HTML/script payload..."
                    className="mt-2 w-full rounded-xl border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] p-4 font-mono text-[13px] leading-relaxed text-[#14110F] placeholder:text-[rgba(20,17,15,0.45)] focus:border-[#B79B6B] focus:bg-[#FBF8F2] focus:outline-none"
                  />
                </div>

                {/* Quick Samples */}
                <div className="space-y-2.5">
                  <div className="editorial-label">Quick Samples</div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PAYLOADS.slice(0, 5).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (!authorName.trim()) setAuthorName('Ananya Rao');
                          onPayloadChange(preset.payload);
                          setValidationError(null);
                        }}
                        className={`min-h-[34px] rounded-full border px-3.5 py-1 text-[13px] font-medium transition-colors ${
                          sharedPayload === preset.payload
                            ? 'border-[#14110F] bg-[#14110F] text-[#F4EFE6]'
                            : 'border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] text-[rgba(20,17,15,0.72)] hover:border-[#14110F] hover:text-[#14110F]'
                        }`}
                      >
                        {preset.title.replace('Classic ', '').replace('Broken ', '')}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        onPayloadChange('');
                        setValidationError(null);
                      }}
                      className="min-h-[34px] rounded-full border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] px-3.5 py-1 text-[13px] font-medium text-[rgba(20,17,15,0.72)] hover:border-[#14110F] hover:text-[#14110F]"
                    >
                      Empty Field Test
                    </button>
                  </div>
                </div>

                {validationError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-xl border border-[#8C2F3F]/35 bg-[#8C2F3F]/8 px-4 py-3 text-[15px] font-medium text-[#8C2F3F]"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{validationError}</span>
                  </div>
                )}

                {submitBanner && !validationError && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 rounded-xl border border-[#1D4D3C]/30 bg-[#1D4D3C]/8 px-4 py-3 text-[15px] font-medium text-[#1D4D3C]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{submitBanner}</span>
                  </motion.div>
                )}

                <button type="submit" className="btn-primary w-full px-6 py-3 text-[15px]">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Run &amp; Inspect</span>
                </button>
              </form>

              {/* Processing Path */}
              <div className="space-y-4 border-t border-[rgba(244,239,230,0.12)] pt-7">
                <div className="flex items-center justify-between">
                  <span className="editorial-label-dark">Processing Path</span>
                  <span className="font-mono text-[12px] text-[rgba(244,239,230,0.72)]">
                    {traceType === 'idle'
                      ? 'Ready'
                      : traceType === 'happy'
                      ? 'Happy Path'
                      : 'Exception Path'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {executionSteps.map((step) => {
                    const active = step.step <= revealedStep || traceType === 'idle';
                    const tone =
                      !active || step.status === 'pending'
                        ? 'border-[rgba(244,239,230,0.12)] bg-[#162923] text-[rgba(244,239,230,0.62)]'
                        : step.status === 'pass'
                        ? 'border-[#8FBFA6]/45 bg-[#162923] text-[#8FBFA6]'
                        : step.status === 'warn'
                        ? 'border-[#B79B6B]/70 bg-[#162923] text-[#E6C99B]'
                        : 'border-[#8C2F3F]/75 bg-[#162923] text-[#E2A4AE]';

                    return (
                      <div
                        key={step.label}
                        className={`rounded-xl border p-3.5 transition-colors duration-250 ${tone}`}
                      >
                        <div className="font-mono text-[11px] uppercase tracking-[0.1em]">
                          {step.label}
                        </div>
                        <div className="mt-1.5 text-[13px] leading-snug">{step.detail}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safe Rendered Feed */}
              <div className="space-y-3.5 border-t border-[rgba(244,239,230,0.12)] pt-7">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-[#F4EFE6]">
                    Rendered Comment Log
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCommentsFeed((prev) => prev.slice(-1))}
                    className="inline-flex items-center gap-1.5 text-[15px] text-[rgba(244,239,230,0.68)] hover:text-[#F4EFE6]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                  {commentsFeed.map((item) => (
                    <article
                      key={item.id}
                      className="luxury-card-dark space-y-2 p-4"
                    >
                      <div className="flex items-center justify-between text-[15px]">
                        <span className="font-semibold text-[#F4EFE6]">{item.author}</span>
                        <span className="font-mono text-[12px] text-[rgba(244,239,230,0.62)] tabular-nums">
                          {item.timestamp} ·{' '}
                          <span className="text-[#8FBFA6]">
                            {item.analysis.isMalicious ? 'Neutralized' : 'Verified'}
                          </span>
                        </span>
                      </div>
                      <p className="font-mono text-[13px] text-[rgba(244,239,230,0.72)] break-all">
                        {item.text}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Unsafe vs Secure Rendering + Lexical Token Breakdown */}
            <div className="space-y-9 lg:col-span-7">
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div className="space-y-2">
                    <div className="editorial-label-dark">Comparison Stage</div>
                    <h2 className="font-display text-3xl font-normal text-[#F4EFE6] sm:text-4xl">
                      Unsafe vs. Secure{' '}
                      <span className="italic text-[#B79B6B]">Rendering</span>
                    </h2>
                    <p className="text-[16px] leading-[1.65] text-[rgba(244,239,230,0.68)]">
                      Inspect conceptual unsafe DOM parsing alongside React&apos;s plain-text rendering.
                    </p>
                  </div>

                  <SegmentedControl
                    ariaLabel="Output comparison mode"
                    layoutId="playground-output-mode"
                    surface="dark"
                    size="sm"
                    value={outputMode}
                    onChange={setOutputMode}
                    options={[
                      { id: 'compare', label: 'Compare Both' },
                      { id: 'unsafe', label: 'Unsafe', tone: 'burgundy' },
                      { id: 'secure', label: 'Secure', tone: 'forest' },
                    ]}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={outputMode}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.24, ease: LUXURY_EASE }}
                    className={`grid gap-6 ${
                      outputMode === 'compare' ? 'xl:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {(outputMode === 'compare' || outputMode === 'unsafe') &&
                      renderUnsafePanel()}
                    {(outputMode === 'compare' || outputMode === 'secure') &&
                      renderSecurePanel()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Lexical Token Breakdown */}
              <div className="space-y-4 border-t border-[rgba(244,239,230,0.12)] pt-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[18px] font-semibold text-[#F4EFE6]">
                    Lexical Pattern Inspection
                  </h3>
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-[#B79B6B] tabular-nums">
                    {flaggedTokens.length} flagged token(s)
                  </span>
                </div>

                <div className="luxury-code-block p-5">
                  <HighlightedTokens analysis={currentAnalysis} />
                </div>

                {flaggedTokens.length > 0 && (
                  <div className="space-y-2.5">
                    {flaggedTokens.map((tok, i) => (
                      <div
                        key={i}
                        className="luxury-card-dark flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5"
                      >
                        <code className="code-danger-highlight rounded px-2 py-0.5 font-mono text-[13px] break-all">
                          {tok.text}
                        </code>
                        <span className="text-[15px] text-[rgba(244,239,230,0.72)]">
                          {tok.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFICATION SUMMARY — Cream (#F4EFE6) Pre-Footer */}
      <section className="bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-3 px-6 py-20 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="editorial-label">Verification Summary</div>
            <span className="text-[15px] font-semibold text-[#1D4D3C]">
              Protection Passed
            </span>
          </div>
          <p className="max-w-4xl text-[17px] leading-[1.7] text-[rgba(20,17,15,0.68)]">
            {currentAnalysis.isMalicious
              ? `Submitted input from ${activeSubmission.author} matched ${currentAnalysis.vectorCategory.toLowerCase()} indicators (${currentAnalysis.triggeredRules.join(', ')}). XSS Guard prevented execution by treating the content as literal React text and escaping structural HTML characters.`
              : `Submitted input from ${activeSubmission.author} contained valid plaintext without active tags, inline event handlers, or script URIs.`}
          </p>
        </div>
      </section>
    </div>
  );
}
