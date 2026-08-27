import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'lumina_editorial_secret_key_2026_jwt_token';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = db.get('users');
    const user = users.find(u => u.id === decoded.id || u.email === decoded.email);
    if (user) {
      const { passwordHash, ...safeUser } = user;
      req.user = safeUser;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Bu işlem için lütfen oturum açınız.' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Yönetici') {
    return res.status(403).json({ success: false, message: 'Bu eylem yalnızca Yönetici (Admin) yetkisi gerektirir.' });
  }
  next();
}
