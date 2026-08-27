import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/stats
router.get('/', (req, res) => {
  const books = db.get('books');
  const loans = db.get('loans');
  const purchases = db.get('purchases');
  const users = db.get('users');
  const quotes = db.get('quotes');

  const totalCopies = books.reduce((a, b) => a + (Number(b.stock) || 0), 0);
  const totalRevenue = purchases.reduce((a, p) => a + (Number(p.price) || 0), 0);

  res.json({
    success: true,
    stats: {
      totalTitles: books.length,
      totalCopies,
      activeLoans: loans.filter(l => l.status === 'Aktif').length,
      totalSales: purchases.length,
      totalRevenue,
      registeredUsers: users.length,
      totalQuotes: quotes.length
    }
  });
});

// GET /api/coupons
router.get('/coupons', (req, res) => {
  const coupons = db.get('coupons');
  res.json({ success: true, coupons });
});

export default router;
