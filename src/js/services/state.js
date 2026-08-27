import { DB_KEYS } from '../config/constants.js';
import { defaultBooks } from '../data/default-books.js';
import { defaultUsers } from '../data/default-users.js';
import { defaultLoans } from '../data/default-loans.js';
import { defaultPurchases } from '../data/default-purchases.js';
import { defaultQuotes } from '../data/default-quotes.js';
import { defaultReviews } from '../data/default-reviews.js';
import { defaultCoupons } from '../data/default-coupons.js';

function getStored(key, def) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : def;
  } catch(e) { return def; }
}

const initialBooks = getStored(DB_KEYS.BOOKS, defaultBooks);
defaultBooks.forEach(db => {
  let existing = initialBooks.find(b => b.title === db.title);
  if (!existing) {
    initialBooks.push(db);
  } else {
    existing.cover = db.cover;
  }
});

const initialUsers = getStored(DB_KEYS.USERS, defaultUsers);

export const state = {
  books: initialBooks,
  users: initialUsers,
  loans: getStored(DB_KEYS.LOANS, defaultLoans),
  purchasesHistory: getStored(DB_KEYS.PURCHASES, defaultPurchases),
  quotes: getStored(DB_KEYS.QUOTES, defaultQuotes),
  bookReviews: getStored(DB_KEYS.REVIEWS, defaultReviews),
  favorites: getStored(DB_KEYS.FAVORITES, []).filter(title => initialBooks.some(b => b.title === title)),
  availableCoupons: getStored(DB_KEYS.COUPONS, defaultCoupons),
  currentUser: getStored(DB_KEYS.USER, null),
  pendingRequests: getStored(DB_KEYS.PENDING_BORROWS, []),
  pendingExtensions: getStored(DB_KEYS.PENDING_EXTENSIONS, []),
  cart: [],
  cartAppliedCoupon: null,
  selectedReviewRating: 5,
  currentDetailBookTitle: '',
  editingReviewId: null,
  currentLoanTitle: '',
  currentPurchaseTitle: '',
  purchaseTotal: 0,
  emailNotifications: true,
  currentLang: 'tr',
  english: false
};
