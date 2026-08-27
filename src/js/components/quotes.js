import { el, safeText, openModal, closeModal, toast } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { updateAllRealStatistics } from './stats.js';
import { api } from '../services/api.js';

let pendingDeleteQuoteId = null;

export function renderQuotes(filterTag, searchQ) {
  const container = el('quotesGrid') || el('quoteList') || el('quotesListContainer');
  if (!container) return;

  const searchInput = el('quoteSearch') || el('quoteSearchInput');
  const tagSelect = el('quoteTagFilter') || el('quoteTagSelect');

  const query = (searchQ !== undefined ? searchQ : (searchInput ? searchInput.value : '')).toLowerCase().trim();
  const tag = (filterTag !== undefined ? filterTag : (tagSelect ? tagSelect.value : '')).trim();

  const filtered = state.quotes.filter(q => {
    const matchesQ = !query ||
                     (q.text && q.text.toLowerCase().includes(query)) ||
                     (q.bookTitle && q.bookTitle.toLowerCase().includes(query)) ||
                     (q.author && q.author.toLowerCase().includes(query)) ||
                     (q.userName && q.userName.toLowerCase().includes(query));
    const matchesTag = !tag || tag === 'ALL' || tag === 'Tüm Etiketler' || (q.tag && q.tag.toLowerCase() === tag.toLowerCase());
    return matchesQ && matchesTag;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
        <h3 style="margin-bottom:8px">Okur defterinizde alıntı bulunmuyor.</h3>
        <p style="font-size:14px">Kitap detayları sayfasından beğendiğiniz pasajları defterinize ekleyebilirsiniz.</p>
        <button class="btn-action-primary" style="margin-top:16px" onclick="document.querySelector('.nav-link[href=\'#view-home\']').click(); setTimeout(() => document.getElementById('katalog').scrollIntoView({behavior: 'smooth'}), 100)">Kataloğu Aç</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(quote => {
    const isOwner = state.currentUser && (
      (quote.userId !== 'system_archive' && (quote.userEmail ? quote.userEmail === state.currentUser.email : quote.userId === state.currentUser.id)) ||
      (state.currentUser.role === 'Yönetici')
    );
    const isLiked = (state.likedQuotes || []).includes(quote.id);
    const safeQuote = (quote.text || '').replace(/'/g, "\\'");
    const safeBook = (quote.bookTitle || '').replace(/'/g, "\\'");
    const safeAuthor = (quote.author || '').replace(/'/g, "\\'");

    return `
      <article class="quote-card-styled">
        <div class="quote-card-header">
          <span class="quote-tag-badge">#${quote.tag || 'Edebiyat'}</span>
          <span class="quote-date-text">${quote.date || 'Bugün'}</span>
        </div>
        
        <div class="quote-body-wrapper">
          <blockquote class="quote-body-text">
            “${quote.text}”
          </blockquote>
        </div>

        <div class="quote-card-footer">
          <div class="quote-author-info">
            <h4 class="quote-book-title">${quote.bookTitle}</h4>
            <div class="quote-meta-line">
              <span>${quote.author}</span>
              ${quote.page ? `<span class="quote-page-tag">· Sayfa ${quote.page}</span>` : ''}
            </div>
            <small class="quote-sharer-tag">Paylaşan: ${quote.userName || 'Lumina Okuru'}</small>
          </div>

          <div class="quote-actions-cluster">
            <button type="button" onclick="copyQuoteText('${safeQuote}', '${safeBook}', '${safeAuthor}')" class="btn-quote-copy" title="Alıntıyı Kopyala">Kopyala</button>
            <button type="button" onclick="likeQuote(${quote.id})" class="btn-quote-like ${isLiked ? 'liked' : ''}" title="${isLiked ? 'Beğeniyi Geri Al' : 'Alıntıyı Beğen'}">
              <span class="quote-heart-icon">${isLiked ? '♥' : '♡'}</span>
              <span>${quote.likes || 0}</span>
            </button>
            ${isOwner ? `
              <button type="button" onclick="deleteQuote(${quote.id})" class="btn-quote-delete" title="Alıntıyı Sil">✕</button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

export function openAddQuoteModal(defaultBookTitle) {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }
  const bookTitle = defaultBookTitle || (state.books[0] ? state.books[0].title : 'Sessizliğin Atlası');
  const book = state.books.find(b => b.title === bookTitle) || state.books[0] || {};

  if (el('quoteSelectedBookTitle')) el('quoteSelectedBookTitle').textContent = book.title || 'Lumina Edebiyatı';
  if (el('quoteSelectedBookAuthor')) el('quoteSelectedBookAuthor').textContent = (book.author || 'Lumina Yazarı') + (book.genre ? ` · ${book.genre}` : '');

  if (el('quoteBookSelect')) el('quoteBookSelect').value = book.title || '';
  if (el('quoteAuthorInput')) el('quoteAuthorInput').value = book.author || '';
  if (el('quoteTextInput')) el('quoteTextInput').value = '';
  if (el('quotePageInput')) el('quotePageInput').value = '';

  openModal('addQuoteModal');
}

export function autoFillQuoteAuthor() {
  const sel = el('quoteBookSelect') || el('quoteModalBookSelect');
  if (!sel) return;
  const bookTitle = sel.value;
  const book = state.books.find(b => b.title === bookTitle);
  if (book) {
    if (el('quoteAuthorInput')) el('quoteAuthorInput').value = book.author;
    if (el('quoteSelectedBookTitle')) el('quoteSelectedBookTitle').textContent = book.title;
    if (el('quoteSelectedBookAuthor')) el('quoteSelectedBookAuthor').textContent = (book.author || 'Lumina Yazarı') + (book.genre ? ` · ${book.genre}` : '');
  }
}

export function submitNewQuote(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }

  const selBook = (el('quoteBookSelect') || el('quoteModalBookSelect'))?.value || '';
  const authorInput = el('quoteAuthorInput') || el('quoteModalAuthorInput');
  const textInput = el('quoteTextInput') || el('quoteModalTextInput');
  const pageInput = el('quotePageInput') || el('quoteModalPageInput');

  const text = (textInput ? textInput.value : '').trim();
  if (!text) {
    toast('Lütfen alıntı metnini giriniz.');
    textInput?.focus();
    return;
  }

  const bookTitle = selBook || 'Lumina Edebiyat Arşivi';
  const author = (authorInput ? authorInput.value : '').trim() || 'Seçkin Yazar';
  const page = pageInput ? pageInput.value : '';
  const book = state.books.find(b => b.title === bookTitle);
  const tag = (book && book.genre) ? book.genre : 'Edebiyat';

  const newQuote = {
    id: Date.now(),
    userId: state.currentUser.id,
    userName: state.currentUser.name,
    bookTitle: bookTitle,
    author: author,
    text: text,
    page: page ? Number(page) : null,
    tag: tag,
    likes: 0,
    date: new Date().toLocaleDateString('tr-TR')
  };

  state.quotes.unshift(newQuote);
  saveState();
  closeModal('addQuoteModal');
  if (typeof renderProfilePage === 'function') renderProfilePage();
  if (typeof renderUserQuotes === 'function') renderUserQuotes();
  playUiSound('stamp');
  toast('Yeni alıntınız edebiyat defterine kaydedildi!');

  // Sync with API
  api.addQuote(newQuote).catch(() => {});

  if (textInput) textInput.value = '';
  if (pageInput) pageInput.value = '';

  renderQuotes();
  updateAllRealStatistics();
}

export function likeQuote(id) {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return;

  state.likedQuotes = state.likedQuotes || [];
  const index = state.likedQuotes.indexOf(id);

  if (index > -1) {
    // Unlike
    state.likedQuotes.splice(index, 1);
    quote.likes = Math.max(0, (quote.likes || 1) - 1);
    saveState();
    playUiSound('click');
    toast('Alıntı beğenisi geri alındı.');
  } else {
    // Like
    state.likedQuotes.push(id);
    quote.likes = (quote.likes || 0) + 1;
    saveState();
    playUiSound('tink');
    toast('Alıntı beğenildi! ❤️');
  }

  // Sync like with API
  api.toggleLikeQuote(id, state.currentUser?.email).catch(() => {});

  renderQuotes();
}

export function copyQuoteText(text, bookTitle, author) {
  const formatted = `“${text}”\n— ${bookTitle || ''} (${author || ''})\n[Lumina Kütüphanesi]`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(formatted).then(() => {
      playUiSound('tink');
      toast('Alıntı panoya kopyalandı!');
    }).catch(() => {
      playUiSound('tink');
      toast('Alıntı kopyalandı.');
    });
  } else {
    playUiSound('tink');
    toast('Alıntı kopyalandı.');
  }
}

export function deleteQuote(id) {
  pendingDeleteQuoteId = id;
  openModal('deleteQuoteConfirmModal');
}

export function executeDeleteQuote() {
  if (!pendingDeleteQuoteId) return;
  const idToDelete = pendingDeleteQuoteId;
  state.quotes = state.quotes.filter(q => q.id !== idToDelete);
  saveState();
  closeModal('deleteQuoteConfirmModal');
  pendingDeleteQuoteId = null;
  playUiSound('click');
  toast('Alıntı kaydı başarıyla silindi.');
  
  // Sync delete with API
  api.deleteQuote(idToDelete).catch(() => {});

  renderQuotes();
  if (typeof window.renderMemberProfileData === 'function') window.renderMemberProfileData();
  if (typeof window.renderProfilePage === 'function') window.renderProfilePage();
  updateAllRealStatistics();
}
