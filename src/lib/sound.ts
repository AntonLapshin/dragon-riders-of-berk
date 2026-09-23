/**
 * Retro WebAudio sound engine — bleeps, roars, fanfares with zero audio files.
 * Singleton; toggle with `sound.enabled`.
 */
class SoundEngine {
  ctx: AudioContext | null = null;
  enabled = true;

  private ac(): AudioContext | null {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, when = 0): void {
    if (!this.enabled) return;
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur);
  }

  tick(): void {
    this.tone(1500, 0.04, 'square', 0.045);
  }
  step(): void {
    this.tone(500 + Math.random() * 80, 0.07, 'triangle', 0.09);
  }
  good(): void {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.11, i * 0.09));
  }
  bad(): void {
    this.tone(190, 0.3, 'sawtooth', 0.09);
    this.tone(120, 0.42, 'sawtooth', 0.08, 0.12);
  }
  clash(): void {
    this.tone(880, 0.12, 'square', 0.08);
    this.tone(660, 0.16, 'square', 0.07, 0.08);
  }
  roar(): void {
    if (!this.enabled) return;
    const c = this.ac();
    if (!c) return;
    const dur = 1.3;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(110, c.currentTime + dur);
    const g = c.createGain();
    g.gain.value = 0.4;
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start();
  }
  win(): void {
    [392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.12, i * 0.12));
  }
}

export const sound = new SoundEngine();
