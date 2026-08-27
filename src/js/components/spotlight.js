import { el, safeText, openModal, closeModal } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { showDetails } from './details.js';
import { openReader } from './reader.js';
import { navigateTo, scrollToSection } from './router.js';

let spotlightSelectedIndex = 0;

export function openSpotlight() {
  playUiSound('page');
  const modal = el('spotlightModal');
  if (!modal) return;
  modal.classList.add('show');
  spotlightSelectedIndex = 0;
  const input = el('spotlightInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  handleSpotlightInput();
}

export function closeSpotlight() {
  const modal = el('spotlightModal');
  if (modal) modal.classList.remove('show');
}

export function handleSpotlightBackdropClick(e) {
  if (e.target.id === 'spotlightModal') {
    closeSpotlight();
  }
}

export function handleSpotlightInput() {
  const q = (el('spotlightInput') ? el('spotlightInput').value : '').toLowerCase().trim();
  const list = el('spotlightResultsList') || el('spotlightList');
  if (!list) return;

  const matches = [];

  state.books.forEach(b => {
    if (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q)) {
      matches.push({ type: 'book', title: b.title, sub: b.author + ' · ' + b.genre, action: () => { closeSpotlight(); showDetails(b.title); } });
    }
  });

  state.quotes.forEach(quote => {
    if (quote.text.toLowerCase().includes(q) || quote.bookTitle.toLowerCase().includes(q) || quote.author.toLowerCase().includes(q)) {
      matches.push({ type: 'quote', title: '“' + quote.text.slice(0, 50) + '...”', sub: quote.bookTitle + ' · ' + quote.author, action: () => { closeSpotlight(); navigateTo('quotes'); } });
    }
  });

  const navMatches = [
    { title: 'Kütüphane Kataloğu', sub: 'Tüm Eserleri İncele', action: () => { closeSpotlight(); scrollToSection('katalog'); } },
    { title: 'Okur Defteri & Alıntılar', sub: 'Seçkin Pasajlar', action: () => { closeSpotlight(); navigateTo('quotes'); } },
    { title: 'Kütüphane Hakkında', sub: 'Kuruluş & Felsefe', action: () => { closeSpotlight(); navigateTo('about'); } },
    { title: 'Sıkça Sorulan Sorular', sub: 'Rehber & Bilgi', action: () => { closeSpotlight(); navigateTo('faq'); } },
    { title: 'Okur / Yönetim Paneli', sub: 'Hesap & Ödünç Durumu', action: () => { closeSpotlight(); navigateTo('profile'); } }
  ].filter(n => n.title.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q));

  matches.push(...navMatches);

  if (matches.length === 0) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted);font-size:14px">Sonuç bulunamadı.</div>';
    return;
  }

  spotlightSelectedIndex = Math.min(spotlightSelectedIndex, matches.length - 1);

  list.innerHTML = matches.map((item, idx) => {
    return `
      <div class="spotlight-item ${idx === spotlightSelectedIndex ? 'selected' : ''}" onclick="window.executeSpotlightItem(${idx})">
        <div>
          <strong style="display:block;font-size:14px;color:var(--ink)">${item.title}</strong>
          <small style="color:var(--muted);font-size:12px">${item.sub}</small>
        </div>
        <span class="spotlight-type-tag">${item.type === 'book' ? 'KİTAP' : (item.type === 'quote' ? 'ALINTI' : 'SAYFA')}</span>
      </div>
    `;
  }).join('');

  window._currentSpotlightMatches = matches;
}

export function executeSpotlightItem(index) {
  if (window._currentSpotlightMatches && window._currentSpotlightMatches[index]) {
    window._currentSpotlightMatches[index].action();
  }
}

export function handleSpotlightKeyDown(e) {
  const matches = window._currentSpotlightMatches || [];
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    spotlightSelectedIndex = (spotlightSelectedIndex + 1) % matches.length;
    updateSpotlightSelection();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    spotlightSelectedIndex = (spotlightSelectedIndex - 1 + matches.length) % matches.length;
    updateSpotlightSelection();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executeSpotlightItem(spotlightSelectedIndex);
  }
}

export function updateSpotlightSelection() {
  const items = document.querySelectorAll('.spotlight-item');
  items.forEach((it, i) => it.classList.toggle('selected', i === spotlightSelectedIndex));
  if (items[spotlightSelectedIndex]) {
    items[spotlightSelectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

