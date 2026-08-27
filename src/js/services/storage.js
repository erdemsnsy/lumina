import { DB_KEYS } from '../config/constants.js';
import { state } from './state.js';
import { defaultBooks } from '../data/default-books.js';
import { defaultUsers } from '../data/default-users.js';
import { defaultLoans } from '../data/default-loans.js';
import { defaultPurchases } from '../data/default-purchases.js';
import { defaultQuotes } from '../data/default-quotes.js';
import { defaultReviews } from '../data/default-reviews.js';
import { defaultCoupons } from '../data/default-coupons.js';
import { toast } from '../utils/helpers.js';
import { updateAllRealStatistics } from '../components/stats.js';

export function getStored(key, def) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : def;
  } catch(e) { return def; }
}

export function setStored(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

export function saveState() {
  try {
    setStored(DB_KEYS.BOOKS, state.books);
    setStored(DB_KEYS.USERS, state.users);
    setStored(DB_KEYS.LOANS, state.loans);
    setStored(DB_KEYS.PURCHASES, state.purchasesHistory);
    setStored(DB_KEYS.QUOTES, state.quotes);
    setStored(DB_KEYS.REVIEWS, state.bookReviews);
    setStored(DB_KEYS.FAVORITES, state.favorites);
    setStored(DB_KEYS.COUPONS, state.availableCoupons);
    setStored(DB_KEYS.USER, state.currentUser);
    setStored(DB_KEYS.PENDING_BORROWS, state.pendingRequests);
    setStored(DB_KEYS.PENDING_EXTENSIONS, state.pendingExtensions);
    updateAllRealStatistics();
  } catch(e) {
    console.error('saveState error:', e);
  }
}

export function exportDatabaseJson() {
  const dbDump = {
    exportedAt: new Date().toISOString(),
    version: '2.0-Lumina-Luxury',
    books: state.books,
    users: state.users,
    loans: state.loans,
    purchases: state.purchasesHistory,
    quotes: state.quotes,
    reviews: state.bookReviews,
    coupons: state.availableCoupons
  };
  const jsonStr = JSON.stringify(dbDump, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = `Lumina_Kutuphane_Yedek_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
  toast('Veritabanı JSON yedeği başarıyla indirildi!');
}

export function resetDemoData() {
  if (!confirm('Tüm kütüphane veritabanı orijinal demo durumuna sıfırlanacak. Emin misiniz?')) return;
  localStorage.clear();
  state.books = [...defaultBooks];
  state.users = [...defaultUsers];
  state.loans = [...defaultLoans];
  state.purchasesHistory = [...defaultPurchases];
  state.quotes = [...defaultQuotes];
  state.bookReviews = [...defaultReviews];
  state.favorites = ['Sessizliğin Atlası'];
  state.availableCoupons = [...defaultCoupons];
  state.currentUser = state.users[0];
  state.pendingRequests = [];
  state.pendingExtensions = [];
  saveState();
  location.reload();
}
