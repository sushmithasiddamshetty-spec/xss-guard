import {
  ArrowRight,
  BookOpen,
  Terminal,
  FlaskConical,
  ShieldCheck,
  GitBranch,
  BarChart3,
  Info,
  Layers,
  Cpu,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavPageId } from '../types/security';
import HeroVisual from './HeroVisual';

interface HomeViewProps {
  onNavigate: (page: NavPageId) => void;
  totalLogsCount: number;
}

const LAB_MODULES: Array<{
  id: NavPageId;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof BookOpen;
  accent: string;
}> = [
  {
    id: 'learn',
    title: 'Learn XSS',
    subtitle: 'Foundations & Taxonomy',
    description:
      'Explore Reflected, Stored, and DOM-Based XSS mechanics alongside safe scenarios and a 5-question quiz.',
    icon: BookOpen,
    accent: 'text-blue-400',
  },
  {
    id: 'simulator',
    title: 'Live Simulator',
    subtitle: 'Comment Sandbox',
    description:
      'Submit names and comments to compare conceptual unsafe interpretation against safe React plain-text rendering.',
    icon: Terminal,
    accent: 'text-cyan-400',
  },
  {
    id: 'playground',
    title: 'Attack Playground',
    subtitle: 'Token & Vector Inspector',
    description:
      'Dissect payload anatomy token-by-token to see how parsers detect script tags, event handlers, and URIs.',
    icon: FlaskConical,
    accent: 'text-purple-400',
  },
  {
    id: 'protection',
    title: 'Protection Lab',
    subtitle: 'Defense-in-Depth Stack',
    description:
      'Experiment interactively with Output Encoding, Input Sanitization, and Secure React Rendering.',
    icon: ShieldCheck,
    accent: 'text-emerald-400',
  },
  {
    id: 'paths',
    title: 'Happy & Exception Path',
    subtitle: 'Workflow Trace',
    description:
      'Step through valid comment submissions versus empty fields and suspicious HTML-like patterns.',
    icon: GitBranch,
    accent: 'text-cyan-300',
  },
  {
    id: 'reports',
    title: 'Security Reports',
    subtitle: 'Audit & Analytics',
    description:
      'Review live simulation statistics, input distributions, test history, and export JSON audit reports.',
    icon: BarChart3,
    accent: 'text-blue-300',
  },
  {
    id: 'about',
    title: 'About Project',
    subtitle: 'B.Tech Workshop Overview',
    description:
      'Inspect the educational goals, client-side lexical sandbox architecture, and responsible security ethics.',
    icon: Info,
    accent: 'text-purple-300',
  },
];

export default function HomeView({ onNavigate, totalLogsCount }: HomeViewProps) {
  return (
    <div className="space-y-24 pb-10">
      {/* Hero Section (Immediate Zero-Latency Availability) */}
      <section className="pt-8 sm:pt-12 lg:pt-16">
        <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Core Message & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-6"
          >
            <p className="text-xs font-medium tracking-wide text-cyan-300/90 sm:text-sm">
              Interactive Cybersecurity Laboratory · Safe Client-Side Sandbox
            </p>

            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-[3.5rem]">
              Your First Line of Defence{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Against XSS
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Understand, simulate and prevent Cross-Site Scripting attacks through an interactive security laboratory.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('simulator')}
                className="btn-primary-cyber px-6 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <span>Launch Simulator</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('learn')}
                className="btn-secondary-cyber px-6 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>Explore XSS</span>
              </button>
            </div>

            {/* Clean Typographic Highlights Strip */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-800/90 pt-6">
              <div>
                <div className="font-mono text-2xl font-semibold text-white tabular-nums">3</div>
                <div className="mt-1 text-xs text-slate-400">Core XSS Vectors</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-cyan-300 tabular-nums">3 Labs</div>
                <div className="mt-1 text-xs text-slate-400">Defensive Techniques</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-purple-300 tabular-nums">
                  {totalLogsCount}
                </div>
                <div className="mt-1 text-xs text-slate-400">Logged Lab Runs</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Interactive Cybersecurity Visual */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-6"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* Platform Purpose & How It Works (Animated Scroll Entrance) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-labelledby="platform-overview-heading"
        className="space-y-8"
      >
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            Platform Architecture
          </p>
          <h2
            id="platform-overview-heading"
            className="font-display text-2xl font-bold text-white [text-wrap:balance] sm:text-3xl"
          >
            Built to teach offensive awareness and defensive engineering safely
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            XSS GUARD replaces static textbook slides with a live, deterministic browser sandbox. Every payload is parsed lexically inside memory so students can observe injection mechanics without executing real malicious code.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel rounded-2xl p-6"
          >
            <Layers className="h-6 w-6 text-blue-400" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold text-white">
              Safe Lexical Simulation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Untrusted inputs are tokenized and inspected by a custom AST engine rather than injected into the real DOM, preventing any actual browser execution.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel rounded-2xl p-6"
          >
            <Cpu className="h-6 w-6 text-cyan-400" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold text-white">
              Multi-Context Testing
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Compare how Reflected search queries, Stored forum comments, and DOM-Based URL fragments behave when defenses are applied.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel rounded-2xl p-6"
          >
            <Lock className="h-6 w-6 text-purple-400" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold text-white">
              Defense-in-Depth Pipeline
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Verify how HTML entity encoding, allowlist sanitizers, and React plain-text rendering reinforce one another across every layer.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Lab Modules Grid (Animated Scroll Entrance) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-labelledby="lab-modules-heading"
        className="space-y-8"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-wider text-purple-300 uppercase">
              Laboratory Workspace
            </p>
            <h2
              id="lab-modules-heading"
              className="font-display text-2xl font-bold text-white sm:text-3xl"
            >
              Explore every module in the suite
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <span>Jump to Live Simulator</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LAB_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.id}
                type="button"
                onClick={() => onNavigate(mod.id)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                className="glass-panel glass-panel-hover group flex flex-col justify-between rounded-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${mod.accent}`} aria-hidden="true" />
                    <ArrowRight
                      className="h-4 w-4 text-slate-500 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-cyan-300"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-4 text-xs font-medium text-slate-400">{mod.subtitle}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-white">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {mod.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
