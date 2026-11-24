import {
  DefenseEvaluation,
  DefenseLayerConfig,
  DefenseStageResult,
  PayloadToken,
  ThreatSeverity,
  XssAnalysisResult,
} from '../types/security';

const DANGEROUS_TAG_TEST = /<\s*\/?\s*(script|iframe|svg|object|embed|body|marquee|details|video|audio|math|style|link|meta|base|form)\b[^>]*>/i;
const GENERIC_HTML_TEST = /<\s*\/?\s*[a-z][a-z0-9-]*\b[^>]*>/i;
const EVENT_HANDLER_REGEX = /\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URI_REGEX = /(?:javascript|vbscript|data\s*:\s*text\/html)\s*:[^\s"'<>)]*/gi;
const BREAKOUT_REGEX = /["']\s*(?:>|\/?>|\bon[a-z]+\s*=)/gi;

export function encodeHtmlEntities(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function stripDangerousHtml(input: string): string {
  let cleaned = input;
  // Remove script, iframe, object, embed, svg, style blocks completely
  cleaned = cleaned.replace(
    /<\s*(script|iframe|object|embed|style|svg)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );
  // Remove standalone self-closing or unclosed dangerous tags
  cleaned = cleaned.replace(
    /<\s*\/?\s*(script|iframe|svg|object|embed|body|link|meta|base|form|marquee|details)\b[^>]*>/gi,
    ''
  );
  // Remove inline event handlers like onerror=..., onload=..., onmouseover=...
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Neutralize javascript: / vbscript: / data:text/html URIs
  cleaned = cleaned.replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:[^\s"'<>)]*/gi, '#blocked-uri');
  return cleaned.trim();
}

export interface SanitizationDetails {
  original: string;
  cleaned: string;
  removedTags: string[];
  removedEventHandlers: string[];
  neutralizedUris: string[];
  totalRemovedCount: number;
}

export function inspectSanitization(input: string): SanitizationDetails {
  const removedTags: string[] = [];
  const removedEventHandlers: string[] = [];
  const neutralizedUris: string[] = [];

  const blockRegex = /<\s*(script|iframe|object|embed|style|svg)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
  const blockMatches = input.match(blockRegex);
  if (blockMatches) {
    removedTags.push(...blockMatches);
  }

  const withoutBlocks = input.replace(blockRegex, '');
  const standaloneRegex = /<\s*\/?\s*(script|iframe|svg|object|embed|body|link|meta|base|form|marquee|details)\b[^>]*>/gi;
  const standaloneMatches = withoutBlocks.match(standaloneRegex);
  if (standaloneMatches) {
    removedTags.push(...standaloneMatches);
  }

  const withoutDangerousTags = withoutBlocks.replace(standaloneRegex, '');
  const eventMatches = withoutDangerousTags.match(/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi);
  if (eventMatches) {
    removedEventHandlers.push(...eventMatches.map((m) => m.trim()));
  }

  const uriMatches = withoutDangerousTags.match(
    /(?:javascript|vbscript|data\s*:\s*text\/html)\s*:[^\s"'<>)]*/gi
  );
  if (uriMatches) {
    neutralizedUris.push(...uriMatches);
  }

  const cleaned = stripDangerousHtml(input);
  const totalRemovedCount =
    removedTags.length + removedEventHandlers.length + neutralizedUris.length;

  return {
    original: input,
    cleaned,
    removedTags,
    removedEventHandlers,
    neutralizedUris,
    totalRemovedCount,
  };
}

function extractSimulatedAlertText(input: string): string | null {
  const alertMatch = input.match(/(?:alert|confirm|prompt)\s*\(\s*(['"`]?)(.*?)\1\s*\)/i);
  if (alertMatch && alertMatch[2] !== undefined) {
    const cleanMsg = alertMatch[2].trim();
    return cleanMsg.length > 0 ? cleanMsg : '1';
  }
  if (/document\.cookie/i.test(input)) {
    return 'Session Cookie Read Attempt (session_id=workshop_demo_token)';
  }
  if (/fetch\s*\(|xmlhttprequest/i.test(input)) {
    return 'Simulated Outbound Data Exfiltration Request Blocked';
  }
  return null;
}

function tokenizePayload(input: string): PayloadToken[] {
  if (!input) return [];

  const matches: Array<{ start: number; end: number; priority: number; token: PayloadToken }> = [];

  const collectMatches = (
    regex: RegExp,
    kind: PayloadToken['kind'],
    reason: string,
    priority: number
  ) => {
    const cloned = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = cloned.exec(input)) !== null) {
      if (m[0].length === 0) {
        cloned.lastIndex++;
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        priority,
        token: { text: m[0], kind, reason },
      });
    }
  };

  collectMatches(
    /<\s*\/?\s*(script|iframe|svg|object|embed|body|marquee|details|video|audio)\b[^>]*>/gi,
    'dangerous-tag',
    'Executable or active HTML element capable of running scripts.',
    4
  );
  collectMatches(
    EVENT_HANDLER_REGEX,
    'event-handler',
    'Inline DOM event attribute (on*) executes JavaScript when triggered.',
    5
  );
  collectMatches(
    JAVASCRIPT_URI_REGEX,
    'dangerous-uri',
    'Executable URI protocol executes code upon navigation or resource load.',
    4
  );
  collectMatches(
    BREAKOUT_REGEX,
    'attribute-breakout',
    'Quote breakout escapes an HTML attribute context into executable markup.',
    3
  );
  collectMatches(
    /<\s*\/?\s*[a-z][a-z0-9-]*\b[^>]*>/gi,
    'html-tag',
    'Unescaped HTML element markup; must be encoded or sanitized before rendering.',
    1
  );

  // Sort by start index, then higher priority, then longer span
  matches.sort((a, b) => a.start - b.start || b.priority - a.priority || b.end - a.end);

  const nonOverlapping: Array<{ start: number; end: number; token: PayloadToken }> = [];
  let cursor = 0;
  for (const item of matches) {
    if (item.start >= cursor) {
      nonOverlapping.push(item);
      cursor = item.end;
    }
  }

  const tokens: PayloadToken[] = [];
  let pos = 0;
  for (const item of nonOverlapping) {
    if (item.start > pos) {
      tokens.push({
        text: input.slice(pos, item.start),
        kind: 'safe-text',
      });
    }
    tokens.push(item.token);
    pos = item.end;
  }
  if (pos < input.length) {
    tokens.push({
      text: input.slice(pos),
      kind: 'safe-text',
    });
  }

  return tokens;
}

export function analyzePayload(rawInput: string): XssAnalysisResult {
  const trimmed = rawInput ?? '';
  const triggeredRules: string[] = [];
  let score = 0;

  const hasScriptTag = /<\s*script\b/i.test(trimmed);
  const hasDangerousTag = DANGEROUS_TAG_TEST.test(trimmed);
  const hasEventHandler = /\bon[a-z]+\s*=/i.test(trimmed);
  const hasJavascriptUri = /(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i.test(trimmed);
  const hasBreakout = /["']\s*(?:>|\/?>|\bon[a-z]+\s*=)/i.test(trimmed);
  const hasGenericHtml = GENERIC_HTML_TEST.test(trimmed);

  if (hasScriptTag) {
    triggeredRules.push('Direct <script> tag injection');
    score += 45;
  }
  if (hasDangerousTag && !hasScriptTag) {
    triggeredRules.push('Active HTML container tag (<svg>, <iframe>, <body>, etc.)');
    score += 35;
  }
  if (hasEventHandler) {
    triggeredRules.push('Inline DOM event handler attribute (onerror / onload / onmouseover)');
    score += 35;
  }
  if (hasJavascriptUri) {
    triggeredRules.push('Executable pseudo-protocol URI (javascript: / data:text/html)');
    score += 35;
  }
  if (hasBreakout) {
    triggeredRules.push('Attribute quote breakout pattern');
    score += 25;
  }
  if (hasGenericHtml && triggeredRules.length === 0) {
    triggeredRules.push('Unescaped HTML markup syntax detected');
    score += 15;
  }

  let severity: ThreatSeverity = 'Safe';
  if (score >= 45) severity = 'Critical';
  else if (score >= 30) severity = 'High';
  else if (score >= 20) severity = 'Medium';
  else if (score >= 10) severity = 'Low';

  const isMalicious = score >= 20;

  let vectorCategory = 'Clean Plaintext';
  if (hasScriptTag) vectorCategory = 'Script Block Injection';
  else if (hasEventHandler) vectorCategory = 'DOM Event Handler Vector';
  else if (hasJavascriptUri) vectorCategory = 'URI Protocol Execution';
  else if (hasDangerousTag) vectorCategory = 'Active Tag Injection';
  else if (hasBreakout) vectorCategory = 'Attribute Context Breakout';
  else if (hasGenericHtml) vectorCategory = 'Unescaped HTML Markup';

  const extractedAlert = extractSimulatedAlertText(trimmed);
  const simulatedAlertText = isMalicious
    ? extractedAlert ?? 'Simulated XSS Payload Triggered'
    : null;

  let simulatedImpact = 'No executable script behavior detected. Input renders safely as plain text.';
  if (isMalicious) {
    if (/cookie/i.test(trimmed)) {
      simulatedImpact =
        'In an unprotected browser, this vector could read non-HttpOnly cookies and exfiltrate session tokens.';
    } else if (hasEventHandler) {
      simulatedImpact =
        'In an unprotected DOM, the browser triggers the inline event handler automatically on element load or pointer hover.';
    } else if (hasJavascriptUri) {
      simulatedImpact =
        'Clicking or loading this link in an unprotected app executes arbitrary script in the origin context.';
    } else {
      simulatedImpact =
        'In an unprotected page, the browser parses the injected markup as executable JavaScript with full page origin privileges.';
    }
  } else if (severity === 'Low') {
    simulatedImpact =
      'Contains harmless HTML formatting tags without active script triggers, though strict output encoding is still recommended.';
  }

  return {
    rawInput: trimmed,
    isMalicious,
    severity,
    vectorCategory,
    triggeredRules,
    tokens: tokenizePayload(trimmed),
    simulatedAlertText,
    simulatedImpact,
    htmlEncoded: encodeHtmlEntities(trimmed),
    sanitizedOutput: stripDangerousHtml(trimmed),
  };
}

export function evaluateDefenses(
  rawInput: string,
  config: DefenseLayerConfig
): DefenseEvaluation {
  const analysis = analyzePayload(rawInput);
  const stages: DefenseStageResult[] = [];
  let current = rawInput;
  let scriptBlocked = !analysis.isMalicious;

  // Stage 1: HTML Allowlist Sanitizer
  if (config.tagAndEventSanitizer) {
    const cleaned = stripDangerousHtml(current);
    const recheck = analyzePayload(cleaned);
    const neutralizedHere = analysis.isMalicious && !recheck.isMalicious;
    if (neutralizedHere) {
      scriptBlocked = true;
    }
    stages.push({
      stageName: 'HTML Allowlist Sanitizer',
      enabled: true,
      inputSnapshot: current,
      outputSnapshot: cleaned || '(empty after stripping dangerous markup)',
      status: neutralizedHere ? 'Neutralized' : analysis.isMalicious ? 'Mitigated' : 'Passed',
      explanation: neutralizedHere
        ? 'Stripped dangerous tags (<script>, <svg>, <iframe>), inline on* handlers, and javascript: URIs.'
        : 'Input inspected against allowlist rules; no disallowed script elements remained.',
    });
    current = cleaned;
  } else {
    stages.push({
      stageName: 'HTML Allowlist Sanitizer',
      enabled: false,
      inputSnapshot: current,
      outputSnapshot: current,
      status: analysis.isMalicious ? 'Bypassed' : 'Passed',
      explanation: 'Disabled. Raw tags and inline event handlers pass directly to the next stage.',
    });
  }

  // Stage 2: Context-Aware Output Encoding
  if (config.htmlEncoding) {
    const encoded = encodeHtmlEntities(current);
    const recheck = analyzePayload(current);
    const neutralizedHere = recheck.isMalicious;
    if (neutralizedHere || analysis.isMalicious) {
      scriptBlocked = true;
    }
    stages.push({
      stageName: 'Context-Aware Output Encoding',
      enabled: true,
      inputSnapshot: current,
      outputSnapshot: encoded,
      status: analysis.isMalicious ? 'Neutralized' : 'Passed',
      explanation:
        'Converted <, >, &, ", and \' into inert HTML entities so the browser renders literal characters instead of executable nodes.',
    });
    current = encoded;
  } else {
    stages.push({
      stageName: 'Context-Aware Output Encoding',
      enabled: false,
      inputSnapshot: current,
      outputSnapshot: current,
      status: !scriptBlocked ? 'Bypassed' : 'Passed',
      explanation: 'Disabled. Special characters remain unescaped in HTML rendering context.',
    });
  }

  // Stage 3: Content Security Policy (CSP)
  if (config.cspHeader) {
    const blockedByCsp = !scriptBlocked;
    if (blockedByCsp) {
      scriptBlocked = true;
    }
    stages.push({
      stageName: 'Content Security Policy (CSP)',
      enabled: true,
      inputSnapshot: current,
      outputSnapshot: "Header: Content-Security-Policy: script-src 'self'; object-src 'none'",
      status: blockedByCsp ? 'Neutralized' : 'Passed',
      explanation: blockedByCsp
        ? 'Browser refused inline <script> and event handler execution because no matching nonce or hash exists.'
        : 'Policy active as a defense-in-depth safety net blocking unauthorized inline scripts.',
    });
  } else {
    stages.push({
      stageName: 'Content Security Policy (CSP)',
      enabled: false,
      inputSnapshot: current,
      outputSnapshot: 'No CSP Header Sent',
      status: !scriptBlocked ? 'Bypassed' : 'Passed',
      explanation: 'Disabled. Browser permits inline scripts and unverified event execution.',
    });
  }

  // Stage 4: HttpOnly Cookie Flag
  stages.push({
    stageName: 'HttpOnly & SameSite Cookie Flag',
    enabled: config.httpOnlyCookies,
    inputSnapshot: 'document.cookie access check',
    outputSnapshot: config.httpOnlyCookies
      ? 'Set-Cookie: session=***; HttpOnly; Secure; SameSite=Strict'
      : 'document.cookie readable by JavaScript',
    status: config.httpOnlyCookies ? 'Mitigated' : !scriptBlocked ? 'Bypassed' : 'Passed',
    explanation: config.httpOnlyCookies
      ? 'Even if an injection reached the DOM, JavaScript cannot access HttpOnly session cookies.'
      : 'Disabled. Any executing script in the origin could read non-HttpOnly cookies.',
  });

  return {
    finalOutput: current,
    scriptWouldExecute: !scriptBlocked,
    cookieProtected: config.httpOnlyCookies || scriptBlocked,
    stages,
  };
}
