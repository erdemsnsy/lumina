import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/purchases
router.get('/', (req, res) => {
  const purchases = db.get('purchases');
  if (req.query.userEmail) {
    return res.json({ success: true, purchases: purchases.filter(p => p.userEmail === req.query.userEmail) });
  }
  res.json({ success: true, count: purchases.length, purchases });
});

// POST /api/purchases/checkout
router.post('/checkout', requireAuth, (req, res) => {
  const { items = [], couponCode, paymentMethod = 'Kredi / Banka Kartı', deliveryAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Satın alınacak ürün bulunamadı.' });
  }

  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const book = db.get('books').find(b => b.title === item.title);
    if (!book || book.stock < item.qty) {
      return res.status(400).json({ 
        success: false, 
        message: `'${item.title}' için yeterli stok bulunmuyor. (Mevcut Stok: ${book ? book.stock : 0})` 
      });
    }
    subtotal += book.price * (item.qty || 1);
    processedItems.push({ book, qty: item.qty || 1 });
  }

  // Coupon calculation
  let discountPct = 0;
  if (couponCode) {
    const coupon = db.get('coupons').find(c => c.code === couponCode.toUpperCase());
    if (coupon) discountPct = coupon.discountPct;
  }
  const discountAmount = (subtotal * discountPct) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const receiptNo = '#LM-' + Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toISOString().split('T')[0];

  const createdPurchases = [];

  for (const { book, qty } of processedItems) {
    const purchase = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      receiptNo,
      title: book.title,
      qty,
      author: book.author,
      user: req.user.name,
      userEmail: req.user.email,
      price: book.price * qty,
      date: dateStr,
      paymentMethod,
      deliveryAddress: deliveryAddress || 'Kadıköy, Moda Cad. No: 18 / İstanbul',
      status: 'Hazırlanıyor'
    };

    db.insert('purchases', purchase);
    createdPurchases.push(purchase);

    // Decrement stock
    db.update('books', b => b.title === book.title, b => ({ ...b, stock: Math.max(0, b.stock - qty) }));
  }

  res.status(201).json({
    success: true,
    message: 'Siparişiniz başarıyla alındı ve kütüphanenize tanımlandı!',
    receiptNo,
    total: finalTotal,
    discount: discountAmount,
    purchases: createdPurchases
  });
});

export default router;
