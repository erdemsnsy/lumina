import { el, safeText, avg, openModal, closeModal, toast } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { summaries } from '../config/constants.js';
import { renderBooks } from './catalog.js';
import { borrow, buy } from './borrow-buy.js';
import { addToCart } from './cart.js';
import { openReader } from './reader.js';
import { openAddQuoteModal } from './quotes.js';

export function showDetails(title) {
  const book = state.books.find(b => b.title === title);
  if (!book) return;

  state.currentDetailBookTitle = title;
  state.editingReviewId = null;

  if (el('detailCover')) el('detailCover').style.backgroundImage = `url('${book.cover}')`;
  if (el('detailTitle')) el('detailTitle').textContent = book.title;
  if (el('detailAuthor')) el('detailAuthor').textContent = book.author;
  if (el('detailGenre')) el('detailGenre').textContent = book.genre;
  if (el('detailGenreBadge')) el('detailGenreBadge').textContent = (book.genre || 'EDEBİYAT').toUpperCase();
  if (el('detailStockBadge')) el('detailStockBadge').textContent = book.stock > 0 ? `${book.stock} Stokta` : 'Tükendi';
  if (el('detailYearBadge')) el('detailYearBadge').textContent = book.year || '2024';
  if (el('detailPriceAmount')) el('detailPriceAmount').textContent = book.price;
  if (el('detailIsbn')) el('detailIsbn').textContent = `ISBN: ${book.isbn || '978-605-001'}`;
  if (el('detailYear')) el('detailYear').textContent = book.year;
  if (el('detailStock')) el('detailStock').textContent = book.stock + ' Adet Mevcut';
  if (el('detailPrice')) el('detailPrice').textContent = book.price;

  if (el('detailMeta')) {
    el('detailMeta').textContent = `${book.author} · ${book.genre} · ${book.year} · ISBN: ${book.isbn} · Stok: ${book.stock} Adet`;
  }

  const defaultSummary = summaries[book.genre] || 'Edebiyat ve düşünce dünyasına ışık tutan seçkin bir eser.';
  if (el('detailSummary')) el('detailSummary').textContent = defaultSummary;

  // Quotes list for this specific book
  const quotesContainer = el('detailQuotesList');
  if (quotesContainer) {
    const bookQuotes = state.quotes.filter(q => q.bookTitle && q.bookTitle.toLowerCase() === book.title.toLowerCase());
    if (bookQuotes.length === 0) {
      quotesContainer.innerHTML = `<p style="color:var(--muted);margin:4px 0 0;font-size:12px">Bu eserden henüz kaydedilmiş bir alıntı bulunmuyor.</p>`;
    } else {
      quotesContainer.innerHTML = bookQuotes.slice(0, 3).map(q => `
        <div style="padding:6px 0;border-bottom:1px solid var(--line);font-style:italic;color:var(--ink-soft)">
          “${q.text}” <span style="font-style:normal;font-size:11px;color:var(--muted)">— ${q.userName || 'Okur'}</span>
        </div>
      `).join('');
    }
  }

  const btnRead = el('detailReaderBtn');
  if (btnRead) {
    btnRead.onclick = () => {
      openReader(book.title);
    };
  }

  const btnAddQuote = el('detailAddQuoteBtn');
  if (btnAddQuote) {
    btnAddQuote.onclick = () => {
      closeModal('detailModal');
      openAddQuoteModal(book.title);
    };
  }

  const btnBorrow = el('detailBorrowBtn');
  const btnBuy = el('detailBuyBtn');
  const btnAddCart = el('detailAddToCartBtn');

  if (btnBorrow) {
    btnBorrow.disabled = book.stock <= 0;
    btnBorrow.onclick = () => borrow(book.title);
  }
  if (btnBuy) {
    btnBuy.disabled = book.stock <= 0;
    btnBuy.onclick = () => buy(book.title);
  }
  if (btnAddCart) {
    btnAddCart.disabled = book.stock <= 0;
    btnAddCart.onclick = () => addToCart(book.title);
  }

  setReviewRating(5);
  const formBox = el('addReviewFormBox');
  if (formBox) formBox.style.display = 'none';
  const rText = el('reviewTextInput');
  if (rText) rText.value = '';

  renderBookReviewsInDetail(book.title);
  openModal('detailModal');
}

export function setReviewRating(r) {
  state.selectedReviewRating = r;
  const ratingVal = el('starRatingVal');
  if (ratingVal) ratingVal.textContent = `${r} / 5`;
  const stars = document.querySelectorAll('#starRatingPicker img');
  stars.forEach((s, idx) => {
    s.style.opacity = (idx < r) ? '1' : '0.35';
    s.style.filter = (idx < r) ? 'none' : 'grayscale(100%)';
  });
}

export function toggleAddReviewForm(show) {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }
  const box = el('addReviewFormBox');
  if (!box) return;
  if (typeof show === 'boolean') {
    box.style.display = show ? 'block' : 'none';
  } else {
    const isHidden = box.style.display === 'none' || box.style.display === '';
    box.style.display = isHidden ? 'block' : 'none';
  }
}

export function renderBookReviewsInDetail(bookTitle) {
  const list = el('detailReviewsList');
  if (!list) return;

  const reviews = state.bookReviews.filter(r => r.bookTitle === bookTitle);
  const avgScore = avg(reviews);

  if (el('detailAvgRating')) el('detailAvgRating').textContent = avgScore;
  if (el('detailRatingSummary')) el('detailRatingSummary').textContent = `★ ${avgScore} (${reviews.length} değerlendirme)`;
  if (el('detailReviewCount')) el('detailReviewCount').textContent = `(${reviews.length} okur değerlendirmesi)`;

  if (reviews.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);font-size:14px;padding:16px 0">Bu eser için henüz yorum yapılmamış. İlk değerlendirmeyi siz yazın!</p>`;
    return;
  }

  list.innerHTML = reviews.map(r => {
    const isOwner = state.currentUser && (state.currentUser.name === r.userName || state.currentUser.role === 'Yönetici');
    const starString = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

    return `
      <div style="padding:14px 0;border-bottom:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div>
            <strong style="font-size:14px;color:var(--ink)">${r.userName}</strong>
            <span style="font-size:12px;color:var(--muted);margin-left:8px">${r.date}</span>
          </div>
          <div style="color:#d97706;font-size:13px">${starString}</div>
        </div>
        <p style="font-size:13.5px;color:var(--ink-soft);line-height:1.5;margin:0">${r.comment}</p>
        ${isOwner ? `
          <div style="margin-top:6px;display:flex;gap:12px">
            <button onclick="window.editBookReview(${r.id})" style="background:transparent;border:0;color:var(--gold);font-size:12px;cursor:pointer;font-weight:600">Düzenle</button>
            <button onclick="window.deleteBookReview(${r.id})" style="background:transparent;border:0;color:var(--danger);font-size:12px;cursor:pointer;font-weight:600">Sil</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

export function editBookReview(id) {
  const r = state.bookReviews.find(rev => rev.id === id);
  if (!r) return;

  state.editingReviewId = id;
  const box = el('addReviewFormBox');
  if (box) box.style.display = 'block';

  setReviewRating(r.rating);
  if (el('reviewTextInput')) el('reviewTextInput').value = r.comment;
  if (el('submitReviewBtn')) el('submitReviewBtn').textContent = 'Değerlendirmeyi Güncelle';
}

export function deleteBookReview(id) {
  if (!confirm('Yorumunuzu silmek istediğinize emin misiniz?')) return;
  state.bookReviews = state.bookReviews.filter(r => r.id !== id);
  saveState();
  renderBookReviewsInDetail(state.currentDetailBookTitle);
  renderBooks();
  toast('Yorumunuz başarıyla silindi.');
}

export function submitBookReview(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }

  const commentText = (el('reviewTextInput')?.value || '').trim();
  if (!commentText) {
    toast('Lütfen bir yorum metni giriniz.');
    return;
  }

  if (state.editingReviewId) {
    const r = state.bookReviews.find(rev => rev.id === state.editingReviewId);
    if (r) {
      r.rating = state.selectedReviewRating;
      r.comment = commentText;
      r.date = 'Bugün (Düzenlendi)';
    }
    state.editingReviewId = null;
    toast('Değerlendirmeniz güncellendi!');
  } else {
    const newRev = {
      id: Date.now(),
      bookTitle: state.currentDetailBookTitle,
      userName: state.currentUser.name,
      rating: state.selectedReviewRating,
      date: 'Bugün',
      comment: commentText
    };
    state.bookReviews.push(newRev);
    toast('Değerlendirmeniz kaydedildi. Katkınız için teşekkürler!');
  }

  saveState();
  if (el('reviewTextInput')) el('reviewTextInput').value = '';
  if (el('addReviewFormBox')) el('addReviewFormBox').style.display = 'none';
  if (el('submitReviewBtn')) el('submitReviewBtn').textContent = 'Değerlendirmeyi Yayınla';
  renderBookReviewsInDetail(state.currentDetailBookTitle);
  renderBooks();
}

