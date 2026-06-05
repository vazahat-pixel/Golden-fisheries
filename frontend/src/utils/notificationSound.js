/** Shared alert tone — works without mp3 files (browser autoplay rules apply until user gesture). */
let audioCtx = null;
let unlocked = false;

export function unlockNotificationAudio() {
  if (unlocked) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    unlocked = true;
  } catch {
    /* ignore */
  }
}

/** Two-tone “ring” via Web Audio (logistics alert). */
export function playTripAlertSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => playTone(audioCtx)).catch(() => {});
      return;
    }
    playTone(audioCtx);
  } catch (e) {
    console.warn('[Alert Sound]:', e?.message);
  }
}

function playTone(ctx) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  const playBeep = (freq, start, duration) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + duration);
  };

  playBeep(880, now, 0.15);
  playBeep(1175, now + 0.2, 0.2);
  playBeep(880, now + 0.45, 0.15);
}

/** Vibrate on supported mobile browsers */
export function vibrateTripAlert() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 300]);
  }
}
