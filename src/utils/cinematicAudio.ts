/**
 * Procedural Web Audio synthesizer for the XSS Guard cinematic opening.
 * Muted by default and only initialized on explicit user interaction.
 */
export class CinematicSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscA: OscillatorNode | null = null;
  private ambientOscB: OscillatorNode | null = null;
  private muted = true;
  private impactTriggered = false;
  private portalTriggered = false;
  private wakeTriggered = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(nextMuted: boolean): void {
    this.muted = nextMuted;

    if (!nextMuted) {
      this.ensureInitialized();
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.32, this.ctx.currentTime + 0.35);
      }
    } else if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.25);
    }
  }

  private ensureInitialized(): void {
    if (this.ctx || typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Subtle Obsidian ambient harmonic bed (D2 + A2)
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.22;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 73.42; // D2

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.value = 110.0; // A2

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(bedGain);
    bedGain.connect(master);

    oscA.start();
    oscB.start();

    this.ctx = ctx;
    this.masterGain = master;
    this.ambientOscA = oscA;
    this.ambientOscB = oscB;
  }

  public syncTimeline(elapsedSec: number): void {
    if (this.muted || !this.ctx || !this.masterGain) return;

    if (!this.wakeTriggered && elapsedSec >= 3.6) {
      this.wakeTriggered = true;
      this.playSoftChime(293.66, 0.9);
    }

    if (!this.portalTriggered && elapsedSec >= 7.2) {
      this.portalTriggered = true;
      this.playWhoosh(1.4, 180, 620, 0.18);
    }

    if (!this.impactTriggered && elapsedSec >= 14.5) {
      this.impactTriggered = true;
      this.playShieldInterception();
    }
  }

  public resetCueFlags(): void {
    this.wakeTriggered = false;
    this.portalTriggered = false;
    this.impactTriggered = false;
  }

  private playSoftChime(freq: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private playWhoosh(
    duration: number,
    startFreq: number,
    endFreq: number,
    peakGain: number
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const sampleCount = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, sampleCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.4;
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.7);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + duration * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration + 0.05);
  }

  private playShieldInterception(): void {
    if (!this.ctx || !this.masterGain) return;
    // Cinematic whoosh preceding crystal shield impact
    this.playWhoosh(0.85, 240, 1100, 0.28);

    const now = this.ctx.currentTime + 0.2;

    // Deep sub-bass thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(115, now);
    subOsc.frequency.exponentialRampToValueAtTime(42, now + 0.9);
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.exponentialRampToValueAtTime(0.42, now + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 1.15);

    // Champagne-gold harmonic glass chord (D4 + A4 + F#5)
    [293.66, 440.0, 739.99].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.11 / (idx + 1), now + idx * 0.03 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.03);
      osc.stop(now + 2.3);
    });
  }

  public dispose(): void {
    try {
      this.ambientOscA?.stop();
      this.ambientOscB?.stop();
      void this.ctx?.close();
    } catch {
      // Ignore audio teardown errors on fast unmount
    }
    this.ctx = null;
    this.masterGain = null;
    this.ambientOscA = null;
    this.ambientOscB = null;
  }
}
