import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export default function HeroVisual() {
  const shouldReduceMotion = useReducedMotion();
  const [guardEnabled, setGuardEnabled] = useState(true);

  const samplePayload = `<script>alert('Session')</script>`;
  const encodedOutput = `&lt;script&gt;alert(&#x27;Session&#x27;)&lt;&#x2F;script&gt;`;

  return (
    <div className="gradient-border-card relative overflow-hidden rounded-2xl p-6 sm:p-7">
      {/* Subtle top glow accent */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full opacity-35 blur-3xl"
        style={{
          background: guardEnabled
            ? 'radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Interactive Mode Switcher inside Visual */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
        <div className="flex items-center gap-2.5">
          {guardEnabled ? (
            <ShieldCheck className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-400" aria-hidden="true" />
          )}
          <span className="font-display text-sm font-semibold text-white">
            Interactive Packet & DOM Inspector
          </span>
        </div>

        <div className="inline-flex rounded-lg border border-slate-700/80 bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => setGuardEnabled(false)}
            className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              !guardEnabled
                ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unprotected
          </button>
          <button
            type="button"
            onClick={() => setGuardEnabled(true)}
            className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              guardEnabled
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            XSS Guard Active
          </button>
        </div>
      </div>

      {/* Animated Pipeline Nodes */}
      <div className="relative mt-5 space-y-4">
        {/* Node 1: Incoming Payload */}
        <div className="rounded-xl border border-slate-800 bg-[#050814]/80 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Terminal className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              Incoming Request Payload
            </span>
            <span>HTTP Input</span>
          </div>
          <code className="mt-2 block overflow-x-auto font-mono text-xs text-amber-300 sm:text-[13px]">
            {samplePayload}
          </code>
        </div>

        {/* Animated Signal Connector */}
        <div className="relative flex items-center justify-center py-1" aria-hidden="true">
          <div className="h-7 w-px bg-gradient-to-b from-blue-500/70 via-cyan-400/70 to-purple-500/70" />
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [-10, 12, -10] }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            }
            className={`absolute h-2 w-2 rounded-full ${
              guardEnabled ? 'bg-cyan-300 shadow-[0_0_10px_#22d3ee]' : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'
            }`}
          />
        </div>

        {/* Node 2: Defense Engine Decision */}
        <div
          className={`rounded-xl border p-4 transition-colors duration-200 ${
            guardEnabled
              ? 'border-cyan-500/35 bg-cyan-950/20'
              : 'border-rose-500/35 bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-white">
              <Lock className={`h-3.5 w-3.5 ${guardEnabled ? 'text-cyan-300' : 'text-rose-300'}`} aria-hidden="true" />
              {guardEnabled ? 'Sanitization & Encoding Gate' : 'Raw Unescaped Sink (innerHTML)'}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                guardEnabled ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {guardEnabled ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Threat Blocked
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Script Executes
                </>
              )}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {guardEnabled
              ? 'HTML entities escaped and Content-Security-Policy enforced. Browser renders inert plain text.'
              : 'No encoding applied. Browser parses <script> tag into an executable JavaScript block.'}
          </p>
        </div>

        {/* Node 3: Simulated Browser Outcome */}
        <div className="rounded-xl border border-slate-800 bg-[#050814]/85 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Simulated Browser Output</span>
            <span className="font-mono tabular-nums">
              {guardEnabled ? 'CSP: script-src self' : 'Alert Popped (Simulated)'}
            </span>
          </div>

          {guardEnabled ? (
            <div className="mt-2.5 rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-3 py-2.5 font-mono text-xs text-emerald-200 break-all">
              {encodedOutput}
            </div>
          ) : (
            <div className="mt-2.5 rounded-lg border border-rose-500/35 bg-rose-950/30 px-3 py-2.5 text-xs text-rose-200">
              <span className="font-semibold">Simulated Alert Dialog:</span> &ldquo;Session&rdquo; — Unprotected DOM allowed script execution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
