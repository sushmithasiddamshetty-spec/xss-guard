import { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  Globe,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { XSS_TYPES_GUIDE, QUIZ_QUESTIONS } from '../data/xssContent';
import { NavPageId } from '../types/security';

interface LearnXssViewProps {
  onNavigate: (page: NavPageId) => void;
}

export default function LearnXssView({ onNavigate }: LearnXssViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedTypeId, setSelectedTypeId] = useState<'reflected' | 'stored' | 'dom'>('reflected');
  const [flowMode, setFlowMode] = useState<'unsafe' | 'safe'>('safe');
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    0: true,
  });
  const [showCodeCompare, setShowCodeCompare] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const activeType =
    XSS_TYPES_GUIDE.find((item) => item.id === selectedTypeId) ?? XSS_TYPES_GUIDE[0];

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="space-y-12 pb-8 pt-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>XSS Learning Centre · First-Year Workshop Guide</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Understanding Cross-Site Scripting (XSS)
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Cross-Site Scripting happens when a website accidentally treats untrusted user text as executable HTML or JavaScript. Select each of the three main types below to explore harmless scenarios, animated flow diagrams, and how developers prevent them.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('simulator')}
          className="inline-flex min-h-[42px] shrink-0 items-center gap-2 self-start rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
        >
          <span>Try Live Simulator</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Interactive 3-Card Type Selector */}
      <section aria-label="Three Main Types of XSS" className="space-y-6">
        <div
          role="tablist"
          aria-label="XSS Types"
          className="grid gap-4 md:grid-cols-3"
        >
          {XSS_TYPES_GUIDE.map((item) => {
            const active = item.id === selectedTypeId;
            return (
              <button
                key={item.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => {
                  setSelectedTypeId(item.id);
                  setExpandedSteps({ 0: true });
                }}
                className={`group rounded-2xl border p-5 text-left transition-all ${
                  active
                    ? 'border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_26px_-10px_rgba(6,182,212,0.55)]'
                    : 'glass-panel hover:border-cyan-400/35'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-cyan-400">
                    Type {item.number}
                  </span>
                  <span className={active ? 'text-cyan-200 font-semibold' : 'text-slate-400'}>
                    {active ? 'Selected' : 'Explore'}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg font-bold text-white">
                  {item.shortTitle}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300 line-clamp-2">
                  {item.simpleDefinition}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected XSS Type Deep-Dive Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="gradient-border-card rounded-2xl p-6 sm:p-8 space-y-8"
          >
            {/* 1. Simple Definition & Harmless Scenario */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-6">
                <div className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  Simple Definition
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {activeType.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
                  {activeType.simpleDefinition}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#050814]/80 p-5 lg:col-span-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  <span>{activeType.scenarioTitle}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {activeType.scenarioDescription}
                </p>
              </div>
            </div>

            {/* 2. Animated Visual Flow Diagram */}
            <div className="space-y-4 border-t border-slate-800/80 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-semibold text-white">
                    Animated Visual Flow Diagram
                  </h4>
                  <p className="text-xs text-slate-400">
                    Toggle between how an unsafe site handles input vs. a protected site.
                  </p>
                </div>

                <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/90 p-1">
                  <button
                    type="button"
                    onClick={() => setFlowMode('unsafe')}
                    className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      flowMode === 'unsafe'
                        ? 'border border-rose-500/45 bg-rose-500/20 text-rose-200'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unsafe Flow
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowMode('safe')}
                    className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      flowMode === 'safe'
                        ? 'border border-emerald-500/45 bg-emerald-500/20 text-emerald-200'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Protected Flow
                  </button>
                </div>
              </div>

              {/* 4-Node Animated Diagram */}
              <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {activeType.flowDiagram.map((step, idx) => (
                  <motion.div
                    key={`${activeType.id}-${flowMode}-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.06 }}
                    className={`relative rounded-xl border p-4 ${
                      flowMode === 'unsafe'
                        ? 'border-rose-500/35 bg-rose-950/15'
                        : 'border-emerald-500/35 bg-emerald-950/15'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400">Step 0{idx + 1}</span>
                      <span
                        className={
                          flowMode === 'unsafe' ? 'text-rose-300' : 'text-emerald-300'
                        }
                      >
                        {step.actor}
                      </span>
                    </div>
                    <div className="mt-2 font-display text-sm font-bold text-white">
                      {step.node}
                    </div>
                    <p className="mt-1.5 font-mono text-xs leading-relaxed text-slate-200">
                      {flowMode === 'unsafe' ? step.unsafeBehavior : step.safeBehavior}
                    </p>

                    {/* Animated connector dot between nodes on desktop */}
                    {idx < activeType.flowDiagram.length - 1 && (
                      <motion.div
                        aria-hidden="true"
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : { x: [0, 8, 0], opacity: [0.5, 1, 0.5] }
                        }
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                        }
                        className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-5 w-5 items-center justify-center rounded-full border bg-[#050814] ${
                          flowMode === 'unsafe'
                            ? 'border-rose-400/60 text-rose-300'
                            : 'border-emerald-400/60 text-emerald-300'
                        }`}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 3. How It Happens (Expandable Explanations) */}
            <div className="space-y-4 border-t border-slate-800/80 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-lg font-semibold text-white">
                  How It Happens (Step-by-Step)
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = activeType.howItHappens.every((_, i) => expandedSteps[i]);
                    const next: Record<number, boolean> = {};
                    activeType.howItHappens.forEach((_, i) => {
                      next[i] = !allOpen;
                    });
                    setExpandedSteps(next);
                  }}
                  className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                >
                  {activeType.howItHappens.every((_, i) => expandedSteps[i])
                    ? 'Collapse All Steps'
                    : 'Expand All Steps'}
                </button>
              </div>

              <div className="space-y-2.5">
                {activeType.howItHappens.map((step, idx) => {
                  const isOpen = !!expandedSteps[idx];
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800/90 bg-[#050814]/75 overflow-hidden"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleStep(idx)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                      >
                        <div>
                          <div className="font-display text-sm font-semibold text-white">
                            {step.stepTitle}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-300">{step.summary}</div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-cyan-300 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden border-t border-slate-800/80 px-4 py-3 text-xs leading-relaxed text-cyan-100 bg-cyan-950/10"
                          >
                            {step.deepDive}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Safe Illustrative Example */}
            <div className="space-y-4 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-300" aria-hidden="true" />
                <h4 className="font-display text-lg font-semibold text-white">
                  Safe Illustrative Example
                </h4>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-[#050814]/85 p-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-400">
                    Harmless Sample Input
                  </div>
                  <div className="font-mono text-xs text-cyan-200 break-all">
                    {activeType.safeExample.harmlessInput}
                  </div>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-4 space-y-2">
                  <div className="text-xs font-semibold text-rose-300">
                    What an Unprotected Site Would Do
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {activeType.safeExample.unsafeConceptual}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/15 p-4 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300">
                    Safe Output Displayed as Plain Text
                  </div>
                  <div className="font-mono text-xs text-emerald-100 break-all">
                    {activeType.safeExample.safeRendered}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400">{activeType.safeExample.note}</p>
            </div>

            {/* 5. Prevention Techniques & Expandable Code Comparison */}
            <div className="space-y-5 border-t border-slate-800/80 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-display text-lg font-semibold text-white">
                  Prevention Techniques
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCodeCompare((prev) => !prev)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                >
                  <span>{showCodeCompare ? 'Hide Code Examples' : 'View Vulnerable vs. Safe Code'}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showCodeCompare ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {activeType.preventionTechniques.map((tech, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{tech.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {tech.detail}
                    </p>
                  </div>
                ))}
              </div>

              <AnimatePresence initial={false}>
                {showCodeCompare && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-5 overflow-hidden lg:grid-cols-2"
                  >
                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        <span>Conceptual Unsafe Pattern</span>
                      </div>
                      <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-rose-100">
                        <code>{activeType.vulnerableCode}</code>
                      </pre>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        <span>Safe Defensive Pattern</span>
                      </div>
                      <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-100">
                        <code>{activeType.secureCode}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Interactive 5-Question Knowledge Check Quiz */}
      <section aria-labelledby="quiz-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="quiz-heading" className="font-display text-2xl font-bold text-white">
              Knowledge-Check Quiz (5 Questions)
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Select an answer for each question to receive instant feedback and explanations.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-sm text-cyan-300 tabular-nums">
              Score: {correctCount} / {QUIZ_QUESTIONS.length} ({answeredCount} answered)
            </div>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={() => setAnswers({})}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Quiz</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const selected = answers[q.id];
            const isAnswered = selected !== undefined;
            const isCorrect = selected === q.correctIndex;

            return (
              <div key={q.id} className="glass-panel rounded-2xl p-6">
                <h3 className="font-display text-base font-semibold text-white sm:text-lg">
                  {qIdx + 1}. {q.question}
                </h3>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    const isPicked = selected === optIdx;
                    const showCorrectStyle = isAnswered && optIdx === q.correctIndex;
                    const showWrongStyle = isAnswered && isPicked && !isCorrect;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                        }
                        className={`flex min-h-[44px] items-start gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          showCorrectStyle
                            ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                            : showWrongStyle
                            ? 'border-rose-400/60 bg-rose-500/15 text-rose-100'
                            : isPicked
                            ? 'border-cyan-400/60 bg-cyan-500/15 text-white'
                            : 'border-slate-800 bg-[#050814]/70 text-slate-300 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 font-mono text-xs text-slate-400">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16 }}
                    className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
                      isCorrect
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                    )}
                    <div>
                      <span className="font-semibold">
                        {isCorrect ? 'Correct! ' : 'Not quite. '}
                      </span>
                      <span>{q.explanation}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
