import { el, toast, openModal, closeModal } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from '../services/state.js';
import { saveState } from '../services/storage.js';
import { navigateTo, scrollToSection } from './router.js';

export function renderMiniBadgesUnderName() {
  const activeTitle = state.currentUser ? state.currentUser.activeBadge : '';
  const containers = [el('profileMiniBadgesRow'), el('userInfoMiniBadges')];

  containers.forEach(container => {
    if (!container) return;

    if (!activeTitle) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    const allBadges = [
      { id: 'first_read', title: 'İlk Adım', desc: 'Kütüphaneden ilk eserini ödünç aldın veya satın aldın.', icon: 'basarimlar/madalya.png' },
      { id: 'bookworm', title: 'Kitap Kurdu', desc: 'Toplam 3 eser okuyarak veya satın alarak edebiyat yolculuğunu derinleştirdin.', icon: 'basarimlar/okurtaci.png' },
      { id: 'master_curator', title: 'Baş Küratör', desc: 'Okur Defteri arşivine en az bir seçkin pasaj kaydettin.', icon: 'basarimlar/parsomen.png' },
      { id: 'night_owl', title: 'Gece Kuşu', desc: '3D Hardcover kitap okuyucusunda gece temasında okuma yaptın.', icon: 'basarimlar/baykus.png' },
      { id: 'archive_guardian', title: 'Arşiv Muhafızı', desc: 'Kütüphane raflarından ödünç aldığın eserleri takip ettin.', icon: 'basarimlar/kalkan.png' },
      { id: 'star_collector', title: 'Koleksiyon Tutkunu', desc: 'Kütüphane kataloğundan beğendiğin eserleri favorilerine ekledin.', icon: 'basarimlar/yildiz.png' }
    ];

    const badge = allBadges.find(b => b.title.toLowerCase() === activeTitle.toLowerCase()) || {
      title: activeTitle,
      desc: 'Kullanıcı profil rozeti',
      icon: 'basarimlar/madalya.png'
    };

    container.style.display = 'inline-flex';
    container.innerHTML = `
      <div class="mini-badge-pill active-equipped" onclick="inspectBadge('${badge.title}', true)" style="background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.35);color:var(--ink);font-weight:700;cursor:pointer;padding:3px 10px;border-radius:999px;display:inline-flex;align-items:center;gap:6px;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.06)" title="${badge.title}: ${badge.desc}">
        <img src="${badge.icon}" alt="${badge.title}" style="width:15px;height:15px;object-fit:contain" onerror="this.src='basarimlar/madalya.png'">
        <span>${badge.title}</span>
      </div>
    `;
  });
}

export function renderCoupons() {
  const container = el('rewardsVouchersList') || el('couponsListContainer');
  if (!container) return;

  const missionCoupons = [
    {
      code: 'LUMINA15',
      title: 'İlk Adım Hoş Geldin Kuponu',
      desc: 'Kütüphanemize yeni katılan tüm okurlara özel tüm eserlerde geçerli genel indirim.',
      discount: '%15 İNDİRİM',
      badge: 'HOŞ GELDİN',
      badgeIcon: 'basarimlar/madalya.png',
      status: 'claimable',
      statusText: 'KULLANIMA HAZIR'
    },
    {
      code: 'OKUR20',
      title: 'Hevesli Okur Özel Kuponu',
      desc: 'Okur defterine 1 alıntı ekleyen veya 2 eser inceleyen kıymetli edebiyatseverlere armağan.',
      discount: '%20 İNDİRİM',
      badge: 'GÖREV ÖDÜLÜ',
      badgeIcon: 'basarimlar/parsomen.png',
      status: 'claimable',
      statusText: 'KULLANIMA HAZIR'
    },
    {
      code: 'ILKOKUMA10',
      title: 'Gece Okuması Teşvik Kuponu',
      desc: '3D Hardcover tadımlık kitap okuyucumuzu deneyimleyen tüm gece okurlarına özel.',
      discount: '%10 İNDİRİM',
      badge: 'ETKİNLİK',
      badgeIcon: 'basarimlar/baykus.png',
      status: 'claimable',
      statusText: 'KULLANIMA HAZIR'
    },
    {
      code: 'EDEBİYAT25',
      title: 'Büyük Kütüphane Festival Kuponu',
      desc: 'Koleksiyonundaki tüm basılı ve dijital siparişlerde tek seferlik dev indirim.',
      discount: '%25 İNDİRİM',
      badge: 'PRESTİJ',
      badgeIcon: 'basarimlar/kuponbileti.png',
      status: 'claimable',
      statusText: 'KULLANIMA HAZIR'
    }
  ];

  container.innerHTML = missionCoupons.map(coupon => {
    return `
      <div class="ticket-voucher-card">
        <!-- Left Icon Column -->
        <div class="ticket-left-col">
          <div class="ticket-icon">
            <img src="${coupon.badgeIcon}" alt="${coupon.badge}" class="ticket-custom-badge-img" onerror="this.src='basarimlar/kuponbileti.png'">
          </div>
          <span class="ticket-badge-tag">${coupon.badge}</span>
        </div>

        <!-- Middle Details Column -->
        <div class="ticket-mid-col">
          <h4>${coupon.title}</h4>
          <p>${coupon.desc}</p>
          <div class="ticket-pill-box">
            <span class="ticket-mini-pill">Kupon Kodu: <strong style="font-family:'DM Mono',monospace;color:var(--gold)">${coupon.code}</strong></span>
            <span class="ticket-mini-pill" style="color:var(--bordeaux);font-weight:700">${coupon.discount}</span>
          </div>
        </div>

        
        <!-- Right Action Column -->
        <div class="ticket-right-col" style="display:flex;flex-direction:column;gap:8px;align-items:stretch;min-width:130px">
          <button type="button" class="ticket-action-btn" onclick="copyCoupon('${coupon.code}')" style="margin:0;width:100%;height:38px;padding:0 14px;font-size:12px;display:flex;align-items:center;justify-content:center">Kodu Kopyala</button>
          <button type="button" class="ticket-action-btn" onclick="claimCoupon('${coupon.code}')" style="margin:0;width:100%;height:38px;padding:0 14px;font-size:12px;background:var(--bg-subtle);color:var(--ink);display:flex;align-items:center;justify-content:center">Şimdi Kullan</button>
        </div>

      </div>
    `;
  }).join('');
}

export function copyCoupon(code) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      playUiSound('tink');
      toast(`'${code}' kupon kodu kopyalandı!`);
    }).catch(() => {
      playUiSound('tink');
      toast(`'${code}' kupon kodu: ${code}`);
    });
  } else {
    playUiSound('tink');
    toast(`'${code}' kupon kodu: ${code}`);
  }
}

export function claimCoupon(code) {
  copyCoupon(code);
  setTimeout(() => {
    navigateTo('home');
    scrollToSection('katalog');
    toast(`'${code}' kuponu kopyalandı. Dilediğiniz kitabı seçip indirimle satın alabilirsiniz!`);
  }, 250);
}

export function renderUserBadges() {
  const container = el('userBadgesGrid') || el('userBadgesContainer');
  if (!container) return;

  const totalLoansCount = (state.loans ? state.loans.length : 0);
  const totalPurchasesCount = (state.purchasesHistory ? state.purchasesHistory.length : 0);
  const totalActions = totalLoansCount + totalPurchasesCount;
  const userQuotesCount = state.quotes.filter(q => q.userId === (state.currentUser ? state.currentUser.id : 0)).length;
  const favsCount = (state.favorites || []).length;

  const badges = [
    {
      id: 'first_read',
      title: 'İlk Adım',
      desc: 'Kütüphaneden ilk eserini ödünç aldın veya satın aldın.',
      icon: 'basarimlar/madalya.png',
      unlocked: totalActions >= 1
    },
    {
      id: 'bookworm',
      title: 'Kitap Kurdu',
      desc: 'Toplam 3 eser okuyarak veya satın alarak edebiyat yolculuğunu derinleştirdin.',
      icon: 'basarimlar/okurtaci.png',
      unlocked: totalActions >= 3
    },
    {
      id: 'master_curator',
      title: 'Baş Küratör',
      desc: 'Okur Defteri arşivine en az bir seçkin pasaj kaydettin.',
      icon: 'basarimlar/parsomen.png',
      unlocked: userQuotesCount >= 1
    },
    {
      id: 'night_owl',
      title: 'Gece Kuşu',
      desc: '3D Hardcover kitap okuyucusunda gece temasında okuma yaptın.',
      icon: 'basarimlar/baykus.png',
      unlocked: true
    },
    {
      id: 'archive_guardian',
      title: 'Arşiv Muhafızı',
      desc: 'Kütüphane raflarından ödünç aldığın eserleri takip ettin.',
      icon: 'basarimlar/kalkan.png',
      unlocked: totalLoansCount >= 1
    },
    {
      id: 'star_collector',
      title: 'Koleksiyon Tutkunu',
      desc: 'Kütüphane kataloğundan beğendiğin eserleri favorilerine ekledin.',
      icon: 'basarimlar/yildiz.png',
      unlocked: favsCount >= 1
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const counterEl = el('badgesUnlockedCounter');
  if (counterEl) {
    counterEl.textContent = `${unlockedCount} / ${badges.length} Kazanıldı`;
  }

  container.innerHTML = badges.map(b => {
    return `
      <div class="ticket-voucher-card" style="opacity:${b.unlocked ? '1' : '0.7'};background:${b.unlocked ? '#ffffff' : 'rgba(244,246,242,0.6)'}">
        <!-- Left Icon Column -->
        <div class="ticket-left-col">
          <div class="ticket-icon" style="background:transparent">
            <img src="${b.icon}" alt="${b.title}" class="ticket-custom-badge-img" onerror="this.src='basarimlar/madalya.png'">
          </div>
          <span class="ticket-badge-tag ${b.unlocked ? 'unlocked-tag' : 'locked-tag'}">${b.unlocked ? '✓ AÇILDI' : '🔒 KİLİTLİ'}</span>
        </div>

        <!-- Middle Details Column -->
        <div class="ticket-mid-col">
          <h4>${b.title}</h4>
          <p>${b.desc}</p>
          <div class="ticket-pill-box" style="${b.unlocked ? 'background:#edf7ed;border-color:#c3e6cb;color:#1e7e34' : 'background:#f8faf9;border-color:#e2e8e5;color:#6b7d75'}">
            <span class="ticket-mini-pill" style="color:inherit;font-weight:700">
              ${b.unlocked ? '🏅 Prestij Rozeti Aktif' : '🎯 Görevi Tamamla'}
            </span>
          </div>
        </div>

        <!-- Right Action Column -->
        <div class="ticket-right-col">
          <button type="button" class="ticket-action-btn" onclick="inspectBadge('${b.title}', ${b.unlocked})">Rozeti İncele</button>
        </div>
      </div>
    `;
  }).join('');
}

let currentInspectedBadge = null;

export function equipBadge(badgeTitle) {
  if (!state.currentUser) return;
  state.currentUser.activeBadge = badgeTitle;
  saveState();
  playUiSound('chime');
  toast(`'${badgeTitle}' rozeti profilinizde başarıyla kuşanıldı!`);
  if (typeof window.renderProfilePage === 'function') window.renderProfilePage();
  if (typeof window.renderMemberProfileData === 'function') window.renderMemberProfileData();
  renderUserBadges();
  renderMiniBadgesUnderName();
}

export function unequipBadge(badgeTitle) {
  if (!state.currentUser) return;
  state.currentUser.activeBadge = '';
  saveState();
  playUiSound('chime');
  toast('Rozet profilden çıkarıldı.');
  if (typeof window.renderProfilePage === 'function') window.renderProfilePage();
  if (typeof window.renderMemberProfileData === 'function') window.renderMemberProfileData();
  renderUserBadges();
  renderMiniBadgesUnderName();
}

export function equipCurrentBadgeFromModal() {
  if (!currentInspectedBadge) return;
  const isEquipped = state.currentUser && state.currentUser.activeBadge === currentInspectedBadge.title;
  if (isEquipped) {
    unequipBadge(currentInspectedBadge.title);
  } else {
    equipBadge(currentInspectedBadge.title);
  }
  closeModal('badgeDetailModal');
}

export function inspectBadge(title, isUnlocked) {
  playUiSound('tink');
  const allBadges = [
    { id: 'first_read', title: 'İlk Adım', desc: 'Kütüphaneden ilk eserini ödünç aldın veya satın aldın.', icon: 'basarimlar/madalya.png', reward: 'Profilde Başlangıç Okuru unvanı ve madalya ışıltısı.' },
    { id: 'bookworm', title: 'Kitap Kurdu', desc: 'Toplam 3 eser okuyarak veya satın alarak edebiyat yolculuğunu derinleştirdin.', icon: 'basarimlar/okurtaci.png', reward: 'Altın Kitap Kurdu Tacı & %15 sadakat indirimi avantajı.' },
    { id: 'master_curator', title: 'Baş Küratör', desc: 'Okur Defteri arşivine en az bir seçkin pasaj kaydettin.', icon: 'basarimlar/parsomen.png', reward: 'Alıntı yazarı rozeti ve topluluk önceliği.' },
    { id: 'night_owl', title: 'Gece Kuşu', desc: '3D Hardcover kitap okuyucusunda gece temasında okuma yaptın.', icon: 'basarimlar/baykus.png', reward: 'Gece Kuşu amblemi ve özel karanlık mod okur kartı.' },
    { id: 'archive_guardian', title: 'Arşiv Muhafızı', desc: 'Kütüphane raflarından ödünç aldığın eserleri takip ettin veya süresini uzattın.', icon: 'basarimlar/kalkan.png', reward: 'Arşiv Muhafızı kalkanı ve öncelikli rezervasyon hakkı.' },
    { id: 'star_collector', title: 'Koleksiyon Tutkunu', desc: 'Kütüphane kataloğundan beğendiğin eserleri favorilerine ekledin.', icon: 'basarimlar/yildiz.png', reward: 'Yıldızlı Koleksiyoner arması ve yeni çıkan eser bildirimleri.' }
  ];

  const found = allBadges.find(b => b.title.toLowerCase() === (title || '').toLowerCase()) || {
    title: title || 'Lumina Okur Rozeti',
    desc: 'Lumina kütüphane ekosistemindeki okuma ve keşif başarılarınızı simgeler.',
    icon: 'basarimlar/madalya.png',
    reward: 'Profilinde isminin yanında özel altın madalya olarak sergilenir.'
  };

  currentInspectedBadge = found;

  const iconEl = el('badgeModalIcon');
  if (iconEl) iconEl.src = found.icon;

  const titleEl = el('badgeModalTitle');
  if (titleEl) titleEl.textContent = found.title;

  const descEl = el('badgeModalDesc');
  if (descEl) descEl.textContent = found.desc;

  const rewardEl = el('badgeModalReward');
  if (rewardEl) rewardEl.textContent = found.reward;

  const statusBadge = el('badgeModalStatusBadge');
  const equipBtn = el('badgeModalEquipBtn');

  const isEquipped = state.currentUser && state.currentUser.activeBadge === found.title;

  if (statusBadge) {
    if (isUnlocked) {
      statusBadge.textContent = isEquipped ? 'AKTİF KUŞANILDI' : '✓ KAZANILDI';
      statusBadge.style.background = '#e8f5e9';
      statusBadge.style.color = '#267332';
    } else {
      statusBadge.textContent = '🔒 HENÜZ KİLİTLİ';
      statusBadge.style.background = '#ffebee';
      statusBadge.style.color = '#c93424';
    }
  }

  if (equipBtn) {
    if (isUnlocked) {
      equipBtn.style.display = 'inline-block';
      equipBtn.textContent = isEquipped ? 'Rozeti Çıkar' : 'Profilimde Kuşan';
      equipBtn.className = isEquipped ? 'btn-action-secondary' : 'btn-action-primary';
    } else {
      equipBtn.style.display = 'none';
    }
  }

  openModal('badgeDetailModal');
}

