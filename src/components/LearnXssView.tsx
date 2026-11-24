import { useState } from 'react';
import { ArrowRight, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { XSS_TYPES_GUIDE } from '../data/xssContent';
import { NavPageId } from '../types/security';
import { ThreatIllustration } from './EditorialDiagrams';
import {
  LUXURY_EASE,
  LuxuryMediaFrame,
  Reveal,
  SegmentedControl,
} from './LuxuryPrimitives';

import storedVaultImg from '../assets/images/threat_stored_vault_1795542573790.jpg';
import reflectedMirrorImg from '../assets/images/threat_reflected_mirror_1795542574221.jpg';
import domLayersImg from '../assets/images/threat_dom_layers_1795542574723.jpg';

const THREAT_IMAGES: Record<'stored' | 'reflected' | 'dom', { src: string; alt: string }> = {
  stored: {
    src: storedVaultImg,
    alt: 'Architectural study of matte obsidian storage vessel and three frosted glass display panels',
  },
  reflected: {
    src: reflectedMirrorImg,
    alt: 'Architectural study of deep forest ceramic block facing a beveled optical mirror',
  },
  dom: {
    src: domLayersImg,
    alt: 'Architectural study of layered frosted glass planes mounted with champagne brass pins',
  },
};

interface LearnXssViewProps {
  onNavigate: (page: NavPageId) => void;
}

export default function LearnXssView({ onNavigate }: LearnXssViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<'stored' | 'reflected' | 'dom'>('stored');
  const [flowMode, setFlowMode] = useState<'unsafe' | 'safe'>('safe');
  const [visualView, setVisualView] = useState<'study' | 'schematic'>('study');
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const orderedModules = [
    XSS_TYPES_GUIDE.find((m) => m.id === 'stored')!,
    XSS_TYPES_GUIDE.find((m) => m.id === 'reflected')!,
    XSS_TYPES_GUIDE.find((m) => m.id === 'dom')!,
  ];

  const activeType =
    orderedModules.find((item) => item.id === selectedId) ?? orderedModules[0];
  const activeVisual = THREAT_IMAGES[activeType.id];

  return (
    <div className="space-y-0">
      {/* 1. EDITORIAL HEADER + THREAT STUDY (Cream #F4EFE6) */}
      <section className="bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-12 px-6 pt-20 pb-24 sm:px-10 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-[148px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 border-b border-[rgba(20,17,15,0.08)] pb-10 sm:flex-row sm:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label">Understand the Threats</div>
                <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] [text-wrap:balance] sm:text-5xl lg:text-[4rem]">
                  How Cross-Site Scripting <span className="italic text-[#0F1F1A]">occurs.</span>
                </h1>
                <p className="text-[17px] leading-[1.7] text-[rgba(20,17,15,0.62)] sm:text-[18px]">
                  Select a threat pattern to examine how untrusted text flows through an unprotected page compared with an escaped boundary.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('playground')}
                className="btn-primary self-start px-6 py-3 text-[15px]"
              >
                <span>Test in Playground</span>
                <ArrowRight className="btn-arrow h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          {/* Segmented Switcher */}
          <div>
            <SegmentedControl
              ariaLabel="XSS Threat Types"
              layoutId="learn-threat-tab"
              value={selectedId}
              onChange={setSelectedId}
              options={orderedModules.map((item, idx) => ({
                id: item.id,
                label: `0${idx + 1} · ${item.title}`,
              }))}
            />
          </div>

          {/* Summary + Oversized Bleeding 3D Study Split */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: LUXURY_EASE }}
              className="grid items-center gap-12 lg:grid-cols-12"
            >
              <div className="space-y-6 lg:col-span-6">
                <h2 className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.02em] text-[#14110F] sm:text-5xl">
                  {activeType.title}
                </h2>
                <p className="text-[17px] leading-[1.7] text-[rgba(20,17,15,0.62)] sm:text-[18px]">
                  {activeType.summary}
                </p>
                <div className="space-y-3 border-t border-[rgba(20,17,15,0.08)] pt-6">
                  <div className="editorial-label">Everyday Example</div>
                  <p className="text-[16px] leading-[1.7] text-[rgba(20,17,15,0.68)]">
                    {activeType.scenario}
                  </p>
                  <div className="luxury-code-block px-5 py-3.5 text-[13px] break-all">
                    <span className="code-danger-highlight inline-block rounded px-2 py-0.5">
                      {activeType.exampleInput}
                    </span>
                  </div>
                </div>
              </div>

              <div className="luxury-card space-y-5 p-6 lg:col-span-6 lg:-mr-10 xl:-mr-16">
                <div className="flex items-center justify-between">
                  <span className="editorial-label">Visual Model</span>
                  <SegmentedControl
                    ariaLabel="Threat visual mode"
                    layoutId="learn-visual-mode"
                    size="sm"
                    value={visualView}
                    onChange={setVisualView}
                    options={[
                      { id: 'study', label: '3D Study' },
                      { id: 'schematic', label: 'Schematic' },
                    ]}
                  />
                </div>

                {visualView === 'study' && !imgFailed[activeType.id] ? (
                  <LuxuryMediaFrame
                    src={activeVisual.src}
                    alt={activeVisual.alt}
                    aspectClassName="aspect-[4/3]"
                    onError={() =>
                      setImgFailed((prev) => ({ ...prev, [activeType.id]: true }))
                    }
                  />
                ) : (
                  <div className="rounded-[20px] border border-[rgba(20,17,15,0.08)] bg-[#F4EFE6] p-6">
                    <ThreatIllustration variant={activeType.id} />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 2. REQUEST-TO-DOM EXECUTION FLOW — Full-Width Deep Forest (#0F1F1A) */}
      <section className="border-t border-[rgba(244,239,230,0.12)] bg-[#0F1F1A] text-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-12 px-6 py-24 sm:px-10 sm:py-28 lg:py-[156px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl space-y-4">
                <div className="editorial-label-dark">Execution Trace</div>
                <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#F4EFE6] sm:text-5xl lg:text-[3.75rem]">
                  Request-to-DOM Execution{' '}
                  <span className="italic text-[#B79B6B]">Flow.</span>
                </h2>
                <p className="text-[17px] leading-[1.7] text-[rgba(244,239,230,0.68)]">
                  Toggle between an unprotected sink and a protected boundary to inspect each stage.
                </p>
              </div>

              <SegmentedControl
                ariaLabel="Request to DOM execution flow mode"
                layoutId="learn-flow-mode"
                surface="dark"
                value={flowMode}
                onChange={setFlowMode}
                options={[
                  { id: 'unsafe', label: 'Unsafe Flow', tone: 'burgundy' },
                  { id: 'safe', label: 'Protected Flow', tone: 'forest' },
                ]}
              />
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeType.id}-${flowMode}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: LUXURY_EASE }}
              className="space-y-8"
            >
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {activeType.flowDiagram.map((step, idx) => (
                  <div
                    key={`${activeType.id}-${flowMode}-${idx}`}
                    className={`luxury-card-dark space-y-3.5 p-6 ${
                      flowMode === 'unsafe'
                        ? 'border-[#8C2F3F]/60'
                        : 'border-[rgba(183,155,107,0.3)]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
                      <span className="text-[rgba(244,239,230,0.52)]">0{idx + 1}</span>
                      <span
                        className={
                          flowMode === 'unsafe' ? 'text-[#E2A4AE]' : 'text-[#B79B6B]'
                        }
                      >
                        {step.actor}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-display text-xl font-normal text-[#F4EFE6]">
                      <span>{step.node}</span>
                      {idx < 3 && (
                        <ChevronRight
                          className="ml-auto hidden h-4 w-4 text-[#B79B6B]/70 lg:block"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="font-mono text-[13px] leading-relaxed text-[rgba(244,239,230,0.72)]">
                      {flowMode === 'unsafe' ? step.unsafeBehavior : step.safeBehavior}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="luxury-code-block space-y-3 p-6">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#E2A4AE]">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    <span>Unprotected Result (Conceptual)</span>
                  </div>
                  <p className="font-sans text-[16px] leading-[1.7] text-[rgba(244,239,230,0.74)]">
                    {activeType.unsafeConceptual}
                  </p>
                </div>

                <div className="luxury-card space-y-3 p-6 text-[#14110F]">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#1D4D3C]">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>Protected Plain-Text Result</span>
                  </div>
                  <div className="rounded-xl border border-[rgba(20,17,15,0.08)] bg-[#F4EFE6] px-4 py-3 font-mono text-[13px] text-[#14110F] break-all">
                    {activeType.safeRendered}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 3. CODE COMPARISON — Cream (#F4EFE6) + Warm Near-Black (#14110F) Code Blocks */}
      <section className="border-t border-[rgba(20,17,15,0.08)] bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-10 px-6 py-24 sm:px-10 sm:py-28 lg:py-[144px]">
          <Reveal>
            <div className="space-y-3">
              <div className="editorial-label">Implementation Contrast</div>
              <h2 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] sm:text-5xl">
                Vulnerable vs. <span className="italic text-[#0F1F1A]">protected</span> code.
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="luxury-code-block space-y-4 p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[#E2A4AE]">
                    Vulnerable Code
                  </span>
                  <span className="editorial-label-dark text-[#E2A4AE]">Avoid</span>
                </div>
                <pre className="code-danger-highlight overflow-x-auto rounded-xl p-5 font-mono text-[13px] leading-[1.7]">
                  <code>{activeType.vulnerableCode}</code>
                </pre>
              </div>

              <div className="luxury-card space-y-5 p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[#1D4D3C]">
                    Safe Implementation
                  </span>
                  <span className="editorial-label">Recommended</span>
                </div>
                <pre className="luxury-code-block overflow-x-auto p-5 font-mono text-[13px] leading-[1.7]">
                  <code className="code-safe-highlight inline-block w-full rounded px-2 py-1">
                    {activeType.secureCode}
                  </code>
                </pre>
                <ul className="space-y-2.5 pt-1 text-[15px] leading-[1.65] text-[rgba(20,17,15,0.68)]">
                  {activeType.prevention.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B79B6B]" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
