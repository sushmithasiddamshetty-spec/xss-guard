import { useState } from 'react';
import {
  BarChart3,
  Download,
  RotateCcw,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileCheck2,
  Ban,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SecurityReportEntry } from '../types/security';

interface SecurityReportsViewProps {
  reports: SecurityReportEntry[];
  onClearReports: () => void;
}

type InputCategory = 'Normal' | 'Suspicious' | 'Invalid';

function classifyEntry(entry: SecurityReportEntry): InputCategory {
  if (entry.inputCategory) return entry.inputCategory;
  const trimmed = entry.payload.trim();
  if (
    !trimmed ||
    trimmed.startsWith('(empty') ||
    entry.ruleTriggered.toLowerCase().includes('empty')
  ) {
    return 'Invalid';
  }
  if (entry.severity === 'Safe') return 'Normal';
  return 'Suspicious';
}

function didProtectionPass(entry: SecurityReportEntry): boolean {
  if (typeof entry.protectionPassed === 'boolean') return entry.protectionPassed;
  return entry.outcome !== 'Simulated Execution';
}

export default function SecurityReportsView({
  reports,
  onClearReports,
}: SecurityReportsViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | InputCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic statistics derived directly from actual test history
  const totalTests = reports.length;
  const normalCount = reports.filter((r) => classifyEntry(r) === 'Normal').length;
  const suspiciousCount = reports.filter((r) => classifyEntry(r) === 'Suspicious').length;
  const invalidCount = reports.filter((r) => classifyEntry(r) === 'Invalid').length;
  const safelyHandledCount = reports.filter(
    (r) => r.outcome !== 'Simulated Execution'
  ).length;
  const protectionChecksPassed = reports.filter((r) => didProtectionPass(r)).length;

  const overallPassRate =
    totalTests > 0 ? Math.round((protectionChecksPassed / totalTests) * 100) : 0;

  let overallStatusTitle = 'Awaiting Simulation Tests';
  let overallStatusDetail =
    'Run a test in the Live Simulator, Protection Lab, or Happy & Exception Path to populate educational metrics.';
  let overallStatusTone: 'neutral' | 'nominal' | 'warning' = 'neutral';

  if (totalTests > 0) {
    if (protectionChecksPassed === totalTests) {
      overallStatusTitle = 'Simulation Protection Verified';
      overallStatusDetail = `All ${totalTests} educational simulation test(s) were safely handled without script execution.`;
      overallStatusTone = 'nominal';
    } else {
      overallStatusTitle = 'Unprotected Simulation Recorded';
      overallStatusDetail = `${
        totalTests - protectionChecksPassed
      } test(s) simulated an unprotected state. Enable defense controls in the simulator to verify mitigation.`;
      overallStatusTone = 'warning';
    }
  }

  const filteredReports = reports.filter((entry) => {
    const category = classifyEntry(entry);
    const matchesCategory = categoryFilter === 'All' || category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      entry.payload.toLowerCase().includes(q) ||
      entry.ruleTriggered.toLowerCase().includes(q) ||
      entry.sourceModule.toLowerCase().includes(q) ||
      entry.outcome.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleDownloadReport = () => {
    const reportBundle = {
      reportTitle: 'XSS GUARD – Educational Simulation Security Report',
      generatedAt: new Date().toISOString(),
      disclaimer:
        'Educational simulation results only. This prototype demonstrates XSS defense concepts locally and does not claim complete real-world website security.',
      summaryStatistics: {
        totalTestsPerformed: totalTests,
        normalInputs: normalCount,
        suspiciousInputs: suspiciousCount,
        invalidInputs: invalidCount,
        inputsSafelyHandled: safelyHandledCount,
        protectionChecksPassed,
        overallProtectionStatus: overallStatusTitle,
        simulationPassRatePercent: overallPassRate,
      },
      testHistory: reports.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        sourceModule: entry.sourceModule,
        inputClassification: classifyEntry(entry),
        inputSnapshot: entry.payload,
        severity: entry.severity,
        testResult: entry.outcome,
        protectionCheckPassed: didProtectionPass(entry),
        ruleOrValidationNote: entry.ruleTriggered,
      })),
    };

    const blob = new Blob([JSON.stringify(reportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xss-guard-simulation-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const distributionItems: Array<{
    label: InputCategory;
    count: number;
    barClass: string;
    textClass: string;
  }> = [
    {
      label: 'Normal',
      count: normalCount,
      barClass: 'bg-emerald-400',
      textClass: 'text-emerald-300',
    },
    {
      label: 'Suspicious',
      count: suspiciousCount,
      barClass: 'bg-amber-400',
      textClass: 'text-amber-300',
    },
    {
      label: 'Invalid',
      count: invalidCount,
      barClass: 'bg-rose-400',
      textClass: 'text-rose-300',
    },
  ];

  return (
    <div className="space-y-8 pb-8 pt-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-400 uppercase">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span>Educational Simulation Analytics</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Security Reports
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Live summary of educational simulation tests recorded across XSS GUARD. All metrics update automatically whenever you submit a test.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 self-start">
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={reports.length === 0}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_24px_-6px_rgba(6,182,212,0.55)] transition-all hover:brightness-110 disabled:opacity-40"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download Report</span>
          </button>

          <button
            type="button"
            onClick={onClearReports}
            disabled={reports.length === 0}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-rose-400/50 hover:text-rose-200 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset Test History</span>
          </button>
        </div>
      </div>

      {/* Explicit Educational Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 px-5 py-4 text-xs leading-relaxed text-slate-200 sm:text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
        <p>
          <span className="font-semibold text-white">Educational Simulation Notice:</span>{' '}
          The metrics below represent simulated test results from this B.Tech workshop prototype. This educational tool demonstrates XSS concepts locally and does not provide complete real-world production website security.
        </p>
      </div>

      {/* Overall Protection Status Card (Metric #7) */}
      <motion.div
        key={`${totalTests}-${overallStatusTitle}`}
        initial={{ opacity: 0.75, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`rounded-2xl border p-6 ${
          overallStatusTone === 'nominal'
            ? 'border-emerald-500/40 bg-emerald-950/20'
            : overallStatusTone === 'warning'
            ? 'border-amber-500/40 bg-amber-950/20'
            : 'glass-panel'
        }`}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            {overallStatusTone === 'nominal' ? (
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" aria-hidden="true" />
            ) : overallStatusTone === 'warning' ? (
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" aria-hidden="true" />
            ) : (
              <FileCheck2 className="mt-0.5 h-6 w-6 shrink-0 text-cyan-400" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Overall Protection Status (Educational Simulation)
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                {overallStatusTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-300">{overallStatusDetail}</p>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-slate-800 bg-[#050814]/85 px-5 py-3 text-left sm:text-right">
            <div className="text-xs text-slate-400">Simulation Check Rate</div>
            <div className="mt-0.5 font-mono text-2xl font-bold text-cyan-300 tabular-nums">
              {overallPassRate}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics #1–#6 Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="glass-panel rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-400">Total Tests Performed</div>
          <div className="mt-2 font-mono text-3xl font-bold text-white tabular-nums">
            {totalTests}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-400">Normal Inputs</div>
          <div className="mt-2 font-mono text-3xl font-bold text-emerald-300 tabular-nums">
            {normalCount}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-400">Suspicious Inputs</div>
          <div className="mt-2 font-mono text-3xl font-bold text-amber-300 tabular-nums">
            {suspiciousCount}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-400">Invalid Inputs</div>
          <div className="mt-2 font-mono text-3xl font-bold text-rose-300 tabular-nums">
            {invalidCount}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-400">Inputs Safely Handled</div>
          <div className="mt-2 font-mono text-3xl font-bold text-cyan-300 tabular-nums">
            {safelyHandledCount}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-400">Protection Checks Passed</div>
          <div className="mt-2 font-mono text-3xl font-bold text-purple-300 tabular-nums">
            {protectionChecksPassed}
          </div>
        </div>
      </div>

      {/* Test Distribution Chart */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Test Input Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Proportional breakdown of Normal, Suspicious, and Invalid inputs across simulation tests.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            Total: {totalTests} test(s)
          </span>
        </div>

        {/* Stacked proportional bar */}
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-800/90 flex">
          {totalTests > 0 &&
            distributionItems.map((item) => {
              const pct = (item.count / totalTests) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={item.label}
                  className={`${item.barClass} h-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.count}`}
                />
              );
            })}
        </div>

        {/* Individual labeled distribution bars */}
        <div className="grid gap-4 md:grid-cols-3">
          {distributionItems.map((item) => {
            const pct = totalTests > 0 ? Math.round((item.count / totalTests) * 100) : 0;
            return (
              <div
                key={item.label}
                className="rounded-xl border border-slate-800/90 bg-[#050814]/75 p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${item.textClass}`}>
                    {item.label} Inputs
                  </span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {item.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${item.barClass} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar + Test History Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Simulation Test History
            </h2>
            <p className="text-xs text-slate-400">
              Individual educational simulation records with classification and test results.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Normal', 'Suspicious', 'Invalid'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'border border-cyan-400/40 bg-cyan-500/20 text-cyan-200'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search input or result..."
                aria-label="Search test history"
                className="w-full rounded-xl border border-slate-700/80 bg-[#050814] py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#050814]/70 p-8 text-center space-y-3">
            <p className="text-sm font-medium text-slate-300">
              {reports.length === 0
                ? 'No simulation test records to display.'
                : 'No records match your current category filter or search query.'}
            </p>
            <p className="text-xs text-slate-500">
              {reports.length === 0
                ? 'Submit comments in the Live Simulator or run tests in the Protection Lab to generate live report entries.'
                : 'Reset your filters to view all recorded simulation tests.'}
            </p>
            {reports.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setSearchQuery('');
                }}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/25"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 pr-4 font-medium">Time</th>
                  <th className="py-3 pr-4 font-medium">Source</th>
                  <th className="py-3 pr-4 font-medium">Input Type</th>
                  <th className="py-3 pr-4 font-medium">Submitted Input</th>
                  <th className="py-3 pr-4 font-medium">Protection Check</th>
                  <th className="py-3 font-medium">Test Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredReports.map((row) => {
                  const category = classifyEntry(row);
                  const passed = didProtectionPass(row);

                  return (
                    <tr key={row.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 pr-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {row.timestamp}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-200 whitespace-nowrap">
                        {row.sourceModule}
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            category === 'Normal'
                              ? 'text-emerald-300'
                              : category === 'Suspicious'
                              ? 'text-amber-300'
                              : 'text-rose-300'
                          }`}
                        >
                          {category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-cyan-200 max-w-[260px] truncate">
                        {row.payload}
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${
                            passed ? 'text-emerald-300' : 'text-amber-300'
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>{passed ? 'Passed' : 'Unprotected'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-200">
                          {row.outcome === 'Simulated Execution' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                          )}
                          <span>{row.outcome}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
