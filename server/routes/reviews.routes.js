import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/reviews?bookTitle=...
router.get('/', (req, res) => {
  const { bookTitle } = req.query;
  let reviews = db.get('reviews');
  if (bookTitle) {
    reviews = reviews.filter(r => r.bookTitle === bookTitle);
  }
  res.json({ success: true, count: reviews.length, reviews });
});

// POST /api/reviews
router.post('/', requireAuth, (req, res) => {
  const { bookTitle, rating = 5, text } = req.body;

  if (!bookTitle || !text) {
    return res.status(400).json({ success: false, message: 'Kitap adı ve yorum metni zorunludur.' });
  }

  const newReview = {
    id: Date.now(),
    bookTitle: bookTitle.trim(),
    userName: req.user.name,
    userEmail: req.user.email,
    rating: Number(rating) || 5,
    text: text.trim(),
    date: new Date().toISOString().split('T')[0]
  };

  db.insert('reviews', newReview);
  res.status(201).json({ success: true, message: 'İncelemeniz yayınlandı!', review: newReview });
});

export default router;
