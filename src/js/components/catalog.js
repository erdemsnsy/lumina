import { el, safeText, avg, openModal } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { updateAllRealStatistics } from './stats.js';
import { showDetails } from './details.js';
import { borrow, buy } from './borrow-buy.js';
import { addToCart } from './cart.js';
import { openReader } from './reader.js';

let isCatalogExpanded = false;
let currentCatalogViewMode = 'grid';

export function setCatalogViewMode(mode) {
  playUiSound('click');
  currentCatalogViewMode = mode;
  const container = el('catalog') || el('catalogGrid');
  const btnGrid = el('viewBtnGrid');
  const btnList = el('viewBtnList');

  if (container) {
    container.classList.toggle('view-compact-shelf', mode === 'list');
  }
  if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
  if (btnList) btnList.classList.toggle('active', mode === 'list');
}

let activeCatalogGenre = '';

export function selectCatalogCategory(genre, btn) {
  playUiSound('click');
  activeCatalogGenre = genre || '';
  const sel = el('genre') || el('catalogGenreSelect');
  if (sel) sel.value = genre;
  syncCategoryPillsFromSelect(activeCatalogGenre);
  renderBooks();
}

export function syncCategoryPillsFromSelect(currentGenre) {
  const sel = el('genre') || el('catalogGenreSelect');
  const activeGenre = currentGenre !== undefined ? currentGenre : (sel ? sel.value : activeCatalogGenre);
  activeCatalogGenre = activeGenre || '';
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    const titleEl = pill.querySelector('.pill-title') || pill.querySelector('span');
    const pText = titleEl ? titleEl.textContent.trim() : pill.textContent.trim();
    if (!activeGenre && pText.includes('Tüm')) {
      pill.classList.add('active');
    } else if (activeGenre && pText.toLowerCase() === activeGenre.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }

    // Dynamic count update
    const countBadge = pill.querySelector('.pill-count-badge');
    if (countBadge && state && state.books) {
      if (pText.includes('Tüm')) {
        countBadge.textContent = state.books.length;
      } else {
        const count = state.books.filter(b => b.genre && b.genre.toLowerCase() === pText.toLowerCase()).length;
        countBadge.textContent = count;
      }
    }
  });
}

export function toggleCatalogExpand() {
  playUiSound('click');
  isCatalogExpanded = !isCatalogExpanded;
  const btn = el('catalogExpandBtn');
  if (btn) {
    btn.innerHTML = isCatalogExpanded ? 'Daha Az Eser Göster ▲' : 'Tüm Kataloğu Genişlet (' + state.books.length + ' Eser) ▼';
  }
  renderBooks();
}

export function renderBooks() {
  const searchInput = el('search') || el('catalogSearch');
  const genreSelect = el('genre') || el('catalogGenreSelect');
  const sortSelect = el('sort') || el('catalogSort');

  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const genreSel = (genreSelect ? genreSelect.value : activeCatalogGenre).trim();
  const sortSel = sortSelect ? sortSelect.value : 'new';

  let filtered = state.books.filter(b => {
    const matchesSearch = !query ||
                          (b.title && b.title.toLowerCase().includes(query)) ||
                          (b.author && b.author.toLowerCase().includes(query)) ||
                          (b.isbn && b.isbn.toLowerCase().includes(query)) ||
                          (b.genre && b.genre.toLowerCase().includes(query));
    const matchesGenre = (!genreSel || genreSel === 'ALL' || (b.genre && b.genre.toLowerCase() === genreSel.toLowerCase()));
    return matchesSearch && matchesGenre;
  });

  if (sortSel === 'title') {
    filtered.sort((a,b) => a.title.localeCompare(b.title, 'tr'));
  } else if (sortSel === 'author') {
    filtered.sort((a,b) => (a.author || '').localeCompare(b.author || '', 'tr'));
  } else if (sortSel === 'price-asc' || sortSel === 'priceAsc') {
    filtered.sort((a,b) => a.price - b.price);
  } else if (sortSel === 'price-desc' || sortSel === 'priceDesc') {
    filtered.sort((a,b) => b.price - a.price);
  } else if (sortSel === 'stock') {
    filtered.sort((a,b) => b.stock - a.stock);
  }

  const countVal = el('catalogCountVal');
  if (countVal) countVal.textContent = filtered.length;

  const limit = isCatalogExpanded ? 999 : 8;
  const displayList = filtered.slice(0, limit);

  const container = el('catalog') || el('catalogGrid');
  if (!container) return;

  if (displayList.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px;background:var(--bg-surface);border:1px dashed var(--line);border-radius:12px">
        <h4 style="font-family:'Fraunces',serif;font-size:18px;margin-bottom:8px">Aradığınız kriterlere uygun eser bulunamadı</h4>
        <p style="color:var(--muted);font-size:14px">Farklı bir arama terimi veya kategori filtresi deneyebilirsiniz.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = displayList.map(book => {
    const isFav = state.favorites.includes(book.title);
    const reviews = state.bookReviews.filter(r => r.bookTitle === book.title);
    const ratingScore = avg(reviews);
    const reviewCount = reviews.length;
    const isOut = book.stock <= 0;
    const safeTitle = safeText(book.title);

    return `
      <article class="book-card ${isOut ? 'out-of-stock' : ''}">
        <!-- Cover Area with Top-Right Heart Button -->
        <div class="mini-cover" style="background-image: linear-gradient(to top, rgba(15,23,20,0.85) 0%, rgba(15,23,20,0.15) 55%, rgba(15,23,20,0.35) 100%), url('${book.cover}'); background-size: cover; background-position: center;" onclick="showDetails('${safeTitle}')">
          <span class="cover-tag-badge">${book.genre}</span>
          <button type="button" class="fav-btn-icon ${isFav ? 'active' : ''}" style="position:absolute;top:10px;right:10px;z-index:5" onclick="event.stopPropagation(); toggleFavorite('${safeTitle}')" title="${isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="${isFav ? '#e63946' : 'none'}" stroke="${isFav ? '#e63946' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <div class="cover-title-text">${book.title}</div>
          <div class="cover-author-text">${book.author}</div>
        </div>

        <!-- Book Info Area (Option 2: Luxury Editorial Bottom Deck with Coin Icon) -->
        <div class="book-info" style="display:flex;flex-direction:column;flex:1">
          <!-- Top: Title & Author -->
          <h3 style="font:700 16.5px/1.3 'Fraunces',serif;margin:0 0 4px;cursor:pointer" onclick="showDetails('${safeTitle}')">${book.title}</h3>
          <p style="color:var(--muted);font-size:12.5px;margin:0 0 10px">${book.author} · ${book.year}</p>

          <!-- Middle Micro-Line: Rating & Stock Badge -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px;font-size:12px">
            <div style="display:inline-flex;align-items:center;gap:4px">
              <img src="basarimlar/yildiz.png" style="width:12px;height:12px;object-fit:contain" alt="★" onerror="this.src='basarimlar/yildiz.png'">
              <strong style="color:var(--ink);font-weight:700">${ratingScore}</strong>
              <span style="color:var(--muted);font-size:11px">(${reviewCount} yorum)</span>
            </div>
            <span class="status-badge ${isOut ? 'out' : ''}">${isOut ? 'TÜKENDİ' : (book.stock + ' Stokta')}</span>
          </div>

          <!-- Bottom Editorial Price & Actions Container -->
          <div style="margin-top:auto;padding-top:10px;border-top:1px solid var(--line)">
            <!-- Price Row with coin.png icon -->
            <div class="book-price-row">
              <span class="book-price-label">Katalog Fiyatı</span>
              <div class="book-price-value">
                <img src="basarimlar/coin.png" alt="Altın" class="book-price-coin" onerror="this.src='basarimlar/coin.png'">
                <span class="book-price-amount">${book.price}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="book-card-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:0;border-top:0;margin-top:0">
              <button type="button" class="btn-borrow" ${isOut ? 'disabled style="opacity:0.45;cursor:not-allowed"' : ''} onclick="borrow('${safeTitle}')">Ödünç Al</button>
              <button type="button" class="btn-cart-action" ${isOut ? 'disabled style="opacity:0.45;cursor:not-allowed"' : ''} onclick="addToCart('${safeTitle}')">Sepete Ekle</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Update catalog expand wrapper visibility
  const expandWrapper = el('catalogExpandWrapper');
  if (expandWrapper) {
    if (filtered.length > 8) {
      expandWrapper.style.display = 'flex';
      expandWrapper.innerHTML = `<button type="button" id="catalogExpandBtn" class="btn-action-secondary" style="padding:10px 22px;font-size:13px;font-weight:600" onclick="toggleCatalogExpand()">${isCatalogExpanded ? 'Daha Az Eser Göster ▲' : 'Tüm Kataloğu Genişlet (' + filtered.length + ' Eser) ▼'}</button>`;
    } else {
      expandWrapper.style.display = 'none';
    }
  }
}

export function filterByGenre(genre) {
  const sel = el('genre') || el('catalogGenreSelect');
  if (sel) sel.value = genre;
  syncCategoryPillsFromSelect(genre);
  renderBooks();
  const catSection = el('katalog') || el('catalogSection');
  if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
}

export function toggleFavorite(title) {
  playUiSound('tink');
  const index = state.favorites.indexOf(title);
  if (index > -1) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(title);
  }
  saveState();
  renderBooks();
  renderFavoritesPage();
  updateAllRealStatistics();
}

export function renderFavoritesPage() {
  const container = el('favoritesPageList') || el('favoritesList');
  if (!container) return;

  state.favorites = (state.favorites || []).filter(title => state.books.some(b => b.title === title));
  const favBooks = state.books.filter(b => state.favorites.includes(b.title));
  
  if (favBooks.length === 0) {
    container.className = '';
    container.innerHTML = `
      <div class="card-box" style="max-width:1240px;margin:0 auto;padding:60px 46px;text-align:center;box-shadow:var(--shadow-sm);border-radius:var(--radius-lg);border:1px solid var(--line);background:#ffffff">
        <h3 style="font:700 24px 'Fraunces',serif;color:var(--ink);margin:0 0 10px">Favorilerinizde kitap bulunmuyor.</h3>
        <p style="color:var(--muted);font-size:14px;max-width:500px;margin:0 auto 20px;line-height:1.5">Katalogdaki kitapların üzerindeki kalp simgesine tıklayarak beğendiğiniz eserleri favorilerinize ekleyebilirsiniz.</p>
        <button type="button" class="btn-action-primary" style="padding:12px 28px;font-size:14px;font-weight:700" onclick="scrollToSection('katalog')">Kataloğu Aç</button>
      </div>
    `;
    return;
  }

  container.className = 'catalog-grid';
  container.innerHTML = favBooks.map(book => {
    const reviews = state.bookReviews.filter(r => r.bookTitle === book.title);
    const ratingScore = avg(reviews);
    const reviewCount = reviews.length;
    const isOut = book.stock <= 0;
    const safeTitle = safeText(book.title);

    return `
      <article class="book-card ${isOut ? 'out-of-stock' : ''}">
        <div class="mini-cover" style="background-image: linear-gradient(to top, rgba(15,23,20,0.85) 0%, rgba(15,23,20,0.15) 55%, rgba(15,23,20,0.35) 100%), url('${book.cover}'); background-size: cover; background-position: center;" onclick="showDetails('${safeTitle}')">
          <span class="cover-tag-badge">${book.genre}</span>
          <button type="button" class="fav-btn-icon active" style="position:absolute;top:10px;right:10px;z-index:5" onclick="event.stopPropagation(); toggleFavorite('${safeTitle}')" title="Favorilerden Çıkar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#e63946" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <div class="cover-title-text">${book.title}</div>
          <div class="cover-author-text">${book.author}</div>
        </div>

        <div class="book-info" style="display:flex;flex-direction:column;flex:1">
          <h3 style="font:700 16.5px/1.3 'Fraunces',serif;margin:0 0 4px;cursor:pointer" onclick="showDetails('${safeTitle}')">${book.title}</h3>
          <p style="color:var(--muted);font-size:12.5px;margin:0 0 10px">${book.author} · ${book.year}</p>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px;font-size:12px">
            <div style="display:inline-flex;align-items:center;gap:4px">
              <img src="basarimlar/yildiz.png" style="width:12px;height:12px;object-fit:contain" alt="★" onerror="this.src='basarimlar/yildiz.png'">
              <strong style="color:var(--ink);font-weight:700">${ratingScore}</strong>
              <span style="color:var(--muted);font-size:11px">(${reviewCount} yorum)</span>
            </div>
            <span class="status-badge ${isOut ? 'out' : ''}">${isOut ? 'TÜKENDİ' : (book.stock + ' Stokta')}</span>
          </div>

          <div style="margin-top:auto;padding-top:10px;border-top:1px solid var(--line)">
            <div class="book-price-row">
              <span class="book-price-label">Katalog Fiyatı</span>
              <div class="book-price-value">
                <img src="basarimlar/coin.png" alt="Altın" class="book-price-coin" onerror="this.src='basarimlar/coin.png'">
                <span class="book-price-amount">${book.price}</span>
              </div>
            </div>

            <div class="book-card-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:0;border-top:0;margin-top:0">
              <button type="button" class="btn-borrow" ${isOut ? 'disabled style="opacity:0.45;cursor:not-allowed"' : ''} onclick="borrow('${safeTitle}')">Ödünç Al</button>
              <button type="button" class="btn-cart-action" ${isOut ? 'disabled style="opacity:0.45;cursor:not-allowed"' : ''} onclick="addToCart('${safeTitle}')">Sepete Ekle</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}
