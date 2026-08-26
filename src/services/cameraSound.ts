/**
 * Easy Study Snap - Shutter Feedback Sound Engine
 * Uses browser Web Audio API to synthesize a crisp camera shutter sound offline.
 */

class CameraSoundEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays a quick mechanical click/shutter sound
   */
  playShutterSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Initial click tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);

      // 2. Second shutter closing snap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(300, now + 0.09);

      gain2.gain.setValueAtTime(0.25, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.05);
      osc2.stop(now + 0.095);
    } catch {
      // Audio autoplay policy or silent mode, ignore gracefully
    }
  }
}

export const cameraSound = new CameraSoundEngine();
