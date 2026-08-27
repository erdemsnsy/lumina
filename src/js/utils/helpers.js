import { playUiSound } from '../services/audio.js';

export const el = (id) => document.getElementById(id);

export function toast(msg) {
  const t = el('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

export function openModal(id) { 
  playUiSound('page');
  const m = el(id); 
  if (m) m.classList.add('show'); 
}

export function closeModal(id) { 
  playUiSound('page');
  const m = el(id); 
  if (m) m.classList.remove('show'); 
}

export function safeText(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

export function avg(reviews) {
  if (!reviews || !reviews.length) return 5;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
  return (sum / reviews.length).toFixed(1);
}

export function getFormattedUserRegDate(dateStr) {
  if (!dateStr) return '2026';
  return dateStr;
}
