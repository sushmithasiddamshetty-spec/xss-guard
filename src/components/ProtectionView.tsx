import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Save,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  analyzePayload,
  encodeHtmlEntities,
  inspectSanitization,
} from '../utils/xssEngine';
import { SecurityReportEntry } from '../types/security';
import { ProtectionPipelineDiagram } from './EditorialDiagrams';
import { LUXURY_EASE, LuxuryMediaFrame, Reveal, SegmentedControl } from './LuxuryPrimitives';
import protectionPrismImg from '../assets/images/story_protection_prism_1795544897487.jpg';

interface ProtectionViewProps {
  sharedPayload: string;
  onPayloadChange: (value: string) => void;
  onLogRun: (entry: Omit<SecurityReportEntry, 'id' | 'timestamp'>) => void;
}

type TechniqueTab = 'encoding' | 'sanitization' | 'rendering';

const ENCODING_PRESETS = [
  { label: 'Script Tag', value: `<script>alert('XSS')</script>` },
  { label: 'HTML Heading', value: `<h2 class="title">Welcome & "Hello"</h2>` },
  { label: 'Attribute Quote', value: `" onmouseover="alert('Test')" data-user='guest'` },
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
  { label: 'SVG Vector', value: `<svg onload="alert('Simulated')"></svg>` },
  { label: 'Script Block', value: `<script>console.log('Untrusted')</script>` },
  { label: 'Safe Feedback', value: `Hello! 2 < 5 & "React" escapes text nodes safely.` },
];

const ENTITY_LEGEND = [
  { char: '<', entity: '&lt;', meaning: 'Prevents opening tags' },
  { char: '>', entity: '&gt;', meaning: 'Prevents closing tags' },
  { char: '&', entity: '&amp;', meaning: 'Prevents entity forging' },
  { char: '"', entity: '&quot;', meaning: 'Protects double quotes' },
  { char: "'", entity: '&#x27;', meaning: 'Protects single quotes' },
  { char: '/', entity: '&#x2F;', meaning: 'Prevents tag breakouts' },
];

export default function ProtectionView({
  sharedPayload,
  onPayloadChange,
  onLogRun,
}: ProtectionViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTechnique, setActiveTechnique] = useState<TechniqueTab>('encoding');
  const [encodingInput, setEncodingInput] = useState<string>(sharedPayload);
  const [sanitizationInput, setSanitizationInput] = useState<string>(
    `<p>Hello Student!</p><script>alert('XSS')</script><img src="avatar.png" onerror="alert('Event')" alt="Avatar">`
  );
  const [renderingInput, setRenderingInput] = useState<string>(sharedPayload);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const encodedResult = encodeHtmlEntities(encodingInput);
  const escapedCount = (encodingInput.match(/[<>&"'/]/g) ?? []).length;

  const sanitizationReport = inspectSanitization(sanitizationInput);
  const renderingAnalysis = analyzePayload(renderingInput);

  const activeStageIndex =
    activeTechnique === 'encoding' || activeTechnique === 'sanitization' ? 2 : 3;

  const handleSaveResult = () => {
    const activeInput =
      activeTechnique === 'encoding'
        ? encodingInput
        : activeTechnique === 'sanitization'
        ? sanitizationInput
        : renderingInput;

    const defenseLabel =
      activeTechnique === 'encoding'
        ? 'Output Encoding'
        : activeTechnique === 'sanitization'
        ? 'Input Sanitization'
        : 'Safe React Rendering';

    if (!activeInput.trim()) {
      onLogRun({
        sourceModule: 'Protection',
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

    const analysis = analyzePayload(activeInput);
    const isSuspicious = analysis.isMalicious || analysis.severity !== 'Safe';
    onLogRun({
      sourceModule: 'Protection',
      context: 'Stored',
      payload: activeInput,
      severity: analysis.severity,
      outcome: isSuspicious ? 'Sanitized' : 'Allowed',
      defenseMode: defenseLabel,
      ruleTriggered: analysis.triggeredRules[0] ?? 'None (Safe plain text)',
      inputCategory: isSuspicious ? 'Suspicious' : 'Normal',
      protectionPassed: true,
    });
    setSavedNotice(true);
  };

  return (
    <div className="space-y-0">
      {/* 1. EDITORIAL HEADER + HAPPY VS EXCEPTION PATH — Cream (#F4EFE6) */}
      <section className="bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-14 px-6 pt-20 pb-20 sm:px-10 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 border-b border-[rgba(20,17,15,0.08)] pb-10 sm:flex-row sm:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label">The Protection System</div>
                <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] [text-wrap:balance] sm:text-5xl lg:text-[4rem]">
                  How modern web apps neutralize unsafe{' '}
                  <span className="italic text-[#0F1F1A]">input.</span>
                </h1>
                <p className="text-[17px] leading-[1.7] text-[rgba(20,17,15,0.62)] sm:text-[18px]">
                  Follow the defense pipeline from raw input through validation, sanitization or encoding, and safe plain-text rendering.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveResult}
                className="btn-secondary self-start px-6 py-3 text-[15px]"
              >
                <Save className="h-4 w-4 text-[#7C6238]" aria-hidden="true" />
                <span>{savedNotice ? 'Saved to Results' : 'Save Test to Results'}</span>
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                <div className="luxury-card space-y-2.5 p-7">
                  <div className="editorial-label text-[#1D4D3C]">Happy Path</div>
                  <h2 className="font-display text-2xl font-normal text-[#14110F]">
                    Trusted plain prose flows cleanly.
                  </h2>
                  <p className="text-[16px] leading-[1.7] text-[rgba(20,17,15,0.62)]">
                    A user enters a normal comment. The website processes it safely and displays it correctly inside a text node.
                  </p>
                </div>

                <div className="luxury-card space-y-2.5 p-7">
                  <div className="editorial-label text-[#8C2F3F]">Exception Path</div>
                  <h2 className="font-display text-2xl font-normal text-[#14110F]">
                    Untrusted markup is intercepted.
                  </h2>
                  <p className="text-[16px] leading-[1.7] text-[rgba(20,17,15,0.62)]">
                    A user enters unexpected or unsafe content. The website detects, sanitizes, or escapes it instead of treating it as trusted HTML.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 lg:-mr-8">
                <LuxuryMediaFrame
                  src={protectionPrismImg}
                  alt="Macro detail of beveled optical glass shield plates trimmed in brushed brass resting on deep forest slate"
                  aspectClassName="aspect-[16/10]"
                  revealOnScroll={false}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. FULL-WIDTH DEEP FOREST (#0F1F1A) PROTECTION STAGE */}
      <section className="border-t border-[rgba(244,239,230,0.12)] bg-[#0F1F1A] text-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-14 px-6 py-24 sm:px-10 sm:py-28 lg:py-[152px]">
          <Reveal>
            <ProtectionPipelineDiagram
              surface="dark"
              activeStageIndex={activeStageIndex}
              onSelectStage={(idx) => {
                if (idx <= 2) {
                  setActiveTechnique(
                    activeTechnique === 'sanitization' ? 'sanitization' : 'encoding'
                  );
                } else {
                  setActiveTechnique('rendering');
                }
                setSavedNotice(false);
              }}
            />
          </Reveal>

          <div>
            <SegmentedControl
              ariaLabel="Protection Techniques"
              layoutId="protection-technique-tab"
              surface="dark"
              value={activeTechnique}
              onChange={(id) => {
                setActiveTechnique(id);
                setSavedNotice(false);
              }}
              options={[
                { id: 'encoding', label: '01 · Output Encoding' },
                { id: 'sanitization', label: '02 · Input Sanitization' },
                { id: 'rendering', label: '03 · Safe Output' },
              ]}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTechnique === 'encoding' && (
              <motion.section
                key="tech-encoding"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: LUXURY_EASE }}
                className="luxury-card space-y-8 p-7 text-[#14110F] sm:p-10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(20,17,15,0.08)] pb-6">
                  <div className="space-y-1.5">
                    <h2 className="font-display text-3xl font-normal text-[#14110F] sm:text-4xl">
                      Output <span className="italic text-[#0F1F1A]">Encoding</span>
                    </h2>
                    <p className="text-[16px] leading-[1.65] text-[rgba(20,17,15,0.62)]">
                      Replaces structural HTML delimiters with literal character entities so browsers display text instead of markup.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[15px] font-medium text-[#1D4D3C] tabular-nums">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>{escapedCount} special character(s) encoded</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="enc-input"
                      className="editorial-label"
                    >
                      Raw Input
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEncodingInput('');
                        onPayloadChange('');
                        setSavedNotice(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[rgba(20,17,15,0.62)] hover:text-[#14110F]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <textarea
                    id="enc-input"
                    rows={2}
                    value={encodingInput}
                    onChange={(e) => {
                      setEncodingInput(e.target.value);
                      onPayloadChange(e.target.value);
                      setSavedNotice(false);
                    }}
                    placeholder="Type HTML-like syntax..."
                    className="w-full rounded-xl border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] p-4 font-mono text-[13px] text-[#14110F] focus:border-[#B79B6B] focus:bg-[#FBF8F2] focus:outline-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    {ENCODING_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setEncodingInput(p.value);
                          onPayloadChange(p.value);
                          setSavedNotice(false);
                        }}
                        className="min-h-[36px] rounded-full border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] px-4 py-1 text-[13px] font-medium text-[rgba(20,17,15,0.7)] transition-colors hover:border-[#14110F] hover:text-[#14110F]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid items-stretch gap-5 lg:grid-cols-11">
                  <div className="luxury-code-block space-y-2.5 p-5 lg:col-span-5">
                    <div className="text-[15px] font-semibold text-[#E2A4AE]">
                      Before (Original Input)
                    </div>
                    <pre className="code-danger-highlight overflow-x-auto rounded-lg p-3.5 font-mono text-[13px] whitespace-pre-wrap break-all">
                      <code>{encodingInput || '(empty)'}</code>
                    </pre>
                  </div>

                  <div
                    className="flex items-center justify-center lg:col-span-1"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 text-[#B79B6B] lg:rotate-0" />
                  </div>

                  <div className="luxury-code-block space-y-2.5 p-5 lg:col-span-5">
                    <div className="text-[15px] font-semibold text-[#8FBFA6]">
                      After (Encoded Entities)
                    </div>
                    <pre className="code-safe-highlight overflow-x-auto rounded-lg p-3.5 font-mono text-[13px] whitespace-pre-wrap break-all">
                      <code>{encodedResult || '(empty)'}</code>
                    </pre>
                  </div>
                </div>

                {/* Engraved Entity Chips */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-[rgba(20,17,15,0.08)] pt-7 sm:grid-cols-3 lg:grid-cols-6">
                  {ENTITY_LEGEND.map((item) => {
                    const active = encodingInput.includes(item.char);
                    return (
                      <div
                        key={item.char}
                        className={`engraved-tile p-4 ${
                          active
                            ? 'border-[#B79B6B] bg-[#F4EFE6]'
                            : 'bg-[#FBF8F2]'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-mono text-[14px]">
                          <span className="text-[#8C2F3F]">{item.char}</span>
                          <span className="text-[#B79B6B]">→</span>
                          <span className="font-semibold text-[#1D4D3C]">{item.entity}</span>
                        </div>
                        <div className="mt-2 text-[15px] leading-snug text-[rgba(20,17,15,0.62)]">
                          {item.meaning}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {activeTechnique === 'sanitization' && (
              <motion.section
                key="tech-sanitization"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: LUXURY_EASE }}
                className="luxury-card space-y-8 p-7 text-[#14110F] sm:p-10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(20,17,15,0.08)] pb-6">
                  <div className="space-y-1.5">
                    <h2 className="font-display text-3xl font-normal text-[#14110F] sm:text-4xl">
                      Input <span className="italic text-[#0F1F1A]">Sanitization</span>
                    </h2>
                    <p className="text-[16px] leading-[1.65] text-[rgba(20,17,15,0.62)]">
                      Strips active script tags, inline event handlers, and dangerous URIs while preserving benign formatting.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[15px] font-medium text-[#1D4D3C] tabular-nums">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>{sanitizationReport.totalRemovedCount} unsafe pattern(s) stripped</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="san-input" className="editorial-label">
                      HTML Input
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSanitizationInput('');
                        setSavedNotice(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[rgba(20,17,15,0.62)] hover:text-[#14110F]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <textarea
                    id="san-input"
                    rows={2}
                    value={sanitizationInput}
                    onChange={(e) => {
                      setSanitizationInput(e.target.value);
                      setSavedNotice(false);
                    }}
                    placeholder="Enter HTML with <script>, onerror=, or javascript:..."
                    className="w-full rounded-xl border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] p-4 font-mono text-[13px] text-[#14110F] focus:border-[#B79B6B] focus:bg-[#FBF8F2] focus:outline-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    {SANITIZATION_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setSanitizationInput(p.value);
                          setSavedNotice(false);
                        }}
                        className="min-h-[36px] rounded-full border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] px-4 py-1 text-[13px] font-medium text-[rgba(20,17,15,0.7)] transition-colors hover:border-[#14110F] hover:text-[#14110F]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid items-stretch gap-5 lg:grid-cols-11">
                  <div className="luxury-code-block space-y-2.5 p-5 lg:col-span-5">
                    <div className="text-[15px] font-semibold text-[#E2A4AE]">
                      Before (Untrusted HTML)
                    </div>
                    <pre className="code-danger-highlight overflow-x-auto rounded-lg p-3.5 font-mono text-[13px] whitespace-pre-wrap break-all">
                      <code>{sanitizationInput || '(empty)'}</code>
                    </pre>
                  </div>

                  <div
                    className="flex items-center justify-center lg:col-span-1"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 text-[#B79B6B] lg:rotate-0" />
                  </div>

                  <div className="luxury-code-block space-y-2.5 p-5 lg:col-span-5">
                    <div className="text-[15px] font-semibold text-[#8FBFA6]">
                      After (Cleaned Output)
                    </div>
                    <pre className="code-safe-highlight overflow-x-auto rounded-lg p-3.5 font-mono text-[13px] whitespace-pre-wrap break-all">
                      <code>
                        {!sanitizationInput.trim()
                          ? '(empty)'
                          : sanitizationReport.cleaned || '(all active markup removed)'}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-[rgba(20,17,15,0.08)] pt-7 sm:grid-cols-3">
                  <div className="engraved-tile space-y-2.5 bg-[#F4EFE6] p-5">
                    <div className="text-[15px] font-semibold text-[#8C2F3F] tabular-nums">
                      Removed Tags ({sanitizationReport.removedTags.length})
                    </div>
                    <div className="space-y-1.5 font-mono text-[12px] text-[rgba(20,17,15,0.7)] break-all">
                      {sanitizationReport.removedTags.length > 0
                        ? sanitizationReport.removedTags.map((t, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-[rgba(20,17,15,0.08)] bg-[#FBF8F2] px-2.5 py-1.5"
                            >
                              {t}
                            </div>
                          ))
                        : 'None'}
                    </div>
                  </div>

                  <div className="engraved-tile space-y-2.5 bg-[#F4EFE6] p-5">
                    <div className="text-[15px] font-semibold text-[#7C6238] tabular-nums">
                      Stripped Events ({sanitizationReport.removedEventHandlers.length})
                    </div>
                    <div className="space-y-1.5 font-mono text-[12px] text-[rgba(20,17,15,0.7)] break-all">
                      {sanitizationReport.removedEventHandlers.length > 0
                        ? sanitizationReport.removedEventHandlers.map((ev, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-[rgba(20,17,15,0.08)] bg-[#FBF8F2] px-2.5 py-1.5"
                            >
                              {ev}
                            </div>
                          ))
                        : 'None'}
                    </div>
                  </div>

                  <div className="engraved-tile space-y-2.5 bg-[#F4EFE6] p-5">
                    <div className="text-[15px] font-semibold text-[#8C2F3F] tabular-nums">
                      Blocked URIs ({sanitizationReport.neutralizedUris.length})
                    </div>
                    <div className="space-y-1.5 font-mono text-[12px] text-[rgba(20,17,15,0.7)] break-all">
                      {sanitizationReport.neutralizedUris.length > 0
                        ? sanitizationReport.neutralizedUris.map((u, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-[rgba(20,17,15,0.08)] bg-[#FBF8F2] px-2.5 py-1.5"
                            >
                              {u}
                            </div>
                          ))
                        : 'None'}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {activeTechnique === 'rendering' && (
              <motion.section
                key="tech-rendering"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: LUXURY_EASE }}
                className="luxury-card space-y-8 p-7 text-[#14110F] sm:p-10"
              >
                <div className="space-y-1.5 border-b border-[rgba(20,17,15,0.08)] pb-6">
                  <h2 className="font-display text-3xl font-normal text-[#14110F] sm:text-4xl">
                    Unsafe DOM Sink vs. Safe{' '}
                    <span className="italic text-[#0F1F1A]">Output</span>
                  </h2>
                  <p className="text-[16px] leading-[1.65] text-[rgba(20,17,15,0.62)]">
                    React binds expressions inside JSX braces as DOM Text Nodes (equivalent to{' '}
                    <code className="text-[#14110F]">textContent</code>), preventing HTML parsing.
                  </p>
                </div>

                <div className="space-y-3">
                  <label htmlFor="ren-input" className="editorial-label block">
                    Untrusted Input String
                  </label>
                  <textarea
                    id="ren-input"
                    rows={2}
                    value={renderingInput}
                    onChange={(e) => {
                      setRenderingInput(e.target.value);
                      onPayloadChange(e.target.value);
                      setSavedNotice(false);
                    }}
                    className="w-full rounded-xl border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] p-4 font-mono text-[13px] text-[#14110F] focus:border-[#B79B6B] focus:bg-[#FBF8F2] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {RENDERING_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setRenderingInput(p.value);
                          onPayloadChange(p.value);
                          setSavedNotice(false);
                        }}
                        className="min-h-[36px] rounded-full border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] px-4 py-1 text-[13px] font-medium text-[rgba(20,17,15,0.7)] transition-colors hover:border-[#14110F] hover:text-[#14110F]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="luxury-code-block space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#E2A4AE]">
                        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                        <span>Unsafe HTML Sink (Conceptual)</span>
                      </span>
                      <span className="editorial-label-dark text-[#E2A4AE]">
                        {renderingAnalysis.isMalicious ? 'Vulnerable' : 'Risky Sink'}
                      </span>
                    </div>
                    <pre className="code-danger-highlight rounded-lg p-4 font-mono text-[13px]">
                      <code>{`element.innerHTML = untrustedInput;`}</code>
                    </pre>
                    <p className="font-sans text-[15px] leading-[1.65] text-[rgba(244,239,230,0.68)]">
                      {renderingAnalysis.isMalicious
                        ? `${renderingAnalysis.vectorCategory}: ${renderingAnalysis.simulatedImpact}`
                        : 'Plaintext renders here, but unescaped sinks stay vulnerable to HTML injection.'}
                    </p>
                  </div>

                  <div className="luxury-code-block space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#8FBFA6]">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        <span>Safe React JSX Binding</span>
                      </span>
                      <span className="editorial-label-dark text-[#8FBFA6]">Protected</span>
                    </div>
                    <pre className="code-safe-highlight rounded-lg p-4 font-mono text-[13px]">
                      <code>{`<p>{untrustedInput}</p>`}</code>
                    </pre>
                    <div className="rounded-lg border border-[rgba(244,239,230,0.14)] bg-[#1B1715] p-4 font-mono text-[13px] text-[#F4EFE6] break-all">
                      {renderingInput || '(empty)'}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. PRE-FOOTER RETURN TO CREAM (#F4EFE6) */}
      <section className="bg-[#F4EFE6] py-16 sm:py-20">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center sm:px-10">
          <div className="space-y-1.5">
            <div className="editorial-label">Verification Ledger</div>
            <p className="text-[17px] leading-[1.7] text-[rgba(20,17,15,0.68)]">
              Save any encoding or sanitization test above to inspect it inside your Results history.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveResult}
            className="btn-primary px-6 py-3 text-[15px]"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>{savedNotice ? 'Saved to Results' : 'Save Current Test'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
