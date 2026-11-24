import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Filter,
  Lock,
  Save,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  analyzePayload,
  encodeHtmlEntities,
  inspectSanitization,
} from '../utils/xssEngine';
import { SecurityReportEntry } from '../types/security';

interface ProtectionLabViewProps {
  sharedPayload: string;
  onPayloadChange: (value: string) => void;
  onLogRun: (entry: Omit<SecurityReportEntry, 'id' | 'timestamp'>) => void;
}

type TechniqueTab = 'encoding' | 'sanitization' | 'rendering';

const ENCODING_PRESETS = [
  {
    label: 'Script Tag',
    value: `<script>alert('XSS')</script>`,
  },
  {
    label: 'HTML Heading',
    value: `<h2 class="title">Welcome & "Hello"</h2>`,
  },
  {
    label: 'Attribute Quote',
    value: `" onmouseover="alert('Test')" data-user='guest'`,
  },
];

const SANITIZATION_PRESETS = [
  {
    label: 'Mixed HTML + Script',
    value: `<p>Workshop Notes</p><script>alert('Removed')</script><b>Stay Safe!</b>`,
  },
  {
    label: 'Event Handler Image',
    value: `<img src="badge.png" onerror="alert('Cookie')" alt="Student Badge">`,
  },
  {
    label: 'JavaScript Link',
    value: `<a href="javascript:alert('Blocked')" onclick="steal()">Profile Link</a>`,
  },
];

const RENDERING_PRESETS = [
  {
    label: 'SVG Vector',
    value: `<svg onload="alert('Simulated')"></svg>`,
  },
  {
    label: 'Script Block',
    value: `<script>console.log('Untrusted')</script>`,
  },
  {
    label: 'Safe Feedback',
    value: `Hello! 2 < 5 & "React" escapes text nodes safely.`,
  },
];

const ENTITY_LEGEND = [
  { char: '<', entity: '&lt;', meaning: 'Prevents opening new HTML tags' },
  { char: '>', entity: '&gt;', meaning: 'Prevents closing HTML tags' },
  { char: '&', entity: '&amp;', meaning: 'Prevents forging character entities' },
  { char: '"', entity: '&quot;', meaning: 'Prevents breaking double-quoted attributes' },
  { char: "'", entity: '&#x27;', meaning: 'Prevents breaking single-quoted attributes' },
  { char: '/', entity: '&#x2F;', meaning: 'Helps prevent closing tag breakouts' },
];

export default function ProtectionLabView({
  sharedPayload,
  onPayloadChange,
  onLogRun,
}: ProtectionLabViewProps) {
  const [activeTechnique, setActiveTechnique] = useState<TechniqueTab>('encoding');

  // Independent or synced inputs for the 3 dedicated labs
  const [encodingInput, setEncodingInput] = useState<string>(sharedPayload);
  const [sanitizationInput, setSanitizationInput] = useState<string>(
    `<p>Hello Student!</p><script>alert('XSS')</script><img src="avatar.png" onerror="alert('Event')" alt="Avatar">`
  );
  const [renderingInput, setRenderingInput] = useState<string>(sharedPayload);
  const [renderCompareMode, setRenderCompareMode] = useState<'unsafe' | 'secure' | 'both'>('both');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Compute deterministic outputs
  const encodedResult = encodeHtmlEntities(encodingInput);
  const encodingAnalysis = analyzePayload(encodingInput);
  const escapedCount = (encodingInput.match(/[<>&"'/]/g) ?? []).length;

  const sanitizationReport = inspectSanitization(sanitizationInput);
  const sanitizedAnalysis = analyzePayload(sanitizationReport.cleaned);

  const renderingAnalysis = analyzePayload(renderingInput);

  const handleSaveAudit = () => {
    const activeInput =
      activeTechnique === 'encoding'
        ? encodingInput
        : activeTechnique === 'sanitization'
        ? sanitizationInput
        : renderingInput;

    const trimmed = activeInput.trim();
    const defenseLabel =
      activeTechnique === 'encoding'
        ? 'Output Encoding'
        : activeTechnique === 'sanitization'
        ? 'Input Sanitization'
        : 'Secure React Rendering';

    if (!trimmed) {
      onLogRun({
        sourceModule: 'Protection Lab',
        context: 'Validation',
        payload: '(empty input)',
        severity: 'Low',
        outcome: 'Blocked',
        defenseMode: defenseLabel,
        ruleTriggered: 'Empty input rejected before transformation',
        inputCategory: 'Invalid',
        protectionPassed: true,
      });
      setSavedNotice(true);
      return;
    }

    const activeAnalysis = analyzePayload(activeInput);
    const isSuspicious = activeAnalysis.isMalicious || activeAnalysis.severity !== 'Safe';
    onLogRun({
      sourceModule: 'Protection Lab',
      context: 'Stored',
      payload: activeInput,
      severity: activeAnalysis.severity,
      outcome: isSuspicious ? 'Sanitized' : 'Allowed',
      defenseMode: defenseLabel,
      ruleTriggered: activeAnalysis.triggeredRules[0] ?? 'None (Safe plain text)',
      inputCategory: isSuspicious ? 'Suspicious' : 'Normal',
      protectionPassed: true,
    });
    setSavedNotice(true);
  };

  return (
    <div className="space-y-8 pb-8 pt-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Interactive Defensive Engineering</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Protection Lab
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Experiment with Output Encoding, Input Sanitization, and Secure React Rendering. Watch live before-and-after transformations without ever executing submitted markup.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAudit}
          className="inline-flex min-h-[42px] shrink-0 items-center gap-2 self-start rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/25"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{savedNotice ? 'Saved to Security Reports' : 'Log Lab Test to Reports'}</span>
        </button>
      </div>

      {/* Interactive 3-Technique Switcher */}
      <div
        role="tablist"
        aria-label="Protection Techniques"
        className="grid gap-3 sm:grid-cols-3"
      >
        <button
          role="tab"
          type="button"
          aria-selected={activeTechnique === 'encoding'}
          onClick={() => {
            setActiveTechnique('encoding');
            setSavedNotice(false);
          }}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            activeTechnique === 'encoding'
              ? 'border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_24px_-10px_rgba(6,182,212,0.5)]'
              : 'glass-panel hover:border-cyan-400/35'
          }`}
        >
          <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" aria-hidden="true" />
          <div>
            <div className="font-display text-sm font-bold text-white">
              1. Output Encoding
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Convert special characters into inert HTML entities.
            </div>
          </div>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTechnique === 'sanitization'}
          onClick={() => {
            setActiveTechnique('sanitization');
            setSavedNotice(false);
          }}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            activeTechnique === 'sanitization'
              ? 'border-purple-400/60 bg-purple-500/10 shadow-[0_0_24px_-10px_rgba(168,85,247,0.5)]'
              : 'glass-panel hover:border-purple-400/35'
          }`}
        >
          <Filter className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" aria-hidden="true" />
          <div>
            <div className="font-display text-sm font-bold text-white">
              2. Input Sanitization
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Strip dangerous tags, event handlers, and script URIs.
            </div>
          </div>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTechnique === 'rendering'}
          onClick={() => {
            setActiveTechnique('rendering');
            setSavedNotice(false);
          }}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            activeTechnique === 'rendering'
              ? 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_24px_-10px_rgba(16,185,129,0.45)]'
              : 'glass-panel hover:border-emerald-400/35'
          }`}
        >
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
          <div>
            <div className="font-display text-sm font-bold text-white">
              3. Secure Rendering
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Compare unsafe HTML parsing vs. React safe text nodes.
            </div>
          </div>
        </button>
      </div>

      {/* Animated Technique Workspace */}
      <AnimatePresence mode="wait">
        {/* TECHNIQUE 1: OUTPUT ENCODING */}
        {activeTechnique === 'encoding' && (
          <motion.section
            key="tech-encoding"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Output Encoding Laboratory"
            className="space-y-6"
          >
            <div className="gradient-border-card rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Output Encoding Transformer
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Enter sample HTML-like text to see how characters are escaped before rendering.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-950/25 px-3.5 py-2 text-xs font-semibold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span className="tabular-nums">
                    {escapedCount > 0
                      ? `Protected · ${escapedCount} Special Character(s) Encoded`
                      : 'Safe · No Special Characters Present'}
                  </span>
                </div>
              </div>

              {/* Interactive Input & Presets */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="encoding-lab-input"
                    className="text-xs font-semibold tracking-wider text-slate-300 uppercase"
                  >
                    Sample HTML-Like Input
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEncodingInput('');
                      onPayloadChange('');
                      setSavedNotice(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Clear Input</span>
                  </button>
                </div>

                <textarea
                  id="encoding-lab-input"
                  rows={3}
                  value={encodingInput}
                  onChange={(e) => {
                    setEncodingInput(e.target.value);
                    onPayloadChange(e.target.value);
                    setSavedNotice(false);
                  }}
                  placeholder="Type HTML-like text such as <script>alert('Hi')</script>..."
                  className="w-full rounded-xl border border-slate-700/80 bg-[#050814] p-3.5 font-mono text-xs leading-relaxed text-cyan-200 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Try sample:</span>
                  {ENCODING_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setEncodingInput(preset.value);
                        onPayloadChange(preset.value);
                        setSavedNotice(false);
                      }}
                      className="min-h-[34px] rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Before vs After Animated Comparison */}
              <div className="grid items-stretch gap-4 lg:grid-cols-11">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-4 lg:col-span-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-200">
                      Before (Original Input)
                    </span>
                    <span className="font-mono text-rose-300">
                      {encodingAnalysis.isMalicious ? 'Executable Risk' : 'Unescaped'}
                    </span>
                  </div>
                  <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-rose-100 whitespace-pre-wrap break-all">
                    <code>{encodingInput || '(empty input)'}</code>
                  </pre>
                </div>

                <div className="flex items-center justify-center lg:col-span-1" aria-hidden="true">
                  <motion.div
                    key={encodedResult}
                    initial={{ scale: 0.85, opacity: 0.4 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
                  </motion.div>
                </div>

                <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/15 p-4 lg:col-span-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-200">
                      After (Safely Encoded)
                    </span>
                    <span className="font-mono text-emerald-300">Inert Text</span>
                  </div>
                  <motion.pre
                    key={encodedResult}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-100 whitespace-pre-wrap break-all"
                  >
                    <code>{encodedResult || '(empty input)'}</code>
                  </motion.pre>
                </div>
              </div>

              {/* Character Mapping Reference + Educational Explanation */}
              <div className="grid gap-5 border-t border-slate-800/80 pt-5 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-5">
                  <h3 className="font-display text-base font-semibold text-white">
                    How Output Encoding Prevents XSS
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                    Browsers decide where HTML tags start and end by looking for control characters such as <code className="text-cyan-300">&lt;</code>, <code className="text-cyan-300">&gt;</code>, and quotes. Output encoding replaces those delimiters with harmless HTML entities (<code className="text-emerald-300">&amp;lt;</code>, <code className="text-emerald-300">&amp;gt;</code>) so the HTML parser prints literal characters on screen instead of building executable DOM nodes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:col-span-7">
                  {ENTITY_LEGEND.map((item) => {
                    const isUsed = encodingInput.includes(item.char);
                    return (
                      <div
                        key={item.char}
                        className={`rounded-xl border p-3 transition-colors ${
                          isUsed
                            ? 'border-cyan-400/50 bg-cyan-500/10'
                            : 'border-slate-800 bg-[#050814]/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-rose-300">{item.char}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-semibold text-emerald-300">
                            {item.entity}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-400">
                          {item.meaning}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* TECHNIQUE 2: INPUT SANITIZATION */}
        {activeTechnique === 'sanitization' && (
          <motion.section
            key="tech-sanitization"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Input Sanitization Laboratory"
            className="space-y-6"
          >
            <div className="gradient-border-card rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Input Sanitization Filter
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Inspect how dangerous HTML tags, inline event-handler attributes, and script URIs are stripped.
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                    sanitizedAnalysis.isMalicious
                      ? 'border-amber-500/40 bg-amber-950/25 text-amber-200'
                      : 'border-emerald-500/35 bg-emerald-950/25 text-emerald-200'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span className="tabular-nums">
                    {sanitizationReport.totalRemovedCount > 0
                      ? `Sanitized · ${sanitizationReport.totalRemovedCount} Dangerous Pattern(s) Removed`
                      : 'Clean · No Unsafe Elements Detected'}
                  </span>
                </div>
              </div>

              {/* Interactive Input & Presets */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="sanitization-lab-input"
                    className="text-xs font-semibold tracking-wider text-slate-300 uppercase"
                  >
                    Sample HTML Input
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSanitizationInput('');
                      setSavedNotice(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Clear Input</span>
                  </button>
                </div>

                <textarea
                  id="sanitization-lab-input"
                  rows={3}
                  value={sanitizationInput}
                  onChange={(e) => {
                    setSanitizationInput(e.target.value);
                    setSavedNotice(false);
                  }}
                  placeholder="Enter sample HTML containing <script>, onerror=, or javascript:..."
                  className="w-full rounded-xl border border-slate-700/80 bg-[#050814] p-3.5 font-mono text-xs leading-relaxed text-purple-200 placeholder:text-slate-600 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Try sample:</span>
                  {SANITIZATION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSanitizationInput(preset.value);
                        setSavedNotice(false);
                      }}
                      className="min-h-[34px] rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-purple-400/50 hover:text-purple-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Before vs After Comparison */}
              <div className="grid items-stretch gap-4 lg:grid-cols-11">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-4 lg:col-span-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-200">
                      Before (Untrusted HTML)
                    </span>
                    <span className="font-mono text-rose-300">Raw Input</span>
                  </div>
                  <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-rose-100 whitespace-pre-wrap break-all">
                    <code>{sanitizationInput || '(empty input)'}</code>
                  </pre>
                </div>

                <div className="flex items-center justify-center lg:col-span-1" aria-hidden="true">
                  <motion.div
                    key={sanitizationReport.cleaned}
                    initial={{ scale: 0.85, opacity: 0.4 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/15 text-purple-300"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
                  </motion.div>
                </div>

                <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/15 p-4 lg:col-span-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-200">
                      After (Cleaned Output)
                    </span>
                    <span className="font-mono text-emerald-300">Sanitized</span>
                  </div>
                  <motion.pre
                    key={sanitizationReport.cleaned}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-100 whitespace-pre-wrap break-all"
                  >
                    <code>
                      {!sanitizationInput.trim()
                        ? '(empty input)'
                        : sanitizationReport.cleaned ||
                          '(all content removed because the input contained only active script markup)'}
                    </code>
                  </motion.pre>
                </div>
              </div>

              {/* Removed Items Breakdown & Process Explanation */}
              <div className="grid gap-5 border-t border-slate-800/80 pt-5 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-5">
                  <h3 className="font-display text-base font-semibold text-white">
                    How Input Sanitization Works
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                    When an application needs to accept limited formatting (such as <code className="text-cyan-300">&lt;b&gt;</code> or <code className="text-cyan-300">&lt;p&gt;</code>), an allowlist sanitizer parses the markup, discards active elements like <code className="text-rose-300">&lt;script&gt;</code> or <code className="text-rose-300">&lt;svg&gt;</code>, strips inline event attributes (<code className="text-orange-300">onerror=</code>, <code className="text-orange-300">onclick=</code>), and blocks <code className="text-purple-300">javascript:</code> URIs.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
                  <div className="rounded-xl border border-slate-800 bg-[#050814]/80 p-3.5">
                    <div className="text-xs font-semibold text-rose-300">
                      Removed Tags ({sanitizationReport.removedTags.length})
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300 break-all">
                      {sanitizationReport.removedTags.length > 0
                        ? sanitizationReport.removedTags.map((t, i) => (
                            <div key={i} className="rounded bg-rose-500/10 px-2 py-1 text-rose-200">
                              {t}
                            </div>
                          ))
                        : 'None detected'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#050814]/80 p-3.5">
                    <div className="text-xs font-semibold text-orange-300">
                      Stripped Events ({sanitizationReport.removedEventHandlers.length})
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300 break-all">
                      {sanitizationReport.removedEventHandlers.length > 0
                        ? sanitizationReport.removedEventHandlers.map((ev, i) => (
                            <div key={i} className="rounded bg-orange-500/10 px-2 py-1 text-orange-200">
                              {ev}
                            </div>
                          ))
                        : 'None detected'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#050814]/80 p-3.5">
                    <div className="text-xs font-semibold text-purple-300">
                      Blocked URIs ({sanitizationReport.neutralizedUris.length})
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300 break-all">
                      {sanitizationReport.neutralizedUris.length > 0
                        ? sanitizationReport.neutralizedUris.map((u, i) => (
                            <div key={i} className="rounded bg-purple-500/10 px-2 py-1 text-purple-200">
                              {u}
                            </div>
                          ))
                        : 'None detected'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* TECHNIQUE 3: SECURE RENDERING */}
        {activeTechnique === 'rendering' && (
          <motion.section
            key="tech-rendering"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Secure Rendering Laboratory"
            className="space-y-6"
          >
            <div className="gradient-border-card rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Unsafe HTML Interpretation vs. Safe React Text Rendering
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Compare what happens conceptually inside an unsafe sink versus React&apos;s built-in text escaping.
                  </p>
                </div>

                <div className="inline-flex max-w-full flex-wrap rounded-xl border border-slate-800 bg-slate-900/85 p-1">
                  <button
                    type="button"
                    onClick={() => setRenderCompareMode('unsafe')}
                    className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      renderCompareMode === 'unsafe'
                        ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unsafe Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenderCompareMode('secure')}
                    className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      renderCompareMode === 'secure'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Secure Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenderCompareMode('both')}
                    className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      renderCompareMode === 'both'
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>
              </div>

              {/* Interactive Input & Presets */}
              <div className="space-y-3">
                <label
                  htmlFor="rendering-lab-input"
                  className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                  Untrusted User String to Render
                </label>
                <textarea
                  id="rendering-lab-input"
                  rows={2}
                  value={renderingInput}
                  onChange={(e) => {
                    setRenderingInput(e.target.value);
                    onPayloadChange(e.target.value);
                    setSavedNotice(false);
                  }}
                  placeholder="Enter text or HTML-like payload..."
                  className="w-full rounded-xl border border-slate-700/80 bg-[#050814] p-3.5 font-mono text-xs text-emerald-200 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Try sample:</span>
                  {RENDERING_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setRenderingInput(preset.value);
                        onPayloadChange(preset.value);
                        setSavedNotice(false);
                      }}
                      className="min-h-[34px] rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-400/50 hover:text-emerald-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Comparison Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={renderCompareMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className={`grid gap-5 ${
                    renderCompareMode === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {(renderCompareMode === 'unsafe' || renderCompareMode === 'both') && (
                    <div className="rounded-2xl border border-rose-500/40 bg-rose-950/15 p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-rose-200">
                          <ShieldAlert className="h-4 w-4 text-rose-400" aria-hidden="true" />
                          <span>Unsafe HTML Sink (Conceptual)</span>
                        </div>
                        <span className="font-mono text-xs text-rose-300">
                          {renderingAnalysis.isMalicious ? 'Vulnerable' : 'Risky Pattern'}
                        </span>
                      </div>

                      <pre className="overflow-x-auto rounded-xl border border-rose-500/25 bg-[#0a0612] p-3 font-mono text-xs text-rose-200">
                        <code>{`// Anti-Pattern: Do NOT do this\nelement.innerHTML = untrustedInput;`}</code>
                      </pre>

                      <div className="rounded-xl border border-rose-500/30 bg-[#050814]/85 p-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-300">
                          Conceptual Browser Result:
                        </div>
                        {renderingAnalysis.isMalicious ? (
                          <div className="flex items-start gap-2 text-xs text-rose-200">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                            <span>
                              The HTML parser treats this string as active DOM elements ({renderingAnalysis.vectorCategory}). {renderingAnalysis.simulatedImpact}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300">
                            Plain text displays normally here, but the unescaped sink remains exposed if another user submits HTML or script syntax.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(renderCompareMode === 'secure' || renderCompareMode === 'both') && (
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/15 p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                          <span>Safe React Text Rendering</span>
                        </div>
                        <span className="font-mono text-xs text-emerald-300">
                          Protected
                        </span>
                      </div>

                      <pre className="overflow-x-auto rounded-xl border border-emerald-500/25 bg-[#050c12] p-3 font-mono text-xs text-emerald-200">
                        <code>{`// Safe React JSX Binding\n<p className="comment">{untrustedInput}</p>`}</code>
                      </pre>

                      <div className="rounded-xl border border-emerald-500/30 bg-[#050814]/85 p-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-300">
                          Actual Safe Rendered Output:
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-[#060b19] p-3 font-mono text-xs text-emerald-100 break-all">
                          {renderingInput || '(empty string)'}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Educational Explanation */}
              <div className="rounded-xl border border-slate-800 bg-[#050814]/75 p-5 space-y-2">
                <h3 className="font-display text-base font-semibold text-white">
                  Why React Text Rendering Is Safer for Untrusted Input
                </h3>
                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  When you pass a variable inside JSX braces like <code className="text-emerald-300">{`{userComment}`}</code>, React inserts it as a browser Text Node (equivalent to <code className="text-cyan-300">element.textContent</code>) and escapes HTML characters automatically. Even if an attacker types <code className="text-rose-300">&lt;script&gt;</code> or <code className="text-rose-300">&lt;svg onload=...&gt;</code>, the browser displays the characters harmlessly instead of executing them.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
