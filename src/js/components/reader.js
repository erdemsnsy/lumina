import { el, openModal, closeModal } from '../utils/helpers.js';
import { playPageFlipSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { sampleExcerpts, getBookSpreads } from '../data/excerpts.js';

let currentReaderBook = null;
let currentSpreadIndex = 0;
let readerFontSize = 15;
let currentReaderTheme = 'light';
let isPageTurning = false;
let isBookOpen = false;

export function openBookFromCover() {
  if (isBookOpen) return;
  const closedCover = el('readerClosedCover');
  const hardcover = el('readerHardcover');
  const prevBtn = el('readerPrevBtn');
  const nextBtn = el('readerNextBtn');

  playPageFlipSound();

  if (closedCover) {
    closedCover.classList.add('opening');
  }

  setTimeout(() => {
    isBookOpen = true;
    if (closedCover) {
      closedCover.style.display = 'none';
      closedCover.classList.remove('opening');
    }
    if (hardcover) {
      hardcover.style.opacity = '1';
      hardcover.style.pointerEvents = 'auto';
    }
    currentSpreadIndex = 0;
    renderReaderPage(currentSpreadIndex);
    updateToolbarState();
  }, 750);
}

export function closeBookToCover() {
  if (!isBookOpen) return;
  const closedCover = el('readerClosedCover');
  const hardcover = el('readerHardcover');

  playPageFlipSound();
  isBookOpen = false;

  if (hardcover) {
    hardcover.style.opacity = '0';
    hardcover.style.pointerEvents = 'none';
  }

  if (closedCover) {
    closedCover.style.display = 'flex';
    closedCover.classList.add('closing');
    setTimeout(() => {
      closedCover.classList.remove('closing');
      updateToolbarState();
    }, 600);
  }
  updateToolbarState();
}

export function toggleBookOpenClose() {
  if (isBookOpen) {
    closeBookToCover();
  } else {
    openBookFromCover();
  }
}

export function open3DBookCover() {
  openBookFromCover();
}

export function openReader(title) {
  const book = state.books.find(b => b.title === title) || {
    title: title || 'Sessizliğin Atlası',
    author: 'Elif Demir',
    genre: 'Felsefe',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=85'
  };

  currentReaderBook = book;
  currentSpreadIndex = 0;
  isBookOpen = false;

  if (el('readerBookTitle')) el('readerBookTitle').textContent = book.title;
  if (el('readerBookAuthor')) el('readerBookAuthor').textContent = book.author;

  // Setup Closed Cover Info & Image
  const closedCover = el('readerClosedCover');
  const closedImg = el('closedCoverImg');
  const closedTitle = el('closedCoverTitle');
  const closedAuthor = el('closedCoverAuthor');
  const hardcover = el('readerHardcover');

  if (closedCover) {
    closedCover.style.display = 'flex';
    closedCover.classList.remove('opening', 'closing');
  }
  if (closedImg) {
    closedImg.style.backgroundImage = `url('${book.cover || 'basarimlar/roman.png'}')`;
  }
  if (closedTitle) closedTitle.textContent = book.title;
  if (closedAuthor) closedAuthor.textContent = book.author;

  if (hardcover) {
    hardcover.style.opacity = '0';
    hardcover.style.pointerEvents = 'none';
  }

  updateToolbarState();
  openModal('readerModal');
  playPageFlipSound();
}

function updateToolbarState() {
  const stateIcon = el('readerStateIcon');
  const stateText = el('readerStateText');
  if (stateIcon && stateText) {
    if (isBookOpen) {
      stateIcon.textContent = '📕';
      stateText.textContent = 'Kapağı Kapat';
    } else {
      stateIcon.textContent = '📖';
      stateText.textContent = 'Kitabı Aç';
    }
  }

  const prevBtn = el('readerPrevBtn');
  const nextBtn = el('readerNextBtn');

  if (!isBookOpen) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  } else {
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';
  }
}

export function renderReaderPage(spreadIdx) {
  const title = currentReaderBook ? currentReaderBook.title : 'Sessizliğin Atlası';
  const author = currentReaderBook ? currentReaderBook.author : 'Lumina Yazarı';
  const genre = currentReaderBook ? currentReaderBook.genre : 'Roman';

  const rawSpreads = getBookSpreads(title, author, genre);

  // Spread 0: Left is Frontispiece / Ex-Libris, Right is Page 1 (Chapter 1)
  if (spreadIdx === 0) {
    const page1Data = rawSpreads[0] ? rawSpreads[0].left : {};

    if (el('readerLeftRunningTitle')) el('readerLeftRunningTitle').textContent = 'LUMINA YAYINLARI';
    if (el('readerLeftRunningAuthor')) el('readerLeftRunningAuthor').textContent = 'ÖZEL BASKI';

    if (el('readerLeftText')) {
      el('readerLeftText').innerHTML = `
        <div class="book-publisher-imprint">
          <div class="publisher-logo-mark">✦</div>
          <h2 class="publisher-name">LUMINA YAYINLARI</h2>
          <div class="publisher-sub">Kütüphane & Edebiyat Koleksiyonu</div>
          <div class="publisher-line"></div>
          <p class="publisher-edition">Lumina Özel Baskısı</p>
          <p class="publisher-meta">Tüm Hakları Saklıdır · İstanbul, 2026</p>
        </div>
      `;
    }
    if (el('readerLeftPageNo')) el('readerLeftPageNo').textContent = 'İç Kapak';
    if (el('readerLeftHint')) el('readerLeftHint').textContent = 'Lumina Arşivi';

    // Right Page: Page 1
    if (el('readerRightRunningChapter')) el('readerRightRunningChapter').textContent = page1Data.runningTitle || `${title.toUpperCase()}`;
    if (el('readerRightText')) {
      el('readerRightText').innerHTML = page1Data.content || `
        <h4 class="book-chapter-heading">1. Bölüm: Başlangıç</h4>
        <p class="book-illuminated-dropcap">Sayfalar aralanırken kelimelerin büyüsü odayı doldurdu. Her satırda derin bir düşünce yolculuğu okuru bekliyordu.</p>
      `;
      el('readerRightText').style.fontSize = readerFontSize + 'px';
    }
    if (el('readerRightPageNo')) el('readerRightPageNo').textContent = 'Sayfa 1';
    if (el('readerRightHint')) el('readerRightHint').textContent = 'Tıkla: Sonraki Sayfa ›';

  } else {
    // Spread 1: Page 2 & 3
    // Spread 2: Page 4 & 5
    // Spread 3: Page 6 & Completion
    const leftPageNum = spreadIdx * 2;
    const rightPageNum = spreadIdx * 2 + 1;

    // Fetch matching content from rawSpreads
    let leftContent = '';
    let rightContent = '';
    let leftHeading = `${title.toUpperCase()}`;
    let rightHeading = `${author.toUpperCase()}`;

    if (spreadIdx === 1) {
      leftContent = rawSpreads[0]?.right?.content || '';
      leftHeading = rawSpreads[0]?.right?.runningChapter || '1. BÖLÜM';
      rightContent = rawSpreads[1]?.left?.content || '';
      rightHeading = rawSpreads[1]?.left?.runningTitle || '2. BÖLÜM';
    } else if (spreadIdx === 2) {
      leftContent = rawSpreads[1]?.right?.content || '';
      leftHeading = rawSpreads[1]?.right?.runningChapter || '2. BÖLÜM';
      rightContent = rawSpreads[2]?.left?.content || '';
      rightHeading = rawSpreads[2]?.left?.runningTitle || '3. BÖLÜM';
    } else {
      leftContent = rawSpreads[2]?.right?.content || '';
      leftHeading = rawSpreads[2]?.right?.runningChapter || 'SON BÖLÜM';
      rightContent = `
        <div class="book-completion-card">
          <div class="completion-icon">✨</div>
          <h4 class="completion-title">Tadımlık Okuma Tamamlandı</h4>
          <p class="completion-desc">"${title}" eserinin 6 sayfalık özel tadımlık bölümünü okudunuz.</p>
          <div class="completion-actions">
            <button type="button" class="btn-action-primary" style="width:100%;margin-bottom:8px" onclick="closeModal('readerModal');openModal('purchaseModal');">Satın Al (🪙 ${currentReaderBook?.price || 150})</button>
            <button type="button" class="btn-action-secondary" style="width:100%" onclick="closeModal('readerModal');navigateTo('catalog');">Kütüphaneden Ödünç Al</button>
          </div>
        </div>
      `;
      rightHeading = 'TAMAMLANDI';
    }

    if (el('readerLeftRunningTitle')) el('readerLeftRunningTitle').textContent = leftHeading;
    if (el('readerLeftRunningAuthor')) el('readerLeftRunningAuthor').textContent = (author).toUpperCase();
    if (el('readerLeftText')) {
      el('readerLeftText').innerHTML = leftContent;
      el('readerLeftText').style.fontSize = readerFontSize + 'px';
    }
    if (el('readerLeftPageNo')) el('readerLeftPageNo').textContent = 'Sayfa ' + leftPageNum;
    if (el('readerLeftHint')) el('readerLeftHint').textContent = '‹ Önceki Sayfa';

    if (el('readerRightRunningChapter')) el('readerRightRunningChapter').textContent = rightHeading;
    if (el('readerRightText')) {
      el('readerRightText').innerHTML = rightContent;
      el('readerRightText').style.fontSize = readerFontSize + 'px';
    }
    if (el('readerRightPageNo')) el('readerRightPageNo').textContent = spreadIdx >= 3 ? 'Sonuç' : 'Sayfa ' + rightPageNum;
    if (el('readerRightHint')) el('readerRightHint').textContent = spreadIdx >= 3 ? 'Bitti ✦' : 'Tıkla: Sonraki Sayfa ›';
  }

  updateToolbarState();
}

export function turnReaderPage(delta) {
  if (isPageTurning) return;
  if (!isBookOpen) {
    openBookFromCover();
    return;
  }

  // If on first spread and user goes back, close the book
  if (currentSpreadIndex === 0 && delta < 0) {
    closeBookToCover();
    return;
  }

  const targetSpread = currentSpreadIndex + delta;
  if (targetSpread < 0 || targetSpread > 3) return;

  isPageTurning = true;
  playPageFlipSound();

  const stack = el('readerPagesStack');
  if (stack) {
    stack.classList.remove('page-turn-anim-next', 'page-turn-anim-prev');
    void stack.offsetWidth; // trigger reflow
    stack.classList.add(delta > 0 ? 'page-turn-anim-next' : 'page-turn-anim-prev');
  }

  // Swap page text at halfway curl
  setTimeout(() => {
    currentSpreadIndex = targetSpread;
    renderReaderPage(currentSpreadIndex);
  }, 480);

  // Complete page transition
  setTimeout(() => {
    if (stack) {
      stack.classList.remove('page-turn-anim-next', 'page-turn-anim-prev');
    }
    isPageTurning = false;
  }, 1000);
}

export function setReaderTheme(theme) {
  currentReaderTheme = theme;
  const modal = el('readerModal');
  if (!modal) return;

  const hardcover = el('readerHardcover');
  if (hardcover) {
    hardcover.classList.remove('sepia-mode', 'dark-mode');
    if (theme === 'sepia') {
      hardcover.classList.add('sepia-mode');
    } else if (theme === 'dark') {
      hardcover.classList.add('dark-mode');
    }
  }
}

export function adjustReaderFontSize(delta) {
  readerFontSize = Math.max(12, Math.min(22, readerFontSize + delta));
  if (el('readerLeftText')) el('readerLeftText').style.fontSize = readerFontSize + 'px';
  if (el('readerRightText')) el('readerRightText').style.fontSize = readerFontSize + 'px';
}
