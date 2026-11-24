import { useState } from 'react';
import {
  Download,
  RotateCcw,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { SecurityReportEntry } from '../types/security';
import { LuxuryMediaFrame, Reveal, SegmentedControl } from './LuxuryPrimitives';
import defenseShieldImg from '../assets/images/story_defense_shield_1795540315234.jpg';

interface ResultsViewProps {
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

export default function ResultsView({
  reports,
  onClearReports,
}: ResultsViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | InputCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const totalTests = reports.length;
  const normalCount = reports.filter((r) => classifyEntry(r) === 'Normal').length;
  const suspiciousCount = reports.filter((r) => classifyEntry(r) === 'Suspicious').length;
  const invalidCount = reports.filter((r) => classifyEntry(r) === 'Invalid').length;
  const safelyHandledCount = reports.filter(
    (r) => r.outcome !== 'Simulated Execution'
  ).length;
  const protectionChecksPassed = reports.filter((r) => didProtectionPass(r)).length;
  const passRate =
    totalTests > 0 ? Math.round((protectionChecksPassed / totalTests) * 100) : 0;

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
    const bundle = {
      reportTitle: 'XSS GUARD — Simulation Security Report',
      generatedAt: new Date().toISOString(),
      disclaimer:
        'Educational simulation results generated locally from user test inputs.',
      summary: {
        totalTestsPerformed: totalTests,
        normalInputs: normalCount,
        suspiciousInputs: suspiciousCount,
        invalidInputs: invalidCount,
        inputsSafelyHandled: safelyHandledCount,
        protectionChecksPassed,
        passRatePercent: passRate,
      },
      history: reports.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        module: entry.sourceModule,
        classification: classifyEntry(entry),
        input: entry.payload,
        severity: entry.severity,
        outcome: entry.outcome,
        passed: didProtectionPass(entry),
        rule: entry.ruleTriggered,
      })),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xss-guard-results-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const distribution = [
    { label: 'Normal' as const, count: normalCount, color: 'bg-[#0F1F1A]' },
    { label: 'Suspicious' as const, count: suspiciousCount, color: 'bg-[#B79B6B]' },
    { label: 'Invalid' as const, count: invalidCount, color: 'bg-[#8C2F3F]' },
  ];

  return (
    <div className="space-y-0">
      {/* 1. HEADER & METRICS (Cream #F4EFE6) */}
      <section className="bg-[#F4EFE6]">
        <div className="mx-auto max-w-[1240px] space-y-14 px-6 pt-20 pb-24 sm:px-10 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-[148px]">
          <Reveal>
            <div className="grid items-center gap-10 border-b border-[rgba(20,17,15,0.08)] pb-12 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <div className="space-y-4">
                  <div className="editorial-label">Results</div>
                  <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-[#14110F] sm:text-5xl lg:text-[4rem]">
                    Simulation test <span className="italic text-[#0F1F1A]">ledger.</span>
                  </h1>
                  <p className="max-w-2xl text-[17px] leading-[1.7] text-[rgba(20,17,15,0.62)] sm:text-[18px]">
                    Dynamic outcomes recorded directly from your Playground and Protection runs. Clearly labeled as educational simulation results.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    disabled={reports.length === 0}
                    className="btn-primary px-6 py-3 text-[15px] disabled:opacity-40"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Download JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClearReports}
                    disabled={reports.length === 0}
                    className="btn-secondary px-6 py-3 text-[15px] disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Reset History</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 lg:-mr-8">
                <LuxuryMediaFrame
                  src={defenseShieldImg}
                  alt="Translucent architectural glass shield illuminated by a warm champagne light sweep"
                  aspectClassName="aspect-[16/10]"
                  revealOnScroll={false}
                />
              </div>
            </div>
          </Reveal>

          {/* Editorial Metric Strip */}
          <Reveal delay={0.08}>
            <div className="luxury-card grid grid-cols-2 divide-y divide-[rgba(20,17,15,0.08)] sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-y-0">
              <div className="space-y-1.5 p-6">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Total Tests
                </div>
                <div className="font-display text-4xl font-normal text-[#14110F] tabular-nums">
                  {totalTests}
                </div>
              </div>
              <div className="space-y-1.5 p-6">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Normal
                </div>
                <div className="font-display text-4xl font-normal text-[#1D4D3C] tabular-nums">
                  {normalCount}
                </div>
              </div>
              <div className="space-y-1.5 p-6">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Suspicious
                </div>
                <div className="font-display text-4xl font-normal text-[#7C6238] tabular-nums">
                  {suspiciousCount}
                </div>
              </div>
              <div className="space-y-1.5 p-6">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Invalid
                </div>
                <div className="font-display text-4xl font-normal text-[#8C2F3F] tabular-nums">
                  {invalidCount}
                </div>
              </div>
              <div className="space-y-1.5 p-6">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Safely Handled
                </div>
                <div className="font-display text-4xl font-normal text-[#14110F] tabular-nums">
                  {safelyHandledCount}
                </div>
              </div>
              <div className="space-y-1.5 p-6">
                <div className="text-[15px] font-medium text-[rgba(20,17,15,0.62)]">
                  Checks Passed
                </div>
                <div className="font-display text-4xl font-normal text-[#1D4D3C] tabular-nums">
                  {totalTests > 0 ? `${passRate}%` : '—'}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Distribution Summary */}
          <Reveal delay={0.14}>
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="editorial-label">Outcome Distribution</span>
                <div className="flex flex-wrap gap-6 font-mono text-[13px] text-[rgba(20,17,15,0.68)] tabular-nums">
                  <span>Normal: {normalCount}</span>
                  <span>Suspicious: {suspiciousCount}</span>
                  <span>Invalid: {invalidCount}</span>
                </div>
              </div>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[rgba(20,17,15,0.08)]">
                {totalTests > 0 &&
                  distribution.map((item) => {
                    const pct = (item.count / totalTests) * 100;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={item.label}
                        className={`${item.color} h-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                        title={`${item.label}: ${item.count}`}
                      />
                    );
                  })}
              </div>
            </div>
          </Reveal>

          {/* Filter & Ledger Table */}
          <Reveal delay={0.2}>
            <div className="luxury-card space-y-6 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SegmentedControl
                  ariaLabel="Filter recorded simulation results"
                  layoutId="results-category-filter"
                  size="sm"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { id: 'All', label: 'All' },
                    { id: 'Normal', label: 'Normal', tone: 'forest' },
                    { id: 'Suspicious', label: 'Suspicious' },
                    { id: 'Invalid', label: 'Invalid', tone: 'burgundy' },
                  ]}
                />

                <div className="relative w-full sm:w-72">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(20,17,15,0.45)]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search input or rule..."
                    aria-label="Search test history"
                    className="min-h-[42px] w-full rounded-full border border-[rgba(20,17,15,0.14)] bg-[#F4EFE6] py-2 pl-10 pr-4 text-[15px] text-[#14110F] placeholder:text-[rgba(20,17,15,0.45)] focus:border-[#B79B6B] focus:bg-[#FBF8F2] focus:outline-none"
                  />
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="rounded-xl border border-[rgba(20,17,15,0.08)] bg-[#F4EFE6] p-12 text-center space-y-2.5">
                  <p className="text-[17px] font-semibold text-[#14110F]">
                    {reports.length === 0
                      ? 'No simulation tests recorded yet.'
                      : 'No entries match your active filter.'}
                  </p>
                  <p className="text-[15px] text-[rgba(20,17,15,0.62)]">
                    {reports.length === 0
                      ? 'Submit inputs in the Playground or Protection view to record live test outcomes.'
                      : 'Clear your filter or search query to view all entries.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[15px]">
                    <thead>
                      <tr className="border-b border-[rgba(20,17,15,0.08)]">
                        <th className="editorial-label py-3.5 pr-4 font-normal">Time</th>
                        <th className="editorial-label py-3.5 pr-4 font-normal">Module</th>
                        <th className="editorial-label py-3.5 pr-4 font-normal">
                          Classification
                        </th>
                        <th className="editorial-label py-3.5 pr-4 font-normal">Input</th>
                        <th className="editorial-label py-3.5 pr-4 font-normal">Check</th>
                        <th className="editorial-label py-3.5 font-normal">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(20,17,15,0.08)]">
                      {filteredReports.map((row) => {
                        const category = classifyEntry(row);
                        const passed = didProtectionPass(row);

                        return (
                          <tr
                            key={row.id}
                            className="transition-colors hover:bg-[#F4EFE6]/65"
                          >
                            <td className="py-4 pr-4 font-mono text-[13px] text-[rgba(20,17,15,0.62)] tabular-nums whitespace-nowrap">
                              {row.timestamp}
                            </td>
                            <td className="py-4 pr-4 text-[#14110F] whitespace-nowrap">
                              {row.sourceModule}
                            </td>
                            <td className="py-4 pr-4 whitespace-nowrap">
                              <span
                                className={`font-semibold ${
                                  category === 'Normal'
                                    ? 'text-[#1D4D3C]'
                                    : category === 'Suspicious'
                                    ? 'text-[#7C6238]'
                                    : 'text-[#8C2F3F]'
                                }`}
                              >
                                {category}
                              </span>
                            </td>
                            <td className="py-4 pr-4 font-mono text-[13px] text-[#14110F] max-w-[260px] truncate">
                              {row.payload}
                            </td>
                            <td className="py-4 pr-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 font-medium ${
                                  passed ? 'text-[#1D4D3C]' : 'text-[#8C2F3F]'
                                }`}
                              >
                                {passed ? (
                                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                  <Ban className="h-4 w-4" aria-hidden="true" />
                                )}
                                <span>{passed ? 'Passed' : 'Unprotected'}</span>
                              </span>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-[#14110F]">
                                {row.outcome === 'Simulated Execution' ? (
                                  <AlertTriangle
                                    className="h-4 w-4 text-[#8C2F3F]"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ShieldCheck
                                    className="h-4 w-4 text-[#1D4D3C]"
                                    aria-hidden="true"
                                  />
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
          </Reveal>
        </div>
      </section>
    </div>
  );
}
