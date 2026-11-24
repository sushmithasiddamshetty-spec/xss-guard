import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight, Film } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  CINEMATIC_SEQUENCE,
  TOTAL_INTRO_DURATION_SEC,
  getSceneAtTime,
} from '../data/cinematicSequence';
import { CinematicSoundEngine } from '../utils/cinematicAudio';
import CinematicShieldCanvas from './CinematicShieldCanvas';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  const elapsedRef = useRef<number>(0);
  const soundEngineRef = useRef<CinematicSoundEngine | null>(null);
  const completedRef = useRef<boolean>(false);

  useEffect(() => {
    const engine = new CinematicSoundEngine();
    soundEngineRef.current = engine;
    return () => {
      engine.dispose();
      soundEngineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.1, (now - lastTs) / 1000);
      lastTs = now;

      const next = elapsedRef.current + dt;
      elapsedRef.current = next;
      setElapsedSec(next);
      soundEngineRef.current?.syncTimeline(next);

      if (next >= TOTAL_INTRO_DURATION_SEC && !completedRef.current) {
        completedRef.current = true;
        onComplete();
        return;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete, shouldReduceMotion]);

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngineRef.current?.setMuted(nextMuted);
  };

  const handleSkip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    soundEngineRef.current?.dispose();
    onComplete();
  };

  // Reduced-motion calm editorial alternative
  if (shouldReduceMotion) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="XSS Guard Introduction"
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#171918] px-6 py-8 text-[#F4F0E8] sm:px-12 sm:py-10"
      >
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-semibold tracking-[0.14em] text-[#C6A878]">
            XSS GUARD
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#C6A878]/40 px-4 py-1.5 text-xs font-medium text-[#FCFAF6] transition-colors hover:border-[#C6A878]"
          >
            <span>Skip Intro</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="font-mono text-xs tracking-[0.2em] text-[#C6A878]">
            THE ART OF DIGITAL DEFENCE.
          </div>
          <h1 className="font-display text-4xl font-normal text-[#FCFAF6] sm:text-5xl">
            Every input deserves protection.
          </h1>
          <p className="font-mono text-xs tracking-[0.22em] text-[#A69B8A]">
            UNDERSTAND. DETECT. PROTECT.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#C6A878] px-7 py-2.5 text-sm font-medium text-[#171918] transition-opacity hover:opacity-90"
            >
              <span>Enter XSS Guard</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#A69B8A]">
          Reduced-motion experience enabled
        </div>
      </div>
    );
  }

  const activeScene = getSceneAtTime(elapsedSec);
  const progressRatio = Math.min(1, elapsedSec / TOTAL_INTRO_DURATION_SEC);
  const initialDarkFade = Math.min(1, elapsedSec / 0.8);
  const is3DStage = activeScene.renderer === 'webgl-3d';
  const isTransitionStage = activeScene.renderer === 'transition';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="XSS Guard Opening Film"
      className="fixed inset-0 z-50 overflow-hidden bg-[#090A09] text-[#F4F0E8] select-none"
    >
      {/* Visual Stage Layer */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: initialDarkFade }}
      >
        {/* Scenes 1 & 2: Replaceable Video Clip Slot (or Cinema Storyboard Reference) */}
        <AnimatePresence mode="sync">
          {activeScene.renderer === 'video-or-storyboard' && (
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {activeScene.videoSrc && !videoErrors[activeScene.id] ? (
                <video
                  src={activeScene.videoSrc}
                  poster={activeScene.storyboardImage}
                  autoPlay
                  muted
                  playsInline
                  onError={() =>
                    setVideoErrors((prev) => ({
                      ...prev,
                      [activeScene.id]: true,
                    }))
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-full w-full overflow-hidden bg-[#0D0F0E]">
                  {activeScene.storyboardImage && (
                    <motion.img
                      src={activeScene.storyboardImage}
                      alt={activeScene.storyboardAlt ?? activeScene.title}
                      referrerPolicy="no-referrer"
                      initial={{ scale: 1.0 }}
                      animate={{ scale: 1.05 }}
                      transition={{ duration: 3.8, ease: 'easeOut' }}
                      className="h-full w-full object-cover opacity-85"
                    />
                  )}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 45%, rgba(9,10,9,0.12) 0%, rgba(9,10,9,0.78) 100%)',
                    }}
                  />
                </div>
              )}

              {/* Explicit Replaceable Video Clip Placeholder Marker */}
              {(!activeScene.videoSrc || videoErrors[activeScene.id]) &&
                activeScene.replaceableSlotLabel && (
                  <div className="absolute bottom-14 left-6 z-20 flex items-center gap-2 rounded-full border border-[#C6A878]/30 bg-[#171918]/80 px-3.5 py-1.5 font-mono text-[11px] text-[#C6A878] sm:left-10">
                    <Film className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{activeScene.replaceableSlotLabel}</span>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scenes 3-6: Real-time Three.js WebGL 3D Digital Environment & Glass Shield */}
        <motion.div
          initial={false}
          animate={{ opacity: is3DStage ? 1 : 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 ${
            is3DStage ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {elapsedSec >= 6.4 && (
            <CinematicShieldCanvas elapsedSecRef={elapsedRef} />
          )}
        </motion.div>

        {/* Scene 6: Brand Reveal Typography Overlay */}
        <AnimatePresence>
          {activeScene.id === 'brand-reveal' && (
            <motion.div
              key="brand-reveal-overlay"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-6 pb-24 text-center sm:pb-28"
            >
              <div className="space-y-3">
                <div className="font-sans text-2xl font-medium tracking-[0.26em] text-[#FCFAF6] sm:text-4xl">
                  XSS GUARD
                </div>
                <div className="mx-auto h-[1px] w-28 bg-gradient-to-r from-transparent via-[#C6A878] to-transparent" />
                <div className="font-display text-lg font-normal tracking-[0.06em] text-[#C6A878] sm:text-xl">
                  THE ART OF DIGITAL DEFENCE.
                </div>
                <div className="font-mono text-[11px] tracking-[0.24em] text-[#A69B8A] sm:text-xs">
                  UNDERSTAND. DETECT. PROTECT.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scene 7: Transition into Homepage Warm Porcelain */}
        <AnimatePresence>
          {isTransitionStage && (
            <motion.div
              key="homepage-bridge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-[#F4F0E8] px-6 text-center text-[#171918]"
            >
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-3xl font-normal text-[#171918] sm:text-5xl"
              >
                Every input deserves protection.
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle Top HUD: Chapter Telemetry + Sound Toggle + Skip Intro */}
      <div className="relative z-40 flex items-center justify-between gap-4 px-6 py-5 sm:px-10 sm:py-7">
        <div
          className={`space-y-0.5 transition-colors duration-500 ${
            isTransitionStage ? 'text-[#171918]' : 'text-[#FCFAF6]'
          }`}
        >
          <div className="font-mono text-[11px] tracking-[0.14em] text-[#C6A878]">
            {activeScene.sceneNumber} / 0{CINEMATIC_SEQUENCE.length} ·{' '}
            {activeScene.title}
          </div>
          <div
            className={`hidden text-xs sm:block ${
              isTransitionStage ? 'text-[#59554E]' : 'text-[#A69B8A]'
            }`}
          >
            {activeScene.subtitle}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Enable cinematic audio' : 'Mute cinematic audio'}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              isTransitionStage
                ? 'border-[#A69B8A]/50 bg-[#FCFAF6] text-[#171918] hover:border-[#171918]'
                : 'border-[#C6A878]/35 bg-[#171918]/75 text-[#FCFAF6] hover:border-[#C6A878]'
            }`}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-[#A69B8A]" aria-hidden="true" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-[#C6A878]" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? 'Sound Off' : 'Sound On'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              isTransitionStage
                ? 'border-[#171918] bg-[#171918] text-[#FCFAF6]'
                : 'border-[#C6A878]/45 bg-[#171918]/80 text-[#FCFAF6] hover:bg-[#FCFAF6] hover:text-[#171918]'
            }`}
          >
            <span>Skip Intro</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Hairline Champagne Timeline Progress */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[2px] bg-white/10">
        <div
          className="h-full origin-left bg-[#C6A878] transition-transform duration-100 ease-linear"
          style={{ transform: `scaleX(${progressRatio})` }}
        />
      </div>
    </div>
  );
}
