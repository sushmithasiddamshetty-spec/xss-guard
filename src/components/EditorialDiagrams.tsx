import { motion, useReducedMotion } from 'motion/react';
import { XssAnalysisResult } from '../types/security';
import { LUXURY_EASE } from './LuxuryPrimitives';

/**
 * Quiet Luxury Architectural Input Inspection Diagram:
 * Used both as a crisp standalone visual and as a resilient fallback.
 */
export function HeroInputJourneyVisual({
  rawInput,
  analysis,
  encodedPreview,
}: {
  rawInput: string;
  analysis: XssAnalysisResult;
  encodedPreview: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const flagged = analysis.isMalicious;
  const accentStroke = flagged ? '#8C2F3F' : '#0F1F1A';

  return (
    <div className="hero-glass-panel relative overflow-hidden rounded-[24px] p-6 sm:p-8">
      <svg
        viewBox="0 0 640 240"
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Diagram showing web input travelling through the security inspection layer to a safe DOM text node"
      >
        <line
          x1="150"
          y1="120"
          x2="262"
          y2="120"
          stroke="#14110F"
          strokeOpacity="0.24"
          strokeWidth="1.25"
          strokeDasharray="4 4"
        />
        <line
          x1="378"
          y1="120"
          x2="488"
          y2="120"
          stroke={flagged ? '#B79B6B' : '#0F1F1A'}
          strokeWidth="1.4"
        />

        {!shouldReduceMotion && (
          <motion.circle
            r="4"
            cy="120"
            fill={flagged ? '#B79B6B' : '#0F1F1A'}
            initial={{ cx: 154, opacity: 0 }}
            animate={{
              cx: [154, 262, 320, 378, 484],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: LUXURY_EASE,
            }}
          />
        )}

        {/* Stage 1: Raw Input */}
        <g transform="translate(18, 56)">
          <rect
            width="134"
            height="128"
            rx="14"
            fill="#F4EFE6"
            stroke="#14110F"
            strokeOpacity="0.14"
            strokeWidth="1.25"
          />
          <text
            x="16"
            y="26"
            fill="#7C6238"
            fontSize="9.5"
            fontFamily="JetBrains Mono, monospace"
          >
            01 · SOURCE
          </text>
          <text
            x="16"
            y="46"
            fill="#14110F"
            fontSize="12.5"
            fontFamily="Manrope, sans-serif"
            fontWeight="600"
          >
            Web Input
          </text>
          <rect
            x="16"
            y="60"
            width="102"
            height="48"
            rx="8"
            fill="#FBF8F2"
            stroke="#14110F"
            strokeOpacity="0.1"
          />
          <text
            x="24"
            y="81"
            fill={flagged ? '#8C2F3F' : '#14110F'}
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {(rawInput || '(empty)').slice(0, 13)}
          </text>
          <text
            x="24"
            y="97"
            fill="#14110F"
            fillOpacity="0.62"
            fontSize="8.5"
            fontFamily="JetBrains Mono, monospace"
          >
            {rawInput.length > 13 ? `${rawInput.slice(13, 25)}...` : `${rawInput.length} chars`}
          </text>
        </g>

        {/* Stage 2: Security Inspection Gate */}
        <g transform="translate(260, 38)">
          <rect
            width="120"
            height="164"
            rx="14"
            fill="#14110F"
            stroke="#B79B6B"
            strokeOpacity="0.48"
            strokeWidth="1.25"
          />
          <text
            x="60"
            y="26"
            textAnchor="middle"
            fill="#B79B6B"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            INSPECTION
          </text>

          <circle
            cx="60"
            cy="82"
            r="32"
            fill="none"
            stroke="#0F1F1A"
            strokeWidth="2"
          />
          <motion.circle
            cx="60"
            cy="82"
            r="23"
            fill="none"
            stroke={flagged ? '#B79B6B' : '#8FBFA6'}
            strokeWidth="1.25"
            strokeDasharray="5 4"
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            style={{ originX: '60px', originY: '82px' }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <path
            d="M51 74 L45 82 L51 90 M69 74 L75 82 L69 90"
            fill="none"
            stroke="#F4EFE6"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="56"
            y1="90"
            x2="64"
            y2="74"
            stroke="#B79B6B"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          <text
            x="60"
            y="142"
            textAnchor="middle"
            fill={flagged ? '#F2CFC8' : '#A6D4BC'}
            fontSize="9.5"
            fontFamily="JetBrains Mono, monospace"
          >
            {flagged ? 'Markup Flagged' : 'Clean String'}
          </text>
        </g>

        {/* Stage 3: Safe Output Node */}
        <g transform="translate(488, 56)">
          <rect
            width="134"
            height="128"
            rx="14"
            fill="#FBF8F2"
            stroke={accentStroke}
            strokeOpacity="0.45"
            strokeWidth="1.25"
          />
          <text
            x="16"
            y="26"
            fill="#1D4D3C"
            fontSize="9.5"
            fontFamily="JetBrains Mono, monospace"
          >
            03 · BOUNDARY
          </text>
          <text
            x="16"
            y="46"
            fill="#14110F"
            fontSize="12.5"
            fontFamily="Manrope, sans-serif"
            fontWeight="600"
          >
            Safe Text Node
          </text>
          <rect
            x="16"
            y="60"
            width="102"
            height="48"
            rx="8"
            fill="#F4EFE6"
            stroke="#14110F"
            strokeOpacity="0.1"
          />
          <text
            x="24"
            y="81"
            fill="#14110F"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {(encodedPreview || '(empty)').slice(0, 13)}
          </text>
          <text
            x="24"
            y="97"
            fill="#1D4D3C"
            fontSize="8.5"
            fontFamily="JetBrains Mono, monospace"
          >
            {flagged ? 'Escaped inert' : 'Verified text'}
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Problem Diagram (Deep Forest #0F1F1A Stage): USER INPUT -> WEB APPLICATION -> BROWSER
 */
export function ProblemFlowDiagram({
  mode,
}: {
  mode: 'unsafe' | 'safe';
}) {
  const shouldReduceMotion = useReducedMotion();
  const isUnsafe = mode === 'unsafe';
  const strokeColor = isUnsafe ? '#D88B97' : '#8FBFA6';

  const stages = [
    {
      index: '01',
      title: 'User Input',
      detail: '<script>alert(1)</script>',
      caption: 'Untrusted delimiters enter through a form field or query string.',
    },
    {
      index: '02',
      title: 'Web Application',
      detail: isUnsafe ? 'html += rawInput' : 'escapeHtml(rawInput)',
      caption: isUnsafe
        ? 'Concatenates angle brackets without encoding or sanitization.'
        : 'Transforms structural characters into inert HTML entities.',
    },
    {
      index: '03',
      title: 'Browser',
      detail: isUnsafe ? 'Parses active <script>' : 'Displays literal text',
      caption: isUnsafe
        ? 'Document parser interprets data as executable script.'
        : 'Renders characters harmlessly inside a text node.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="relative grid gap-6 md:grid-cols-3">
        {stages.map((stage, idx) => (
          <div
            key={stage.title}
            className="luxury-card-dark flex flex-col justify-between p-7"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-[rgba(244,239,230,0.68)]">
                <span>{stage.index}</span>
                <span className="text-[#B79B6B]">
                  {idx === 2 ? (isUnsafe ? 'Active DOM' : 'Text Node') : 'Stage'}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-normal text-[#F4EFE6]">
                {stage.title}
              </h3>
              <div
                className={`mt-4 rounded-xl px-4 py-3 font-mono text-[13px] break-all ${
                  idx === 0
                    ? 'border border-[rgba(244,239,230,0.14)] bg-[#14110F] text-[#F4EFE6]'
                    : isUnsafe
                    ? 'code-danger-highlight'
                    : 'code-safe-highlight'
                }`}
              >
                {stage.detail}
              </div>
            </div>

            <p className="mt-5 text-[15px] leading-[1.65] text-[rgba(244,239,230,0.68)]">
              {stage.caption}
            </p>
          </div>
        ))}
      </div>

      <div className="px-2">
        <svg viewBox="0 0 600 22" className="w-full h-5" aria-hidden="true">
          <line
            x1="20"
            y1="11"
            x2="580"
            y2="11"
            stroke="rgba(244,239,230,0.16)"
            strokeWidth="1.25"
          />
          <line
            x1="20"
            y1="11"
            x2="580"
            y2="11"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeDasharray="5 5"
          />
          <circle cx="20" cy="11" r="3.5" fill="#B79B6B" />
          <circle cx="300" cy="11" r="3.5" fill={strokeColor} />
          <circle cx="580" cy="11" r="3.5" fill={strokeColor} />
          {!shouldReduceMotion && (
            <motion.circle
              r="4"
              cy="11"
              fill={isUnsafe ? '#E2A4AE' : '#8FBFA6'}
              initial={{ cx: 20 }}
              animate={{ cx: [20, 300, 580] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: LUXURY_EASE,
              }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

/**
 * Refined Schematic Diagrams for Stored, Reflected & DOM-Based XSS
 */
export function ThreatIllustration({
  variant,
}: {
  variant: 'stored' | 'reflected' | 'dom';
}) {
  if (variant === 'stored') {
    return (
      <svg
        viewBox="0 0 280 120"
        className="w-full h-32"
        role="img"
        aria-label="Stored XSS schematic showing input persisted in storage and delivered to visitors"
      >
        <rect x="8" y="34" width="60" height="52" rx="8" fill="#FBF8F2" stroke="#14110F" strokeOpacity="0.22" strokeWidth="1.25" />
        <text x="38" y="56" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#14110F" fillOpacity="0.65">Form</text>
        <text x="38" y="72" textAnchor="middle" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="#8C2F3F">&lt;img...&gt;</text>

        <line x1="68" y1="60" x2="106" y2="60" stroke="#B79B6B" strokeWidth="1.4" strokeDasharray="3 3" />

        <ellipse cx="140" cy="36" rx="30" ry="10" fill="#F4EFE6" stroke="#14110F" strokeWidth="1.25" />
        <path d="M110 36 v48 c0 5.5 13.4 10 30 10 s30 -4.5 30 -10 V36" fill="#F4EFE6" stroke="#14110F" strokeWidth="1.25" />
        <ellipse cx="140" cy="36" rx="30" ry="10" fill="#FBF8F2" stroke="#14110F" strokeWidth="1.25" />
        <text x="140" y="68" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#14110F">Store</text>

        <path d="M170 52 L212 32 M170 60 L212 60 M170 68 L212 88" stroke="#0F1F1A" strokeWidth="1.25" />
        <rect x="214" y="20" width="56" height="22" rx="5" fill="#FBF8F2" stroke="#14110F" strokeOpacity="0.2" strokeWidth="1.25" />
        <rect x="214" y="49" width="56" height="22" rx="5" fill="#FBF8F2" stroke="#14110F" strokeOpacity="0.2" strokeWidth="1.25" />
        <rect x="214" y="78" width="56" height="22" rx="5" fill="#FBF8F2" stroke="#14110F" strokeOpacity="0.2" strokeWidth="1.25" />
        <text x="242" y="34" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#14110F" fillOpacity="0.65">Reader 1</text>
        <text x="242" y="63" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#14110F" fillOpacity="0.65">Reader 2</text>
        <text x="242" y="92" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#14110F" fillOpacity="0.65">Reader 3</text>
      </svg>
    );
  }

  if (variant === 'reflected') {
    return (
      <svg
        viewBox="0 0 280 120"
        className="w-full h-32"
        role="img"
        aria-label="Reflected XSS schematic showing query parameter echoed directly by server"
      >
        <rect x="12" y="34" width="84" height="52" rx="8" fill="#FBF8F2" stroke="#14110F" strokeOpacity="0.22" strokeWidth="1.25" />
        <text x="54" y="54" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#14110F">URL ?q=</text>
        <text x="54" y="70" textAnchor="middle" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="#8C2F3F">&lt;script&gt;</text>

        <path d="M98 44 Q146 18 192 44" fill="none" stroke="#0F1F1A" strokeWidth="1.4" />
        <polygon points="188,39 195,45 186,47" fill="#0F1F1A" />

        <path d="M192 76 Q146 102 98 76" fill="none" stroke="#8C2F3F" strokeWidth="1.4" strokeDasharray="4 3" />
        <polygon points="103,72 95,75 101,81" fill="#8C2F3F" />

        <rect x="196" y="28" width="72" height="64" rx="8" fill="#14110F" stroke="#B79B6B" strokeOpacity="0.45" strokeWidth="1.25" />
        <line x1="210" y1="42" x2="210" y2="78" stroke="#B79B6B" strokeWidth="1.8" />
        <text x="238" y="57" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="#F4EFE6">Server</text>
        <text x="238" y="71" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#B79B6B">Echoes raw</text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 280 120"
      className="w-full h-32"
      role="img"
      aria-label="DOM-Based XSS schematic showing client-side source to DOM sink"
    >
      <rect x="10" y="14" width="260" height="92" rx="10" fill="#FBF8F2" stroke="#14110F" strokeOpacity="0.2" strokeWidth="1.25" strokeDasharray="4 3" />
      <text x="22" y="28" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#14110F" fillOpacity="0.62">Browser Client Boundary</text>

      <rect x="22" y="42" width="66" height="46" rx="6" fill="#F4EFE6" stroke="#14110F" strokeOpacity="0.2" strokeWidth="1.25" />
      <text x="55" y="61" textAnchor="middle" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="#14110F">#hash</text>
      <text x="55" y="75" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#14110F" fillOpacity="0.62">Source</text>

      <line x1="88" y1="65" x2="112" y2="65" stroke="#0F1F1A" strokeWidth="1.4" />

      <rect x="112" y="42" width="68" height="46" rx="6" fill="#14110F" />
      <text x="146" y="61" textAnchor="middle" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fill="#F4EFE6">Script</text>
      <text x="146" y="75" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#B79B6B">innerHTML</text>

      <line x1="180" y1="65" x2="202" y2="65" stroke="#8C2F3F" strokeWidth="1.4" />

      <circle cx="216" cy="65" r="7" fill="#F4EFE6" stroke="#8C2F3F" strokeWidth="1.25" />
      <path d="M223 61 L242 48 M223 69 L242 82" stroke="#8C2F3F" strokeWidth="1.25" />
      <rect x="242" y="40" width="18" height="16" rx="3" fill="#F4EFE6" stroke="#8C2F3F" strokeWidth="1.25" />
      <rect x="242" y="74" width="18" height="16" rx="3" fill="#F4EFE6" stroke="#14110F" strokeOpacity="0.22" strokeWidth="1.25" />
    </svg>
  );
}

/**
 * Animated Protection Pipeline inside Deep Forest (#0F1F1A) Surface:
 * Input -> Validation -> Sanitization / Encoding -> Safe Output
 */
export function ProtectionPipelineDiagram({
  activeStageIndex,
  onSelectStage,
  surface = 'dark',
}: {
  activeStageIndex?: number;
  onSelectStage?: (index: number) => void;
  surface?: 'light' | 'dark';
}) {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    { number: '01', label: 'Input', caption: 'Untrusted user string' },
    { number: '02', label: 'Validation', caption: 'Empty & boundary checks' },
    { number: '03', label: 'Sanitization / Encoding', caption: 'Strip or escape delimiters' },
    { number: '04', label: 'Safe Output', caption: 'Inert DOM text node' },
  ];

  const isDark = surface === 'dark';

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) => {
          const isHighlighted = activeStageIndex === idx;
          const Tag = onSelectStage ? 'button' : 'div';
          return (
            <Tag
              key={step.label}
              {...(onSelectStage
                ? { type: 'button' as const, onClick: () => onSelectStage(idx) }
                : {})}
              className={`relative rounded-[16px] border p-6 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isDark
                  ? isHighlighted
                    ? 'border-[#B79B6B] bg-[#14110F] text-[#F4EFE6] shadow-[inset_0_1px_0_rgba(183,155,107,0.35),0_24px_48px_-12px_rgba(0,0,0,0.45)] -translate-y-0.5'
                    : 'border-[rgba(244,239,230,0.12)] bg-[#162923] text-[#F4EFE6] shadow-[inset_0_1px_0_rgba(244,239,230,0.08)] hover:border-[rgba(183,155,107,0.45)]'
                  : isHighlighted
                  ? 'border-[#B79B6B] bg-[#14110F] text-[#F4EFE6] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.22)] -translate-y-0.5'
                  : 'luxury-card text-[#14110F] hover:border-[#B79B6B]/60'
              }`}
            >
              <div
                className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                  isHighlighted
                    ? 'text-[#B79B6B]'
                    : isDark
                    ? 'text-[#B79B6B]/80'
                    : 'text-[#7C6238]'
                }`}
              >
                {step.number}
              </div>
              <div className="mt-2.5 font-display text-xl font-normal">
                {step.label}
              </div>
              <div
                className={`mt-1.5 text-[15px] leading-relaxed ${
                  isHighlighted
                    ? 'text-[rgba(244,239,230,0.72)]'
                    : isDark
                    ? 'text-[rgba(244,239,230,0.68)]'
                    : 'text-[rgba(20,17,15,0.62)]'
                }`}
              >
                {step.caption}
              </div>
            </Tag>
          );
        })}
      </div>

      <svg viewBox="0 0 800 18" className="hidden lg:block w-full h-4" aria-hidden="true">
        <line
          x1="90"
          y1="9"
          x2="710"
          y2="9"
          stroke={isDark ? 'rgba(244,239,230,0.16)' : 'rgba(20,17,15,0.14)'}
          strokeWidth="1.25"
        />
        <circle cx="90" cy="9" r="3" fill="#B79B6B" />
        <circle cx="296" cy="9" r="3" fill="#B79B6B" />
        <circle cx="503" cy="9" r="3" fill="#B79B6B" />
        <circle cx="710" cy="9" r="3.5" fill={isDark ? '#8FBFA6' : '#0F1F1A'} />
        {!shouldReduceMotion && (
          <motion.circle
            r="4"
            cy="9"
            fill="#B79B6B"
            initial={{ cx: 90 }}
            animate={{ cx: [90, 296, 503, 710] }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: LUXURY_EASE,
            }}
          />
        )}
      </svg>
    </div>
  );
}
