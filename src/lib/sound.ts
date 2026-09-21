/**
 * Cyber Haptic Sound Engine
 * Procedural Web Audio API sound generator with zero external audio assets.
 * Ultra-lightweight, privacy-friendly, and accessible.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

// Initialize mute state from localStorage if in browser
if (typeof window !== "undefined") {
  try {
    isMuted = localStorage.getItem("cyber_sound_muted") === "true";
  } catch {
    isMuted = false;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

export function toggleAudioMute(): boolean {
  isMuted = !isMuted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cyber_sound_muted", String(isMuted));
    } catch {}
  }
  return isMuted;
}

/**
 * Play a subtle cyber click (used for hover and light tap)
 */
export function playSoftClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(820, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.025);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.026);
}

/**
 * Play a high-tech toggle bleep (used when flipping switches or radio options)
 */
export function playToggleBeep(isOn = true) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  const startFreq = isOn ? 440 : 660;
  const endFreq = isOn ? 660 : 440;

  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.035);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.036);
}

/**
 * Play an affirmative success chime (used when exporting or copying)
 */
export function playSuccessChime() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 triad
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.04);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + idx * 0.04 + 0.12,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.04);
    osc.stop(ctx.currentTime + idx * 0.04 + 0.13);
  });
}
