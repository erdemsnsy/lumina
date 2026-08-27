import { el, safeText, openModal, closeModal, toast } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { updateAllRealStatistics } from './stats.js';
import { renderBooks } from './catalog.js';
import { showReceiptModal } from './borrow-buy.js';
import { api } from '../services/api.js';

export function addToCart(title) {
  playUiSound('tink');
  const book = state.books.find(b => b.title === title);
  if (!book || book.stock <= 0) {
    toast('Bu eser stokta kalmamıştır.');
    return;
  }

  const existing = state.cart.find(c => c.title === title);
  if (existing) {
    if (existing.qty < book.stock) {
      existing.qty += 1;
      toast(`Sepetteki adet güncellendi: ${book.title} (${existing.qty})`);
    } else {
      toast(`Kütüphane stoğunda sadece ${book.stock} adet bulunmaktadır.`);
    }
  } else {
    state.cart.push({ title: book.title, price: book.price, qty: 1, cover: book.cover, author: book.author });
    toast(`Sepete eklendi: ${book.title}`);
  }

  updateAllRealStatistics();
  renderCartPage();
}

export function changeCartQty(title, delta) {
  const item = state.cart.find(c => c.title === title);
  const book = state.books.find(b => b.title === title);
  if (!item || !book) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(title);
    return;
  }
  if (newQty > book.stock) {
    toast(`Stokta maksimum ${book.stock} adet mevcuttur.`);
    return;
  }

  item.qty = newQty;
  playUiSound('click');
  renderCartPage();
  updateAllRealStatistics();
}

export function removeFromCart(title) {
  playUiSound('click');
  state.cart = state.cart.filter(c => c.title !== title);
  toast(`'${title}' sepetten çıkarıldı.`);
  renderCartPage();
  updateAllRealStatistics();
}

export function applyCartCoupon() {
  const input = el('cartCouponInput');
  const code = (input ? input.value : '').trim().toUpperCase();
  const feedback = el('cartCouponMsg') || el('cartCouponFeedback');

  if (state.availableCoupons.includes(code)) {
    let discountPct = 15;
    if (code === 'OKUR20') discountPct = 20;
    if (code === 'ILKOKUMA10') discountPct = 10;
    if (code === 'EDEBİYAT25') discountPct = 25;

    state.cartAppliedCoupon = { code: code, pct: discountPct };
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color = 'var(--success)';
      feedback.textContent = `✓ '${code}' kuponu uygulandı (% ${discountPct} indirim)`;
    }
    playUiSound('tink');
  } else {
    state.cartAppliedCoupon = null;
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.color = 'var(--danger)';
      feedback.textContent = '✕ Geçersiz veya süresi dolmuş kupon kodu.';
    }
  }
  renderCartPage();
}

export function renderCartPage() {
  const emptyNotice = el('cartEmptyNotice');
  const itemsHeading = el('cartItemsHeading');
  const contentGrid = el('cartContentGrid');
  const cartList = el('cartPageList');

  if (state.cart.length === 0) {
    if (emptyNotice) emptyNotice.style.display = 'block';
    if (itemsHeading) itemsHeading.style.display = 'none';
    if (contentGrid) contentGrid.style.display = 'none';
    return;
  }

  if (emptyNotice) emptyNotice.style.display = 'none';
  if (itemsHeading) {
    itemsHeading.style.display = 'block';
    itemsHeading.textContent = `Sepetindeki Eserler (${state.cart.length})`;
  }
  if (contentGrid) contentGrid.style.display = 'grid';

  let subtotal = 0;
  state.cart.forEach(item => {
    subtotal += item.price * item.qty;
  });

  let discount = 0;
  if (state.cartAppliedCoupon) {
    discount = (subtotal * state.cartAppliedCoupon.pct) / 100;
  }
  const grandTotal = Math.max(0, subtotal - discount);

  if (el('cartSubtotalText')) el('cartSubtotalText').textContent = subtotal.toFixed(0);
  if (el('cartDiscountRow')) {
    el('cartDiscountRow').style.display = discount > 0 ? 'flex' : 'none';
    if (el('cartDiscountText')) el('cartDiscountText').textContent = '-' + discount.toFixed(0);
  }
  if (el('cartTotalText')) el('cartTotalText').textContent = grandTotal.toFixed(0);

  if (cartList) {
    const summaryMap = {
      'Bilim Kurgu': 'Geleceğin dünyasında insan bilincinin ve teknolojinin kesiştiği noktaları irdeleyen çarpıcı bir eser.',
      'Felsefe': 'Düşüncenin derin kıyılarında zihnin sınırlarını zorlayan, varoluş ve bilgelik üzerine zamansız bir başyapıt.',
      'Roman': 'İnsan ruhunun karmaşık labirentlerinde duygusal ve edebi derinliğiyle iz bırakan sürükleyici bir kurgu.',
      'Sanat': 'Görsel kültürün ve estetik yaratımın asırlar boyu süren büyüleyici evrimini gözler önüne seren seçkin bir kaynak.',
      'Tarih': 'Geçmişin tozlu sayfalarından günümüze ışık tutan, medeniyetlerin doğuş ve dönüşümünü ele alan titiz bir araştırma.'
    };

    cartList.innerHTML = state.cart.map(item => {
      const safeTitle = safeText(item.title);
      const book = state.books.find(b => b.title === item.title);
      const coverUrl = (book && book.cover) || item.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85';
      const genre = book ? book.genre : 'Koleksiyon';
      const author = item.author || (book ? book.author : 'Lumina Arşivi');
      const year = book ? (book.year || '2024') : '2024';
      const stock = book ? book.stock : 10;
      const summary = summaryMap[genre] || 'Lumina Kütüphane koleksiyonunun seçkin edebi mirası.';

      return `
        <div class="cart-item-card-box" style="display:flex;gap:24px;padding:22px 24px;border-radius:20px;background:#ffffff;border:1px solid #e1e7e4;box-shadow:0 4px 16px rgba(15,23,20,0.04);align-items:flex-start;transition:all 0.25s ease">
          <!-- Main Content Area (Cover + Details) -->
          <div class="cart-item-top-row" style="display:flex;gap:20px;flex:1;min-width:0;align-items:flex-start">
            <!-- Large Hardcover Book Showcase -->
            <div class="cart-item-cover" style="position:relative;width:115px;height:165px;min-width:115px;flex-shrink:0;border-radius:12px;overflow:hidden;box-shadow:0 10px 22px rgba(15,23,20,0.18);border:1px solid rgba(0,0,0,0.08);background:#1a2b25">
              <img src="${coverUrl}" alt="${safeTitle}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85'">
              <div style="position:absolute;top:0;left:0;bottom:0;width:6px;background:linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.25) 100%)"></div>
            </div>

            <!-- Book Details Deck -->
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
                  <span style="font:700 9.5px 'DM Mono',monospace;letter-spacing:0.04em;background:#edf5ea;color:#1e5b38;padding:2px 8px;border-radius:5px;text-transform:uppercase">${genre}</span>
                  <span style="font:600 11px 'DM Mono',monospace;color:#2e7d32">✓ Stokta (${stock})</span>
                </div>
                <h4 style="font:700 19px/1.25 'Fraunces',serif;margin:0 0 3px;color:var(--ink)">${item.title}</h4>
                <p style="color:var(--muted);font-size:12.5px;margin:0 0 8px">${author} · ${year}</p>
                <div class="cart-item-summary-box" style="font-size:12px;line-height:1.5;color:#394c45;background:rgba(240,246,243,0.75);border:1px solid #dce8e2;padding:8px 12px;border-radius:8px;margin-bottom:10px;font-style:italic">"${summary}"</div>
              </div>
            </div>
          </div>

          <!-- Bottom Actions Bar: Price + Stepper + Remove Button -->
          <div class="cart-item-actions-row" style="display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;padding-top:10px;border-top:1px solid #edf2ef;flex-wrap:wrap">
            <div style="display:inline-flex;align-items:center;gap:5px;background:#f8faf9;border:1px solid #e1e7e4;padding:4px 10px;border-radius:8px">
              <img src="basarimlar/coin.png" alt="Coin" style="width:15px;height:15px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
              <span style="font:800 15px 'Plus Jakarta Sans',sans-serif;color:var(--ink)">${item.price}</span>
              <span style="font-size:11px;color:var(--muted)">/ adet</span>
            </div>

            <div style="display:flex;align-items:center;gap:8px">
              <!-- Qty Stepper -->
              <div style="display:inline-flex;align-items:center;gap:4px;background:#f4f7f5;padding:4px 10px;border-radius:999px;border:1px solid #dbe3de">
                <button type="button" onclick="changeCartQty('${safeTitle}', -1)" style="border:0;background:transparent;cursor:pointer;font-weight:bold;font-size:15px;color:var(--ink);width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%">−</button>
                <span style="font:800 13px 'Plus Jakarta Sans',sans-serif;min-width:18px;text-align:center;color:var(--ink)">${item.qty}</span>
                <button type="button" onclick="changeCartQty('${safeTitle}', 1)" style="border:0;background:transparent;cursor:pointer;font-weight:bold;font-size:15px;color:var(--ink);width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%">+</button>
              </div>

              <!-- Remove Button -->
              <button type="button" onclick="removeFromCart('${safeTitle}')" style="background:#fff1f2;border:1px solid #fecdd3;color:#e63946;padding:5px 12px;border-radius:999px;display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11.5px;font-weight:700;flex-shrink:0" title="Sepetten Kaldır">
                <span>✕</span>
                <span>Çıkar</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

export function handleCartPaymentMethodChange() {
  const select = el('cartPaymentMethod');
  const method = select ? select.value : (document.querySelector('input[name="cartPaymentMethod"]:checked')?.value || 'card');
  const cardFields = el('cartCardFields') || el('cartCheckoutCardFields');
  const transferFields = el('cartTransferFields');
  const walletFields = el('cartWalletFields');

  if (cardFields) cardFields.style.display = (method === 'card') ? 'grid' : 'none';
  if (transferFields) transferFields.style.display = (method === 'transfer') ? 'block' : 'none';
  if (walletFields) walletFields.style.display = (method === 'wallet') ? 'block' : 'none';
}

export function checkoutCart() {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }
  if (state.cart.length === 0) return;

  let subtotal = state.cart.reduce((a,b) => a + (b.price * b.qty), 0);
  let discount = state.cartAppliedCoupon ? (subtotal * state.cartAppliedCoupon.pct) / 100 : 0;
  const total = Math.max(0, subtotal - discount);

  const itemsList = el('cartCheckoutItemsList');
  if (itemsList) {
    itemsList.innerHTML = state.cart.map(c => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #edf2ef">
        <span>${c.title} <b style="color:var(--muted)">(x${c.qty})</b></span>
        <div style="display:inline-flex;align-items:center;gap:4px">
          <img src="basarimlar/coin.png" style="width:13px;height:13px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
          <b style="font-family:'Plus Jakarta Sans',sans-serif;color:var(--ink)">${c.price * c.qty}</b>
        </div>
      </div>
    `).join('');
  }

  if (el('cartCheckoutTotalSum')) {
    el('cartCheckoutTotalSum').innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px">
        <img src="basarimlar/coin.png" style="width:18px;height:18px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
        <span style="font:800 20px/1 'Plus Jakarta Sans',sans-serif;color:var(--ink)">${total.toFixed(0)}</span>
      </div>
    `;
  }
  if (el('cartCheckoutTotalDisplay')) el('cartCheckoutTotalDisplay').textContent = total.toFixed(0);
  if (el('cartCheckoutItemCount')) el('cartCheckoutItemCount').textContent = state.cart.length + ' farklı eser';

  const select = el('cartPaymentMethod');
  if (select) select.value = 'card';
  handleCartPaymentMethodChange();
  openModal('cartCheckoutModal');
}

export function confirmCartCheckout(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (state.cart.length === 0) return;

  const method = el('cartPaymentMethod')?.value || 'card';
  if (method === 'card') {
    const holder = (el('cartCardHolder') ? el('cartCardHolder').value : '').trim();
    const number = (el('cartCardNumber') ? el('cartCardNumber').value : '').trim();
    if (!holder || !number) {
      toast('Lütfen kart üzerindeki ad soyad ve kart numarasını eksiksiz giriniz.');
      return;
    }
  }

  const deliveryAddr = (el('cartAddressInput')?.value || el('cartDeliveryAddress')?.value || 'Kadıköy, Moda Cad. No: 18 / İstanbul');
  const receiptNo = '#LM-' + Math.floor(1000 + Math.random() * 9000);

  let totalSpent = 0;
  state.cart.forEach(item => {
    const book = state.books.find(b => b.title === item.title);
    if (book) {
      book.stock = Math.max(0, book.stock - item.qty);
    }
    const itemTotal = item.price * item.qty;
    totalSpent += itemTotal;
    const record = {
      id: Date.now() + Math.random(),
      userId: state.currentUser ? state.currentUser.id : 1,
      title: item.title + (item.qty > 1 ? ` (x${item.qty})` : ''),
      price: itemTotal,
      date: new Date().toLocaleDateString('tr-TR'),
      receipt: receiptNo,
      deliveryAddress: deliveryAddr
    };
    state.purchasesHistory.unshift(record);
  });

  const grandPurchasesTotal = {
    id: Date.now(),
    title: state.cart.map(c => `${c.title} (x${c.qty})`).join(', '),
    price: totalSpent,
    date: new Date().toLocaleDateString('tr-TR'),
    receipt: receiptNo,
    deliveryAddress: deliveryAddr
  };

  state.cart = [];
  state.cartAppliedCoupon = null;

  saveState();
  closeModal('cartCheckoutModal');
  playUiSound('stamp');
  toast(`Sepetinizdeki tüm siparişler onaylandı! Fatura No: ${receiptNo}`);
  renderBooks();
  renderCartPage();
  updateAllRealStatistics();
  showReceiptModal(grandPurchasesTotal);
}

