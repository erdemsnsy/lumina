import { el } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { openModal } from '../utils/helpers.js';

export function navigateTo(viewName) {
  playUiSound('page');
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.navlink-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.mobile-dock-btn').forEach(btn => btn.classList.remove('active'));

  const targetView = el('view-' + viewName);
  const targetBtn = el('navBtn-' + viewName);
  const targetDockBtn = el('mobDockBtn-' + viewName);

  if (targetView) targetView.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
  if (targetDockBtn) targetDockBtn.classList.add('active');

  // Trigger view-specific render handlers
  if (viewName === 'favorites') {
    if (typeof window.renderFavoritesPage === 'function') window.renderFavoritesPage();
  } else if (viewName === 'cart') {
    if (typeof window.renderCartPage === 'function') window.renderCartPage();
  } else if (viewName === 'quotes') {
    if (typeof window.renderQuotes === 'function') window.renderQuotes();
  } else if (viewName === 'profile') {
    if (typeof window.renderProfilePage === 'function') window.renderProfilePage();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToSection(sectionId) {
  playUiSound('page');
  const currentView = document.querySelector('.app-view.active');
  if (!currentView || currentView.id !== 'view-home') {
    navigateTo('home');
  }

  // Update navbar active state
  document.querySelectorAll('.navlink-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.mobile-dock-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtnId = (sectionId === 'katalog' || sectionId === 'catalogSection') ? 'navBtn-catalog' : 'navBtn-' + sectionId;
  const activeBtn = el(targetBtnId) || el('navBtn-home');
  if (activeBtn) activeBtn.classList.add('active');

  const dockTarget = (sectionId === 'katalog' || sectionId === 'catalogSection') ? el('mobDockBtn-catalog') : el('mobDockBtn-home');
  if (dockTarget) dockTarget.classList.add('active');

  setTimeout(() => {
    const s = el(sectionId);
    if (s) s.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

export function focusSearch() {
  scrollToSection('katalog');
  const q = el('search') || el('catalogSearch');
  if (q) {
    q.focus();
    // Also try focusing after scroll finishes just in case
    setTimeout(() => q.focus(), 350);
  }
}

export function handleProfileNavClick() {
  if (!state.currentUser) {
    openModal('authModal');
  } else {
    navigateTo('profile');
  }
}

export function toggleMobileNavMenu(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const menu = el('mobileNavMenu');
  if (!menu) return;
  const isShow = menu.classList.contains('show');
  document.querySelectorAll('.ambient-dropdown, .mobile-nav-dropdown').forEach(m => m.classList.remove('show'));
  if (!isShow) menu.classList.add('show');
}

// Global click listener to dismiss mobile nav menu
document.addEventListener('click', (e) => {
  const menu = el('mobileNavMenu');
  const btn = el('navMobileMoreBtn');
  if (menu && menu.classList.contains('show')) {
    if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      menu.classList.remove('show');
    }
  }
});
