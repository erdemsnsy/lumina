import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/quotes
router.get('/', (req, res) => {
  const { tag, search, scope, userEmail } = req.query;
  let quotes = [...db.get('quotes')];

  if (search) {
    const q = search.toLowerCase().trim();
    quotes = quotes.filter(item => 
      item.text.toLowerCase().includes(q) || 
      item.bookTitle.toLowerCase().includes(q) ||
      (item.author && item.author.toLowerCase().includes(q))
    );
  }

  if (tag) {
    quotes = quotes.filter(item => item.tag && item.tag.toLowerCase() === tag.toLowerCase());
  }

  if (scope === 'public') {
    quotes = quotes.filter(item => item.isPublic);
  } else if (scope === 'mine' && userEmail) {
    quotes = quotes.filter(item => item.userEmail === userEmail || item.user === userEmail);
  }

  res.json({ success: true, count: quotes.length, quotes });
});

// POST /api/quotes
router.post('/', requireAuth, (req, res) => {
  const { text, bookTitle, author, page, tag = 'Edebiyat', isPublic = true } = req.body;

  if (!text || !bookTitle) {
    return res.status(400).json({ success: false, message: 'Alıntı metni ve kitap adı zorunludur.' });
  }

  const newQuote = {
    id: Date.now(),
    text: text.trim(),
    bookTitle: bookTitle.trim(),
    author: author ? author.trim() : 'Lumina Arşivi',
    page: page ? Number(page) : null,
    tag: tag || 'Edebiyat',
    user: req.user.name,
    userEmail: req.user.email,
    date: new Date().toISOString().split('T')[0],
    likes: 0,
    isPublic: Boolean(isPublic),
    likedBy: []
  };

  db.insert('quotes', newQuote);
  res.status(201).json({ success: true, message: 'Alıntı başarıyla deftere kaydedildi.', quote: newQuote });
});

// POST /api/quotes/:id/like
router.post('/:id/like', (req, res) => {
  const id = Number(req.params.id);
  const userIdentifier = req.user ? req.user.email : (req.body.userEmail || req.ip || 'guest');

  let isLikedNow = false;

  const updated = db.update('quotes', q => q.id === id, quote => {
    const likedBy = quote.likedBy || [];
    const index = likedBy.indexOf(userIdentifier);

    if (index !== -1) {
      // Unlike
      likedBy.splice(index, 1);
      isLikedNow = false;
      return { ...quote, likes: Math.max(0, quote.likes - 1), likedBy };
    } else {
      // Like
      likedBy.push(userIdentifier);
      isLikedNow = true;
      return { ...quote, likes: quote.likes + 1, likedBy };
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Alıntı bulunamadı.' });
  }

  res.json({
    success: true,
    isLiked: isLikedNow,
    likes: updated.likes,
    quote: updated
  });
});

// DELETE /api/quotes/:id
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const quotes = db.get('quotes');
  const quote = quotes.find(q => q.id === id);

  if (!quote) {
    return res.status(404).json({ success: false, message: 'Alıntı bulunamadı.' });
  }

  // Allow deletion if owner or admin
  if (req.user.role !== 'Yönetici' && quote.userEmail && quote.userEmail !== req.user.email) {
    return res.status(403).json({ success: false, message: 'Yalnızca kendi eklediğiniz alıntıları silebilirsiniz.' });
  }

  db.delete('quotes', q => q.id === id);
  res.json({ success: true, message: 'Alıntı silindi.' });
});

export default router;
