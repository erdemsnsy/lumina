import { el, openModal, closeModal, toast } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { summaries } from '../config/constants.js';
import { updateAllRealStatistics } from './stats.js';
import { renderBooks } from './catalog.js';
import { api } from '../services/api.js';

export function updateLoanMinDueDate() {
  const loanDateInput = el('loanDate');
  const returnDateInput = el('returnDate');
  if (!loanDateInput || !returnDateInput) return;
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);
  const maxStr = maxDate.toISOString().split('T')[0];

  loanDateInput.min = todayStr;
  loanDateInput.max = maxStr;
  
  returnDateInput.min = todayStr;
}

export function setLoanDurationDays(days) {
  playUiSound('click');
  const loanDateInput = el('loanDate');
  const returnDateInput = el('returnDate');
  if (!loanDateInput || !returnDateInput) return;
  
  if (!loanDateInput.value) {
    const today = new Date();
    loanDateInput.value = today.toISOString().split('T')[0];
  }
  
  let baseDate = new Date(loanDateInput.value);
  if (isNaN(baseDate.getTime())) baseDate = new Date();
  
  const returnDate = new Date(baseDate);
  returnDate.setDate(baseDate.getDate() + days);
  
  returnDateInput.value = returnDate.toISOString().split('T')[0];
  
  // Highlight active duration button
  document.querySelectorAll('.loan-duration-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-days') === String(days));
  });
}

export function borrow(title) {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }
  const book = state.books.find(b => b.title === title);
  if (!book || book.stock <= 0) {
    toast('Bu eser şu anda kütüphane raflarında tükenmiştir.');
    return;
  }

  state.currentLoanTitle = title;
  if (el('loanCover')) el('loanCover').style.backgroundImage = `url('${book.cover}')`;
  if (el('loanBookTitle')) el('loanBookTitle').textContent = book.title;
  if (el('loanBookMeta')) el('loanBookMeta').textContent = `${book.author} · ${book.genre} (${book.year})`;
  if (el('loanBookGenreBadge')) el('loanBookGenreBadge').textContent = book.genre;
  if (el('loanBookStockBadge')) el('loanBookStockBadge').textContent = `${book.stock} Stokta`;
  if (el('loanUserName')) el('loanUserName').textContent = state.currentUser.name;

  if (el('loanDate')) el('loanDate').value = '';
  if (el('returnDate')) el('returnDate').value = '';
  if (el('loanReason')) el('loanReason').value = '';

  document.querySelectorAll('.loan-duration-btn').forEach(btn => btn.classList.remove('active'));

  updateLoanMinDueDate();
  openModal('loanModal');
}

export function submitLoanRequest(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  
  const loanDateVal = el('loanDate') ? el('loanDate').value : '';
  const returnDateVal = el('returnDate') ? el('returnDate').value : '';
  const reasonVal = el('loanReason') ? el('loanReason').value : '';

  if (!loanDateVal || !returnDateVal || !reasonVal.trim()) {
    toast('Lütfen ödünç alma tarihi, planlanan iade tarihi ve nedeni eksiksiz doldurun.');
    return;
  }

  const book = state.books.find(b => b.title === state.currentLoanTitle);
  if (!book) return;

  const newReq = {
    id: 'req_' + Date.now(),
    userName: state.currentUser.name,
    userEmail: state.currentUser.email,
    title: book.title,
    author: book.author,
    genre: book.genre,
    cover: book.cover,
    loanDate: loanDateVal,
    dueDate: returnDateVal,
    reason: reasonVal,
    type: 'new_loan',
    date: new Date().toLocaleDateString('tr-TR')
  };

  state.pendingRequests.push(newReq);
  saveState();
  closeModal('loanModal');
  playUiSound('stamp');
  toast(`'${book.title}' için ödünç alma talebiniz yöneticinin onayına gönderildi.`);
  
  if (state.currentUser && state.currentUser.role === 'Yönetici' && typeof window.renderAdminDashboardPending === 'function') {
    window.renderAdminDashboardPending();
  }
  updateAllRealStatistics();
}

export function handlePurchasePaymentMethodChange() {
  const select = el('paymentMethod');
  const method = select ? select.value : (document.querySelector('input[name="purchasePaymentMethod"]:checked')?.value || 'card');
  const cardFields = el('paymentCardFields') || el('purchaseCardFields');
  const transferFields = el('paymentTransferFields');
  const walletFields = el('paymentWalletFields');

  if (cardFields) cardFields.style.display = (method === 'card') ? 'grid' : 'none';
  if (transferFields) transferFields.style.display = (method === 'transfer') ? 'block' : 'none';
  if (walletFields) walletFields.style.display = (method === 'wallet') ? 'block' : 'none';
}

export function initPaymentInputsFormatters() {
  const cardNum = el('cardNumber');
  if (cardNum && !cardNum.dataset.formatted) {
    cardNum.dataset.formatted = 'true';
    cardNum.addEventListener('input', (e) => {
      let val = (e.target ? e.target.value : '').replace(/\D/g, '').slice(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
      if (e.target) e.target.value = formatted;
    });
  }

  const cardExp = el('cardExpiry');
  if (cardExp && !cardExp.dataset.formatted) {
    cardExp.dataset.formatted = 'true';
    cardExp.addEventListener('input', (e) => {
      let val = (e.target ? e.target.value : '').replace(/\D/g, '').slice(0, 4);
      if (val.length >= 3) {
        if (e.target) e.target.value = val.slice(0, 2) + '/' + val.slice(2);
      } else {
        if (e.target) e.target.value = val;
      }
    });
  }

  const cardCvv = el('cardCvv');
  if (cardCvv && !cardCvv.dataset.formatted) {
    cardCvv.dataset.formatted = 'true';
    cardCvv.addEventListener('input', (e) => {
      if (e.target) e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });
  }
}

export function cancelBorrowRequest(reqId) {
  playUiSound('tink');
  const idx = state.pendingRequests.findIndex(r => String(r.id) === String(reqId));
  if (idx !== -1) {
    const req = state.pendingRequests[idx];
    state.pendingRequests.splice(idx, 1);
    saveState();
    toast(`'${req.title}' için ödünç alma talebi iptal edildi.`);
    if (typeof window.renderMemberProfileData === 'function') {
      window.renderMemberProfileData();
    }
    updateAllRealStatistics();
  }
}

export function buy(title) {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }
  const book = state.books.find(b => b.title === title);
  if (!book || book.stock <= 0) {
    toast('Bu eser şu anda stokta tükenmiştir.');
    return;
  }

  state.currentPurchaseTitle = title;
  state.purchaseTotal = book.price;

  if (el('purchaseCover')) el('purchaseCover').style.backgroundImage = `url('${book.cover}')`;
  if (el('purchaseBookGenreBadge')) el('purchaseBookGenreBadge').textContent = book.genre;
  if (el('purchaseBookTitle')) el('purchaseBookTitle').textContent = book.title;
  if (el('purchaseBookMeta')) el('purchaseBookMeta').textContent = `${book.author} · ${book.genre} (${book.year})`;
  if (el('purchaseBookSummary')) el('purchaseBookSummary').textContent = summaries[book.genre] || 'Lumina Arşivi seçkin eseri.';
  if (el('priceLine')) el('priceLine').innerHTML = `Ödenecek Tutar: <span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:15px;height:15px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${book.price}</b></span>`;
  if (el('couponCode')) el('couponCode').value = '';
  if (el('purchaseCouponMsg')) el('purchaseCouponMsg').style.display = 'none';

  if (el('purchaseBasePrice')) el('purchaseBasePrice').innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:14px;height:14px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${book.price}</b></span>`;
  if (el('purchaseTotalFinal')) el('purchaseTotalFinal').innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:15px;height:15px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${book.price}</b></span>`;

  const select = el('paymentMethod');
  if (select) select.value = 'card';
  handlePurchasePaymentMethodChange();
  initPaymentInputsFormatters();
  openModal('purchaseModal');
}

export function applyPurchaseCoupon() {
  const code = (el('couponCode')?.value || el('purchaseCouponInput')?.value || '').trim().toUpperCase();
  const feedback = el('purchaseCouponMsg') || el('purchaseCouponFeedback');
  const book = state.books.find(b => b.title === state.currentPurchaseTitle);
  if (!book) return;

  if (state.availableCoupons.includes(code)) {
    let discountPct = 15;
    if (code === 'OKUR20') discountPct = 20;
    if (code === 'ILKOKUMA10') discountPct = 10;
    if (code === 'EDEBİYAT25') discountPct = 25;

    const discountAmount = (book.price * discountPct) / 100;
    state.purchaseTotal = Math.max(0, book.price - discountAmount);

    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color = 'var(--success)';
      feedback.textContent = `✓ '${code}' uygulandı (% ${discountPct} indirim: -${discountAmount.toFixed(0)})`;
    }
    if (el('priceLine')) el('priceLine').innerHTML = `Ödenecek Tutar: <span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:15px;height:15px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${state.purchaseTotal.toFixed(0)}</b></span> (İndirimli)`;
    if (el('purchaseTotalFinal')) el('purchaseTotalFinal').innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:15px;height:15px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${state.purchaseTotal.toFixed(0)}</b></span>`;
    playUiSound('tink');
    toast(`'${code}' kuponu uygulandı: -${discountAmount.toFixed(0)} indirim!`);
  } else {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color = 'var(--danger)';
      feedback.textContent = '✕ Geçersiz veya süresi dolmuş kupon kodu.';
    }
    state.purchaseTotal = book.price;
    if (el('priceLine')) el('priceLine').innerHTML = `Ödenecek Tutar: <span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:15px;height:15px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${book.price}</b></span>`;
    if (el('purchaseTotalFinal')) el('purchaseTotalFinal').innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px"><img src="basarimlar/coin.png" style="width:15px;height:15px;object-fit:contain"><b style="font-family:'Plus Jakarta Sans',sans-serif">${book.price}</b></span>`;
    toast('Geçersiz veya süresi dolmuş kupon kodu.');
  }
}

export function applyCoupon() {
  applyPurchaseCoupon();
}

export function completePurchase(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const book = state.books.find(b => b.title === state.currentPurchaseTitle);
  if (!book || book.stock <= 0) {
    toast('Bu eser stokta kalmamıştır.');
    closeModal('purchaseModal');
    return;
  }

  const method = el('paymentMethod')?.value || 'card';
  if (method === 'card') {
    const cardHolder = (el('cardHolder') ? el('cardHolder').value : '').trim();
    const cardNumber = (el('cardNumber') ? el('cardNumber').value : '').trim();
    const cardExpiry = (el('cardExpiry') ? el('cardExpiry').value : '').trim();
    const cardCvv = (el('cardCvv') ? el('cardCvv').value : '').trim();

    // 1. Name & Surname validation (at least 2 words)
    const nameParts = cardHolder.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      toast('Lütfen kart üzerindeki ad ve soyadınızı eksiksiz giriniz.');
      el('cardHolder')?.focus();
      return;
    }

    // 2. Card Number validation (16 digits)
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) {
      toast('Lütfen 16 haneli kart numaranızı eksiksiz giriniz.');
      el('cardNumber')?.focus();
      return;
    }

    // 3. Expiry date validation (MM/YY format, valid month)
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast('Lütfen son kullanma tarihini AA/YY formatında giriniz (Örn: 11/30).');
      el('cardExpiry')?.focus();
      return;
    }
    const [mm] = cardExpiry.split('/').map(Number);
    if (mm < 1 || mm > 12) {
      toast('Geçersiz ay girdiniz (01 - 12 arası olmalıdır).');
      el('cardExpiry')?.focus();
      return;
    }

    // 4. CVV validation (3 or 4 digits)
    const cvvDigits = cardCvv.replace(/\D/g, '');
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      toast('Lütfen 3 veya 4 haneli CVV güvenlik kodunu giriniz.');
      el('cardCvv')?.focus();
      return;
    }
  }

  book.stock -= 1;
  const receiptNo = '#LM-' + Math.floor(1000 + Math.random() * 9000);
  const purchaseRecord = {
    id: Date.now(),
    userId: state.currentUser ? state.currentUser.id : 1,
    title: book.title,
    price: state.purchaseTotal,
    date: new Date().toLocaleDateString('tr-TR'),
    receipt: receiptNo,
    deliveryAddress: (el('deliveryAddress') ? el('deliveryAddress').value : 'Kadıköy, Moda Cad. No: 18 / İstanbul')
  };

  state.purchasesHistory.unshift(purchaseRecord);
  saveState();
  closeModal('purchaseModal');
  playUiSound('stamp');
  toast(`Siparişiniz tamamlandı! Fatura No: ${receiptNo}`);
  renderBooks();
  updateAllRealStatistics();
  showReceiptModal(purchaseRecord);
}

let currentReturnTarget = null;
let currentReturnRatingVal = 5;

export function setReturnRating(val) {
  currentReturnRatingVal = val;
  const ratingTexts = {
    1: '1 / 5 (Yetersiz)',
    2: '2 / 5 (Geliştirilmeli)',
    3: '3 / 5 (Orta)',
    4: '4 / 5 (İyi & Keyifli)',
    5: '5 / 5 (Kusursuz Deneyim)'
  };
  if (el('returnRatingVal')) {
    el('returnRatingVal').textContent = ratingTexts[val] || `${val} / 5`;
  }
  const picker = el('returnStarRatingPicker');
  if (picker) {
    const stars = picker.querySelectorAll('img');
    stars.forEach((s, idx) => {
      s.style.opacity = (idx < val) ? '1' : '0.25';
    });
  }
}

export function openReturnFeedbackModal(loanIdOrTitle) {
  let loan = null;
  if (typeof loanIdOrTitle === 'object' && loanIdOrTitle !== null) {
    loan = loanIdOrTitle;
  } else if (loanIdOrTitle) {
    loan = (state.loans || []).find(l => String(l.id) === String(loanIdOrTitle) || l.title === loanIdOrTitle);
  }
  if (!loan && state.loans && state.loans.length > 0) {
    loan = state.loans[0];
  }
  if (!loan) {
    return toast('İade edilecek aktif bir ödünç kaydı bulunamadı.');
  }

  currentReturnTarget = loan;
  if (el('returnModalTitle')) el('returnModalTitle').textContent = loan.title;
  
  const bookObj = (state.books || []).find(b => b.title.toLowerCase() === loan.title.toLowerCase()) || {};
  const coverEl = el('returnModalCover');
  if (coverEl) {
    coverEl.src = bookObj.cover || loan.cover || 'basarimlar/okurtaci.png';
  }

  const feedbackInput = el('returnFeedbackInput');
  if (feedbackInput) feedbackInput.value = '';

  setReturnRating(5);
  openModal('returnFeedbackModal');
}

export function confirmReturnWithFeedback() {
  if (!currentReturnTarget) {
    closeModal('returnFeedbackModal');
    return;
  }

  playUiSound('stamp');
  const loanToReturn = currentReturnTarget;
  const title = loanToReturn.title;

  // Remove loan from state
  state.loans = (state.loans || []).filter(l => l.id !== loanToReturn.id && l.title !== loanToReturn.title);

  // Restore book stock
  const book = (state.books || []).find(b => b.title.toLowerCase() === title.toLowerCase());
  if (book) {
    book.stock = (book.stock || 0) + 1;
  }

  // Record feedback if provided
  const feedbackText = el('returnFeedbackInput') ? el('returnFeedbackInput').value.trim() : '';
  if (feedbackText && state.currentUser) {
    if (!state.reviews) state.reviews = [];
    state.reviews.push({
      id: Date.now(),
      bookTitle: title,
      userName: state.currentUser.name || 'Okur',
      rating: currentReturnRatingVal,
      comment: `[İade Notu / Değerlendirme] ${feedbackText}`,
      date: 'Bugün'
    });
  }

  // Sync with API
  if (loanToReturn.id) {
    api.returnLoan(loanToReturn.id).catch(() => {});
  }

  saveState();
  closeModal('returnFeedbackModal');
  currentReturnTarget = null;

  toast(`'${title}' eseri başarıyla iade edildi. Değerlendirmeniz için teşekkür ederiz!`);
  renderBooks();
  updateAllRealStatistics();
  if (typeof window.renderMemberProfileData === 'function') window.renderMemberProfileData();
  if (typeof window.renderProfilePage === 'function') window.renderProfilePage();
}

export function returnBook(loanIdOrTitle) {
  openReturnFeedbackModal(loanIdOrTitle);
}

export function showReceiptModal(purchaseOrReceiptNo) {
  if (!purchaseOrReceiptNo) return;

  let purchase = purchaseOrReceiptNo;
  if (typeof purchaseOrReceiptNo === 'string') {
    purchase = (state.purchasesHistory || []).find(p => p.receipt === purchaseOrReceiptNo || p.title === purchaseOrReceiptNo) || {
      receipt: purchaseOrReceiptNo,
      title: 'Lumina Koleksiyon Eseri',
      price: 210,
      date: new Date().toLocaleDateString('tr-TR'),
      deliveryAddress: 'Kadıköy, Moda Cad. No: 18 / İstanbul'
    };
  }

  const receiptNo = purchase.receipt || purchase.receiptNo || '#LM-9481';
  const receiptDate = purchase.date || new Date().toLocaleDateString('tr-TR');
  const receiptTitle = purchase.title || 'Lumina Edebi Eser';
  const receiptPrice = purchase.price !== undefined ? purchase.price : 210;
  const receiptAddr = purchase.deliveryAddress || 'Kadıköy, Moda Cad. No: 18 / İstanbul';

  if (el('receiptNoText')) el('receiptNoText').textContent = receiptNo;
  if (el('receiptDateText')) el('receiptDateText').textContent = receiptDate;
  if (el('receiptCustomerName')) el('receiptCustomerName').textContent = (state.currentUser ? state.currentUser.name : 'Okur');
  if (el('receiptCustomerEmail')) el('receiptCustomerEmail').textContent = (state.currentUser ? state.currentUser.email : 'okur@lumina.lib');
  if (el('receiptDeliveryAddr')) el('receiptDeliveryAddr').textContent = receiptAddr;

  const tbody = el('receiptItemsTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr style="border-bottom:1px solid var(--line)">
        <td style="padding:10px 0;font-weight:600;color:var(--ink)">${receiptTitle}</td>
        <td style="padding:10px;text-align:center;color:var(--muted)">1 Adet</td>
        <td style="padding:10px 0;text-align:right;font-weight:800;color:var(--ink)">
          <span style="display:inline-flex;align-items:center;gap:4px">
            <img src="basarimlar/coin.png" alt="Coin" style="width:14px;height:14px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
            <span style="font-family:'Plus Jakarta Sans',sans-serif">${receiptPrice}</span>
          </span>
        </td>
      </tr>
    `;
  }

  if (el('receiptSubtotal')) {
    el('receiptSubtotal').innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:4px">
        <img src="basarimlar/coin.png" alt="Coin" style="width:14px;height:14px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700">${receiptPrice}</span>
      </span>
    `;
  }
  if (el('receiptGrandTotal')) {
    el('receiptGrandTotal').innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:4px">
        <img src="basarimlar/coin.png" alt="Coin" style="width:16px;height:16px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:16px">${receiptPrice}</span>
      </span>
    `;
  }

  if (el('receiptNoDisplay')) el('receiptNoDisplay').textContent = receiptNo;
  if (el('receiptDateDisplay')) el('receiptDateDisplay').textContent = receiptDate;
  if (el('receiptCustomerDisplay')) el('receiptCustomerDisplay').textContent = (state.currentUser ? state.currentUser.name : 'Okur');
  if (el('receiptItemDisplay')) el('receiptItemDisplay').textContent = receiptTitle;
  if (el('receiptPriceDisplay')) el('receiptPriceDisplay').textContent = receiptPrice;
  if (el('receiptTotalDisplay')) el('receiptTotalDisplay').textContent = receiptPrice;

  openModal('receiptModal');
}

export function printReceiptDocument() {
  window.print();
}

