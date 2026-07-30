let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, startAt: number, duration: number, gain: number, audioCtx: AudioContext) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gainNode.gain.setValueAtTime(0, startAt);
  gainNode.gain.linearRampToValueAtTime(gain, startAt + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

// Kort, vrolijk drieklank-akkoordje omhoog — bij een exacte voorspelling.
export function playSuccessChime(): void {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  tone(523.25, now, 0.16, 0.08, audioCtx);
  tone(659.25, now + 0.09, 0.16, 0.08, audioCtx);
  tone(783.99, now + 0.18, 0.22, 0.09, audioCtx);
}

// Kort, zacht dalend blipje — bij een gemiste voorspelling.
export function playMissBlip(): void {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  tone(311.13, now, 0.14, 0.06, audioCtx);
  tone(233.08, now + 0.08, 0.18, 0.06, audioCtx);
}
