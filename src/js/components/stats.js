import { el } from '../utils/helpers.js';
import { state } from '../services/state.js';

export function updateAllRealStatistics() {
  const totalBooksCount = state.books.reduce((acc, b) => acc + (Number(b.stock) || 0), 0);
  const totalUniqueTitles = state.books.length;
  const activeLoansCount = state.loans.length;
  const totalReadersCount = state.users.length;
  const totalQuotesCount = state.quotes.length;
  const totalSalesCount = state.purchasesHistory.length;
  const totalSalesRevenue = state.purchasesHistory.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

  // Stats / Dashboard Counters
  if (el('statTotalBooks')) el('statTotalBooks').textContent = totalBooksCount;
  if (el('statTotalTitles')) el('statTotalTitles').textContent = totalUniqueTitles;
  if (el('statActiveLoans')) el('statActiveLoans').textContent = activeLoansCount;
  if (el('statTotalReaders')) el('statTotalReaders').textContent = totalReadersCount;
  if (el('statTotalQuotes')) el('statTotalQuotes').textContent = totalQuotesCount;
  if (el('statTotalSales')) el('statTotalSales').textContent = totalSalesCount;

  if (el('dashTotalBooks')) el('dashTotalBooks').textContent = totalUniqueTitles;
  if (el('dashTotalCopies')) el('dashTotalCopies').textContent = totalBooksCount + ' Kopya';
  if (el('dashActiveLoans')) el('dashActiveLoans').textContent = activeLoansCount;
  if (el('dashPendingCount')) el('dashPendingCount').textContent = state.pendingRequests.length + state.pendingExtensions.length;
  if (el('dashRegisteredUsers')) el('dashRegisteredUsers').textContent = totalReadersCount;
  if (el('dashTotalOrders')) el('dashTotalOrders').textContent = totalSalesCount;
  if (el('dashTotalRevenue')) el('dashTotalRevenue').textContent = totalSalesRevenue.toLocaleString('tr-TR') + ' 🪙';

  if (el('badgeActiveLoans')) el('badgeActiveLoans').textContent = activeLoansCount;
  if (el('badgePendingRequests')) el('badgePendingRequests').textContent = state.pendingRequests.length;
  if (el('badgePendingExtensions')) el('badgePendingExtensions').textContent = state.pendingExtensions.length;

  // Cart & Favorites Badges
  const totalCartCount = state.cart.reduce((a, b) => a + b.qty, 0);
  if (el('cartCountBadge')) el('cartCountBadge').textContent = totalCartCount;
  if (el('navCartBadge')) el('navCartBadge').textContent = totalCartCount;
  const validFavs = (state.favorites || []).filter(title => state.books.some(b => b.title === title));
  state.favorites = validFavs;
  if (el('favCountBadge')) el('favCountBadge').textContent = validFavs.length;
  if (el('navFavBadge')) el('navFavBadge').textContent = validFavs.length;

  // User Header Indicators
  const userAvatarPill = el('navUserAvatar');
  const userNamePill = el('navUserName');
  const userRolePill = el('navUserRole') || el('profileRoleBadge');
  const mobDockUser = el('mobDockUserLabel');
  if (userAvatarPill && userNamePill) {
    if (state.currentUser) {
      userAvatarPill.textContent = state.currentUser.avatar || 'OK';
      userNamePill.textContent = state.currentUser.name;
      if (userRolePill) userRolePill.textContent = state.currentUser.role;
      if (mobDockUser) mobDockUser.textContent = state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'Profil';
    } else {
      userAvatarPill.textContent = '✦';
      userNamePill.textContent = state.english ? 'Sign In' : 'Giriş Yap';
      if (userRolePill) userRolePill.textContent = 'Okur / Üye';
      if (mobDockUser) mobDockUser.textContent = state.english ? 'Sign In' : 'Giriş';
    }
  }
}

