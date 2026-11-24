import { PresetPayload, SecurityReportEntry } from '../types/security';

export const PRESET_PAYLOADS: PresetPayload[] = [
  {
    id: 'safe-comment',
    title: 'Normal Plaintext Comment',
    category: 'Safe Input',
    context: 'stored',
    payload: `Great workshop! Always encode user text before rendering.`,
    description: 'Standard plain text without HTML delimiters or executable syntax.',
    expectedSeverity: 'Safe',
  },
  {
    id: 'script-basic',
    title: 'Classic Script Tag',
    category: 'Script Injection',
    context: 'reflected',
    payload: `<script>alert('XSS Demo')</script>`,
    description: 'Injects an executable <script> element directly into an unescaped HTML response.',
    expectedSeverity: 'Critical',
  },
  {
    id: 'img-onerror',
    title: 'Broken Image Event Handler',
    category: 'Event Handler',
    context: 'stored',
    payload: `<img src="invalid-image" onerror="alert('Stored XSS')">`,
    description: 'Uses a failing image source to trigger an inline onerror handler without clicks.',
    expectedSeverity: 'High',
  },
  {
    id: 'svg-onload',
    title: 'SVG Onload Vector',
    category: 'Active SVG Tag',
    context: 'stored',
    payload: `<svg onload="alert('SVG Vector')"></svg>`,
    description: 'Embeds an inline SVG element whose onload event executes when mounted.',
    expectedSeverity: 'High',
  },
  {
    id: 'js-uri',
    title: 'JavaScript URI Scheme',
    category: 'URI Protocol',
    context: 'dom',
    payload: `<a href="javascript:alert(document.cookie)">View Profile</a>`,
    description: 'Places an executable javascript: protocol inside a link href attribute.',
    expectedSeverity: 'High',
  },
  {
    id: 'attr-breakout',
    title: 'Attribute Quote Breakout',
    category: 'Context Breakout',
    context: 'reflected',
    payload: `" onmouseover="alert('Breakout')" data-x="`,
    description: 'Closes an HTML attribute quote early to inject an interactive event handler.',
    expectedSeverity: 'Medium',
  },
  {
    id: 'case-obfuscated',
    title: 'Mixed-Case Filter Bypass',
    category: 'Obfuscation',
    context: 'reflected',
    payload: `<ScRiPt>alert('Case Bypass')</ScRiPt>`,
    description: 'Tests whether naive case-sensitive string blocklists fail against mixed-case tags.',
    expectedSeverity: 'Critical',
  },
];

export interface XssLearningModule {
  id: 'reflected' | 'stored' | 'dom';
  number: string;
  title: string;
  shortTitle: string;
  summary: string;
  scenario: string;
  flowDiagram: Array<{
    node: string;
    actor: string;
    unsafeBehavior: string;
    safeBehavior: string;
  }>;
  exampleInput: string;
  unsafeConceptual: string;
  safeRendered: string;
  prevention: string[];
  vulnerableCode: string;
  secureCode: string;
}

export const XSS_TYPES_GUIDE: XssLearningModule[] = [
  {
    id: 'reflected',
    number: '01',
    title: 'Reflected XSS',
    shortTitle: 'Reflected',
    summary:
      'Untrusted text from a search query or URL parameter is echoed straight back in a single server response without encoding HTML symbols.',
    scenario:
      'A search bar mirrors ?q= into "Results for: ...". If raw < and > characters pass through unescaped, the browser parses them as HTML.',
    flowDiagram: [
      {
        node: 'Query Input',
        actor: 'URL / Search',
        unsafeBehavior: '?q=<b>hello</b>',
        safeBehavior: '?q=<b>hello</b>',
      },
      {
        node: 'Server Template',
        actor: 'Response Builder',
        unsafeBehavior: 'Concatenates raw query',
        safeBehavior: 'Escapes <, >, &, quotes',
      },
      {
        node: 'HTTP Body',
        actor: 'HTML Document',
        unsafeBehavior: 'Contains active markup',
        safeBehavior: 'Contains &lt;b&gt;hello&lt;/b&gt;',
      },
      {
        node: 'Browser Render',
        actor: 'Screen',
        unsafeBehavior: 'Parses markup as HTML',
        safeBehavior: 'Displays harmless literal text',
      },
    ],
    exampleInput: `Search query: <b class="demo">Algorithms</b>`,
    unsafeConceptual:
      'The browser treats <b> as an actual HTML tag instead of printing the literal search characters.',
    safeRendered: `Showing results for: <b class="demo">Algorithms</b>`,
    prevention: [
      'Encode <, >, &, ", and \' into HTML entities before writing request parameters into HTML.',
      'Use framework bindings like React JSX {query}, which escape text nodes automatically.',
    ],
    vulnerableCode: `app.get('/search', (req, res) => {\n  res.send(\`<p>Results: \${req.query.q}</p>\`);\n});`,
    secureCode: `app.get('/search', (req, res) => {\n  const safe = escapeHtml(req.query.q || '');\n  res.send(\`<p>Results: \${safe}</p>\`);\n});`,
  },
  {
    id: 'stored',
    number: '02',
    title: 'Stored XSS',
    shortTitle: 'Stored',
    summary:
      'Untrusted input is saved in a database (such as a comment or profile bio) and served raw to every visitor who loads that page.',
    scenario:
      'A user posts a comment containing an inline event attribute. When classmates open the thread later, their browsers fetch and parse that stored string.',
    flowDiagram: [
      {
        node: 'Comment Form',
        actor: 'Contributor',
        unsafeBehavior: 'Submits raw HTML-like text',
        safeBehavior: 'Submits comment text',
      },
      {
        node: 'Database Store',
        actor: 'Persistence',
        unsafeBehavior: 'Saves string unvalidated',
        safeBehavior: 'Validates & sanitizes input',
      },
      {
        node: 'Feed Response',
        actor: 'API / Server',
        unsafeBehavior: 'Injects raw HTML string',
        safeBehavior: 'Serves JSON data for binding',
      },
      {
        node: 'Visitor Browsers',
        actor: 'All Readers',
        unsafeBehavior: 'Parses stored markup on load',
        safeBehavior: 'Renders pure text safely',
      },
    ],
    exampleInput: `Feedback: Great lab! <span style="color:red">[Note]</span>`,
    unsafeConceptual:
      'Every subsequent visitor receives the injected styling or active event attributes inside their DOM.',
    safeRendered: `Feedback: Great lab! <span style="color:red">[Note]</span>`,
    prevention: [
      'Render stored strings via React JSX {comment.text} or element.textContent rather than innerHTML.',
      'Strip active tags and on* event attributes with an allowlist sanitizer when rich text is needed.',
    ],
    vulnerableCode: `comments.forEach((c) => {\n  feed.innerHTML += \`<div>\${c.text}</div>\`;\n});`,
    secureCode: `return comments.map((c) => (\n  <div key={c.id}>{c.text}</div>\n));`,
  },
  {
    id: 'dom',
    number: '03',
    title: 'DOM-Based XSS',
    shortTitle: 'DOM-Based',
    summary:
      'Client-side JavaScript reads untrusted data from the browser URL (#hash or search params) and writes it into an unsafe DOM sink like innerHTML.',
    scenario:
      'An event page reads #guest=Priya from the URL fragment. Because #hash never leaves the browser, server filters never see it—only safe client sinks prevent parsing.',
    flowDiagram: [
      {
        node: 'URL Fragment',
        actor: 'Browser Address',
        unsafeBehavior: '#guest=<i>Priya</i>',
        safeBehavior: '#guest=<i>Priya</i>',
      },
      {
        node: 'Client Reader',
        actor: 'DOM Source',
        unsafeBehavior: 'Reads location.hash raw',
        safeBehavior: 'Reads & validates string',
      },
      {
        node: 'DOM Sink',
        actor: 'Assignment',
        unsafeBehavior: 'Uses element.innerHTML',
        safeBehavior: 'Uses element.textContent',
      },
      {
        node: 'Live Banner',
        actor: 'DOM Tree',
        unsafeBehavior: 'Creates active DOM nodes',
        safeBehavior: 'Prints literal text only',
      },
    ],
    exampleInput: `URL Hash: #guest=<i>Riya</i>`,
    unsafeConceptual:
      'Assigning to innerHTML turns <i>Riya</i> into an italic DOM element parsed directly from the URL.',
    safeRendered: `Welcome, <i>Riya</i>!`,
    prevention: [
      'Replace innerHTML, outerHTML, and document.write with textContent or React text bindings.',
      'Verify link URLs begin with https:// or http:// before assigning to href attributes.',
    ],
    vulnerableCode: `const guest = decodeURIComponent(location.hash.slice(1));\ndocument.getElementById('banner').innerHTML = guest;`,
    secureCode: `const guest = decodeURIComponent(location.hash.slice(1));\ndocument.getElementById('banner').textContent = guest;`,
  },
];

export const INITIAL_SECURITY_REPORTS: SecurityReportEntry[] = [
  {
    id: 'rep-101',
    timestamp: '10:14:22',
    sourceModule: 'Playground',
    context: 'Reflected',
    payload: `<script>alert('XSS Demo')</script>`,
    severity: 'Critical',
    outcome: 'Blocked',
    defenseMode: 'Output Encoding + Safe Text Node',
    ruleTriggered: 'Direct <script> tag injection',
    inputCategory: 'Suspicious',
    protectionPassed: true,
  },
  {
    id: 'rep-102',
    timestamp: '10:18:05',
    sourceModule: 'Protection',
    context: 'Stored',
    payload: `<img src="invalid" onerror="alert(1)">`,
    severity: 'High',
    outcome: 'Sanitized',
    defenseMode: 'Allowlist Sanitizer',
    ruleTriggered: 'Inline DOM event handler attribute',
    inputCategory: 'Suspicious',
    protectionPassed: true,
  },
  {
    id: 'rep-103',
    timestamp: '10:21:47',
    sourceModule: 'Playground',
    context: 'DOM-Based',
    payload: `<a href="javascript:alert(document.cookie)">Profile</a>`,
    severity: 'High',
    outcome: 'Blocked',
    defenseMode: 'URI Protocol Filter',
    ruleTriggered: 'Executable pseudo-protocol URI',
    inputCategory: 'Suspicious',
    protectionPassed: true,
  },
  {
    id: 'rep-104',
    timestamp: '10:25:12',
    sourceModule: 'Playground',
    context: 'Validation',
    payload: 'Workshop note: Always encode untrusted output.',
    severity: 'Safe',
    outcome: 'Allowed',
    defenseMode: 'Happy Path Verification',
    ruleTriggered: 'None (Valid plaintext)',
    inputCategory: 'Normal',
    protectionPassed: true,
  },
];
