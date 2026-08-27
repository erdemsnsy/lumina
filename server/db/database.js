import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'lumina-data.json');

// Default Seed Data
const initialSeed = {
  books: [
    { 
      id: 1, 
      title: 'Yarın, Bir Başka Yarın', 
      author: 'Deniz Akın', 
      genre: 'Bilim Kurgu', 
      isbn: '9786051234001', 
      stock: 7, 
      price: 245, 
      year: 2025,
      cover: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=85',
      summary: 'Geleceğin dünyasında insan bilincinin ve teknolojinin kesiştiği noktaları irdeleyen çarpıcı bir eser.'
    },
    { 
      id: 2, 
      title: 'Sessizliğin Atlası', 
      author: 'Elif Demir', 
      genre: 'Felsefe', 
      isbn: '9786051234002', 
      stock: 12, 
      price: 210, 
      year: 2024,
      cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=85',
      summary: 'Düşüncenin derin kıyılarında zihnin sınırlarını zorlayan, varoluş ve bilgelik üzerine zamansız bir başyapıt.'
    },
    { 
      id: 3, 
      title: 'İki Durak Arası', 
      author: 'Aylin Kaya', 
      genre: 'Roman', 
      isbn: '9786051234003', 
      stock: 18, 
      price: 185, 
      year: 2024,
      cover: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=85',
      summary: 'İnsan ruhunun karmaşık labirentlerinde duygusal ve edebi derinliğiyle iz bırakan sürükleyici bir kurgu.'
    },
    { 
      id: 4, 
      title: 'Kayıp Zamanın Kıyısı', 
      author: 'Mert Acar', 
      genre: 'Roman', 
      isbn: '9786051234004', 
      stock: 5, 
      price: 195, 
      year: 2023,
      cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=85',
      summary: 'Geçmişin izlerini arayan bir yazarın hatıralarla dolu unutulmaz serüveni.'
    },
    { 
      id: 5, 
      title: 'Gökyüzü Çizgisi', 
      author: 'Caner Kurt', 
      genre: 'Bilim Kurgu', 
      isbn: '9786051234005', 
      stock: 0, 
      price: 260, 
      year: 2025,
      cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=85',
      summary: 'Yıldızlararası yolculuğun felsefi ve insanı boyutlarını keşfeden destansı bir uzay operası.'
    },
    { 
      id: 6, 
      title: 'Rüzgârın Hatırlattıkları', 
      author: 'Zeynep Gül', 
      genre: 'Sanat', 
      isbn: '9786051234006', 
      stock: 9, 
      price: 220, 
      year: 2024,
      cover: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85',
      summary: 'Görsel sanatların ve estetik yaratımın büyüleyici dünyasına kapı aralayan özel bir seçki.'
    },
    { 
      id: 7, 
      title: 'Zamanın Aynasında Şehir', 
      author: 'Kerem Işık', 
      genre: 'Tarih', 
      isbn: '9786051234007', 
      stock: 4, 
      price: 230, 
      year: 2023,
      cover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=85',
      summary: 'Kadim şehirlerin mimari ve kültürel serüvenini anlatan zengin bir tarih araştırması.'
    },
    { 
      id: 8, 
      title: 'Düşüncenin Yankısı', 
      author: 'Selin Yıldız', 
      genre: 'Felsefe', 
      isbn: '9786051234008', 
      stock: 6, 
      price: 215, 
      year: 2025,
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=85',
      summary: 'Zihin, etik ve insan doğası üzerine derin sorgulamalar içeren çağdaş bir deneme.'
    }
  ],
  users: [
    {
      id: 1,
      name: 'Yönetici (Admin)',
      email: 'admin@lumina.lib',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'Yönetici',
      avatar: '👑',
      joinedDate: '2026-01-01'
    }
  ],
  loans: [],
  purchases: [],
  quotes: [
    { 
      id: 1, 
      text: 'Zaman, sayfaların arasında donup kalmış bir ışıktır; onu yalnızca okuyan gözler uyandırabilir.', 
      bookTitle: 'Sessizliğin Atlası', 
      author: 'Elif Demir', 
      page: 42, 
      tag: 'Felsefe', 
      user: 'Lumina Arşivi', 
      userEmail: 'arsiv@lumina.lib',
      userId: 'system_archive',
      date: '2026-08-20', 
      likes: 12, 
      isPublic: true,
      likedBy: [] 
    },
    { 
      id: 2, 
      text: 'Gelecek, henüz yazılmamış bir cümlenin boşluğunda saklıdır.', 
      bookTitle: 'Yarın, Bir Başka Yarın', 
      author: 'Deniz Akın', 
      page: 108, 
      tag: 'Bilim Kurgu', 
      user: 'Lumina Arşivi', 
      date: '2026-08-22', 
      likes: 7, 
      isPublic: true,
      likedBy: [] 
    },
    { 
      id: 3, 
      text: 'Her şehir bir kitaptır; sokakları satırlar, binaları ise noktalama işaretleridir.', 
      bookTitle: 'Zamanın Aynasında Şehir', 
      author: 'Kerem Işık', 
      page: 75, 
      tag: 'Tarih', 
      user: 'Lumina Arşivi', 
      date: '2026-08-23', 
      likes: 15, 
      isPublic: true,
      likedBy: [] 
    }
  ],
  reviews: [
    {
      id: 1,
      bookTitle: 'Sessizliğin Atlası',
      userName: 'Erdem Şensoy',
      rating: 5,
      text: 'Zihni dinlendiren ve derin düşüncelere sevk eden muhteşem bir anlatım. Her kütüphanede bulunmalı.',
      date: '2026-08-21'
    },
    {
      id: 2,
      bookTitle: 'Yarın, Bir Başka Yarın',
      userName: 'Selin Yıldız',
      rating: 5,
      text: 'Bilim kurgu ve felsefenin kusursuz birleşimi. Son bölümü soluksuz okudum.',
      date: '2026-08-23'
    }
  ],
  coupons: [
    { id: 1, code: 'OKUR20', discountPct: 20, desc: '%20 Okur İndirimi' },
    { id: 2, code: 'ILKOKUMA10', discountPct: 10, desc: '%10 Hoşgeldin İndirimi' },
    { id: 3, code: 'EDEBİYAT25', discountPct: 25, desc: '%25 Edebiyat Festivali İndirimi' }
  ],
  favorites: [
    { userEmail: 'erdem@lumina.lib', bookTitle: 'Sessizliğin Atlası' }
  ],
  pendingBorrows: [],
  pendingExtensions: []
};

class Database {
  constructor() {
    this.data = {};
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = { ...initialSeed };
        this.save();
      }
    } catch (err) {
      console.error('Database initialization error:', err);
      this.data = { ...initialSeed };
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  get(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  }

  set(collection, items) {
    this.data[collection] = items;
    this.save();
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    if (!item.id) {
      item.id = Date.now();
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, predicate, updater) {
    const list = this.get(collection);
    const index = list.findIndex(predicate);
    if (index !== -1) {
      list[index] = typeof updater === 'function' ? updater(list[index]) : { ...list[index], ...updater };
      this.save();
      return list[index];
    }
    return null;
  }

  delete(collection, predicate) {
    const list = this.get(collection);
    const filtered = list.filter(item => !predicate(item));
    const deletedCount = list.length - filtered.length;
    this.data[collection] = filtered;
    this.save();
    return deletedCount > 0;
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialSeed));
    this.save();
  }
}

export const db = new Database();
