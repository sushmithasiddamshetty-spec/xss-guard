import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Send,
  Eraser,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Code2,
  Sparkles,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzePayload } from '../utils/xssEngine';
import { SecurityReportEntry, XssAnalysisResult } from '../types/security';

interface LiveSimulatorViewProps {
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

type OutputPanelMode = 'unsafe' | 'secure' | 'compare';

const SAMPLE_INPUTS = [
  {
    id: 'normal',
    label: 'Normal Text',
    author: 'Aarav Sharma',
    comment: 'Great cybersecurity workshop! Always encode user input before rendering it in the DOM.',
  },
  {
    id: 'html',
    label: 'HTML-Like Input',
    author: 'Meera Nair',
    comment: '<b>Profile</b> <img src="avatar-missing.png" onerror="alert(\'HTML Event Handler\')">',
  },
  {
    id: 'javascript',
    label: 'JavaScript-Like Test',
    author: 'Rohan Verma',
    comment: `<script>alert('XSS Simulation Test')</script>`,
  },
];

function PatternHighlightedText({ analysis }: { analysis: XssAnalysisResult }) {
  if (analysis.tokens.length === 0) {
    return <span className="text-slate-500">(empty)</span>;
  }

  return (
    <span className="font-mono text-xs leading-relaxed break-all">
      {analysis.tokens.map((tok, idx) => {
        if (tok.kind === 'safe-text') {
          return (
            <span key={idx} className="text-slate-200">
              {tok.text}
            </span>
          );
        }

        const style =
          tok.kind === 'dangerous-tag'
            ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50'
            : tok.kind === 'event-handler'
            ? 'bg-orange-500/25 text-orange-200 border border-orange-500/50'
            : tok.kind === 'dangerous-uri'
            ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50'
            : tok.kind === 'html-tag'
            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/45'
            : 'bg-amber-500/25 text-amber-200 border border-amber-500/50';

        return (
          <mark
            key={idx}
            title={tok.reason ?? 'Suspicious pattern'}
            className={`mx-0.5 inline rounded px-1.5 py-0.5 ${style}`}
          >
            {tok.text}
          </mark>
        );
      })}
    </span>
  );
}

export default function LiveSimulatorView({
  sharedPayload,
  onPayloadChange,
  onLogRun,
}: LiveSimulatorViewProps) {
  const [authorName, setAuthorName] = useState<string>('Ananya Rao');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<OutputPanelMode>('secure');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const analyzeTimerRef = useRef<number | null>(null);
  const commentCounterRef = useRef<number>(1);

  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current !== null) {
        window.clearTimeout(analyzeTimerRef.current);
      }
    };
  }, []);

  const initialPreviewText = sharedPayload.trim()
    ? sharedPayload
    : SAMPLE_INPUTS[2].comment;
  const initialAnalysis = analyzePayload(initialPreviewText);
  const [activeSubmission, setActiveSubmission] = useState<SimulatedComment>({
    id: 'cmt-initial',
    author: 'Ananya Rao',
    text: initialPreviewText,
    timestamp: 'Just now',
    analysis: initialAnalysis,
  });

  const [commentsFeed, setCommentsFeed] = useState<SimulatedComment[]>([
    {
      id: 'cmt-seed-1',
      author: 'Workshop Mentor',
      text: 'Welcome to the XSS GUARD comment simulator. Try submitting plain text, HTML tags, or script patterns below.',
      timestamp: '10:00 AM',
      analysis: analyzePayload(
        'Welcome to the XSS GUARD comment simulator. Try submitting plain text, HTML tags, or script patterns below.'
      ),
    },
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = authorName.trim();
    const trimmedComment = sharedPayload.trim();

    if (!trimmedName && !trimmedComment) {
      setValidationError('Please enter both your name and a comment before submitting.');
      onLogRun({
        sourceModule: 'Live Simulator',
        context: 'Validation',
        payload: '(empty name & comment)',
        severity: 'Low',
        outcome: 'Blocked',
        defenseMode: 'Form Field Validation',
        ruleTriggered: 'Empty name and comment fields rejected',
        inputCategory: 'Invalid',
        protectionPassed: true,
      });
      return;
    }
    if (!trimmedName) {
      setValidationError('Name field cannot be empty.');
      onLogRun({
        sourceModule: 'Live Simulator',
        context: 'Validation',
        payload: trimmedComment || '(empty name field)',
        severity: 'Low',
        outcome: 'Blocked',
        defenseMode: 'Form Field Validation',
        ruleTriggered: 'Empty name field rejected',
        inputCategory: 'Invalid',
        protectionPassed: true,
      });
      return;
    }
    if (!trimmedComment) {
      setValidationError('Comment field cannot be empty.');
      onLogRun({
        sourceModule: 'Live Simulator',
        context: 'Validation',
        payload: '(empty comment field)',
        severity: 'Low',
        outcome: 'Blocked',
        defenseMode: 'Form Field Validation',
        ruleTriggered: 'Empty comment field rejected',
        inputCategory: 'Invalid',
        protectionPassed: true,
      });
      return;
    }

    setValidationError(null);
    setIsAnalyzing(true);

    const analysis = analyzePayload(sharedPayload);
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newComment: SimulatedComment = {
      id: `cmt-${Date.now()}-${commentCounterRef.current++}`,
      author: trimmedName,
      text: sharedPayload,
      timestamp: nowTime,
      analysis,
    };

    if (analyzeTimerRef.current !== null) {
      window.clearTimeout(analyzeTimerRef.current);
    }
    analyzeTimerRef.current = window.setTimeout(() => {
      setIsAnalyzing(false);
    }, 220);

    setActiveSubmission(newComment);
    setCommentsFeed((prev) => [newComment, ...prev.slice(0, 5)]);

    const isSuspicious = analysis.isMalicious || analysis.severity !== 'Safe';
    onLogRun({
      sourceModule: 'Live Simulator',
      context: 'Stored',
      payload: sharedPayload,
      severity: analysis.severity,
      outcome: isSuspicious ? 'Blocked' : 'Allowed',
      defenseMode:
        panelMode === 'unsafe'
          ? 'Unsafe Preview + Protected Feed'
          : 'Secure Text Rendering',
      ruleTriggered: analysis.triggeredRules[0] ?? 'None (Valid plaintext)',
      inputCategory: isSuspicious ? 'Suspicious' : 'Normal',
      protectionPassed: true,
    });
  };

  const handleClear = () => {
    setAuthorName('');
    onPayloadChange('');
    setValidationError(null);
  };

  const handleApplySample = (sample: (typeof SAMPLE_INPUTS)[number]) => {
    setAuthorName(sample.author);
    onPayloadChange(sample.comment);
    setValidationError(null);
  };

  const handleResetFeed = () => {
    setCommentsFeed([
      {
        id: 'cmt-seed-1',
        author: 'Workshop Mentor',
        text: 'Welcome to the XSS GUARD comment simulator. Try submitting plain text, HTML tags, or script patterns below.',
        timestamp: '10:00 AM',
        analysis: analyzePayload(
          'Welcome to the XSS GUARD comment simulator. Try submitting plain text, HTML tags, or script patterns below.'
        ),
      },
    ]);
  };

  const currentAnalysis = activeSubmission.analysis;
  const suspiciousTokens = currentAnalysis.tokens.filter(
    (t) => t.kind !== 'safe-text'
  );

  const renderUnsafePanel = () => (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-950/15 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-200">
          <ShieldAlert className="h-4 w-4 text-rose-400" aria-hidden="true" />
          <span>UNSAFE OUTPUT (Conceptual Preview)</span>
        </div>
        <span className="font-mono text-xs text-rose-300">
          Simulated Insecure Sink
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-300">
        On an insecure website that inserts untrusted input into raw HTML (e.g. via unescaped server templates or DOM <code className="text-rose-200">innerHTML</code>), the browser treats markup delimiters as executable instructions instead of text:
      </p>

      {/* Conceptual Visual Simulation (Strictly Safe React Text, Never Executed) */}
      <div className="rounded-xl border border-rose-500/35 bg-[#0a0612] p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Author: {activeSubmission.author}</span>
          <span>Conceptual Browser Reaction</span>
        </div>

        {currentAnalysis.isMalicious ? (
          <div className="rounded-lg border border-rose-500/50 bg-rose-950/40 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-400" aria-hidden="true" />
              <span>Simulated Script Execution Warning</span>
            </div>
            <p className="text-xs leading-relaxed text-rose-100">
              An insecure browser would parse{' '}
              <code className="rounded bg-rose-900/60 px-1.5 py-0.5 font-mono text-rose-200">
                {suspiciousTokens.map((t) => t.text).join(' ')}
              </code>{' '}
              as active code.
              {currentAnalysis.simulatedAlertText
                ? ` Conceptually, a dialog box with "${currentAnalysis.simulatedAlertText}" would appear.`
                : ''}
            </p>
            <p className="text-xs text-slate-300">
              {currentAnalysis.simulatedImpact}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3 text-xs text-slate-200">
            No active script tokens found in this submission. Even in an unsafe sink, plain text renders normally—though leaving the sink unescaped remains risky for future inputs.
          </div>
        )}
      </div>
    </div>
  );

  const renderSecurePanel = () => (
    <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/15 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span>SECURE OUTPUT (Safe Plain Text)</span>
        </div>
        <span className="font-mono text-xs text-emerald-300">
          React Safe Text Binding
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-300">
        XSS GUARD renders untrusted input strictly as literal text characters (equivalent to <code className="text-emerald-200">textContent</code> or escaped HTML entities). Angle brackets and quotes never become executable nodes:
      </p>

      <div className="rounded-xl border border-emerald-500/30 bg-[#050c12] p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Author: {activeSubmission.author}</span>
          <span>Literal Rendered Text</span>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#050814] p-3 font-mono text-xs text-emerald-100 break-all">
          {activeSubmission.text}
        </div>
        <div className="text-xs text-slate-400">
          HTML-Encoded Representation:{' '}
          <code className="font-mono text-cyan-200 break-all">
            {currentAnalysis.htmlEncoded}
          </code>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            <span>Interactive Comment-Submission Sandbox</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Live XSS Simulator
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Submit a comment below to see how an insecure website conceptually misinterprets untrusted HTML versus how XSS GUARD neutralizes it as safe plain text.
          </p>
        </div>

        {/* Protection Status Summary */}
        <div
          className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-xs font-semibold ${
            currentAnalysis.isMalicious
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          <span>
            {currentAnalysis.isMalicious
              ? 'Protection Succeeded · Malicious Pattern Neutralized'
              : 'Protection Succeeded · Input Verified Safe'}
          </span>
        </div>
      </div>

      {/* Main Two-Column Simulator Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Comment Submission Form & Sample Inputs */}
        <div className="space-y-6 lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="glass-panel rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                Post a Workshop Comment
              </h2>
              <span className="text-xs text-slate-400">Safe Sandbox</span>
            </div>

            {/* Name Input Field */}
            <div>
              <label
                htmlFor="sim-author-name"
                className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
              >
                Your Name
              </label>
              <input
                id="sim-author-name"
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter your name (e.g., Aarav Sharma)"
                className="mt-2 w-full rounded-xl border border-slate-700/80 bg-[#050814] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Comment Textarea */}
            <div>
              <label
                htmlFor="sim-comment-text"
                className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
              >
                Comment Payload
              </label>
              <textarea
                id="sim-comment-text"
                rows={4}
                value={sharedPayload}
                onChange={(e) => {
                  onPayloadChange(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Write a normal comment or test HTML / JavaScript-like patterns..."
                className="mt-2 w-full rounded-xl border border-slate-700/80 bg-[#050814] p-3.5 font-mono text-xs leading-relaxed text-cyan-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Inline Validation Alert */}
            {validationError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-200"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit & Clear Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="btn-primary-cyber flex-1 px-5 py-2.5 text-sm disabled:opacity-80"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Scanning Input...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>Submit Comment</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary-cyber px-4 py-2.5 text-sm"
              >
                <Eraser className="h-4 w-4" aria-hidden="true" />
                <span>Clear</span>
              </button>
            </div>

            {/* Three Sample Input Buttons */}
            <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span>Example Inputs</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {SAMPLE_INPUTS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleApplySample(sample)}
                    className="min-h-[40px] rounded-xl border border-slate-700/80 bg-slate-900/75 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Simulated Website Comment Section */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <h2 className="font-display text-base font-semibold text-white">
                  Simulated Website Comment Section
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetFeed}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Reset Feed</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {commentsFeed.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-800/90 bg-[#050814]/80 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-white">{item.author}</span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {item.timestamp} ·{' '}
                      <span
                        className={
                          item.analysis.isMalicious
                            ? 'text-emerald-300'
                            : 'text-cyan-300'
                        }
                      >
                        {item.analysis.isMalicious ? 'Sanitized Display' : 'Verified Safe'}
                      </span>
                    </span>
                  </div>
                  <p className="font-mono text-xs leading-relaxed text-slate-200 break-all">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Unsafe vs Secure Output Panels, Pattern Highlighting & Explanation */}
        <div className="space-y-6 lg:col-span-7">
          {/* Output Comparison Switcher + Animated Panels */}
          <div className="gradient-border-card rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  Output Behavior Inspector
                </h2>
                <p className="text-xs text-slate-400">
                  Switch between Unsafe and Secure panels or compare both side-by-side.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Output Panel Mode"
                className="inline-flex max-w-full flex-wrap rounded-xl border border-slate-800 bg-slate-900/90 p-1"
              >
                <button
                  role="tab"
                  type="button"
                  aria-selected={panelMode === 'unsafe'}
                  onClick={() => setPanelMode('unsafe')}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    panelMode === 'unsafe'
                      ? 'border border-rose-500/45 bg-rose-500/20 text-rose-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unsafe Output
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={panelMode === 'secure'}
                  onClick={() => setPanelMode('secure')}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    panelMode === 'secure'
                      ? 'border border-emerald-500/45 bg-emerald-500/20 text-emerald-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Secure Output
                </button>
                <button
                  role="tab"
                  type="button"
                  aria-selected={panelMode === 'compare'}
                  onClick={() => setPanelMode('compare')}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    panelMode === 'compare'
                      ? 'border border-cyan-400/45 bg-cyan-500/20 text-cyan-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Compare Both
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {panelMode === 'unsafe' && (
                <motion.div
                  key="panel-unsafe"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderUnsafePanel()}
                </motion.div>
              )}

              {panelMode === 'secure' && (
                <motion.div
                  key="panel-secure"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderSecurePanel()}
                </motion.div>
              )}

              {panelMode === 'compare' && (
                <motion.div
                  key="panel-compare"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="grid gap-4 xl:grid-cols-2"
                >
                  {renderUnsafePanel()}
                  {renderSecurePanel()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suspicious Pattern Highlighter */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-purple-300" aria-hidden="true" />
                <h2 className="font-display text-base font-semibold text-white">
                  Suspicious Pattern Highlighter
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Severity: {currentAnalysis.severity} · {suspiciousTokens.length} flagged token(s)
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#050814]/90 p-4">
              <PatternHighlightedText analysis={currentAnalysis} />
            </div>

            {suspiciousTokens.length > 0 && (
              <div className="space-y-2">
                {suspiciousTokens.map((tok, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-slate-800/80 bg-[#050814]/60 px-3 py-2 text-xs"
                  >
                    <code className="font-mono text-rose-300 break-all">{tok.text}</code>
                    <span className="text-slate-300">{tok.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clear Explanation & Protection Verification */}
          <div
            className={`rounded-2xl border p-6 space-y-3 ${
              currentAnalysis.isMalicious
                ? 'border-emerald-500/35 bg-emerald-950/15'
                : 'border-cyan-500/30 bg-cyan-950/15'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <span>What Happened &amp; Protection Status</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                Protection Succeeded
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-200">
              {currentAnalysis.isMalicious
                ? `The submitted comment from ${activeSubmission.author} contained ${currentAnalysis.vectorCategory.toLowerCase()} patterns (${currentAnalysis.triggeredRules.join(', ')}). In an unsafe site, the browser could execute that markup. XSS GUARD prevented execution by rendering the comment strictly as plain React text and escaping HTML delimiters.`
                : `The submitted comment from ${activeSubmission.author} contained clean plain text with no dangerous HTML tags, event attributes, or script protocols. Both validation and safe plain-text rendering succeeded cleanly.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
