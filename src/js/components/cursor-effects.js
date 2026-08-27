import { el } from '../utils/helpers.js';
import { state } from '../services/state.js';

export function renderCursorLoop() {
  // cursor animation loop helper
}

export function attachMagneticPull() {
  const magneticTargets = document.querySelectorAll('.navlink-btn, .user-pill-btn, .lang-pill-btn, .btn-action-primary, .fav-btn-icon');
  magneticTargets.forEach(btn => {
    if (btn.dataset.magneticInit) return;
    btn.dataset.magneticInit = 'true';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${relX * 0.16}px, ${relY * 0.16}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

export function init3DTiltCovers() {
  document.querySelectorAll('.mini-cover, .featured-cover, #detailCover').forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = Math.max(0, Math.min(1, x / rect.width));
      const yPct = Math.max(0, Math.min(1, y / rect.height));

      const rotX = ((0.5 - yPct) * 12).toFixed(2);
      const rotY = ((xPct - 0.5) * 12).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.boxShadow = `0 ${16 + (yPct * 8)}px ${32 + (yPct * 10)}px rgba(15,23,20,0.22)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.boxShadow = '';
    });
  });
}

export function initCursorAndEffects() {
  const cursorDot = el('cursorDot');
  const cursorRing = el('cursorRing');
  const cursorLabel = el('cursorLabel');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isCursorVisible = false;

  if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isCursorVisible) {
        isCursorVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
      cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    window.addEventListener('mouseleave', () => {
      isCursorVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    function cursorLoop() {
      if (isCursorVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
      }
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    document.addEventListener('mouseover', (e) => {
      const ambientTarget = e.target.closest('#navBtn-ambient, .ambient-nav-btn, .ambient-opt-btn, #ambientMenu, #ambientBtnLabel');
      const quoteTarget = e.target.closest('.quote-card-styled, .profile-quotes-list .data-row, blockquote');
      const bookTarget = e.target.closest('.mini-cover, .featured-cover, .featured-book, #detailCover, .catalog-grid .book-card');
      const btnTarget = e.target.closest('button, a, .navlink-btn, .fav-btn-icon, .filter-select, input, select');

      if (ambientTarget) {
        cursorRing.className = 'luxury-cursor-ring cursor-hover-ambient';
        if (cursorLabel) cursorLabel.textContent = state.english ? '✦ AUDIO' : '✦ DİNLE';
      } else if (quoteTarget && !e.target.closest('button')) {
        cursorRing.className = 'luxury-cursor-ring cursor-hover-quote';
        if (cursorLabel) cursorLabel.textContent = state.english ? '✦ READ' : '✦ ALINTI';
      } else if (bookTarget && !e.target.closest('button')) {
        cursorRing.className = 'luxury-cursor-ring cursor-hover-book';
        if (cursorLabel) cursorLabel.textContent = state.english ? '✦ EXPLORE' : '✦ İNCELE';
      } else if (btnTarget) {
        cursorRing.className = 'luxury-cursor-ring cursor-hover-btn';
        if (cursorLabel) cursorLabel.textContent = '';
      } else {
        cursorRing.className = 'luxury-cursor-ring';
        if (cursorLabel) cursorLabel.textContent = '';
      }
    });

    setTimeout(attachMagneticPull, 300);
  }

  setTimeout(init3DTiltCovers, 200);
}
