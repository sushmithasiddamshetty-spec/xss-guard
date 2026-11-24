import { useState, useRef, useEffect } from 'react';
import {
  FlaskConical,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PRESET_PAYLOADS } from '../data/xssContent';
import { analyzePayload } from '../utils/xssEngine';
import { NavPageId, ThreatSeverity } from '../types/security';

interface AttackPlaygroundViewProps {
  sharedPayload: string;
  onPayloadChange: (value: string) => void;
  onNavigate: (page: NavPageId) => void;
}

function getSeverityStyle(severity: ThreatSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'border-rose-500/45 bg-rose-500/15 text-rose-200';
    case 'High':
      return 'border-orange-500/45 bg-orange-500/15 text-orange-200';
    case 'Medium':
      return 'border-amber-500/45 bg-amber-500/15 text-amber-200';
    case 'Low':
      return 'border-blue-500/45 bg-blue-500/15 text-blue-200';
    default:
      return 'border-emerald-500/45 bg-emerald-500/15 text-emerald-200';
  }
}

export default function AttackPlaygroundView({
  sharedPayload,
  onPayloadChange,
  onNavigate,
}: AttackPlaygroundViewProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const analysis = analyzePayload(sharedPayload);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyPayload = async () => {
    if (!sharedPayload) return;
    try {
      await navigator.clipboard.writeText(sharedPayload);
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-8 pb-8 pt-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-purple-300 uppercase">
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            <span>Payload Anatomy &amp; Token Scanner</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Attack Playground
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Inspect how browsers and security scanners break down XSS payloads into dangerous tags, inline event attributes, and executable URIs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('simulator')}
            className="btn-secondary-cyber px-4 py-2 text-xs"
          >
            <span>Test in Live Simulator</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('protection')}
            className="btn-primary-cyber px-4 py-2 text-xs"
          >
            <span>Open Protection Lab</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Split: Preset Catalog & Live Lexical Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Preset Vector Library */}
        <div className="space-y-3 lg:col-span-5">
          <h2 className="font-display text-lg font-semibold text-white">
            Curated Educational Vectors
          </h2>
          <div className="space-y-2.5">
            {PRESET_PAYLOADS.map((item) => {
              const selected = sharedPayload === item.payload;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onPayloadChange(item.payload)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_24px_-12px_rgba(6,182,212,0.5)]'
                      : 'glass-panel hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {item.category} · {item.expectedSeverity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {item.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Live Token Analyzer */}
        <div className="space-y-6 lg:col-span-7">
          <div className="gradient-border-card rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="playground-input"
                className="font-display text-lg font-semibold text-white"
              >
                Custom Payload Inspector
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  disabled={!sharedPayload}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white disabled:opacity-40"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                    analysis.severity
                  )}`}
                >
                  {analysis.isMalicious ? (
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>Severity: {analysis.severity}</span>
                </span>
              </div>
            </div>

            <textarea
              id="playground-input"
              rows={3}
              value={sharedPayload}
              onChange={(e) => onPayloadChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-[#050814] p-3.5 font-mono text-xs leading-relaxed text-cyan-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Type or select a payload to inspect its lexical tokens..."
            />

            {/* Token-by-token highlight strip */}
            <div>
              <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Lexical Token Breakdown
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-xl border border-slate-800 bg-[#050814]/90 p-4 font-mono text-xs">
                {analysis.tokens.length === 0 ? (
                  <span className="text-slate-500">Enter text above to inspect tokens.</span>
                ) : (
                  analysis.tokens.map((tok, i) => {
                    const tokenColor =
                      tok.kind === 'dangerous-tag'
                        ? 'border-rose-500/50 bg-rose-500/20 text-rose-200'
                        : tok.kind === 'event-handler'
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-200'
                        : tok.kind === 'dangerous-uri'
                        ? 'border-purple-500/50 bg-purple-500/20 text-purple-200'
                        : tok.kind === 'attribute-breakout'
                        ? 'border-amber-500/50 bg-amber-500/20 text-amber-200'
                        : tok.kind === 'html-tag'
                        ? 'border-cyan-500/45 bg-cyan-500/15 text-cyan-200'
                        : 'border-slate-700/60 bg-slate-800/50 text-slate-300';

                    return (
                      <span
                        key={i}
                        title={tok.reason ?? 'Safe character data'}
                        className={`rounded-md border px-2 py-1 break-all ${tokenColor}`}
                      >
                        {tok.text}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Triggered Detection Rules */}
            <div className="grid gap-4 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-[#050814]/70 p-4">
                <div className="text-xs font-semibold text-slate-400">
                  Vector Classification
                </div>
                <div className="mt-1 font-display text-base font-semibold text-white">
                  {analysis.vectorCategory}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {analysis.simulatedImpact}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#050814]/70 p-4">
                <div className="text-xs font-semibold text-slate-400">
                  Triggered Scanner Rules ({analysis.triggeredRules.length})
                </div>
                {analysis.triggeredRules.length === 0 ? (
                  <p className="mt-2 text-xs text-emerald-300">
                    No executable XSS patterns detected.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-xs text-rose-200">
                    {analysis.triggeredRules.map((rule, idx) => (
                      <li key={idx}>• {rule}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
