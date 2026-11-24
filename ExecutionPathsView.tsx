import { useState, useEffect } from 'react';
import {
  GitBranch,
  Play,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EXECUTION_PATH_SCENARIOS } from '../data/xssContent';
import { SecurityReportEntry } from '../types/security';

interface ExecutionPathsViewProps {
  onLogRun: (entry: Omit<SecurityReportEntry, 'id' | 'timestamp'>) => void;
}

export default function ExecutionPathsView({ onLogRun }: ExecutionPathsViewProps) {
  const [scenarioId, setScenarioId] = useState<string>(EXECUTION_PATH_SCENARIOS[0].id);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenario =
    EXECUTION_PATH_SCENARIOS.find((s) => s.id === scenarioId) ??
    EXECUTION_PATH_SCENARIOS[0];

  const isComplete = activeStep >= scenario.steps.length - 1;
  const isHappy = scenario.pathType === 'happy';

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= scenario.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [isPlaying, scenario.steps.length]);

  const startSimulation = (targetScenarioId = scenarioId) => {
    const target =
      EXECUTION_PATH_SCENARIOS.find((s) => s.id === targetScenarioId) ??
      EXECUTION_PATH_SCENARIOS[0];
    setScenarioId(targetScenarioId);
    setActiveStep(0);
    setIsPlaying(true);

    onLogRun({
      sourceModule: 'Execution Paths',
      context: 'Validation',
      payload: target.sampleInput.trim() || '(empty input)',
      severity: target.pathType === 'happy' ? 'Safe' : target.id === 'exception-empty' ? 'Low' : 'High',
      outcome: target.pathType === 'happy' ? 'Allowed' : 'Blocked',
      defenseMode: target.label,
      ruleTriggered:
        target.pathType === 'happy'
          ? 'None (Valid Name & Normal Comment)'
          : target.steps[3]?.detail ?? 'Validation / Security Exception',
      inputCategory:
        target.id === 'exception-empty'
          ? 'Invalid'
          : target.pathType === 'happy'
          ? 'Normal'
          : 'Suspicious',
      protectionPassed: true,
    });
  };

  const restartSimulation = () => {
    setActiveStep(0);
    setIsPlaying(true);
  };

  const stepForward = () => {
    setIsPlaying(false);
    setActiveStep((prev) =>
      prev < scenario.steps.length - 1 ? prev + 1 : 0
    );
  };

  const getStepIndicator = (
    status: 'nominal' | 'warning' | 'blocked',
    reached: boolean
  ) => {
    if (!reached) {
      return {
        border: 'border-slate-800/70 bg-[#050814]/45 opacity-45',
        badge: 'text-slate-500',
        icon: <span className="h-2.5 w-2.5 rounded-full bg-slate-700" aria-hidden="true" />,
      };
    }

    if (status === 'blocked') {
      return {
        border: 'border-rose-500/55 bg-rose-950/20',
        badge: 'text-rose-300',
        icon: <ShieldAlert className="h-4 w-4 text-rose-400" aria-hidden="true" />,
      };
    }

    if (status === 'warning') {
      return {
        border: 'border-amber-500/50 bg-amber-950/20',
        badge: 'text-amber-300',
        icon: <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />,
      };
    }

    return {
      border: 'border-emerald-500/45 bg-emerald-950/20',
      badge: 'text-emerald-300',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
    };
  };

  // Derive simulated live form preview state based on activeStep
  const previewName =
    activeStep >= 1
      ? scenario.id === 'happy-valid'
        ? 'Ananya Rao'
        : scenario.id === 'exception-suspicious'
        ? 'Rohan Verma'
        : 'Meera Nair'
      : '';

  const previewComment =
    activeStep >= (isHappy ? 2 : 1)
      ? scenario.id === 'exception-empty'
        ? ''
        : scenario.sampleInput
      : '';

  return (
    <div className="space-y-8 pb-8 pt-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            <span>Visual Workflow Demonstration</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Happy Path &amp; Exception Path
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Watch step-by-step how the comment form processes valid inputs (Happy Path) compared to empty submissions or suspicious HTML-like patterns (Exception Path).
          </p>
        </div>

        {/* Simulation Playback Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <button
            type="button"
            onClick={() => startSimulation(scenarioId)}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-[0_0_24px_-6px_rgba(6,182,212,0.65)] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>Start Simulation</span>
          </button>

          <button
            type="button"
            onClick={restartSimulation}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Restart Simulation</span>
          </button>

          <button
            type="button"
            onClick={stepForward}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Next Step</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid gap-3 md:grid-cols-3">
        {EXECUTION_PATH_SCENARIOS.map((item) => {
          const selected = item.id === scenarioId;
          const happyScenario = item.pathType === 'happy';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => startSimulation(item.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? happyScenario
                    ? 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_24px_-10px_rgba(16,185,129,0.5)]'
                    : 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_24px_-10px_rgba(245,158,11,0.4)]'
                  : 'glass-panel hover:border-cyan-400/35'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span
                  className={`font-semibold ${
                    happyScenario ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {happyScenario ? 'Happy Path (7 Steps)' : 'Exception Path (6 Steps)'}
                </span>
                <span className="font-mono text-slate-400">{item.httpStatus}</span>
              </div>
              <div className="mt-2 font-display text-sm font-bold text-white">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split: Animated Workflow Timeline + Live Form & Result Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Step-by-Step Animated Workflow */}
        <div className="glass-panel rounded-2xl p-6 space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {scenario.label}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {activeStep < 0
                  ? 'Click "Start Simulation" above to animate each step one by one.'
                  : `Progress: Step ${activeStep + 1} of ${scenario.steps.length}`}
              </p>
            </div>
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {Math.max(0, activeStep + 1)} / {scenario.steps.length}
            </span>
          </div>

          <div className="space-y-3">
            {scenario.steps.map((step, idx) => {
              const reached = idx <= activeStep;
              const current = idx === activeStep;
              const ui = getStepIndicator(step.status, reached);

              return (
                <motion.button
                  key={`${scenario.id}-${idx}`}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(idx);
                  }}
                  initial={{ opacity: 0.7 }}
                  animate={{
                    opacity: reached ? 1 : 0.45,
                    scale: current ? 1.01 : 1,
                  }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${ui.border} ${
                    current ? 'ring-2 ring-cyan-400/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${ui.badge}`}>{step.role}</span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-white sm:text-base">
                        {step.nodeTitle}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {step.detail}
                      </p>
                    </div>
                    <div className="mt-1 shrink-0">{ui.icon}</div>
                  </div>

                  {reached && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="mt-3 rounded-lg border border-slate-800/90 bg-[#050814]/85 px-3 py-2 font-mono text-[11px] text-cyan-200 break-all"
                    >
                      {step.dataSnapshot}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Synchronized Visual Form Preview & Final Result Explanation */}
        <div className="space-y-6 lg:col-span-5">
          {/* Simulated Browser Form State */}
          <div className="gradient-border-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <h2 className="font-display text-base font-semibold text-white">
                  Simulated Form State
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {activeStep < 0 ? 'Idle' : isPlaying ? 'Running...' : 'Step Paused'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-400">Name Field</div>
                <div className="mt-1 min-h-[38px] rounded-xl border border-slate-800 bg-[#050814] px-3 py-2 text-xs text-white">
                  {previewName || <span className="text-slate-600">(waiting for step...)</span>}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-400">Comment Field</div>
                <div className="mt-1 min-h-[68px] rounded-xl border border-slate-800 bg-[#050814] px-3 py-2 font-mono text-xs text-cyan-200 break-all">
                  {activeStep < (isHappy ? 2 : 1) ? (
                    <span className="font-sans text-slate-600">(waiting for step...)</span>
                  ) : previewComment ? (
                    previewComment
                  ) : (
                    <span className="text-amber-300">(empty whitespace input)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Simulated Feedback Banner */}
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key={`result-${scenario.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border p-4 space-y-2 ${
                    isHappy
                      ? 'border-emerald-500/45 bg-emerald-950/25'
                      : 'border-amber-500/45 bg-amber-950/25'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    {isHappy ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    )}
                    <span>
                      {isHappy
                        ? 'Success! Comment Published Safely'
                        : scenario.id === 'exception-empty'
                        ? 'Validation Alert: Comment Cannot Be Empty'
                        : 'Security Warning: Suspicious Input Neutralized'}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-200 break-all">
                    {isHappy
                      ? `${previewName}: ${previewComment}`
                      : scenario.id === 'exception-empty'
                      ? 'Please enter a non-empty comment before submitting.'
                      : `Displayed safely as literal text: ${previewComment}`}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-slate-800 bg-[#050814]/70 p-4 text-xs text-slate-400"
                >
                  {activeStep < 0
                    ? 'Press Start Simulation to watch the workflow animate step by step.'
                    : 'Simulation running — watching validation and safe output steps...'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Final Explanation Card */}
          <div
            className={`rounded-2xl border p-6 space-y-3 transition-colors ${
              !isComplete
                ? 'glass-panel opacity-75'
                : isHappy
                ? 'border-emerald-500/40 bg-emerald-950/15'
                : 'border-rose-500/35 bg-rose-950/15'
            }`}
          >
            <div className="flex items-center gap-2 text-base font-bold text-white">
              {isHappy ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-400" aria-hidden="true" />
              )}
              <span>Final Result Explanation</span>
            </div>

            <p className="text-sm leading-relaxed text-slate-200">
              {isComplete
                ? scenario.summary
                : 'Once all steps finish animating, a full plain-language explanation of the Happy Path or Exception Path outcome will appear here.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
