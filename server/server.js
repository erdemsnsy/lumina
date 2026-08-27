import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { authenticate } from './middleware/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import loansRoutes from './routes/loans.routes.js';
import purchasesRoutes from './routes/purchases.routes.js';
import quotesRoutes from './routes/quotes.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import statsRoutes from './routes/stats.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5173;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticate);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lumina Library Backend API is running.', timestamp: new Date().toISOString() });
});

// Serve Static Frontend Files
app.use(express.static(rootDir, {
  extensions: ['html', 'htm']
}));

// SPA Fallback to index.html for unknown routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Endpoint bulunamadı.' });
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.', error: err.message });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`📖 Lumina Library Full-Stack Server Running!`);
    console.log(`🌐 Application URL : http://localhost:${PORT}`);
    console.log(`⚡ REST API URL    : http://localhost:${PORT}/api`);
    console.log(`======================================================\n`);
  });
}

export default app;
