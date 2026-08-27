import { el } from '../utils/helpers.js';

let audioCtx = null;
let lastStepTime = 0;
let lastSwingSign = 0;

export function ensureAudioUnlocked() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch(e) {}
}

if (typeof window !== 'undefined') {
  ['click', 'pointerdown', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(evt => {
    window.addEventListener(evt, ensureAudioUnlocked, { passive: true, once: false });
  });
}

export function playRealisticFootstep(progress, swingSign) {
  try {
    ensureAudioUnlocked();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const now = audioCtx.currentTime;
    if (Math.abs(swingSign) > 0.5 && Math.sign(swingSign) !== lastSwingSign && (now - lastStepTime > 0.20)) {
      lastSwingSign = Math.sign(swingSign);
      lastStepTime = now;

      const isCarpet = progress < 0.90;
      const isRightFoot = swingSign > 0;
      const baseFreq = isCarpet ? (isRightFoot ? 160 : 145) : (isRightFoot ? 310 : 290);

      // Cushioned velvet carpet texture noise
      const bufferSize = audioCtx.sampleRate * 0.10;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.035));
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = isCarpet ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(baseFreq, now);
      filter.Q.setValueAtTime(isCarpet ? 1.5 : 3.5, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(isCarpet ? 0.22 : 0.12, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isCarpet ? 0.09 : 0.05));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.10);

      // Solid body weight step thump
      const thudOsc = audioCtx.createOscillator();
      const thudGain = audioCtx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(isCarpet ? 80 : 140, now);
      thudOsc.frequency.exponentialRampToValueAtTime(isCarpet ? 38 : 50, now + 0.06);

      thudGain.gain.setValueAtTime(0.001, now);
      thudGain.gain.linearRampToValueAtTime(isCarpet ? 0.28 : 0.10, now + 0.006);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      thudOsc.connect(thudGain);
      thudGain.connect(audioCtx.destination);

      thudOsc.start(now);
      thudOsc.stop(now + 0.09);
    }
  } catch(e) {}
}

let isSfxEnabled = true;

export function toggleSfx(event) {
  if (event && event.stopPropagation) event.stopPropagation();
  isSfxEnabled = !isSfxEnabled;
  localStorage.setItem('lumina_sfx_enabled', isSfxEnabled ? '1' : '0');
  updateSfxUi();
  playUiSound('click');
}

export function updateSfxUi() {
  const stored = localStorage.getItem('lumina_sfx_enabled');
  if (stored !== null) isSfxEnabled = (stored === '1');
  const btn = el('sfxToggleBtn');
  if (btn) {
    btn.textContent = isSfxEnabled ? 'AÇIK' : 'KAPALI';
    btn.style.background = isSfxEnabled ? 'rgba(243,212,120,0.22)' : 'rgba(255,255,255,0.08)';
    btn.style.borderColor = isSfxEnabled ? '#f3d478' : 'rgba(255,255,255,0.2)';
    btn.style.color = isSfxEnabled ? '#f3d478' : 'var(--muted)';
  }
  const profBtn = el('profileSfxToggleBtn');
  if (profBtn) {
    profBtn.classList.toggle('active', isSfxEnabled);
    const label = profBtn.querySelector('.toggle-label') || profBtn;
    if (label) label.textContent = isSfxEnabled ? 'Açık' : 'Kapalı';
  }
}

export function playUiSound(soundType) {
  if (!isSfxEnabled) return;
  ensureAudioUnlocked();
  try {
    if (!audioCtx || audioCtx.state === 'suspended') {
      if (audioCtx) audioCtx.resume();
    }
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (soundType === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.05);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (soundType === 'page') {
      const bufferSize = audioCtx.sampleRate * 0.14;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.04));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.8, now);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } else if (soundType === 'stamp') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.175);
    } else if (soundType === 'tink') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (soundType === 'chime') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.14, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.36);
      });
    }
  } catch(e) {}
}

let currentAmbientTrack = 'off';
let ambientNodes = null;

export function toggleAmbientMenu(event) {
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  const menu = el('ambientMenu');
  if (!menu) return;
  menu.classList.toggle('show');
  menu.classList.toggle('open');
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const menu = el('ambientMenu');
    const btn = el('navBtn-ambient');
    if (menu && (menu.classList.contains('show') || menu.classList.contains('open'))) {
      if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
        menu.classList.remove('show');
        menu.classList.remove('open');
      }
    }
  });
}

export function stopCurrentAmbient() {
  if (ambientNodes) {
    try {
      if (ambientNodes.interval) clearInterval(ambientNodes.interval);
      if (ambientNodes.gains) {
        ambientNodes.gains.forEach(g => {
          try {
            if (audioCtx) g.gain.setValueAtTime(0, audioCtx.currentTime);
            g.disconnect();
          } catch(e) {}
        });
      }
      if (ambientNodes.sources) {
        ambientNodes.sources.forEach(s => {
          try {
            s.stop(0);
            s.disconnect();
          } catch(e) {}
        });
      }
    } catch(e) {}
    ambientNodes = null;
  }
  currentAmbientTrack = 'off';
  const label = el('ambientBtnLabel');
  if (label) label.textContent = 'Ambiyans';
  document.querySelectorAll('.ambient-opt-btn').forEach(btn => btn.classList.remove('active'));
  const optOff = el('ambientOpt-off');
  if (optOff) optOff.classList.add('active');
  const navBtn = el('navBtn-ambient');
  if (navBtn) navBtn.classList.remove('playing');
  const menu = el('ambientMenu');
  if (menu) {
    menu.classList.remove('show');
    menu.classList.remove('open');
  }
}

export function setAmbientTrack(trackType) {
  ensureAudioUnlocked();
  if (currentAmbientTrack === trackType) {
    toggleAmbientMenu();
    return;
  }
  stopCurrentAmbient();
  currentAmbientTrack = trackType;

  const menu = el('ambientMenu');
  if (menu) {
    menu.classList.remove('show');
    menu.classList.remove('open');
  }

  document.querySelectorAll('.ambient-opt-btn').forEach(btn => btn.classList.remove('active'));
  const activeOpt = el('ambientOpt-' + trackType);
  if (activeOpt) activeOpt.classList.add('active');

  const navBtn = el('navBtn-ambient');
  const label = el('ambientBtnLabel');

  if (trackType === 'off') {
    if (navBtn) navBtn.classList.remove('playing');
    if (label) label.textContent = 'Ambiyans';
    return;
  }

  if (navBtn) navBtn.classList.add('playing');
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  const now = audioCtx.currentTime;

  if (trackType === 'rain') {
    if (label) label.textContent = 'Yağmur & Fırtına';
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    // Subtle rhythmic raindrop pings
    const dropInterval = setInterval(() => {
      if (currentAmbientTrack !== 'rain') return;
      if (Math.random() < 0.45) {
        try {
          const t = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(Math.random() * 600 + 1200, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
          g.gain.setValueAtTime(0.02, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          osc.connect(g);
          g.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.045);
        } catch(e) {}
      }
    }, 220);

    ambientNodes = { sources: [noise], gains: [gain], interval: dropInterval };
  } else if (trackType === 'fireplace') {
    if (label) label.textContent = 'Şömine Ateşi';
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 1.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    const crackleInterval = setInterval(() => {
      if (currentAmbientTrack !== 'fireplace') return;
      if (Math.random() < 0.6) {
        try {
          const t = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(Math.random() * 1200 + 500, t);
          g.gain.setValueAtTime(Math.random() * 0.12 + 0.03, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
          osc.connect(g);
          g.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.035);
        } catch(e) {}
      }
    }, 160);

    ambientNodes = { sources: [noise], gains: [gain], interval: crackleInterval };
  } else if (trackType === 'library') {
    if (label) label.textContent = 'Sessiz Kütüphane';
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.25;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(360, now);
    filter.Q.setValueAtTime(2.2, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    // Warm peaceful drone tone (A2 - 110Hz harmonic)
    const drone = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(110, now);
    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.linearRampToValueAtTime(0.025, now + 2.0);
    drone.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    drone.start();

    ambientNodes = { sources: [noise, drone], gains: [gain, droneGain] };
  } else if (trackType === 'lofi') {
    if (label) label.textContent = 'Lo-Fi Akşam';
    // Lush warm electric piano chords (Cmaj9)
    const frequencies = [130.81, 164.81, 196.00, 246.94, 293.66]; // C3, E3, G3, B3, D4
    const oscs = [];
    const gains = [];

    frequencies.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const targetVol = idx === 0 ? 0.05 : 0.025;
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(targetVol, now + 1.5);

      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start();
      oscs.push(osc);
      gains.push(g);
    });

    ambientNodes = { sources: oscs, gains: gains };
  }
}

export function playPageFlipSound() {
  playUiSound('page');
}
