import { el, toast } from '../utils/helpers.js';
import { translations } from '../config/constants.js';
import { state } from '../services/state.js';
import { playUiSound } from '../services/audio.js';
import { updateSfxUi } from '../services/audio.js';
import { renderBooks } from './catalog.js';
import { renderQuotes } from './quotes.js';
import { renderCartPage } from './cart.js';
import { renderProfilePage } from './profile.js';
import { updateAllRealStatistics } from './stats.js';

export function toggleFaqAccordion(btn) {
  const item = btn.closest('.faq-item');
  if (item) item.classList.toggle('open');
}

export function filterFaqItems() {
  const q = (el('faqSearchInput') ? el('faqSearchInput').value : '').toLocaleLowerCase('tr');
  const cat = el('faqCategoryFilter') ? el('faqCategoryFilter').value : '';
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const itemCat = item.getAttribute('data-cat') || '';
    const text = item.textContent.toLocaleLowerCase('tr');
    const matchesCat = !cat || itemCat === cat;
    const matchesQuery = !q || text.includes(q);

    item.style.display = (matchesCat && matchesQuery) ? 'block' : 'none';
  });
}

export function applyLanguage(lang) {
  state.currentLang = lang;
  state.english = (lang === 'en');
  const t = translations[lang] || translations.tr;

  const langBtn = el('langBtn');
  if (langBtn) langBtn.textContent = (lang === 'en') ? 'TR' : 'EN';

  // Navbar
  if (el('navBtn-home')) el('navBtn-home').textContent = t.navHome;
  if (el('navBtn-catalog')) el('navBtn-catalog').textContent = t.navCatalog;
  if (el('navBtn-quotes')) el('navBtn-quotes').textContent = t.navQuotes;
  if (el('navBtn-about')) el('navBtn-about').textContent = t.navAbout;
  if (el('navBtn-faq')) el('navBtn-faq').textContent = t.navFaq;
  if (el('ambientBtnLabel')) el('ambientBtnLabel').textContent = state.english ? 'Ambience' : 'Ambiyans';
  if (el('navUserName')) {
    if (state.currentUser) {
      el('navUserName').textContent = (state.currentUser.role === 'Yönetici') ? (lang === 'en' ? 'Admin' : 'Yönetici') : (state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'Okur');
    } else {
      el('navUserName').textContent = (lang === 'en' ? 'Sign In' : 'Giriş Yap');
    }
  }

  // Hero
  if (el('heroBadge')) el('heroBadge').textContent = t.heroBadge;
  if (el('heroTitle')) el('heroTitle').textContent = t.heroTitle;
  if (el('heroSub')) el('heroSub').textContent = t.heroSub;
  if (el('heroBtn1')) el('heroBtn1').textContent = t.heroBtn1;
  if (el('heroBtn2')) el('heroBtn2').textContent = t.heroBtn2;

  // Mood & Featured
  if (el('moodTitle')) el('moodTitle').textContent = t.moodTitle;
  if (el('moodSub')) el('moodSub').textContent = t.moodSub;
  if (el('featuredTitle')) el('featuredTitle').textContent = t.featuredTitle;
  if (el('featuredSub')) el('featuredSub').textContent = t.featuredSub;
  if (el('featuredAll')) el('featuredAll').textContent = t.featuredAll;

  // Catalog
  if (el('catalogTitle')) el('catalogTitle').textContent = t.catalogTitle;
  if (el('catalogSub')) el('catalogSub').textContent = t.catalogSub;
  if (el('search')) el('search').placeholder = t.searchPlaceholder;
  if (el('catalogSearch')) el('catalogSearch').placeholder = t.searchPlaceholder;
  if (el('genre') && el('genre').options[0]) el('genre').options[0].textContent = t.allGenres;
  if (el('catalogGenreSelect') && el('catalogGenreSelect').options[0]) el('catalogGenreSelect').options[0].textContent = t.allGenres;

  // Quotes
  if (el('quotesEyebrow')) el('quotesEyebrow').textContent = t.quotesEyebrow;
  if (el('quotesPageTitle')) el('quotesPageTitle').textContent = t.quotesTitle;
  if (el('quotesPageSubtitle')) el('quotesPageSubtitle').textContent = t.quotesSub;
  if (el('quotesAddBtn')) el('quotesAddBtn').textContent = t.quotesAddBtn;
  if (el('quoteSearch')) el('quoteSearch').placeholder = t.quoteSearchPlaceholder;
  if (el('quoteTagFilter') && el('quoteTagFilter').options[0]) el('quoteTagFilter').options[0].textContent = t.quoteAllTags;

  // About
  if (el('aboutEyebrow')) el('aboutEyebrow').textContent = t.aboutEyebrow;
  if (el('aboutPageTitle')) el('aboutPageTitle').textContent = t.aboutTitle;
  if (el('aboutPageSubtitle')) el('aboutPageSubtitle').textContent = t.aboutSub;
  if (el('aboutValuesTitle')) el('aboutValuesTitle').textContent = t.aboutValuesTitle;
  if (el('aboutValuesSub')) el('aboutValuesSub').textContent = t.aboutValuesSub;

  // FAQ
  const faqEye = el('faqEyebrow') || el('faqPageEyebrow');
  if (faqEye) faqEye.textContent = t.faqEyebrow;
  if (el('faqPageTitle')) el('faqPageTitle').textContent = t.faqTitle;
  if (el('faqPageSubtitle')) el('faqPageSubtitle').textContent = t.faqSub;

  // Favorites
  if (el('favEyebrow')) el('favEyebrow').textContent = (lang === 'en' ? 'LUMINA / MY LIST' : 'LUMINA / LİSTEM');
  if (el('favPageTitle')) el('favPageTitle').textContent = t.favTitle;
  if (el('favPageSubtitle')) el('favPageSubtitle').textContent = t.favSub;

  // Cart
  if (el('cartEyebrow')) el('cartEyebrow').textContent = (lang === 'en' ? 'LUMINA / CHECKOUT' : 'LUMINA / ALIŞVERİŞ');
  if (el('cartPageTitle')) el('cartPageTitle').textContent = t.cartTitle;
  if (el('cartPageSubtitle')) el('cartPageSubtitle').textContent = t.cartSub;

  renderBooks();
  renderQuotes();
  renderCartPage();
}

export function toggleLanguage() {
  const nextLang = (state.currentLang === 'tr') ? 'en' : 'tr';
  applyLanguage(nextLang);
  if (typeof updateSfxUi === 'function') updateSfxUi();
  if (typeof renderProfilePage === 'function') renderProfilePage();
  if (typeof updateAllRealStatistics === 'function') updateAllRealStatistics();
  toast(nextLang === 'en' ? 'Language switched to English.' : 'Dil Türkçe olarak ayarlandı.');
  if (typeof playUiSound === 'function') playUiSound('click');
}

