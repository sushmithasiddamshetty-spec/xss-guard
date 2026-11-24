import { Info, Shield, Code2, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { NavPageId } from '../types/security';

interface AboutProjectViewProps {
  onNavigate: (page: NavPageId) => void;
}

export default function AboutProjectView({ onNavigate }: AboutProjectViewProps) {
  return (
    <div className="space-y-10 pb-8 pt-6">
      {/* Header */}
      <div className="max-w-3xl space-y-3 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-purple-300 uppercase">
          <Info className="h-4 w-4" aria-hidden="true" />
          <span>First-Year B.Tech Engineering Workshop</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          About XSS GUARD
        </h1>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          XSS GUARD is an interactive educational cybersecurity simulator built for first-year B.Tech engineering students to bridge the gap between theoretical web vulnerabilities and practical defensive software engineering.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3"
        >
          <GraduationCap className="h-6 w-6 text-blue-400" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-white">
            Workshop Objectives
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Demonstrate how browsers parse untrusted strings into executable DOM nodes, why naive blocklists fail, and how context-aware output encoding stops XSS at the root.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3"
        >
          <Shield className="h-6 w-6 text-cyan-400" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-white">
            100% Safe Local Sandbox
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            All attack demonstrations run inside a deterministic TypeScript lexical analyzer. Raw payloads are never evaluated or injected via innerHTML into the host application.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3"
        >
          <Code2 className="h-6 w-6 text-purple-400" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-white">
            Engineering Architecture
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Built with React 19, TypeScript, Tailwind CSS, Motion animations, and Lucide vector icons—zero external API keys, paid services, or remote servers required.
          </p>
        </motion.div>
      </div>

      {/* Responsible Security & Lab Guide */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-border-card rounded-2xl p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-8">
            <h2 className="font-display text-2xl font-bold text-white">
              Responsible Security &amp; Ethics Commitment
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              XSS GUARD is strictly an educational and defensive training platform. Understanding how injection flaws arise empowers developers to write safer React components, configure strict Content Security Policies, and validate untrusted user data across every application layer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <button
              type="button"
              onClick={() => onNavigate('simulator')}
              className="btn-primary-cyber px-5 py-2.5 text-sm"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
