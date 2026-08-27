import { el } from '../utils/helpers.js?v=99999';

let isSiteUnlocked = false;
let unlockTimeout;

export function updateCarpetAnimation(p, isInit = false) {
  // Keeping the function signature to avoid breaking main.js imports
  // But doing nothing here since we have a time-based intro now.
}

export function handleCarpetWheel(e) {
  unlockSiteImmediately();
}

export function handleTouchStart(e) {
  unlockSiteImmediately();
}

export function handleTouchMove(e) {
  unlockSiteImmediately();
}

export function handleKeyDown(e) {
  unlockSiteImmediately();
}

export function unlockSiteImmediately() {
  if (isSiteUnlocked) return;
  isSiteUnlocked = true;

  const intro = el('luminaIntro');
  if (intro) {
    intro.classList.add('unlocked');
    setTimeout(() => {
      intro.style.display = 'none';
      
      // RESTORE SCROLL
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.minHeight = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.minHeight = '';
      
      // Trigger resize for components relying on window size (like sliders)
      window.dispatchEvent(new Event('resize'));
    }, 1200);
  }
  
  if (unlockTimeout) {
    clearTimeout(unlockTimeout);
  }
}

export function replayCarpetIntro() {
  isSiteUnlocked = false;
  const intro = el('luminaIntro');
  if (intro) {
    intro.style.display = 'flex';
    intro.classList.remove('unlocked');
    document.body.style.overflow = 'hidden';
    
    // Auto unlock after 4 seconds if user doesn't interact
    if (unlockTimeout) clearTimeout(unlockTimeout);
    unlockTimeout = setTimeout(unlockSiteImmediately, 4000);
  }
}

// Initial state
if (typeof document !== 'undefined' && document.body) {
  document.body.style.overflow = 'hidden';
  
  // Auto unlock after 4 seconds
  unlockTimeout = setTimeout(unlockSiteImmediately, 4000);
}

// Global Event Listeners to skip intro
window.addEventListener('wheel', handleCarpetWheel, { passive: true });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('click', unlockSiteImmediately, { passive: true });
window.addEventListener('keydown', handleKeyDown, { passive: true });
