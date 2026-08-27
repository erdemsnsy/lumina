import { el, toast, openModal, closeModal } from '../utils/helpers.js';
import { playUiSound } from '../services/audio.js';
import { state } from './state.js';
import { saveState } from './storage.js';
import { renderProfilePage } from '../components/profile.js';
import { updateAllRealStatistics } from '../components/stats.js';
import { api } from './api.js';

export function validateRegisterPasswordLive(value = '') {
  const val = String(value || '');

  const hasLength = val.length >= 8;
  const hasUpper = /[A-ZÇĞİÖŞÜ]/.test(val);
  const hasLower = /[a-zçğıöşü]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const hasSpecial = /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü\s]/.test(val);

  const rules = [
    { id: 'rule-length', valid: hasLength },
    { id: 'rule-upper', valid: hasUpper },
    { id: 'rule-lower', valid: hasLower },
    { id: 'rule-number', valid: hasNumber },
    { id: 'rule-special', valid: hasSpecial }
  ];

  rules.forEach(({ id, valid }) => {
    const elem = el(id);
    if (!elem) return;
    const icon = elem.querySelector('.rule-icon');
    if (valid) {
      elem.style.color = '#185a38';
      if (icon) icon.textContent = '✓';
    } else {
      elem.style.color = '#c93424';
      if (icon) icon.textContent = '✕';
    }
  });

  return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

export function clearAuthForms() {
  const ids = ['loginEmail', 'loginPass', 'regName', 'regEmail', 'regPass', 'forgotEmail'];
  ids.forEach(id => {
    const input = el(id);
    if (input) input.value = '';
  });

  // Reset password input type to password
  ['loginPass', 'regPass'].forEach(id => {
    const input = el(id);
    if (input) input.type = 'password';
  });

  // Reset eye buttons
  document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.textContent = '👁️';
  });

  // Reset live rules checklist to initial red
  validateRegisterPasswordLive('');
}

export function togglePasswordVisibility(inputId, btn) {
  const input = el(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

export function switchAuthView(viewName) {
  playUiSound('page');
  clearAuthForms();

  const views = ['authLoginView', 'authRegisterView', 'authForgotView'];
  views.forEach(v => {
    const elem = el(v);
    if (elem) elem.style.display = 'none';
  });

  const tabLogin = el('authTabLogin');
  const tabRegister = el('authTabRegister');
  const tabSwitcher = el('authTabSwitcher');
  if (tabSwitcher) {
    tabSwitcher.style.display = (viewName === 'forgot') ? 'none' : 'flex';
  }
  if (tabLogin && tabRegister) {
    if (viewName === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
    } else if (viewName === 'register') {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
    }
  }

  if (viewName === 'login') {
    const v = el('authLoginView');
    if (v) v.style.display = 'block';
  } else if (viewName === 'register') {
    const v = el('authRegisterView');
    if (v) v.style.display = 'block';
  } else if (viewName === 'forgot') {
    const v = el('authForgotView');
    if (v) v.style.display = 'block';
  }
}

export async function handleFormLogin(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const emailInput = el('loginEmail');
  const passInput = el('loginPass');
  const email = (emailInput ? emailInput.value : '').trim();
  const pass = (passInput ? passInput.value : '').trim();

  if (!email) {
    toast('Lütfen e-posta adresinizi giriniz.');
    return;
  }

  // Try API Login first
  const res = await api.login(email, pass);
  if (res.ok && res.data?.user) {
    state.currentUser = res.data.user;
    saveState();
    clearAuthForms();
    closeModal('authModal');
    playUiSound('stamp');
    toast(`Hoş geldiniz, Sayın ${res.data.user.name}!`);
    renderProfilePage();
    updateAllRealStatistics();
    return;
  }

  // Fallback to local storage
  const found = state.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    state.currentUser = found;
    saveState();
    clearAuthForms();
    closeModal('authModal');
    playUiSound('stamp');
    toast(`Hoş geldiniz, Sayın ${found.name}!`);
    renderProfilePage();
    updateAllRealStatistics();
  } else {
    toast(res.data?.message || 'Bu e-posta adresine ait bir okur kaydı bulunamadı.');
  }
}

export async function handleFormRegister(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const nameInput = el('regName');
  const emailInput = el('regEmail');
  const passInput = el('regPass');

  const name = (nameInput ? nameInput.value : '').trim();
  const email = (emailInput ? emailInput.value : '').trim();
  const pass = (passInput ? passInput.value : '').trim();

  if (!name || name.length < 2) {
    toast('Lütfen geçerli bir ad soyad giriniz.');
    return;
  }
  if (!email || !email.includes('@')) {
    toast('Lütfen geçerli bir e-posta adresi giriniz.');
    return;
  }

  // Validate password security rules
  const isValidPass = validateRegisterPasswordLive(pass);
  if (!isValidPass) {
    toast('Lütfen tüm şifre güvenlik kurallarını (yeşil olana kadar) tamamlayınız.');
    return;
  }

  // Try API Register
  const res = await api.register(name, email, pass);
  if (res.ok && res.data?.user) {
    state.currentUser = res.data.user;
    state.users.push(res.data.user);
    saveState();
    clearAuthForms();
    closeModal('authModal');
    playUiSound('stamp');
    toast(`Aramıza hoş geldiniz, Sayın ${res.data.user.name}!`);
    renderProfilePage();
    updateAllRealStatistics();
    return;
  }

  if (!res.ok && res.data?.message) {
    toast(res.data.message);
    return;
  }

  // Fallback to local state
  if (state.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    toast('Bu e-posta adresi ile zaten kayıtlı bir okur bulunmaktadır.');
    return;
  }

  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'OK';
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: pass,
    avatar: initials,
    role: 'Okur',
    registered: 'Bugün'
  };

  state.users.push(newUser);
  state.currentUser = newUser;
  saveState();
  clearAuthForms();
  closeModal('authModal');
  playUiSound('stamp');
  toast(`Aramıza hoş geldiniz, Sayın ${newUser.name}!`);
  renderProfilePage();
  updateAllRealStatistics();
}

export async function handlePasswordReset(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const emailInput = el('forgotEmail');
  const email = (emailInput ? emailInput.value : '').trim();

  if (!email || !email.includes('@')) {
    toast('Lütfen geçerli bir e-posta adresi giriniz.');
    return;
  }

  // Try API first
  const res = await api.forgotPassword(email);
  if (res.ok) {
    const found = state.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      found.password = 'Lumina2026!';
      saveState();
    }
    toast(res.data?.message || `Şifre sıfırlama talebiniz '${email}' için tamamlandı. Geçici şifreniz: Lumina2026!`);
    switchAuthView('login');
    if (el('loginEmail')) el('loginEmail').value = email;
    if (el('loginPass')) el('loginPass').value = 'Lumina2026!';
    return;
  }

  // Fallback to local state
  const found = state.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    found.password = 'Lumina2026!';
    saveState();
    toast(`Şifre sıfırlama talebiniz '${email}' için tamamlandı. Geçici şifreniz: Lumina2026!`);
    switchAuthView('login');
    if (el('loginEmail')) el('loginEmail').value = email;
    if (el('loginPass')) el('loginPass').value = 'Lumina2026!';
  } else {
    toast(res.data?.message || 'Bu e-posta adresi sistemimizde kayıtlı değildir.');
  }
}

export function handleLogout() {
  playUiSound('click');
  api.setToken('');
  state.currentUser = null;
  clearAuthForms();
  saveState();
  renderProfilePage();
  updateAllRealStatistics();
  toast('Oturumunuz güvenle kapatıldı.');
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.navlink-btn').forEach(btn => btn.classList.remove('active'));
  const homeView = el('view-home');
  const homeBtn = el('navBtn-home');
  if (homeView) homeView.classList.add('active');
  if (homeBtn) homeBtn.classList.add('active');
}
