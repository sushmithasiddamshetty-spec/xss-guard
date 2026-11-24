import {
  ExecutionPathScenario,
  PresetPayload,
  SecurityReportEntry,
} from '../types/security';

export const PRESET_PAYLOADS: PresetPayload[] = [
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
    payload: `<img src="invalid-image" onerror="alert('Stored XSS Triggered')">`,
    description: 'Uses a failing image source to automatically fire the inline onerror handler without user clicks.',
    expectedSeverity: 'High',
  },
  {
    id: 'svg-onload',
    title: 'SVG Onload Vector',
    category: 'Active SVG Tag',
    context: 'stored',
    payload: `<svg onload="alert('SVG Vector Executed')"></svg>`,
    description: 'Embeds an inline SVG element whose onload event executes as soon as the node mounts.',
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
    payload: `" onmouseover="alert('Attribute Breakout')" data-x="`,
    description: 'Closes an HTML attribute quote early and injects an interactive event handler.',
    expectedSeverity: 'Medium',
  },
  {
    id: 'case-obfuscated',
    title: 'Mixed-Case Filter Bypass',
    category: 'Obfuscation',
    context: 'reflected',
    payload: `<ScRiPt>alert('Case Bypass')</ScRiPt>`,
    description: 'Tests whether naive case-sensitive string blocklists fail against mixed-case HTML tags.',
    expectedSeverity: 'Critical',
  },
  {
    id: 'safe-comment',
    title: 'Benign Workshop Comment',
    category: 'Safe Input',
    context: 'stored',
    payload: `Great cybersecurity lab! Looking forward to learning CSP headers.`,
    description: 'Normal student feedback containing no markup or executable tokens.',
    expectedSeverity: 'Safe',
  },
];

export interface XssLearningModule {
  id: 'reflected' | 'stored' | 'dom';
  number: string;
  title: string;
  shortTitle: string;
  simpleDefinition: string;
  scenarioTitle: string;
  scenarioDescription: string;
  howItHappens: Array<{
    stepTitle: string;
    summary: string;
    deepDive: string;
  }>;
  flowDiagram: Array<{
    node: string;
    actor: string;
    unsafeBehavior: string;
    safeBehavior: string;
  }>;
  safeExample: {
    harmlessInput: string;
    unsafeConceptual: string;
    safeRendered: string;
    note: string;
  };
  preventionTechniques: Array<{
    title: string;
    detail: string;
  }>;
  vulnerableCode: string;
  secureCode: string;
}

export const XSS_TYPES_GUIDE: XssLearningModule[] = [
  {
    id: 'reflected',
    number: '01',
    title: 'Reflected XSS (Non-Persistent)',
    shortTitle: 'Reflected XSS',
    simpleDefinition:
      'Reflected XSS happens when a website takes text directly from your current web request (such as a search bar or URL parameter) and immediately prints it back on the page without escaping special HTML characters.',
    scenarioTitle: 'Harmless Scenario: College Library Book Search',
    scenarioDescription:
      'Imagine a campus library website with a search box. When you search for "Physics", the page displays: "Showing results for: Physics". If the server copies the search parameter straight into HTML without encoding, special symbols like < and > can be mistaken for HTML tags.',
    howItHappens: [
      {
        stepTitle: '1. Input Sent in URL or Search Box',
        summary: 'A user opens a link or submits a search term containing HTML-like symbols.',
        deepDive:
          'Because the text lives in the current HTTP request (e.g. ?query=...), it is not saved in any database—it only affects that single request-response cycle.',
      },
      {
        stepTitle: '2. Server Echoes Input Unescaped',
        summary: 'The backend builds an HTML response string by concatenating the raw query.',
        deepDive:
          'Without an HTML encoder, the browser cannot tell which < and > characters came from the developer’s template versus the user’s search string.',
      },
      {
        stepTitle: '3. Browser Parses the Reflected Markup',
        summary: 'The browser receives the response and interprets unescaped tags as page instructions.',
        deepDive:
          'When protected with output encoding, characters like < become &lt;, so the browser displays the exact text harmlessly instead of parsing tags.',
      },
    ],
    flowDiagram: [
      {
        node: 'Search Input / URL',
        actor: 'User Request',
        unsafeBehavior: '?q=<demo-tag>hi</demo-tag>',
        safeBehavior: '?q=<demo-tag>hi</demo-tag>',
      },
      {
        node: 'Web Server Route',
        actor: 'Backend Template',
        unsafeBehavior: 'Concatenates raw query into HTML',
        safeBehavior: 'Encodes <, >, &, quotes first',
      },
      {
        node: 'HTTP Response',
        actor: 'HTML Document',
        unsafeBehavior: 'Contains unescaped tag markup',
        safeBehavior: 'Contains &lt;demo-tag&gt;hi&lt;/demo-tag&gt;',
      },
      {
        node: 'Browser Render',
        actor: 'Page Screen',
        unsafeBehavior: 'Parses markup as active HTML',
        safeBehavior: 'Displays harmless plain text',
      },
    ],
    safeExample: {
      harmlessInput: `Search query: <b class="demo">Algorithms</b>`,
      unsafeConceptual:
        'An insecure search page would treat <b> as a real HTML tag and change the page layout instead of showing the literal query.',
      safeRendered: `Showing results for: <b class="demo">Algorithms</b>`,
      note: 'Notice how safe output shows the exact typed characters literally as plain text.',
    },
    preventionTechniques: [
      {
        title: 'Context-Aware Output Encoding',
        detail: 'Convert <, >, &, ", and \' to HTML entities (&lt;, &gt;, etc.) before inserting request parameters into HTML.',
      },
      {
        title: 'Use Safe Template Engines / React JSX',
        detail: 'Modern frameworks like React automatically escape {searchQuery} inside JSX text nodes.',
      },
      {
        title: 'Input Length & Character Validation',
        detail: 'Validate query formats on the server (e.g., reject unexpected control characters or overly long strings).',
      },
    ],
    vulnerableCode: `// Conceptual Unsafe Pattern (Do Not Use)\napp.get('/search', (req, res) => {\n  const query = req.query.q;\n  res.send(\`<p>Results for: \${query}</p>\`);\n});`,
    secureCode: `// Safe Escaped Pattern\nimport escapeHtml from 'escape-html';\napp.get('/search', (req, res) => {\n  const safeQuery = escapeHtml(req.query.q || '');\n  res.send(\`<p>Results for: \${safeQuery}</p>\`);\n});`,
  },
  {
    id: 'stored',
    number: '02',
    title: 'Stored XSS (Persistent)',
    shortTitle: 'Stored XSS',
    simpleDefinition:
      'Stored XSS happens when untrusted user input is saved into a database (such as a comment section, forum post, or student profile) and later displayed raw to everyone who opens that page.',
    scenarioTitle: 'Harmless Scenario: Student Workshop Noticeboard',
    scenarioDescription:
      'Suppose a college club builds a discussion board where students post workshop feedback. If a post containing raw HTML tags is saved in the database and rendered unescaped for every classmate who visits the board, every visitor’s browser receives that markup.',
    howItHappens: [
      {
        stepTitle: '1. User Submits Persistent Content',
        summary: 'Text containing HTML-like markup is sent through a comment or profile form.',
        deepDive:
          'Unlike Reflected XSS, this data is meant to stay on the website for future visitors, making protection even more critical.',
      },
      {
        stepTitle: '2. Database Stores Unsanitized Text',
        summary: 'The backend saves the raw comment string without sanitizing or encoding on output.',
        deepDive:
          'Even if a database stores raw user text, the application must never trust stored strings when rendering them back into HTML.',
      },
      {
        stepTitle: '3. Every Visitor Loads the Stored Post',
        summary: 'Whenever classmates open the forum page, their browsers receive the stored entry.',
        deepDive:
          'Using safe text rendering (like React {comment} or textContent) ensures every visitor sees safe literal characters.',
      },
    ],
    flowDiagram: [
      {
        node: 'Comment Form',
        actor: 'Contributor',
        unsafeBehavior: 'Submits raw HTML-like comment',
        safeBehavior: 'Submits comment text',
      },
      {
        node: 'Database Storage',
        actor: 'Backend Store',
        unsafeBehavior: 'Saves raw string; no output policy',
        safeBehavior: 'Validates schema & sanitizes markup',
      },
      {
        node: 'Forum Page Feed',
        actor: 'Server / API',
        unsafeBehavior: 'Sends raw HTML into template',
        safeBehavior: 'Returns JSON text for safe binding',
      },
      {
        node: 'Visitor Browsers',
        actor: 'All Readers',
        unsafeBehavior: 'Interprets stored tags on load',
        safeBehavior: 'Renders pure text safely for all',
      },
    ],
    safeExample: {
      harmlessInput: `Feedback: Great lab! <span style="color:cyan">[Workshop Note]</span>`,
      unsafeConceptual:
        'An insecure comment board would render custom HTML styling or active attributes inside another student’s browser.',
      safeRendered: `Feedback: Great lab! <span style="color:cyan">[Workshop Note]</span>`,
      note: 'In XSS GUARD’s safe simulator, stored comments always display as plain text without altering page structure.',
    },
    preventionTechniques: [
      {
        title: 'Safe Text Rendering by Default',
        detail: 'Bind database strings using React JSX {comment.text} or DOM textContent instead of innerHTML.',
      },
      {
        title: 'Allowlist HTML Sanitization (If Rich Text Is Needed)',
        detail: 'If formatted text is allowed, use a strict allowlist sanitizer that strips <script>, <iframe>, and all on* event attributes.',
      },
      {
        title: 'Content Security Policy (CSP) & HttpOnly Cookies',
        detail: 'Add defense-in-depth headers and HttpOnly session cookies so unauthorized scripts cannot run or read tokens.',
      },
    ],
    vulnerableCode: `// Conceptual Unsafe Pattern (Do Not Use)\ncomments.forEach((item) => {\n  board.innerHTML += \`<div class="post">\${item.text}</div>\`;\n});`,
    secureCode: `// Safe React Rendering\nfunction CommentList({ comments }) {\n  return comments.map((item) => (\n    <div key={item.id} className="post">{item.text}</div>\n  ));\n}`,
  },
  {
    id: 'dom',
    number: '03',
    title: 'DOM-Based XSS (Client-Side)',
    shortTitle: 'DOM-Based XSS',
    simpleDefinition:
      'DOM-Based XSS occurs entirely inside the user’s browser when client-side JavaScript reads untrusted data (like the URL #fragment or search params) and writes it into an unsafe DOM property such as innerHTML.',
    scenarioTitle: 'Harmless Scenario: Campus Event Welcome Banner',
    scenarioDescription:
      'A static event page reads a student’s name from the URL fragment (e.g., #guest=Priya) to show a personalized welcome banner. Because the #fragment stays in the browser and never reaches the server, insecure client-side JavaScript can accidentally interpret HTML characters.',
    howItHappens: [
      {
        stepTitle: '1. Client Script Reads Untrusted Source',
        summary: 'Browser JavaScript reads window.location.hash or URLSearchParams.',
        deepDive:
          'Common untrusted DOM sources include location.hash, location.search, and postMessage payloads.',
      },
      {
        stepTitle: '2. Data Flows to an Unsafe DOM Sink',
        summary: 'The script assigns that string directly to innerHTML or document.write.',
        deepDive:
          'Because the server is not involved in parsing the #hash fragment, server-side filters never even see the input!',
      },
      {
        stepTitle: '3. Browser Updates the Live DOM Tree',
        summary: 'The DOM parses any embedded tags or event attributes immediately.',
        deepDive:
          'Switching one line from element.innerHTML = name to element.textContent = name eliminates the vulnerability completely.',
      },
    ],
    flowDiagram: [
      {
        node: 'URL Fragment (#)',
        actor: 'Browser Address',
        unsafeBehavior: '#guest=<b>Priya</b>',
        safeBehavior: '#guest=<b>Priya</b>',
      },
      {
        node: 'Client JS Reader',
        actor: 'DOM Source',
        unsafeBehavior: 'Reads location.hash directly',
        safeBehavior: 'Reads & validates URLSearchParams',
      },
      {
        node: 'DOM Assignment',
        actor: 'DOM Sink',
        unsafeBehavior: 'Writes via element.innerHTML',
        safeBehavior: 'Writes via element.textContent',
      },
      {
        node: 'Rendered Banner',
        actor: 'Live DOM',
        unsafeBehavior: 'Parses HTML nodes dynamically',
        safeBehavior: 'Prints literal text safely',
      },
    ],
    safeExample: {
      harmlessInput: `URL Hash: #guest=<i>Riya</i>`,
      unsafeConceptual:
        'Using element.innerHTML turns <i>Riya</i> into an italic HTML element, proving the browser is parsing markup from the URL.',
      safeRendered: `Welcome, <i>Riya</i>!`,
      note: 'Replacing innerHTML with textContent or React JSX ensures URL fragments are treated strictly as plain text.',
    },
    preventionTechniques: [
      {
        title: 'Prefer Safe DOM Sinks (textContent)',
        detail: 'Always use element.textContent or React JSX bindings instead of innerHTML, outerHTML, or document.write.',
      },
      {
        title: 'Avoid Dynamic Code Evaluation',
        detail: 'Never pass user-influenced strings into eval(), new Function(), or string-based setTimeout calls.',
      },
      {
        title: 'Validate URL Schemes',
        detail: 'Before setting <a href={url}>, confirm the URL starts with https:// or http:// rather than javascript:.',
      },
    ],
    vulnerableCode: `// Conceptual Unsafe Pattern (Do Not Use)\nconst guest = decodeURIComponent(location.hash.slice(1));\ndocument.getElementById('banner').innerHTML = guest;`,
    secureCode: `// Safe DOM Sink Pattern\nconst guest = decodeURIComponent(location.hash.slice(1));\ndocument.getElementById('banner').textContent = guest;`,
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question:
      'Which type of XSS happens when user input from a search box or URL parameter is echoed straight back in a single server response without saving it?',
    options: [
      'Reflected XSS',
      'Stored XSS',
      'Hardware XSS',
      'Encrypted XSS',
    ],
    correctIndex: 0,
    explanation:
      'Reflected XSS is non-persistent: the server reflects input from the immediate HTTP request back into the response page.',
  },
  {
    id: 'q2',
    question:
      'Why is Stored XSS considered persistent across multiple visitors?',
    options: [
      'It is saved in a database (such as a comment or profile) and served whenever users open that page.',
      'It only runs inside browser developer tools.',
      'It requires editing the user’s operating system registry.',
      'It only affects offline HTML files.',
    ],
    correctIndex: 0,
    explanation:
      'Stored XSS persists in backend storage like a comment table or forum thread, so every subsequent visitor receives it unless properly encoded or sanitized.',
  },
  {
    id: 'q3',
    question:
      'Why does assigning user input to element.textContent prevent DOM-based XSS while element.innerHTML can cause it?',
    options: [
      'textContent inserts raw character data literally without parsing HTML tags or attributes.',
      'textContent encrypts the string with AES-256.',
      'innerHTML only works on backend Node.js servers.',
      'textContent deletes all letters and numbers.',
    ],
    correctIndex: 0,
    explanation:
      'textContent treats input strictly as plain text, so characters like < and > appear visibly on screen rather than creating new DOM elements.',
  },
  {
    id: 'q4',
    question:
      'What does Output Encoding do to characters such as < and > before placing them in HTML?',
    options: [
      'Converts them into harmless HTML entities (&lt; and &gt;) so the browser displays them as text.',
      'Compresses the web page into a ZIP archive.',
      'Executes the code faster on the CPU.',
      'Stores the text inside browser cookies.',
    ],
    correctIndex: 0,
    explanation:
      'Output encoding turns HTML control characters into safe entity codes (&lt;, &gt;, &quot;) so the browser’s parser cannot mistake user data for markup.',
  },
  {
    id: 'q5',
    question:
      'Which cookie security flag stops client-side JavaScript from reading sensitive session cookies via document.cookie?',
    options: [
      'HttpOnly',
      'AutoFocus',
      'ReadWrite',
      'PublicCache',
    ],
    correctIndex: 0,
    explanation:
      'Setting the HttpOnly flag tells the browser to keep the session cookie inaccessible to client-side JavaScript, adding an important layer of defense-in-depth.',
  },
];

export const EXECUTION_PATH_SCENARIOS: ExecutionPathScenario[] = [
  {
    id: 'happy-valid',
    label: 'Happy Path: Valid Name & Normal Comment',
    pathType: 'happy',
    sampleInput: 'Great cybersecurity workshop! Always encode user text before rendering.',
    summary:
      'All 7 workflow steps succeed cleanly: the user enters a valid name and normal comment, validation passes, and the comment displays safely with a confirmation message.',
    httpStatus: '200 OK · Success',
    steps: [
      {
        nodeTitle: '1. User opens the comment form',
        role: 'Step 01 · Form Ready',
        status: 'nominal',
        detail: 'The browser loads the workshop comment form with Name and Comment fields ready.',
        dataSnapshot: 'Form Status: Ready for Input',
      },
      {
        nodeTitle: '2. User enters a valid name',
        role: 'Step 02 · Name Input',
        status: 'nominal',
        detail: 'Student types a non-empty display name into the Name input field.',
        dataSnapshot: 'Name: "Ananya Rao"',
      },
      {
        nodeTitle: '3. User enters a normal comment',
        role: 'Step 03 · Comment Input',
        status: 'nominal',
        detail: 'Student writes plain text feedback without suspicious HTML or script tags.',
        dataSnapshot: 'Comment: "Great cybersecurity workshop! Always encode user text."',
      },
      {
        nodeTitle: '4. User clicks Submit',
        role: 'Step 04 · Form Submit',
        status: 'nominal',
        detail: 'Submission handler captures the Name and Comment values for inspection.',
        dataSnapshot: 'Action: Submit Event Triggered',
      },
      {
        nodeTitle: '5. Website validates the fields',
        role: 'Step 05 · Validation Check',
        status: 'nominal',
        detail: 'Both fields are non-empty and contain zero unsafe HTML tags or event handlers.',
        dataSnapshot: 'Validation: Passed · 0 Suspicious Patterns',
      },
      {
        nodeTitle: '6. Website safely displays the comment',
        role: 'Step 06 · Safe DOM Render',
        status: 'nominal',
        detail: 'React renders the name and comment inside pure text nodes.',
        dataSnapshot: 'Displayed: Ananya Rao — "Great cybersecurity workshop!"',
      },
      {
        nodeTitle: '7. Show a success message',
        role: 'Step 07 · Confirmation',
        status: 'nominal',
        detail: 'User sees a green confirmation banner confirming the comment was posted safely.',
        dataSnapshot: 'Success: Comment published safely (HTTP 200 OK)',
      },
    ],
  },
  {
    id: 'exception-suspicious',
    label: 'Exception Path: Suspicious HTML-Like Input',
    pathType: 'exception',
    sampleInput: `<img src="badge.png" onerror="alert('XSS Demo')">`,
    summary:
      'User submits suspicious HTML-like input. The website identifies the unsafe pattern, neutralizes it without executing any script, and displays a security warning.',
    httpStatus: 'Handled Safely · Warning',
    steps: [
      {
        nodeTitle: '1. User opens the comment form',
        role: 'Step 01 · Form Ready',
        status: 'nominal',
        detail: 'The browser loads the workshop comment form with Name and Comment fields.',
        dataSnapshot: 'Form Status: Ready for Input',
      },
      {
        nodeTitle: '2. User submits suspicious HTML-like input',
        role: 'Step 02 · Suspicious Input',
        status: 'warning',
        detail: 'User enters a comment containing an HTML tag and inline onerror event pattern.',
        dataSnapshot: `Name: "Rohan" · Comment: "<img src='badge.png' onerror='...'>"`,
      },
      {
        nodeTitle: '3. Website checks the input',
        role: 'Step 03 · Security Inspection',
        status: 'warning',
        detail: 'The lexical analyzer scans the submitted string for HTML delimiters and on* handlers.',
        dataSnapshot: 'Scanner: Inspecting tokens...',
      },
      {
        nodeTitle: '4. Website identifies potentially unsafe content',
        role: 'Step 04 · Exception Detected',
        status: 'blocked',
        detail: 'Analyzer flags active HTML markup (<img ...>) and the inline onerror= attribute.',
        dataSnapshot: 'Flagged: HTML Tag + Inline Event Handler (onerror)',
      },
      {
        nodeTitle: '5. Website safely handles content without executing it',
        role: 'Step 05 · Safe Neutralization',
        status: 'nominal',
        detail: 'HTML characters are escaped and rendered as inert plain text—zero JavaScript runs.',
        dataSnapshot: `Rendered as literal text: &lt;img src="badge.png" ...&gt;`,
      },
      {
        nodeTitle: '6. Display an appropriate warning message',
        role: 'Step 06 · Warning Banner',
        status: 'warning',
        detail: 'An alert banner informs the user that suspicious HTML-like syntax was neutralized safely.',
        dataSnapshot: 'Warning: Unsafe markup neutralized; rendered safely as text.',
      },
    ],
  },
  {
    id: 'exception-empty',
    label: 'Exception Path: Empty Comment Field',
    pathType: 'exception',
    sampleInput: '   ',
    summary:
      'User attempts to submit an empty comment. Validation catches the missing field immediately before storage or rendering and shows a clear validation message.',
    httpStatus: '400 Validation Error',
    steps: [
      {
        nodeTitle: '1. User opens the comment form',
        role: 'Step 01 · Form Ready',
        status: 'nominal',
        detail: 'The browser loads the workshop comment form with Name and Comment fields.',
        dataSnapshot: 'Form Status: Ready for Input',
      },
      {
        nodeTitle: '2. User submits an empty comment',
        role: 'Step 02 · Empty Submission',
        status: 'warning',
        detail: 'User leaves the Comment textarea blank (or whitespace-only) and clicks Submit.',
        dataSnapshot: 'Name: "Meera" · Comment: "" (0 characters)',
      },
      {
        nodeTitle: '3. Website checks the input',
        role: 'Step 03 · Field Check',
        status: 'warning',
        detail: 'Form validator trims whitespace and checks required field lengths.',
        dataSnapshot: 'comment.trim().length === 0',
      },
      {
        nodeTitle: '4. Website identifies the validation issue',
        role: 'Step 04 · Exception Detected',
        status: 'blocked',
        detail: 'Validation fails because a non-empty comment is required before posting.',
        dataSnapshot: 'Exception: EMPTY_COMMENT_FIELD',
      },
      {
        nodeTitle: '5. Website safely halts submission',
        role: 'Step 05 · Safe Guard',
        status: 'nominal',
        detail: 'The comment feed state remains untouched and no blank entry is added.',
        dataSnapshot: 'Feed Protected · Zero Empty Entries Added',
      },
      {
        nodeTitle: '6. Display an appropriate validation message',
        role: 'Step 06 · Validation Alert',
        status: 'warning',
        detail: 'User sees a clear message asking them to enter a valid comment before submitting.',
        dataSnapshot: 'Validation Message: "Comment field cannot be empty."',
      },
    ],
  },
];

export const INITIAL_SECURITY_REPORTS: SecurityReportEntry[] = [
  {
    id: 'rep-101',
    timestamp: '10:14:22',
    sourceModule: 'Live Simulator',
    context: 'Reflected',
    payload: `<script>alert('XSS Demo')</script>`,
    severity: 'Critical',
    outcome: 'Blocked',
    defenseMode: 'XSS Guard Active (Encoding + CSP)',
    ruleTriggered: 'Direct <script> tag injection',
  },
  {
    id: 'rep-102',
    timestamp: '10:18:05',
    sourceModule: 'Attack Playground',
    context: 'Stored',
    payload: `<img src="invalid" onerror="alert(1)">`,
    severity: 'High',
    outcome: 'Sanitized',
    defenseMode: 'Allowlist Sanitizer',
    ruleTriggered: 'Inline DOM event handler attribute',
  },
  {
    id: 'rep-103',
    timestamp: '10:21:47',
    sourceModule: 'Live Simulator',
    context: 'DOM-Based',
    payload: `<a href="javascript:alert(document.cookie)">Profile</a>`,
    severity: 'High',
    outcome: 'Blocked',
    defenseMode: 'URI Protocol Filter',
    ruleTriggered: 'Executable pseudo-protocol URI',
  },
  {
    id: 'rep-104',
    timestamp: '10:25:12',
    sourceModule: 'Execution Paths',
    context: 'Validation',
    payload: 'Workshop note: Always encode untrusted output.',
    severity: 'Safe',
    outcome: 'Allowed',
    defenseMode: 'Happy Path Verification',
    ruleTriggered: 'None (Valid plaintext)',
  },
];
