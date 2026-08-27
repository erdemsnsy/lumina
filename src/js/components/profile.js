import { el, toast, openModal, closeModal } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { navigateTo, scrollToSection } from './router.js';
import { switchAuthView, handleLogout } from '../services/auth.js';
import { updateAllRealStatistics } from './stats.js';
import { renderAdminDashboardPending, renderAdminInventoryTable, renderAdminLoansTable, renderAdminUsersTable, renderAdminSalesTable, renderAdminQuotesManagement } from './admin.js';
import { renderCoupons, renderUserBadges, inspectBadge } from './vouchers-badges.js';
import { copyQuoteText, deleteQuote, openAddQuoteModal } from './quotes.js';
import { returnBook, showReceiptModal } from './borrow-buy.js';

    // =========================================================================
    // PROFILE / DASHBOARD RENDERING
    // =========================================================================
    export function renderProfilePage() {
      if (!state.currentUser) {
        if (el('navUserName')) el('navUserName').textContent = state.english ? 'Sign In' : 'Giriş Yap';
        if (el('navUserAvatar')) el('navUserAvatar').textContent = '👤';
        
        const pName = el('profileName');
        if (pName) pName.textContent = 'Lütfen Giriş Yapın';
        const pEmail = el('profileEmail');
        if (pEmail) pEmail.textContent = '';
        const avatarEl = el('profileAvatar');
        if (avatarEl) {
          avatarEl.textContent = '👤';
          avatarEl.className = 'user-avatar-lg';
        }
        const roleBadge = el('profileRoleBadge');
        if (roleBadge) roleBadge.style.display = 'none';
        
        const navContainer = el('profileNavContainer');
        if (navContainer) navContainer.innerHTML = '';
        
        return;
      }
      const isAdmin = state.currentUser.role === 'Yönetici';

      const pName = el('profileName');
      if (pName) pName.textContent = state.currentUser.name;
      const pEmail = el('profileEmail');
      if (pEmail) pEmail.textContent = state.currentUser.email;
      
      const avatarEl = el('profileAvatar');
      if (avatarEl) {
        avatarEl.textContent = state.currentUser.avatar;
        avatarEl.className = 'user-avatar-lg' + (isAdmin ? ' admin' : '');
        avatarEl.style.cursor = 'pointer';
        avatarEl.onclick = () => openModal('avatarModal');
      }
      
      const roleBadge = el('profileRoleBadge');
      if (roleBadge) {
        roleBadge.textContent = state.currentUser.role;
        roleBadge.className = 'status-badge' + (isAdmin ? ' admin' : '');
      }

      el('profilePageEyebrow').textContent = isAdmin ? 'LUMINA / YÖNETİCİ KONTROL MERKEZİ' : 'LUMINA / OKUR PROFİLİ';
      el('profilePageTitle').textContent = isAdmin ? 'Yönetim Paneli.' : 'Okuma Alanın.';
      el('profilePageSubtitle').textContent = isAdmin 
        ? 'Kütüphane ekosistemindeki tüm kitapları, stokları, ödünç onaylarını, kayıtlı okurları ve satışları canlı yönetin.'
        : 'Ödünçlerin, siparişlerin, kaydettiğin alıntılar ve kişisel okuma defterin.';

      const navContainer = el('profileNavContainer');
      let navHtml = '';

      if (isAdmin) {
        navHtml = `
          <!-- YÖNETİM & ENVANTER AKORDİYON -->
          <div class="nav-section-label">Yönetim</div>
          <div class="accordion-group open has-active-child" id="accGroup-adminInventory">
            <button type="button" class="accordion-header-btn" onclick="toggleProfileAccordion('adminInventory', this)">
              <span class="acc-title">Envanter & Okurlar</span>
              <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                <button type="button" class="v-nav-btn sub-item active" onclick="switchProfileTab('adminInventory', this)">Kitap & Stok Yönetimi</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('adminLoans', this)">Ödünç & İade Masası</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('adminUsers', this)">Üye & Okur Yönetimi</button>
              </div>
            </div>
          </div>

          <!-- FİNANS & MODERASYON AKORDİYON -->
          <div class="accordion-group" id="accGroup-adminFinance">
            <button type="button" class="accordion-header-btn" onclick="toggleProfileAccordion('adminFinance', this)">
              <span class="acc-title">Finans & Moderasyon</span>
              <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('adminSales', this)">Satışlar & Ciro Raporu</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('adminQuotes', this)">Alıntı Moderasyonu</button>
              </div>
            </div>
          </div>

          <!-- SİSTEM & HESAP -->
          <div class="nav-section-label" style="margin-top:8px">Sistem</div>
          <button type="button" class="v-nav-btn" onclick="switchProfileTab('adminSettings', this)">Sistem Ayarları & Araçlar</button>
          <button type="button" class="v-nav-btn" style="color:var(--danger)" onclick="handleLogout()">Çıkış Yap</button>
        `;
        if (navContainer) {
          navContainer.innerHTML = navHtml;
          switchProfileTab('adminInventory', navContainer.querySelector('.v-nav-btn.sub-item'));
        }

        renderAdminDashboardPending();
        renderAdminInventoryTable();
        renderAdminLoansTable();
        renderAdminUsersTable();
        renderAdminSalesTable();
        renderAdminQuotesManagement();
      } else {
        navHtml = `
          <!-- PROFİL -->
          <div class="nav-section-label">Profil</div>
          <button type="button" class="v-nav-btn active" onclick="switchProfileTab('userInfo', this)">Kişisel Bilgiler</button>

          <!-- KÜTÜPHANEM AKORDİYON -->
          <div class="accordion-group" id="accGroup-library">
            <button type="button" class="accordion-header-btn" onclick="toggleProfileAccordion('library', this)">
              <span class="acc-title">Kütüphanem</span>
              <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userLoans', this)">Ödünç Aldıklarım</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userHistory', this)">Ödünç Geçmişim</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userQuotes', this)">Kaydettiğim Alıntılar</button>
              </div>
            </div>
          </div>

          <!-- ALIŞVERİŞ AKORDİYON -->
          <div class="accordion-group" id="accGroup-shopping">
            <button type="button" class="accordion-header-btn" onclick="toggleProfileAccordion('shopping', this)">
              <span class="acc-title">Alışveriş</span>
              <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userPurchases', this)">Satın Aldıklarım</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userHistory', this)">İadelerim</button>
              </div>
            </div>
          </div>

          <!-- BAŞARILAR AKORDİYON -->
          <div class="accordion-group" id="accGroup-rewards">
            <button type="button" class="accordion-header-btn" onclick="toggleProfileAccordion('rewards', this)">
              <span class="acc-title">Başarılar</span>
              <svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userBadges', this)">Rozetlerim</button>
                <button type="button" class="v-nav-btn sub-item" onclick="switchProfileTab('userRewards', this)">Kuponlar & Görevler</button>
              </div>
            </div>
          </div>

          <!-- HESAP -->
          <div class="nav-section-label" style="margin-top:8px">Hesap</div>
          <button type="button" class="v-nav-btn" onclick="switchProfileTab('userSettings', this)">Ayarlar & Hesap</button>
          <button type="button" class="v-nav-btn" style="color:var(--danger)" onclick="handleLogout()">Çıkış Yap</button>
        `;
        if (navContainer) {
          navContainer.innerHTML = navHtml;
          switchProfileTab('userInfo', navContainer.querySelector('.v-nav-btn'));
        }

        renderMemberProfileData();
      }

      renderMiniBadgesUnderName();

      updateAllRealStatistics();
    }

    export function toggleProfileAccordion(groupId, headerBtn) {
      playUiSound('page');
      const group = headerBtn ? headerBtn.closest('.accordion-group') : el('accGroup-' + groupId);
      if (!group) return;
      const isCurrentlyOpen = group.classList.contains('open');

      // Close all accordions (exclusive single-open behavior)
      document.querySelectorAll('.accordion-group').forEach(g => {
        g.classList.remove('open');
      });

      // Toggle current
      if (!isCurrentlyOpen) {
        group.classList.add('open');
      }
    }

    export function switchProfileTab(tabName, btn) {
      playUiSound('page');
      document.querySelectorAll('.profile-tab-pane').forEach(p => p.style.display = 'none');
      const targetPane = el('pTab-' + tabName);
      if (targetPane) targetPane.style.display = 'block';

      document.querySelectorAll('.v-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.accordion-group').forEach(g => g.classList.remove('has-active-child'));

      if (btn) {
        btn.classList.add('active');
        const parentGroup = btn.closest('.accordion-group');
        if (parentGroup) {
          // Ensure parent accordion is open and marked
          document.querySelectorAll('.accordion-group').forEach(g => {
            if (g !== parentGroup) g.classList.remove('open');
          });
          parentGroup.classList.add('open');
          parentGroup.classList.add('has-active-child');
        } else {
          // Direct top-level item clicked (like Kişisel Bilgiler, Ayarlar), close accordions
          document.querySelectorAll('.accordion-group').forEach(g => g.classList.remove('open'));
        }
      }
    }


    // =========================================================================
    // MEMBER PROFILE DATA & PERSONAL INFO ENGINE
    // =========================================================================
    export function renderMiniBadgesUnderName() {
      const totalLoansCount = (state.loans || []).length;
      const totalPurchasesCount = (state.purchasesHistory || []).length;
      const userQuotesCount = (state.quotes || []).filter(q => state.currentUser && q.userId === state.currentUser.id).length;
      const favsCount = (state.favorites || []).length;
      const hours = new Date().getHours();
      const isNightTime = (hours >= 19 || hours <= 6);
      const hasPhilosophy = (state.quotes || []).some(q => q.bookTitle.toLowerCase().includes('atlas') || q.bookTitle.toLowerCase().includes('kendine')) || (state.loans || []).some(l => l.title.toLowerCase().includes('atlas'));
      const hasExtensionOrReturn = (state.pendingExtensions || []).length > 0 || totalLoansCount >= 2;

      const badges = [
        {
          id: 'first_step',
          title: 'İlk Adım (First Step)',
          img: 'basarimlar/madalya.png',
          unlocked: totalLoansCount > 0 || totalPurchasesCount > 0 || true
        },
        {
          id: 'night_owl',
          title: 'Gece Kuşu (Night Owl)',
          img: 'basarimlar/baykus.png',
          unlocked: isNightTime || totalLoansCount > 0
        },
        {
          id: 'quote_master',
          title: 'Alıntı Ustası (Quote Master)',
          img: 'basarimlar/parsomen.png',
          unlocked: userQuotesCount >= 1
        },
        {
          id: 'archive_guardian',
          title: 'Arşiv Muhafızı (Archive Guardian)',
          img: 'basarimlar/kalkan.png',
          unlocked: hasExtensionOrReturn || totalLoansCount >= 1
        },
        {
          id: 'collector_passion',
          title: 'Koleksiyon Tutkunu (Star Collector)',
          img: 'basarimlar/yildiz.png',
          unlocked: favsCount >= 1
        }
      ];

      if (typeof window.renderMiniBadgesUnderName === 'function') {
        window.renderMiniBadgesUnderName();
      }
    }

    export function toggleProfileEditMode(isEditing) {
      const displayView = el('profileInfoDisplayView');
      const editView = el('profileInfoEditView');
      if (!displayView || !editView) return;

      if (isEditing) {
        if (el('editFullNameInput')) el('editFullNameInput').value = state.currentUser ? state.currentUser.name : '';
        if (el('editEmailInput')) el('editEmailInput').value = state.currentUser ? state.currentUser.email : '';
        if (el('editPhoneInput')) el('editPhoneInput').value = (state.currentUser && state.currentUser.phone) ? state.currentUser.phone : '0532 845 19 23';
        displayView.style.display = 'none';
        editView.style.display = 'block';
        playUiSound('page');
      } else {
        editView.style.display = 'none';
        displayView.style.display = 'block';
        playUiSound('page');
      }
    }

    export function getFormattedUserRegDate(u) {
      if (!u) return '14 Ocak 2026';
      const reg = u.registered || u.date;
      if (reg && reg !== 'Bugün') return reg;
      return '14 Ocak 2026';
    }

    export function renderMemberProfileData() {
      if (state.currentUser) {
        const regDate = getFormattedUserRegDate(state.currentUser);
        if (el('userInfoName')) el('userInfoName').textContent = state.currentUser.name;
        if (el('userInfoAvatar')) el('userInfoAvatar').textContent = state.currentUser.avatar || 'OK';

        // Kişisel Bilgiler Görüntüleme Alanları
        if (el('displayProfileName')) el('displayProfileName').textContent = state.currentUser.name || 'Erdem Şensoy';
        if (el('displayProfileEmail')) el('displayProfileEmail').textContent = state.currentUser.email || 'erdemensoy@gmail.com';
        if (el('displayProfilePhone')) el('displayProfilePhone').textContent = state.currentUser.phone || '0532 845 19 23';

        // Üyelik Bilgileri Alanları
        if (el('displayMemberDate')) el('displayMemberDate').textContent = regDate;
        if (el('displayMemberNo')) el('displayMemberNo').textContent = state.currentUser.memberNo || ('LMN-' + String(state.currentUser.id || 1284).padStart(6, '0'));
      }

      renderMiniBadgesUnderName();

      // Render user's pending loan requests and active loans
      const myPending = (state.pendingRequests || []).filter(r => state.currentUser && (r.userId === state.currentUser.id || r.userName === state.currentUser.name));
      
      let loansContentHtml = '';

      if (myPending.length > 0) {
        loansContentHtml += `
          <div style="margin-bottom: 24px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:16px">⏳</span>
              <h4 style="margin:0;font:700 15px 'Fraunces',serif;color:var(--ink)">Yönetici Onayı Bekleyen Taleplerim (${myPending.length})</h4>
            </div>
            <div class="loan-cards-stack">
              ${myPending.map(req => {
                const safeTitle = (req.title || '').replace(/'/g, "\\'");
                const bookObj = (state.books || []).find(b => b.title.toLowerCase() === (req.title || '').toLowerCase()) || {};
                const coverUrl = bookObj.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                const authorName = bookObj.author || 'Lumina Yazarı';

                return `
                  <div class="loan-item-card" style="border-left: 4px solid var(--gold); background: #fdfcf9;">
                    <img src="${coverUrl}" alt="${safeTitle}" class="loan-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'">
                    <div class="loan-info-body">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
                        <div>
                          <b style="font:700 16px 'Fraunces',serif;color:var(--ink);display:block;margin-bottom:3px">${req.title}</b>
                          <div style="font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                            <span>Yazar: <b style="color:var(--ink-soft)">${authorName}</b></span>
                            <span>Talep Tarihi: <b style="color:var(--ink-soft)">${req.requestDate || 'Bugün'}</b></span>
                            <span>İstenen Süre: <b style="color:var(--ink-soft)">${req.requestedDays || 14} Gün</b></span>
                          </div>
                        </div>
                        <span class="status-badge" style="background:#fff8e1;color:#b78103;font-weight:700;font-size:12px;padding:4px 12px;border-radius:999px;border:1px solid #ffe082">⏳ Onay Bekliyor</span>
                      </div>
                      <div class="loan-actions-row" style="margin-top:12px">
                        <button type="button" class="btn-action-secondary" style="padding:5px 14px;font-size:11.5px;color:var(--danger)" onclick="cancelBorrowRequest('${req.id}')">Talebi İptal Et</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (state.loans.length > 0) {
        loansContentHtml += `
          <div>
            ${myPending.length > 0 ? '<h4 style="margin:0 0 12px;font:700 15px \'Fraunces\',serif;color:var(--ink)">Aktif Okuduğum Kitaplar (' + state.loans.length + ')</h4>' : ''}
            <div class="loan-cards-stack">
              ${state.loans.map(l => {
                const safeTitle = l.title.replace(/'/g, "\\'");
                const daysLeft = l.daysRemaining !== undefined ? l.daysRemaining : 4;
                const progressPct = Math.max(12, Math.min(100, (daysLeft / 7) * 100));
                const badgeColor = daysLeft > 3 ? '#267332' : (daysLeft > 1 ? '#e65100' : '#c93424');
                const badgeBg = daysLeft > 3 ? '#e8f5e9' : (daysLeft > 1 ? '#fff3e0' : '#ffebee');
                const isPendingExt = (state.pendingExtensions || []).some(x => (x.loanId && String(x.loanId) === String(l.id)) || x.bookTitle === l.title);

                const bookObj = (state.books || []).find(b => b.title.toLowerCase() === l.title.toLowerCase()) || {};
                const coverUrl = bookObj.cover || l.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                const authorName = bookObj.author || l.author || 'Lumina Yazarı';

                let extBtnHtml = '';
                if (isPendingExt) {
                  extBtnHtml = '<span class="status-badge" style="background:#fff3e0;color:#e65100;font-weight:700;font-size:11.5px;padding:5px 12px">⏳ +7 Gün Uzatma Talebi Onay Bekliyor</span>';
                } else {
                  extBtnHtml = '<button type="button" class="btn-action-secondary" style="padding:6px 14px;font-size:12px;font-weight:600" onclick="requestLoanExtension(\'' + (l.id || '') + '\', \'' + safeTitle + '\')">+7 Gün Süre Uzat</button>';
                }

                return `
                  <div class="loan-item-card">
                    <img src="${coverUrl}" alt="${safeTitle}" class="loan-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'">
                    <div class="loan-info-body">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
                        <div>
                          <b style="font:700 16px 'Fraunces',serif;color:var(--ink);display:block;margin-bottom:3px">${l.title}</b>
                          <div style="font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                            <span>Yazar: <b style="color:var(--ink-soft)">${authorName}</b></span>
                            <span>Alınma: <b style="color:var(--ink-soft)">${l.date || '20 Ağustos 2026'}</b></span>
                            <span>Son Teslim: <b style="color:var(--ink-soft)">${l.due || '27 Ağustos 2026'}</b></span>
                          </div>
                        </div>
                        <span class="status-badge" style="background:${badgeBg};color:${badgeColor};font-weight:700;font-size:12px;padding:4px 10px;border-radius:999px">⏱️ ${daysLeft} Gün Kaldı</span>
                      </div>
                      <div style="width:100%;height:5px;background:var(--line);border-radius:999px;overflow:hidden;margin:4px 0">
                        <div style="width:${progressPct}%;height:100%;background:${badgeColor};border-radius:999px;transition:width 0.3s ease"></div>
                      </div>
                      <div class="loan-actions-row">
                        ${extBtnHtml}
                        <button type="button" class="btn-action-primary" style="padding:6px 16px;font-size:12px" onclick="returnBook('${safeTitle}')">İade Et</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (!myPending.length && !state.loans.length) {
        loansContentHtml = `
          <div style="text-align:center;padding:48px 20px;color:var(--muted);background:#ffffff;border-radius:16px;border:1px solid var(--line)">
            <div style="font-size:36px;margin-bottom:8px">📖</div>
            <p style="margin:0;font-size:14.5px;font-weight:600;color:var(--ink)">Şu anda aktif bir ödünç kitabınız veya bekleyen talebiniz bulunmuyor.</p>
            <p style="margin:6px 0 16px;font-size:13px">Katalogdan dilediğiniz eseri seçip ödünç alma talebi gönderebilirsiniz.</p>
            <button type="button" class="btn-action-primary" style="font-size:13px;padding:8px 20px" onclick="navigateTo('home'); scrollToSection('katalog');">Kataloğu Keşfet →</button>
          </div>
        `;
      }

      el('profileFullLoans').innerHTML = loansContentHtml;

      el('profilePurchasesList').innerHTML = state.purchasesHistory.length ? ('<div class="history-cards-stack">' + state.purchasesHistory.map(p => {
        const safeTitle = p.title.replace(/'/g, "\\'");
        const bookObj = (state.books || []).find(b => b.title.toLowerCase() === p.title.toLowerCase()) || {};
        const coverUrl = bookObj.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
        const method = p.method === 'transfer' ? 'Banka Havalesi' : (p.method === 'cash' ? 'Kapıda Nakit' : 'Kredi Kartı');

        return '<div class="history-item-card">' +
          '<img src="' + coverUrl + '" alt="' + safeTitle + '" class="history-cover-img" onclick="showDetails(\'' + safeTitle + '\')" onerror="this.src=\'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80\'">' +
          '<div class="history-info-body">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;flex-wrap:wrap">' +
              '<h4 class="history-book-title" onclick="showDetails(\'' + safeTitle + '\')">' + p.title + '</h4>' +
              '<span class="history-genre-pill" style="background:#fef7e7;color:var(--gold-dark);border:1px solid #fae1a7">Sipariş Tamamlandı</span>' +
            '</div>' +
            '<div class="history-meta-row">' +
              '<span>📅 Tarih: <b>' + p.date + '</b></span>' +
              '<span>💳 Ödeme: <b>' + method + '</b></span>' +
              '<span>Makbuz: <code style="font-family:\'DM Mono\',monospace;background:#f0f3f1;padding:2px 6px;border-radius:4px">' + p.receipt + '</code></span>' +
            '</div>' +
            '<div style="margin-top:8px;display:inline-flex;width:fit-content;max-width:max-content;align-self:flex-start;align-items:center;gap:6px;background:#f1f4f2;border:1px solid rgba(15,23,20,0.08);padding:4px 10px;border-radius:8px">' +
              '<img src="basarimlar/coin.png" alt="Coin" style="width:16px;height:16px;object-fit:contain" onerror="this.src=\'basarimlar/coin.png\'">' +
              '<b style="font-size:13.5px;color:var(--ink);font-family:\'Plus Jakarta Sans\',sans-serif;font-weight:700">' + p.price + '</b>' +
            '</div>' +
          '</div>' +
          '<div class="history-actions-col">' +
            '<button type="button" class="history-action-btn primary" onclick="showReceiptModal(\'' + p.receipt + '\')"> Faturayı Görüntüle</button>' +
            '<button type="button" class="history-action-btn" onclick="openAddQuoteModal(\'' + safeTitle + '\')"> Alıntı Ekle</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>') : '<p style="color:var(--muted);font-size:14px;padding:20px 0;text-align:center">Henüz satın alma geçmişiniz bulunmuyor.</p>';

      const sampleHistory = [
        { title: 'Kendine Doğru', author: 'Lale Öz', borrowDate: '3 Ağustos 2026', returnDate: '10 Ağustos 2026', durationDays: 7, status: 'Zamanında İade Edildi' },
        { title: 'Rüzgârın Adı', author: 'Ece Koral', borrowDate: '19 Temmuz 2026', returnDate: '26 Temmuz 2026', durationDays: 7, status: 'Zamanında İade Edildi' }
      ];

      const historySummaryHtml = '<div class="reading-stats-summary-grid">' +
        '<div class="stat-mini-pill-box">' +
          '<div class="stat-mini-icon-circle" style="background:rgba(33,56,47,0.08);border:1px solid #c8e6c9">' +
            '' +
          '</div>' +
          '<div>' +
            '<span class="stat-mini-label">Tamamlanan Eser</span>' +
            '<b class="stat-mini-val">' + sampleHistory.length + ' Kitap</b>' +
          '</div>' +
        '</div>' +
        '<div class="stat-mini-pill-box">' +
          '<div class="stat-mini-icon-circle" style="background:rgba(179,136,32,0.1);border:1px solid #fae1a7">' +
            '' +
          '</div>' +
          '<div>' +
            '<span class="stat-mini-label">Ortalama Süre</span>' +
            '<b class="stat-mini-val">7 Gün / Eser</b>' +
          '</div>' +
        '</div>' +
        '<div class="stat-mini-pill-box">' +
          '<div class="stat-mini-icon-circle" style="background:rgba(43,97,30,0.1);border:1px solid #c8e6c9">' +
            '' +
          '</div>' +
          '<div>' +
            '<span class="stat-mini-label">Güvenilirlik</span>' +
            '<b class="stat-mini-val" style="color:#2b611e">%100 Kusursuz İade</b>' +
          '</div>' +
        '</div>' +
      '</div>';

      el('profileHistoryList').innerHTML = sampleHistory.length ? (historySummaryHtml + '<div class="history-cards-stack">' + sampleHistory.map(h => {
        const safeTitle = h.title.replace(/'/g, "\\'");
        const bookObj = (state.books || []).find(b => b.title.toLowerCase() === h.title.toLowerCase()) || {};
        const coverUrl = bookObj.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
        const genre = bookObj.genre || 'Felsefe';

        return '<div class="history-item-card">' +
          '<img src="' + coverUrl + '" alt="' + safeTitle + '" class="history-cover-img" onclick="showDetails(\'' + safeTitle + '\')" onerror="this.src=\'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80\'">' +
          '<div class="history-info-body">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;flex-wrap:wrap">' +
              '<h4 class="history-book-title" onclick="showDetails(\'' + safeTitle + '\')">' + h.title + '</h4>' +
              '<span class="history-genre-pill">' + genre + '</span>' +
            '</div>' +
            '<div class="history-meta-row">' +
              '<span>Yazar: <b>' + h.author + '</b></span>' +
              '<span>📅 Ödünç: <b>' + h.borrowDate + '</b></span>' +
              '<span>✓ İade: <b>' + h.returnDate + '</b></span>' +
            '</div>' +
            '<div style="margin-top:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
              '<span class="history-status-badge">✓ ' + h.status + '</span>' +
              '<span style="font-size:11.5px;color:var(--muted);font-family:\'DM Mono\',monospace">⏱️ ' + h.durationDays + ' Gün Okuma Süresi</span>' +
            '</div>' +
          '</div>' +
          '<div class="history-actions-col">' +
            '<button type="button" class="history-action-btn primary" onclick="showDetails(\'' + safeTitle + '\')" title="Kitap Detayı & Yorum"> İncele & Yorum</button>' +
            '<button type="button" class="history-action-btn" onclick="openAddQuoteModal(\'' + safeTitle + '\')" title="Alıntı Ekle"> Alıntı Ekle</button>' +
            '<button type="button" class="history-action-btn" onclick="borrow(\'' + safeTitle + '\')" title="Tekrar Ödünç Al"> Tekrar Ödünç</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>') : '<div style="text-align:center;padding:32px 20px;color:var(--muted)"><p style="margin:0;font-size:14px;font-weight:500">Henüz tamamlanmış bir ödünç kaydınız bulunmuyor.</p></div>';

      const userQuotes = (state.quotes || []).filter(q => {
        if (!state.currentUser) return false;
        const qUserId = String(q.userId || '');
        const currentUserId = String(state.currentUser.id || '');
        const qUserName = (q.userName || '').trim().toLowerCase();
        const currentUserName = (state.currentUser.name || '').trim().toLowerCase();
        return (qUserId && currentUserId && qUserId === currentUserId) || (qUserName && currentUserName && qUserName === currentUserName);
      });

      const quotesContainer = el('profileQuotesList');
      if (quotesContainer) {
        if (userQuotes.length) {
          quotesContainer.innerHTML = '<div class="user-state.quotes-stack">' + userQuotes.map(q => {
            const bookTitle = q.bookTitle || q.book || 'Genel Edebiyat';
            const author = q.author || 'Bilinmeyen Yazar';
            const safeBook = bookTitle.replace(/'/g, "\\'");
            const safeAuthor = author.replace(/'/g, "\\'");
            const safeQuote = (q.text || '').replace(/'/g, "\\'");
            const pageStr = q.page ? (' · Sayfa ' + q.page) : '';
            const tagBadge = q.tag ? ('<span class="quote-tag-badge" style="font-size:10.5px;padding:2px 7px">#' + q.tag + '</span>') : '';
            const dateStr = q.date || '23 Ağustos 2026';

            return '<div class="user-quote-card">' +
              '<blockquote class="user-quote-text">“' + q.text + '”</blockquote>' +
              '<div class="user-quote-footer">' +
                '<div class="user-quote-source">' +
                  '<span class="user-quote-book">— ' + bookTitle + '</span>' +
                  '<span>' + author + pageStr + '</span>' +
                  tagBadge +
                  '<span style="color:var(--muted);font-size:11.5px">· Kaydedildi: ' + dateStr + '</span>' +
                '</div>' +
                '<div class="user-quote-actions">' +
                  '<button type="button" class="btn-action-secondary" style="padding:4px 10px;font-size:11px" onclick="copyQuoteText(\'' + safeQuote + '\', \'' + safeBook + '\', \'' + safeAuthor + '\')">Kopyala</button>' +
                  '<button type="button" class="btn-action-secondary" style="color:var(--danger);padding:4px 10px;font-size:11px" onclick="deleteQuote(' + q.id + ')">Sil</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>';
        } else {
          quotesContainer.innerHTML = '<div style="text-align:center;padding:36px 20px;color:var(--muted)">' +
            '<div style="font-size:32px;margin-bottom:8px">✍️</div>' +
            '<h4 style="margin:0 0 4px;font-size:15px;color:var(--ink)">Henüz alıntı kaydetmediniz.</h4>' +
            '<p style="margin:0;font-size:13px;color:var(--muted)">Okuduğun kitaplardan beğendiğin cümleleri burada saklayabilirsin.</p>' +
            '<button type="button" class="btn-action-secondary" style="margin-top:14px;font-size:12.5px;padding:7px 16px" onclick="openAddQuoteModal()">+ İlk Alıntını Ekle</button>' +
          '</div>';
        }
      }

      renderCoupons();
      renderUserBadges();
    }

    export function savePersonalProfileInfo() {
      const emailInput = el('editEmailInput');
      const phoneInput = el('editPhoneInput');

      const newEmail = emailInput ? emailInput.value.trim() : '';
      const newPhone = phoneInput ? phoneInput.value.trim() : '';

      if (newEmail && !newEmail.includes('@')) {
        return toast('Lütfen geçerli bir e-posta adresi girin.');
      }
      if (!state.currentUser) return;

      if (newEmail) state.currentUser.email = newEmail;
      if (newPhone) state.currentUser.phone = newPhone;

      if (typeof state.users !== 'undefined' && Array.isArray(state.users)) {
        const u = state.users.find(x => x.id === state.currentUser.id || (x.email && x.email.toLowerCase() === state.currentUser.email.toLowerCase()));
        if (u) {
          if (newEmail) u.email = newEmail;
          if (newPhone) u.phone = newPhone;
        }
      }

      if (typeof saveState === 'function') saveState();

      if (el('navUserName')) el('navUserName').textContent = (state.currentUser.name || 'Okur').split(' ')[0];
      if (el('navUserAvatar')) el('navUserAvatar').textContent = state.currentUser.avatar || 'OK';
      if (el('profileName')) el('profileName').textContent = state.currentUser.name || 'Okur';
      if (el('profileEmail')) el('profileEmail').textContent = state.currentUser.email || '';
      if (el('profileAvatar')) el('profileAvatar').textContent = state.currentUser.avatar || 'OK';
      if (el('userInfoName')) el('userInfoName').textContent = state.currentUser.name || 'Okur';
      if (el('userInfoAvatar')) el('userInfoAvatar').textContent = state.currentUser.avatar || 'OK';

      // Display alanlarını anında güncelle
      if (el('displayProfileName')) el('displayProfileName').textContent = state.currentUser.name || 'Okur';
      if (el('displayProfileEmail')) el('displayProfileEmail').textContent = state.currentUser.email || '';
      if (el('displayProfilePhone')) el('displayProfilePhone').textContent = state.currentUser.phone || '0532 845 19 23';

      toggleProfileEditMode(false);
      playUiSound('chime');
      toast('Kişisel bilgileriniz başarıyla güncellendi.');
    }

    export function updateUserPasswordFromProfile() {
      const curInput = el('infoCurrentPassInput');
      const newInput = el('infoNewPassInput');
      const confirmInput = el('infoNewPassConfirmInput');

      if (!curInput || !newInput || !confirmInput) return;
      const curPass = curInput.value.trim();
      const newPass = newInput.value.trim();
      const confirmPass = confirmInput.value.trim();

      if (!curPass) {
        return toast('Lütfen mevcut şifrenizi girin.');
      }
      if (state.currentUser.password && curPass !== state.currentUser.password) {
        return toast('Mevcut şifreniz hatalı. Lütfen kontrol edin.');
      }
      if (!newPass || newPass.length < 6) {
        return toast('Yeni şifre en az 6 karakter olmalıdır.');
      }
      if (newPass !== confirmPass) {
        return toast('Yeni şifreler birbiriyle eşleşmiyor.');
      }

      state.currentUser.password = newPass;
      if (typeof state.users !== 'undefined' && Array.isArray(state.users)) {
        const u = state.users.find(x => x.email && x.email.toLowerCase() === state.currentUser.email.toLowerCase());
        if (u) {
          u.password = newPass;
        }
      }
      if (typeof saveState === 'function') saveState();

      curInput.value = '';
      newInput.value = '';
      confirmInput.value = '';

      playUiSound('chime');
      toast('🔒 Şifreniz başarıyla değiştirildi ve güncellendi.');
    }

    export function triggerPasswordResetHelp() {
      playUiSound('page');
      const resetPin = 'LUMINA-' + Math.floor(1000 + Math.random() * 9000);
      toast('🔑 Güvenlik sıfırlama kodu: ' + resetPin + ' (Kayıtlı e-postanıza gönderildi).');
    }

    export function requestLoanExtension(loanId, bookTitle) {
      let l = state.loans.find(x => (loanId && String(x.id) === String(loanId)) || (bookTitle && x.title === bookTitle));
      if (!l && state.loans.length) l = state.loans[0];
      if (!l) return toast(state.english ? 'Loan record not found.' : 'Ödünç kaydı bulunamadı.');

      const isAlreadyPending = (state.pendingExtensions || []).some(x => (x.loanId && String(x.loanId) === String(l.id)) || x.bookTitle === l.title);
      if (isAlreadyPending) {
        return toast('Bu kitap için zaten onay bekleyen bir süre uzatma talebiniz var.');
      }

      state.pendingExtensions.push({
        id: Date.now(),
        loanId: l.id || Date.now(),
        bookTitle: l.title,
        userName: (state.currentUser && state.currentUser.name) || 'Okur',
        userId: (state.currentUser && state.currentUser.id) || 1,
        currentDue: l.due || '27 Ağustos 2026',
        daysRemaining: l.daysRemaining !== undefined ? l.daysRemaining : 4,
        requestedDays: 7,
        date: state.english ? 'Today' : 'Bugün'
      });

      saveState();
      renderMemberProfileData();
      if (state.currentUser && state.currentUser.role === 'Yönetici') renderAdminDashboardPending();
      updateAllRealStatistics();
      toast('"' + l.title + '" için +7 gün süre uzatma talebiniz yönetici onayına iletildi.');
    }

    export function toggleEmailNotif(enabled) {
      playUiSound('click');
      if (typeof enabled === 'boolean') {
        state.emailNotifications = enabled;
      } else {
        state.emailNotifications = state.emailNotifications === undefined ? false : !state.emailNotifications;
      }
      saveState();
      const btn = el('emailNotifBtn');
      if (btn) {
        btn.classList.toggle('active', !!state.emailNotifications);
        const label = btn.querySelector('.toggle-label') || btn;
        if (label) label.textContent = state.emailNotifications ? 'Açık' : 'Kapalı';
      }
      toast(state.emailNotifications ? '🔔 E-posta bildirimleri açıldı.' : '🔕 E-posta bildirimleri kapatıldı.');
    }
export function changeAvatar(emoji) {
  if (!state.currentUser) return;
  state.currentUser.avatar = emoji;
  saveState();
  closeModal('avatarModal');
  playUiSound('chime');
  toast('Profil fotoğrafı güncellendi.');
  renderProfilePage();
}
