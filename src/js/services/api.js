import { state } from './state.js';
import { saveState } from './storage.js';

const API_BASE = '/api';
const TOKEN_KEY = 'lumina_auth_token';

export const api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn(`[API Fallback] Network request failed for ${endpoint}:`, err.message);
      return { ok: false, status: 0, error: err.message, isOffline: true };
    }
  },

  // Auth Endpoints
  async register(name, email, password, role = 'Okur') {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    if (res.ok && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  },

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.ok && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async updateAvatar(avatar) {
    return this.request('/auth/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar })
    });
  },

  // Books
  async getBooks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/books${query ? '?' + query : ''}`);
  },

  async getBookDetails(idOrTitle) {
    return this.request(`/books/${encodeURIComponent(idOrTitle)}`);
  },

  async addBook(bookData) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  },

  async updateBook(id, bookData) {
    return this.request(`/books/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
  },

  async updateStock(id, delta) {
    return this.request(`/books/${encodeURIComponent(id)}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta })
    });
  },

  async deleteBook(id) {
    return this.request(`/books/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Loans
  async getLoans(userEmail) {
    return this.request(`/loans${userEmail ? '?userEmail=' + encodeURIComponent(userEmail) : ''}`);
  },

  async requestLoan(bookTitle, loanDate, returnDate, reason) {
    return this.request('/loans/request', {
      method: 'POST',
      body: JSON.stringify({ bookTitle, loanDate, returnDate, reason })
    });
  },

  async returnLoan(loanId) {
    return this.request(`/loans/${encodeURIComponent(loanId)}/return`, {
      method: 'POST'
    });
  },

  async extendLoan(loanId) {
    return this.request(`/loans/${encodeURIComponent(loanId)}/extend`, {
      method: 'POST'
    });
  },

  // Purchases & Cart
  async checkout(items, couponCode, paymentMethod, deliveryAddress) {
    return this.request('/purchases/checkout', {
      method: 'POST',
      body: JSON.stringify({ items, couponCode, paymentMethod, deliveryAddress })
    });
  },

  async getPurchases(userEmail) {
    return this.request(`/purchases${userEmail ? '?userEmail=' + encodeURIComponent(userEmail) : ''}`);
  },

  // Quotes
  async getQuotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/quotes${query ? '?' + query : ''}`);
  },

  async addQuote(quoteData) {
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    });
  },

  async toggleLikeQuote(quoteId, userEmail) {
    return this.request(`/quotes/${encodeURIComponent(quoteId)}/like`, {
      method: 'POST',
      body: JSON.stringify({ userEmail })
    });
  },

  async deleteQuote(quoteId) {
    return this.request(`/quotes/${encodeURIComponent(quoteId)}`, {
      method: 'DELETE'
    });
  },

  // Reviews
  async getReviews(bookTitle) {
    return this.request(`/reviews${bookTitle ? '?bookTitle=' + encodeURIComponent(bookTitle) : ''}`);
  },

  async addReview(bookTitle, rating, text) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookTitle, rating, text })
    });
  },

  // Stats
  async getStats() {
    return this.request('/stats');
  }
};
