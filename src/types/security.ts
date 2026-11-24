export type NavPageId =
  | 'home'
  | 'learn'
  | 'playground'
  | 'protection'
  | 'results';

export type ThreatSeverity = 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';

export type XssContextType = 'reflected' | 'stored' | 'dom';

export interface PayloadToken {
  text: string;
  kind: 'safe-text' | 'dangerous-tag' | 'event-handler' | 'dangerous-uri' | 'attribute-breakout' | 'html-tag';
  reason?: string;
}

export interface XssAnalysisResult {
  rawInput: string;
  isMalicious: boolean;
  severity: ThreatSeverity;
  vectorCategory: string;
  triggeredRules: string[];
  tokens: PayloadToken[];
  simulatedAlertText: string | null;
  simulatedImpact: string;
  htmlEncoded: string;
  sanitizedOutput: string;
}

export interface DefenseLayerConfig {
  htmlEncoding: boolean;
  tagAndEventSanitizer: boolean;
  cspHeader: boolean;
  httpOnlyCookies: boolean;
}

export interface DefenseStageResult {
  stageName: string;
  enabled: boolean;
  inputSnapshot: string;
  outputSnapshot: string;
  status: 'Neutralized' | 'Mitigated' | 'Bypassed' | 'Passed';
  explanation: string;
}

export interface DefenseEvaluation {
  finalOutput: string;
  scriptWouldExecute: boolean;
  cookieProtected: boolean;
  stages: DefenseStageResult[];
}

export interface SecurityReportEntry {
  id: string;
  timestamp: string;
  sourceModule: 'Playground' | 'Protection' | 'Live Simulator' | 'Attack Playground' | 'Protection Lab' | 'Execution Paths';
  context: 'Reflected' | 'Stored' | 'DOM-Based' | 'Validation';
  payload: string;
  severity: ThreatSeverity;
  outcome: 'Blocked' | 'Sanitized' | 'Simulated Execution' | 'Allowed';
  defenseMode: string;
  ruleTriggered: string;
  inputCategory?: 'Normal' | 'Suspicious' | 'Invalid';
  protectionPassed?: boolean;
}

export interface PresetPayload {
  id: string;
  title: string;
  category: string;
  context: XssContextType;
  payload: string;
  description: string;
  expectedSeverity: ThreatSeverity;
}
