import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/loans
router.get('/', (req, res) => {
  const loans = db.get('loans');
  if (req.query.userEmail) {
    return res.json({ success: true, loans: loans.filter(l => l.userEmail === req.query.userEmail) });
  }
  res.json({ success: true, count: loans.length, loans });
});

// POST /api/loans/request
router.post('/request', requireAuth, (req, res) => {
  const { bookTitle, loanDate, returnDate, reason } = req.body;

  if (!bookTitle || !loanDate || !returnDate) {
    return res.status(400).json({ success: false, message: 'Kitap adı, ödünç alma tarihi ve iade tarihi zorunludur.' });
  }

  const book = db.get('books').find(b => b.title === bookTitle);
  if (!book || book.stock <= 0) {
    return res.status(400).json({ success: false, message: 'Bu eser şu anda kütüphane raflarında tükenmiştir.' });
  }

  // Check active loan limit (Max 3 books)
  const userLoans = db.get('loans').filter(l => l.userEmail === req.user.email && l.status === 'Aktif');
  if (userLoans.length >= 3) {
    return res.status(400).json({ success: false, message: 'Aynı anda en fazla 3 aktif kitap ödünç alabilirsiniz.' });
  }

  const newLoan = {
    id: Date.now(),
    bookTitle: book.title,
    author: book.author,
    user: req.user.name,
    userEmail: req.user.email,
    date: loanDate,
    dueDate: returnDate,
    reason: reason || 'Bireysel Edebi Okuma',
    status: 'Aktif'
  };

  db.insert('loans', newLoan);

  // Decrement book stock
  db.update('books', b => b.title === bookTitle, b => ({ ...b, stock: Math.max(0, b.stock - 1) }));

  res.status(201).json({
    success: true,
    message: `'${book.title}' eseri için ödünç alma talebiniz onaylandı. Keyifli okumalar!`,
    loan: newLoan
  });
});

// POST /api/loans/:id/return
router.post('/:id/return', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const loan = db.get('loans').find(l => l.id === id);

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Ödünç kaydı bulunamadı.' });
  }

  // Restore stock
  db.update('books', b => b.title === loan.bookTitle, b => ({ ...b, stock: b.stock + 1 }));

  // Remove loan
  db.delete('loans', l => l.id === id);

  res.json({
    success: true,
    message: `'${loan.bookTitle}' başarıyla iade edildi. Teşekkür ederiz!`
  });
});

// POST /api/loans/:id/extend
router.post('/:id/extend', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const loan = db.get('loans').find(l => l.id === id);

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Ödünç kaydı bulunamadı.' });
  }

  const currentDue = new Date(loan.dueDate);
  currentDue.setDate(currentDue.getDate() + 7);
  const newDueStr = currentDue.toISOString().split('T')[0];

  const updated = db.update('loans', l => l.id === id, { dueDate: newDueStr });

  res.json({
    success: true,
    message: `Ödünç süreniz 7 gün uzatıldı. Yeni teslim tarihi: ${newDueStr}`,
    loan: updated
  });
});

export default router;
