import { el, toast, safeText, openModal, closeModal } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState, exportDatabaseJson, resetDemoData } from '../services/storage.js';
import { updateAllRealStatistics } from './stats.js';
import { renderBooks } from './catalog.js';

export function showAdminConfirm(title, message, btnText, onConfirm) {
  if (el('adminConfirmModalTitle')) el('adminConfirmModalTitle').textContent = title;
  if (el('adminConfirmModalText')) el('adminConfirmModalText').textContent = message;
  
  const proceedBtn = el('adminConfirmModalProceedBtn');
  if (proceedBtn) {
    proceedBtn.textContent = btnText || 'Onayla';
    proceedBtn.onclick = () => {
      closeModal('adminConfirmActionModal');
      if (typeof onConfirm === 'function') onConfirm();
    };
  }
  openModal('adminConfirmActionModal');
}

export function renderAdminDashboardPending() {
  const pendingContainer = el('adminPendingFullList');
  if (pendingContainer) {
    if (state.pendingRequests.length === 0) {
      pendingContainer.innerHTML = '<div style="text-align:center;padding:24px 16px;color:var(--muted);background:#f9fbf9;border-radius:12px;border:1px dashed #d5ded9"><p style="margin:0;font-size:13.5px;font-weight:500">Bekleyen yeni ödünç talebi bulunmamaktadır.</p></div>';
    } else {
      pendingContainer.innerHTML = state.pendingRequests.map(req => {
        const userName = req.userName || 'Kayıtlı Okur';
        const bookTitle = req.title || 'Edebi Eser';
        const reqDate = req.requestDate || 'Bugün';
        const days = req.requestedDays || 14;
        const initials = userName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'OK';

        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border:1px solid var(--line);border-radius:12px;margin-bottom:10px;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.03);gap:14px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:50%;background:#eaf4ed;color:#185a38;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:1px solid #c8e6c9">
                ${initials}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <strong style="font-size:14.5px;color:var(--ink)">${userName}</strong>
                  <span style="color:var(--muted);font-size:12px">→</span>
                  <span style="font-family:'Fraunces',serif;font-weight:700;font-size:14.5px;color:var(--ink-soft)">${bookTitle}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:3px;font-size:12px;color:var(--muted);flex-wrap:wrap">
                  <span>Talep Tarihi: <b style="color:var(--ink-soft)">${reqDate}</b></span>
                  <span>·</span>
                  <span>Süre: <b style="color:var(--ink-soft)">${days} Gün</b></span>
                </div>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button type="button" class="btn-action-primary" onclick="window.approveRequest('${req.id}')" style="padding:7px 18px;font-size:12px;font-weight:600;background:#185a38;border-color:#185a38;color:#ffffff;border-radius:8px">Onayla</button>
              <button type="button" class="btn-action-secondary" onclick="window.confirmReject('${req.id}')" style="padding:7px 18px;font-size:12px;font-weight:600;color:#c93424;border:1px solid rgba(201,52,36,0.3);background:#ffffff;border-radius:8px">Reddet</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  const extContainer = el('adminExtensionPendingList');
  if (extContainer) {
    if (state.pendingExtensions.length === 0) {
      extContainer.innerHTML = '<div style="text-align:center;padding:24px 16px;color:var(--muted);background:#f9fbf9;border-radius:12px;border:1px dashed #d5ded9"><p style="margin:0;font-size:13.5px;font-weight:500">Bekleyen süre uzatma talebi bulunmamaktadır.</p></div>';
    } else {
      extContainer.innerHTML = state.pendingExtensions.map(ext => {
        const userName = ext.userName || 'Kayıtlı Okur';
        const bookTitle = ext.title || ext.bookTitle || 'Ödünç Eser';
        const reqDate = ext.requestDate || 'Bugün';
        const extraDays = ext.extraDays || 7;
        const initials = userName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'OK';

        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border:1px solid var(--line);border-radius:12px;margin-bottom:10px;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.03);gap:14px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:50%;background:#fff3e0;color:#e65100;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:1px solid #ffe0b2">
                ${initials}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <strong style="font-size:14.5px;color:var(--ink)">${userName}</strong>
                  <span style="color:var(--muted);font-size:12px">→</span>
                  <span style="font-family:'Fraunces',serif;font-weight:700;font-size:14.5px;color:var(--ink-soft)">${bookTitle}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:3px;font-size:12px;color:var(--muted);flex-wrap:wrap">
                  <span>Talep: <b style="color:var(--ink-soft)">+${extraDays} Gün Ek Süre</b></span>
                  <span>·</span>
                  <span>Tarih: <b style="color:var(--ink-soft)">${reqDate}</b></span>
                </div>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button type="button" class="btn-action-primary" onclick="window.approveExtension('${ext.id}')" style="padding:7px 18px;font-size:12px;font-weight:600;background:#185a38;border-color:#185a38;color:#ffffff;border-radius:8px">Onayla</button>
              <button type="button" class="btn-action-secondary" onclick="window.rejectExtension('${ext.id}')" style="padding:7px 18px;font-size:12px;font-weight:600;color:#c93424;border:1px solid rgba(201,52,36,0.3);background:#ffffff;border-radius:8px">Reddet</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  renderAdminInventoryTable();
  renderAdminLoansTable();
  renderAdminUsersTable();
  renderAdminSalesTable();
  renderAdminQuotesManagement();
}

export function approveRequest(id) {
  const reqIndex = state.pendingRequests.findIndex(r => String(r.id) === String(id));
  if (reqIndex === -1) return;

  const req = state.pendingRequests[reqIndex];
  const book = state.books.find(b => b.title === req.title);
  if (!book || book.stock <= 0) {
    toast('Bu eserin stoğu kalmamıştır. Talep onaylanamıyor.');
    return;
  }

  book.stock -= 1;
  const newLoan = {
    id: Date.now(),
    userId: req.userId,
    userName: req.userName,
    title: req.title,
    days: req.requestedDays,
    daysRemaining: req.requestedDays,
    date: new Date().toLocaleDateString('tr-TR'),
    due: new Date(Date.now() + req.requestedDays * 86400000).toLocaleDateString('tr-TR')
  };

  state.loans.unshift(newLoan);
  state.pendingRequests.splice(reqIndex, 1);
  saveState();
  playUiSound('stamp');
  toast(`${req.userName} için ödünç talebi onaylandı!`);
  renderAdminDashboardPending();
  renderBooks();
  updateAllRealStatistics();
}

export function confirmReject(id) {
  const req = state.pendingRequests.find(r => String(r.id) === String(id));
  const title = req ? req.title : 'bu ödünç';
  showAdminConfirm('Ödünç Talebini Reddet', `'${title}' için yapılan ödünç alma talebini reddetmek istediğinize emin misiniz?`, 'Talebi Reddet', () => {
    state.pendingRequests = state.pendingRequests.filter(r => String(r.id) !== String(id));
    saveState();
    toast('Ödünç talebi reddedildi.');
    renderAdminDashboardPending();
    updateAllRealStatistics();
  });
}

export function approveExtension(id) {
  const extIndex = state.pendingExtensions.findIndex(e => String(e.id) === String(id));
  if (extIndex === -1) return;

  const ext = state.pendingExtensions[extIndex];
  const loan = state.loans.find(l => String(l.id) === String(ext.loanId));
  if (loan) {
    loan.daysRemaining += ext.extraDays;
    loan.days += ext.extraDays;
  }

  state.pendingExtensions.splice(extIndex, 1);
  saveState();
  playUiSound('stamp');
  toast('Süre uzatma talebi onaylandı!');
  renderAdminDashboardPending();
  updateAllRealStatistics();
}

export function rejectExtension(id) {
  showAdminConfirm('Süre Uzatma Talebini Reddet', 'Bu esere ait +7 gün ek süre uzatma talebini reddetmek istediğinize emin misiniz?', 'Talebi Reddet', () => {
    state.pendingExtensions = state.pendingExtensions.filter(e => String(e.id) !== String(id));
    saveState();
    toast('Süre uzatma talebi reddedildi.');
    renderAdminDashboardPending();
    updateAllRealStatistics();
  });
}

export function renderAdminInventoryTable() {
  const tbody = el('adminBooksTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.books.map(b => {
    return `
      <tr>
        <td><strong>${b.title}</strong></td>
        <td>${b.author}</td>
        <td><span class="quote-tag-pill" style="font-size:11px">${b.genre}</span></td>
        <td>${b.stock} Adet</td>
        <td style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;color:var(--ink)">
          <span style="display:inline-flex;align-items:center;gap:4px">
            <img src="basarimlar/coin.png" alt="Coin" style="width:14px;height:14px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
            <span>${b.price}</span>
          </span>
        </td>
        <td>
          <button class="btn-card-action" onclick="window.adjustBookStock('${b.id}', 1)" style="padding:4px 8px;font-size:11px">+</button>
          <button class="btn-card-action" onclick="window.adjustBookStock('${b.id}', -1)" style="padding:4px 8px;font-size:11px">-</button>
          <button class="btn-card-action" onclick="window.deleteBook('${b.id}')" style="padding:4px 8px;font-size:11px;color:var(--danger)">Sil</button>
        </td>
      </tr>
    `;
  }).join('');
}

export function adjustBookStock(id, delta) {
  const b = state.books.find(book => String(book.id) === String(id));
  if (!b) return;
  b.stock = Math.max(0, b.stock + delta);
  saveState();
  renderAdminInventoryTable();
  renderBooks();
  updateAllRealStatistics();
}

export function deleteBook(id) {
  const book = state.books.find(b => String(b.id) === String(id));
  const title = book ? book.title : 'Bu eseri';
  showAdminConfirm('Eseri Envanterden Sil', `'${title}' adlı eseri kütüphane envanterinden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`, 'Eseri Sil', () => {
    state.books = state.books.filter(b => String(b.id) !== String(id));
    saveState();
    toast(`'${title}' kütüphane envanterinden silindi.`);
    renderAdminInventoryTable();
    renderBooks();
    updateAllRealStatistics();
  });
}

export function openAddBookModal() {
  openModal('addBookModal');
}

export function submitNewBook(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const title = (el('newBookTitle').value || '').trim();
  const author = (el('newBookAuthor').value || '').trim();
  const genre = el('newBookGenre').value || 'Roman';
  const isbn = (el('newBookIsbn').value || '').trim() || '978605' + Math.floor(1000000 + Math.random() * 9000000);
  const stock = Number(el('newBookStock').value) || 5;
  const price = Number(el('newBookPrice').value) || 150;
  const year = Number(el('newBookYear').value) || 2026;
  const cover = (el('newBookCover').value || '').trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=85';

  if (!title || !author) {
    toast('Lütfen eser adı ve yazar alanlarını doldurunuz.');
    return;
  }

  const newB = {
    id: Date.now(),
    title: title,
    author: author,
    genre: genre,
    isbn: isbn,
    stock: stock,
    price: price,
    year: year,
    cover: cover
  };

  state.books.unshift(newB);
  saveState();
  closeModal('addBookModal');
  playUiSound('stamp');
  toast(`'${newB.title}' envantere başarıyla eklendi!`);
  renderAdminInventoryTable();
  renderBooks();
  updateAllRealStatistics();
}

export function renderAdminLoansTable() {
  const tbody = el('adminLoansTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.loans.map(l => {
    return `
      <tr>
        <td><strong>${l.userName}</strong></td>
        <td>${l.title}</td>
        <td>${l.date}</td>
        <td>${l.due} (${l.daysRemaining} gün)</td>
        <td>
          <button class="btn-card-action" onclick="window.adminReturnLoan('${l.id}')" style="padding:4px 8px;font-size:11px">İade Al</button>
        </td>
      </tr>
    `;
  }).join('');
}

export function adminReturnLoan(id) {
  const loanIndex = state.loans.findIndex(l => String(l.id) === String(id));
  if (loanIndex === -1) return;

  const loan = state.loans[loanIndex];
  const b = state.books.find(book => book.title === loan.title);
  if (b) b.stock += 1;

  state.loans.splice(loanIndex, 1);
  saveState();
  toast(`'${loan.title}' adlı eserin iadesi alındı.`);
  renderAdminLoansTable();
  renderBooks();
  updateAllRealStatistics();
}

export function renderAdminUsersTable() {
  const tbody = el('adminUsersTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.users.map(u => {
    const isMainAdmin = String(u.id) === '2' || u.email === 'admin@lumina.lib';
    const isYonetici = u.role === 'Yönetici';
    const roleStyle = isYonetici ? 'background:#eaf4ed;color:#185a38;border:1px solid #c8e6c9' : 'background:#f1f4f2;color:#495e57;border:1px solid #dce4e0';
    const initials = (u.avatar || u.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)) || 'OK';

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:#f1f5f3;border:1px solid #d8e2dc;color:var(--ink);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">
              ${initials}
            </div>
            <strong>${u.name}</strong>
          </div>
        </td>
        <td style="color:var(--muted);font-size:13px">${u.email}</td>
        <td>
          <span style="${roleStyle};padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.02em">
            ${u.role}
          </span>
        </td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--muted)">${u.registered || '2026'}</td>
        <td>
          <div style="display:flex;gap:6px;align-items:center">
            <button type="button" class="btn-action-secondary" onclick="window.toggleUserRole('${u.id}')" style="padding:4px 10px;font-size:11.5px;font-weight:600;background:#f7faf8">Rol Değiştir</button>
            ${!isMainAdmin ? `<button type="button" class="btn-action-secondary" onclick="window.deleteUser('${u.id}')" style="padding:4px 10px;font-size:11.5px;font-weight:600;color:#c93424;border-color:rgba(201,52,36,0.3);background:#ffffff">Sil</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function toggleUserRole(id) {
  const u = state.users.find(user => String(user.id) === String(id));
  if (!u) return;
  u.role = u.role === 'Yönetici' ? 'Okur' : 'Yönetici';
  saveState();
  toast(`${u.name} kullanıcısının rolü '${u.role}' olarak güncellendi.`);
  renderAdminUsersTable();
}

export function deleteUser(id) {
  if (String(id) === '2') {
    toast('Ana yönetici hesabı silinemez.');
    return;
  }
  const u = state.users.find(user => String(user.id) === String(id));
  const name = u ? u.name : 'Bu okuru';
  showAdminConfirm('Okur Hesabını Sil', `'${name}' adlı kullanıcı hesabını sistemden silmek istediğinize emin misiniz?`, 'Kullanıcıyı Sil', () => {
    state.users = state.users.filter(user => String(user.id) !== String(id));
    saveState();
    toast(`'${name}' kullanıcı kaydı silindi.`);
    renderAdminUsersTable();
    updateAllRealStatistics();
  });
}

export function openAddUserModal() {
  openModal('addUserModal');
}

export function submitNewUser(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const name = (el('newUserName').value || '').trim();
  const email = (el('newUserEmail').value || '').trim();
  const role = el('newUserRole').value || 'Okur';

  if (!name || !email) {
    toast('Lütfen ad ve e-posta alanlarını doldurunuz.');
    return;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    avatar: name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'OK',
    role: role,
    registered: 'Bugün'
  };

  state.users.push(newUser);
  saveState();
  closeModal('addUserModal');
  playUiSound('stamp');
  toast(`Yeni kullanıcı ${name} sisteme eklendi!`);
  renderAdminUsersTable();
  updateAllRealStatistics();
}

export function renderAdminSalesTable() {
  const tbody = el('adminSalesTableBody');
  if (!tbody) return;

  const totalSum = state.purchasesHistory.reduce((acc, cur) => acc + (Number(cur.price) || 0), 0);
  if (el('adminSalesTotalSum')) {
    el('adminSalesTotalSum').textContent = `Toplam Ciro: ${totalSum} Coin`;
  }

  tbody.innerHTML = state.purchasesHistory.map(p => {
    return `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;background:#f0f3f1;border:1px solid #d5ded9;padding:3px 8px;border-radius:5px;font-size:12px;font-weight:600;color:var(--ink)">${p.receipt}</span></td>
        <td><strong style="font-family:'Fraunces',serif;font-size:14px;color:var(--ink)">${p.title}</strong></td>
        <td style="color:var(--muted);font-size:12.5px">${p.date}</td>
        <td>
          <span style="display:inline-flex;align-items:center;gap:5px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;color:var(--ink)">
            <img src="basarimlar/coin.png" alt="Coin" style="width:15px;height:15px;object-fit:contain" onerror="this.src='basarimlar/coin.png'">
            <span>${p.price}</span>
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

export function renderAdminQuotesManagement() {
  const container = el('adminQuotesManageList');
  if (!container) return;

  if (state.quotes.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:24px 16px;color:var(--muted);background:#f9fbf9;border-radius:12px;border:1px dashed #d5ded9"><p style="margin:0;font-size:13.5px">Henüz kayıtlı alıntı bulunmamaktadır.</p></div>';
    return;
  }

  container.innerHTML = state.quotes.map(q => {
    const safeBook = q.bookTitle || 'Genel Edebiyat';
    const safeAuthor = q.author || 'Bilinmeyen Yazar';
    const safeUser = q.userName || 'Okur';
    const tag = q.tag || 'Genel';
    const date = q.date || 'Bugün';

    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:14px 18px;border:1px solid var(--line);border-radius:12px;margin-bottom:12px;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.03);gap:16px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-family:'Fraunces',serif;font-weight:700;font-size:14.5px;color:var(--ink)">${safeBook}</span>
            <span style="color:var(--muted);font-size:12px">·</span>
            <span style="color:var(--ink-soft);font-size:12.5px;font-weight:600">${safeAuthor}</span>
            <span style="background:rgba(24,90,56,0.08);color:#185a38;border:1px solid rgba(24,90,56,0.2);padding:2px 7px;border-radius:4px;font-size:10.5px;font-weight:700">#${tag}</span>
          </div>
          <p style="margin:4px 0 8px;font-size:13px;color:#2c3e38;font-style:italic;line-height:1.5;background:#f8faf9;border-left:3px solid var(--gold);padding:8px 12px;border-radius:0 8px 8px 0">“${q.text}”</p>
          <div style="display:flex;gap:14px;font-size:11.5px;color:var(--muted);flex-wrap:wrap">
            <span>Okur: <b style="color:var(--ink-soft)">${safeUser}</b></span>
            <span>Tarih: <b style="color:var(--ink-soft)">${date}</b></span>
            <span>Beğeni: <b style="color:#c93424">${q.likes || 0}</b></span>
          </div>
        </div>
        <button type="button" class="btn-action-secondary" onclick="window.deleteQuote('${q.id}')" style="padding:6px 14px;font-size:12px;font-weight:600;color:#c93424;border:1px solid rgba(201,52,36,0.3);background:#ffffff;border-radius:7px;cursor:pointer;flex-shrink:0">Sil</button>
      </div>
    `;
  }).join('');
}

export function publishAnnouncementFromDash(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const input = el('dashAnnouncementInput');
  const text = (input ? input.value : '').trim();
  if (!text) {
    toast('Lütfen duyuru metnini giriniz.');
    return;
  }

  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.innerHTML = `
      <span class="marquee-item"><span class="pulse-dot"></span> ${text.toUpperCase()}</span>
      <span class="marquee-sep">✦</span>
      <span class="marquee-item">${text.toUpperCase()}</span>
      <span class="marquee-sep">✦</span>
      <span class="marquee-item"><span class="pulse-dot"></span> ${text.toUpperCase()}</span>
      <span class="marquee-sep">✦</span>
      <span class="marquee-item">${text.toUpperCase()}</span>
      <span class="marquee-sep">✦</span>
    `;
  }
  playUiSound('stamp');
  toast('Duyuru üst kayan bantta canlı olarak yayınlandı!');
  if (input) input.value = '';
}
