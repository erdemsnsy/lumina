# 📖 Lumina — Luxury Editorial Digital Library & Bookstore

<p align="center">
  <img src="https://images.unsplash.com/photo-1507842229452-9533f009efb4?auto=format&fit=crop&w=1200&q=85" alt="Lumina Banner" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <b>Lumina</b>, modern web teknolojileri ve lüks editoryal tipografi (Fraunces & Plus Jakarta Sans) ile tasarlanmış, tam teşekküllü bir dijital kütüphane, e-ticaret ve edebiyat topluluğu platformudur.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/CSS3-Vanilla_Luxury-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## ✨ Öne Çıkan Özellikler (Key Features)

### 📚 1. Editoryal Kitap Kataloğu & 3D Sert Kapak Deneyimi
- Klasik yayınevi zarafetinde dinamik kitap kartları, sırt ışıklandırmalı 3D ciltli kapak gölgelendirmeleri.
- Tür bazlı filtreleme (*Felsefe, Bilim Kurgu, Roman, Sanat, Tarih*), anlık arama ve sıralama seçenekleri.
- **Akıllı Favori Sistemi:** Kalp simgesiyle listeye ekleme ve dinamik sayaç rozeti.

### 🛒 2. Lumina Kasa — Gelişmiş Sepet & Satın Alma Akışı
- Çoklu kitap ekleme, sepet içi adet artırma/azaltma (`− 1 +`).
- **Özel İndirim Kuponu Biletleri:** Nostaljik delikli kupon tasarımıyla anlık bakiye düşümü (`OKUR20`, `ILKOKUMA10`).
- Kredi kartı, banka havalesi ve dijital cüzdan seçenekleri ile anında dijital makbuz (`#LM-XXXX`) üretimi.

### ⏳ 3. 14 Günlük Akıllı Ödünç Alma Protokolü
- Tarih seçici, hızlı gün ekleme kapsülleri (`+7 Gün`, `+14 Gün`, `+21 Gün`) ve edebi gerekçe etiketleri.
- Otomatik stok düşümü, iade tarihi takibi ve tek tıkla süre uzatma / iade etme desteği.

### ✍️ 4. Okur Defteri — Alıntı & Topluluk Duvarı
- Kitaplardan ilham veren pasajları kaydetme, panoya tek tıkla editoryal biçimde kopyalama.
- **Tekil Beğeni Mekanizması:** Her alıntıyı sadece bir kez beğenebilme ve tekrar basıldığında beğeniyi geri çekebilme.

### 🎧 5. İnteraktif Ambiyans & Ses Tasarımı
- Sayfa çevirme, mühür basma, madeni para şıngırtısı ve ahşap kütüphane tıkırtısı ses efektleri.
- Yağmur sesi, şömine çıtırtısı ve kütüphane uğultusu ile odaklanmış okuma odası deneyimi.

### 👑 6. Yönetici & Okur Kontrol Masası
- Canlı istatistik paneli: Toplam eser adedi, aktif ödünç sayısı, toplam ciro ve kayıtlı okur metrikleri.
- Yeni kitap ve üye ekleme modal pencereleri.

---

## 🏛️ Mimari & Teknoloji Yığını (Architecture & Tech Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Client)                       │
│  Vanilla JS (ES Modules) · CSS3 Design Tokens · HTML5      │
│  ├── /src/js/components (Catalog, Cart, Loans, Quotes...)   │
│  ├── /src/js/services   (API Client, State, Audio, Auth)   │
│  └── /src/styles        (Luxury Editorial CSS Architecture) │
└──────────────────────────────┬──────────────────────────────┘
                               │  HTTP REST / JSON API (JWT Auth)
┌──────────────────────────────▼──────────────────────────────┐
│                    BACKEND (Server)                         │
│  Node.js + Express.js API Server                            │
│  ├── /server/routes     (Auth, Books, Loans, Purchases...)  │
│  ├── /server/middleware (JWT Auth & Role Guard)             │
│  └── /server/db         (Database Engine & Seed Data)       │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ REST API Dokümantasyonu

| Metot | Endpoint | Açıklama | Yetki |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Yeni okur kaydı oluşturur ve JWT döner | Herkes |
| `POST` | `/api/auth/login` | Giriş yapar ve JWT oturum anahtarı üretir | Herkes |
| `GET` | `/api/auth/me` | Giriş yapmış kullanıcının profilini döner | Okur / Admin |
| `GET` | `/api/books` | Kitap listesini filtre ve sıralama ile döner | Herkes |
| `POST` | `/api/books` | Kataloğa yeni kitap ekler | **Yönetici** |
| `POST` | `/api/loans/request` | Kitap ödünç alma talebi başlatır | Okur |
| `POST` | `/api/loans/:id/return` | Ödünç alınan eseri iade eder ve stoğu yeniler | Okur |
| `POST` | `/api/purchases/checkout`| Sepetteki ürünleri satın alır ve faturalandırır | Okur |
| `GET` | `/api/quotes` | Alıntı defteri kayıtlarını listeler | Herkes |
| `POST` | `/api/quotes/:id/like` | Alıntıyı beğenir veya beğeniyi geri çeker | Herkes |
| `GET` | `/api/stats` | Kütüphane KPI'larını ve canlı metrikleri döner | Herkes |

---

## 🚀 Hızlı Başlangıç (Quick Start)

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/erdemsensoy/lumina-library.git
cd lumina-library
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Sunucuyu Başlatın
```bash
npm start
```

Tarayıcınızda açın: **[http://localhost:5173](http://localhost:5173)**

---

## 💼 LinkedIn Tanıtım Şablonu

Projeyi LinkedIn'de paylaşırken aşağıdaki metni kullanabilirsiniz:

> 🚀 **Lumina — Modern & Editoryal Dijital Kütüphane Platformu**
>
> Kitap tutkunları ve kütüphane arşivleri için sıfırdan geliştirdiğim Full-Stack projem **Lumina**'yı paylaşmaktan mutluluk duyuyorum! 📚✨
>
> 🔹 **Frontend:** Vanilla JavaScript (ES Modules), CSS3 Luxury Typography (*Fraunces & Plus Jakarta Sans*), Web Audio API ile interaktif ses efektleri & ambiyans odası.
> 🔹 **Backend:** Node.js & Express.js tabanlı REST API mimarisi, JWT kimlik doğrulama, rol bazlı erişim yönetimi.
> 🔹 **Özellikler:** 3D sert kapak katalog sergisi, dinamik sepet & kupon sistemi, 14 günlük ödünç alma protokolü, topluluk alıntı defteri ve canlı admin KPI paneli.
>
> 💻 GitHub: `https://github.com/kullanici-adiniz/lumina-library`
>
> #JavaScript #NodeJS #WebDevelopment #FullStack #SoftwareEngineering #Frontend #CleanCode #OpenSource

---

## 📄 Lisans
Bu proje **MIT** lisansı ile lisanslanmıştır.
