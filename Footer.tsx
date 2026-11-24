import { NavPageId } from '../types/security';
import { NAV_ITEMS } from './Navbar';

interface FooterProps {
  onNavigate: (page: NavPageId) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="relative z-10 mt-20 border-t border-cyan-500/15 bg-[#040711]/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-2.5">
            <div className="font-display text-lg font-bold text-white">
              XSS <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">GUARD</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              First-Year B.Tech Engineering Workshop Project. Designed strictly for safe, local, client-side cybersecurity education and defensive coding practice.
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="text-left text-sm text-slate-400 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 py-0.5"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>XSS GUARD · Interactive XSS Protection Simulator · Academic Workshop Edition</p>
          <p>All demonstrations execute safely inside an isolated lexical sandbox.</p>
        </div>
      </div>
    </footer>
  );
}
