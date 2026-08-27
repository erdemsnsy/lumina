import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/books
router.get('/', (req, res) => {
  const { q, genre, sort } = req.query;
  let books = [...db.get('books')];

  if (q) {
    const query = q.toLowerCase().trim();
    books = books.filter(b => 
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      (b.isbn && b.isbn.toLowerCase().includes(query)) ||
      (b.genre && b.genre.toLowerCase().includes(query))
    );
  }

  if (genre && genre !== 'ALL') {
    books = books.filter(b => b.genre && b.genre.toLowerCase() === genre.toLowerCase());
  }

  if (sort === 'title') {
    books.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  } else if (sort === 'author') {
    books.sort((a, b) => a.author.localeCompare(b.author, 'tr'));
  } else if (sort === 'year') {
    books.sort((a, b) => (b.year || 0) - (a.year || 0));
  } else if (sort === 'price-asc') {
    books.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    books.sort((a, b) => b.price - a.price);
  }

  res.json({ success: true, count: books.length, books });
});

// GET /api/books/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = db.get('books').find(b => b.id === id || b.title === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap bulunamadı.' });
  }

  const reviews = db.get('reviews').filter(r => r.bookTitle === book.title);
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 5.0;

  res.json({
    success: true,
    book: {
      ...book,
      rating: Number(avgRating),
      reviewsCount: reviews.length,
      reviews
    }
  });
});

// POST /api/books (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const { title, author, genre, isbn, stock = 5, price = 150, year = 2026, cover, summary } = req.body;

  if (!title || !author || !genre) {
    return res.status(400).json({ success: false, message: 'Kitap adı, yazar ve tür zorunludur.' });
  }

  const newBook = {
    id: Date.now(),
    title: title.trim(),
    author: author.trim(),
    genre: genre.trim(),
    isbn: isbn ? isbn.trim() : `978605${Math.floor(1000000 + Math.random() * 9000000)}`,
    stock: Number(stock) || 0,
    price: Number(price) || 150,
    year: Number(year) || 2026,
    cover: cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85',
    summary: summary || 'Lumina Kütüphane koleksiyonuna yeni katılan seçkin eser.'
  };

  db.insert('books', newBook);
  res.status(201).json({ success: true, message: 'Yeni kitap başarıyla eklendi.', book: newBook });
});

// PUT /api/books/:id (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const updated = db.update('books', b => b.id === id || b.title === req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Kitap bulunamadı.' });
  }
  res.json({ success: true, message: 'Kitap bilgileri güncellendi.', book: updated });
});

// PATCH /api/books/:id/stock (Admin only)
router.patch('/:id/stock', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { delta = 0, stock } = req.body;

  const updated = db.update('books', b => b.id === id || b.title === req.params.id, book => {
    let newStock = stock !== undefined ? Number(stock) : book.stock + Number(delta);
    return { ...book, stock: Math.max(0, newStock) };
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Kitap bulunamadı.' });
  }

  res.json({ success: true, message: 'Stok adedi güncellendi.', book: updated });
});

// DELETE /api/books/:id (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const deleted = db.delete('books', b => b.id === id || b.title === req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Kitap bulunamadı.' });
  }
  res.json({ success: true, message: 'Kitap katalogdan silindi.' });
});

export default router;
