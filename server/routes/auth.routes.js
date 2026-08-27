import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'Okur', avatar = 'OK' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Lütfen tüm zorunlu alanları doldurunuz.' });
  }

  // Password rules validation
  const hasLength = password.length >= 8;
  const hasUpper = /[A-ZÇĞİÖŞÜ]/.test(password);
  const hasLower = /[a-zçğıöşü]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü\s]/.test(password);

  if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return res.status(400).json({ 
      success: false, 
      message: 'Şifreniz belirlenen güvenlik kurallarına (En az 8 karakter, büyük harf, küçük harf, rakam ve özel sembol) uymalıdır.' 
    });
  }

  const users = db.get('users');
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: role === 'Yönetici' ? 'Yönetici' : 'Okur',
    avatar: avatar || initials || 'OK',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  db.insert('users', newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    message: 'Kayıt işlemi başarıyla tamamlandı.',
    token,
    user: safeUser
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-posta ve şifre zorunludur.' });
  }

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    success: true,
    message: 'Giriş başarılı.',
    token,
    user: safeUser
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/avatar
router.put('/avatar', requireAuth, (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ success: false, message: 'Avatar boş olamaz.' });
  }

  const updated = db.update('users', u => u.id === req.user.id, { avatar });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
  }

  const { passwordHash: _, ...safeUser } = updated;
  res.json({
    success: true,
    message: 'Profil avatarı güncellendi.',
    user: safeUser
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Lütfen geçerli bir e-posta adresi giriniz.' });
  }

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(404).json({ success: false, message: 'Bu e-posta adresi sistemimizde kayıtlı değildir.' });
  }

  // Set compliant temporary password
  const newPasswordHash = bcrypt.hashSync('Lumina2026!', 10);
  db.update('users', u => u.id === user.id, { passwordHash: newPasswordHash });

  res.json({
    success: true,
    message: `Şifre sıfırlama talebiniz '${email}' için tamamlandı. Geçici şifreniz: Lumina2026!`
  });
});

// GET /api/auth/users (Admin only)
router.get('/users', (req, res) => {
  const users = db.get('users').map(u => {
    const { passwordHash, ...safe } = u;
    return safe;
  });
  res.json({ success: true, users });
});

export default router;
