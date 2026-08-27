import { el, toast, openModal, closeModal, safeText, avg, getFormattedUserRegDate } from './utils/helpers.js';
import { state } from './services/state.js';
import { getStored, setStored, saveState, exportDatabaseJson, resetDemoData } from './services/storage.js';
import { ensureAudioUnlocked, toggleSfx, updateSfxUi, playUiSound, toggleAmbientMenu, stopCurrentAmbient, setAmbientTrack, playPageFlipSound, playRealisticFootstep } from './services/audio.js';
import { updateCarpetAnimation, handleCarpetWheel, handleTouchStart, handleTouchMove, handleKeyDown, unlockSiteImmediately, replayCarpetIntro } from './components/corridor.js';
import { navigateTo, scrollToSection, focusSearch, handleProfileNavClick, toggleMobileNavMenu } from './components/router.js';
import { togglePasswordVisibility, switchAuthView, handleFormLogin, handleFormRegister, handlePasswordReset, handleLogout, validateRegisterPasswordLive, clearAuthForms } from './services/auth.js';
import { updateAllRealStatistics } from './components/stats.js';
import { setCatalogViewMode, selectCatalogCategory, syncCategoryPillsFromSelect, toggleCatalogExpand, renderBooks, filterByGenre, toggleFavorite, renderFavoritesPage } from './components/catalog.js';
import { showDetails, setReviewRating, toggleAddReviewForm, renderBookReviewsInDetail, submitBookReview, editBookReview, deleteBookReview } from './components/details.js';
import { updateLoanMinDueDate, setLoanDurationDays, borrow, submitLoanRequest, cancelBorrowRequest, handlePurchasePaymentMethodChange, buy, applyPurchaseCoupon, applyCoupon, completePurchase, returnBook, showReceiptModal, printReceiptDocument, setReturnRating, openReturnFeedbackModal, confirmReturnWithFeedback } from './components/borrow-buy.js';
import { addToCart, changeCartQty, removeFromCart, applyCartCoupon, renderCartPage, checkoutCart, confirmCartCheckout, handleCartPaymentMethodChange } from './components/cart.js';
import { renderQuotes, openAddQuoteModal, autoFillQuoteAuthor, submitNewQuote, likeQuote, copyQuoteText, deleteQuote, executeDeleteQuote } from './components/quotes.js';
import { renderProfilePage, changeAvatar, toggleProfileAccordion, switchProfileTab, toggleProfileEditMode, renderMemberProfileData, savePersonalProfileInfo, updateUserPasswordFromProfile, triggerPasswordResetHelp, requestLoanExtension, toggleEmailNotif } from './components/profile.js';
import { renderAdminDashboardPending, renderAdminInventoryTable, adjustBookStock, deleteBook, openAddBookModal, submitNewBook, renderAdminLoansTable, adminReturnLoan, renderAdminUsersTable, toggleUserRole, deleteUser, openAddUserModal, submitNewUser, renderAdminSalesTable, renderAdminQuotesManagement, publishAnnouncementFromDash, approveRequest, confirmReject, approveExtension, rejectExtension } from './components/admin.js';
import { renderCoupons, claimCoupon, copyCoupon, renderUserBadges, inspectBadge, equipBadge, unequipBadge, renderMiniBadgesUnderName, equipCurrentBadgeFromModal } from './components/vouchers-badges.js';
import { openReader, renderReaderPage, turnReaderPage, open3DBookCover, openBookFromCover, closeBookToCover, toggleBookOpenClose, setReaderTheme, adjustReaderFontSize } from './components/reader.js';
import { openSpotlight, closeSpotlight, handleSpotlightBackdropClick, handleSpotlightInput, executeSpotlightItem, handleSpotlightKeyDown, updateSpotlightSelection } from './components/spotlight.js';
import { toggleFaqAccordion, filterFaqItems, applyLanguage, toggleLanguage } from './components/faq.js';
import { initCursorAndEffects, renderCursorLoop, attachMagneticPull, init3DTiltCovers } from './components/cursor-effects.js';
import { initHeroSlider, showHero, moveHero, restartHero } from './components/hero.js';

// ==========================================
// Window Attachment for HTML Event Handlers
// ==========================================
Object.assign(window, {
  state,
  el,
  toast,
  openModal,
  closeModal,
  safeText,
  avg,
  getStored,
  setStored,
  getFormattedUserRegDate,
  playRealisticFootstep,
  saveState,
  exportDatabaseJson,
  resetDemoData,
  toggleSfx,
  updateSfxUi,
  playUiSound,
  toggleAmbientMenu,
  stopCurrentAmbient,
  setAmbientTrack,
  playPageFlipSound,
  updateCarpetAnimation,
  unlockSiteImmediately,
  replayCarpetIntro,
  navigateTo,
  scrollToSection,
  focusSearch,
  handleProfileNavClick,
  toggleMobileNavMenu,
  togglePasswordVisibility,
  switchAuthView,
  validateRegisterPasswordLive,
  clearAuthForms,
  handleFormLogin,
  handleFormRegister,
  handlePasswordReset,
  handleLogout,
  updateAllRealStatistics,
  setCatalogViewMode,
  selectCatalogCategory,
  syncCategoryPillsFromSelect,
  toggleCatalogExpand,
  renderBooks,
  filterByGenre,
  toggleFavorite,
  renderFavoritesPage,
  showDetails,
  setReviewRating,
  toggleAddReviewForm,
  renderBookReviewsInDetail,
  submitBookReview,
  editBookReview,
  deleteBookReview,
  updateLoanMinDueDate,
  setLoanDurationDays,
  borrow,
  submitLoanRequest,
  cancelBorrowRequest,
  handlePurchasePaymentMethodChange,
  buy,
  applyPurchaseCoupon,
  applyCoupon,
  completePurchase,
  returnBook,
  showReceiptModal,
  printReceiptDocument,
  setReturnRating,
  openReturnFeedbackModal,
  confirmReturnWithFeedback,
  addToCart,
  changeCartQty,
  removeFromCart,
  applyCartCoupon,
  renderCartPage,
  checkoutCart,
  confirmCartCheckout,
  handleCartPaymentMethodChange,
  renderQuotes,
  openAddQuoteModal,
  autoFillQuoteAuthor,
  submitNewQuote,
  likeQuote,
  copyQuoteText,
  deleteQuote,
  executeDeleteQuote,
  renderProfilePage,
  toggleProfileAccordion,
  switchProfileTab,
  toggleProfileEditMode,
  renderMemberProfileData,
  savePersonalProfileInfo,
  updateUserPasswordFromProfile,
  triggerPasswordResetHelp,
  requestLoanExtension,
  toggleEmailNotif,
  renderAdminDashboardPending,
  renderAdminInventoryTable,
  adjustBookStock,
  deleteBook,
  openAddBookModal,
  submitNewBook,
  renderAdminLoansTable,
  adminReturnLoan,
  renderAdminUsersTable,
  toggleUserRole,
  deleteUser,
  openAddUserModal,
  submitNewUser,
  renderAdminSalesTable,
  renderAdminQuotesManagement,
  publishAnnouncementFromDash,
  approveRequest,
  confirmReject,
  approveExtension,
  rejectExtension,
  renderCoupons,
  claimCoupon,
  copyCoupon,
  renderUserBadges,
  inspectBadge,
  equipBadge,
  unequipBadge,
  equipCurrentBadgeFromModal,
  renderMiniBadgesUnderName,
  openReader,
  renderReaderPage,
  turnReaderPage,
  setReaderTheme,
  adjustReaderFontSize,
  openSpotlight,
  closeSpotlight,
  handleSpotlightBackdropClick,
  handleSpotlightInput,
  executeSpotlightItem,
  handleSpotlightKeyDown,
  updateSpotlightSelection,
  toggleFaqAccordion,
  filterFaqItems,
  applyLanguage,
  toggleLanguage,
  renderCursorLoop,
  attachMagneticPull,
  init3DTiltCovers,
  showHero,
  moveHero,
  restartHero
});

// ==========================================
// Global Keyboard Shortcuts & Modal Backdrop
// ==========================================
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openSpotlight();
  }
  if (e.key === 'Escape') {
    closeSpotlight();
    document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
  }
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('show');
    }
  });
});

// ==========================================
// Application Bootstrap Sequence
// ==========================================

// Expose all modules to global scope for inline HTML handlers
window.el = el;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.safeText = safeText;
window.avg = avg;
window.getFormattedUserRegDate = getFormattedUserRegDate;
window.state = state;
window.getStored = getStored;
window.setStored = setStored;
window.saveState = saveState;
window.exportDatabaseJson = exportDatabaseJson;
window.resetDemoData = resetDemoData;
window.ensureAudioUnlocked = ensureAudioUnlocked;
window.toggleSfx = toggleSfx;
window.updateSfxUi = updateSfxUi;
window.playUiSound = playUiSound;
window.toggleAmbientMenu = toggleAmbientMenu;
window.stopCurrentAmbient = stopCurrentAmbient;
window.setAmbientTrack = setAmbientTrack;
window.playPageFlipSound = playPageFlipSound;
window.playRealisticFootstep = playRealisticFootstep;
window.updateCarpetAnimation = updateCarpetAnimation;
window.handleCarpetWheel = handleCarpetWheel;
window.handleTouchStart = handleTouchStart;
window.handleTouchMove = handleTouchMove;
window.handleKeyDown = handleKeyDown;
window.unlockSiteImmediately = unlockSiteImmediately;
window.replayCarpetIntro = replayCarpetIntro;
window.navigateTo = navigateTo;
window.scrollToSection = scrollToSection;
window.focusSearch = focusSearch;
window.handleProfileNavClick = handleProfileNavClick;
window.togglePasswordVisibility = togglePasswordVisibility;
window.switchAuthView = switchAuthView;
window.handleFormLogin = handleFormLogin;
window.handleFormRegister = handleFormRegister;
window.handlePasswordReset = handlePasswordReset;
window.handleLogout = handleLogout;
window.updateAllRealStatistics = updateAllRealStatistics;
window.setCatalogViewMode = setCatalogViewMode;
window.selectCatalogCategory = selectCatalogCategory;
window.syncCategoryPillsFromSelect = syncCategoryPillsFromSelect;
window.toggleCatalogExpand = toggleCatalogExpand;
window.renderBooks = renderBooks;
window.filterByGenre = filterByGenre;
window.toggleFavorite = toggleFavorite;
window.renderFavoritesPage = renderFavoritesPage;
window.showDetails = showDetails;
window.setReviewRating = setReviewRating;
window.toggleAddReviewForm = toggleAddReviewForm;
window.renderBookReviewsInDetail = renderBookReviewsInDetail;
window.submitBookReview = submitBookReview;
window.editBookReview = editBookReview;
window.deleteBookReview = deleteBookReview;
window.updateLoanMinDueDate = updateLoanMinDueDate;
window.setLoanDurationDays = setLoanDurationDays;
window.borrow = borrow;
window.submitLoanRequest = submitLoanRequest;
window.cancelBorrowRequest = cancelBorrowRequest;
window.handlePurchasePaymentMethodChange = handlePurchasePaymentMethodChange;
window.buy = buy;
window.applyPurchaseCoupon = applyPurchaseCoupon;
window.applyCoupon = applyCoupon;
window.completePurchase = completePurchase;
window.returnBook = returnBook;
window.showReceiptModal = showReceiptModal;
window.printReceiptDocument = printReceiptDocument;
window.addToCart = addToCart;
window.changeCartQty = changeCartQty;
window.removeFromCart = removeFromCart;
window.applyCartCoupon = applyCartCoupon;
window.renderCartPage = renderCartPage;
window.checkoutCart = checkoutCart;
window.confirmCartCheckout = confirmCartCheckout;
window.handleCartPaymentMethodChange = handleCartPaymentMethodChange;
window.renderQuotes = renderQuotes;
window.openAddQuoteModal = openAddQuoteModal;
window.autoFillQuoteAuthor = autoFillQuoteAuthor;
window.submitNewQuote = submitNewQuote;
window.likeQuote = likeQuote;
window.copyQuoteText = copyQuoteText;
window.deleteQuote = deleteQuote;
window.executeDeleteQuote = executeDeleteQuote;
window.renderProfilePage = renderProfilePage;
window.changeAvatar = changeAvatar;
window.toggleProfileAccordion = toggleProfileAccordion;
window.switchProfileTab = switchProfileTab;
window.toggleProfileEditMode = toggleProfileEditMode;
window.renderMemberProfileData = renderMemberProfileData;
window.savePersonalProfileInfo = savePersonalProfileInfo;
window.updateUserPasswordFromProfile = updateUserPasswordFromProfile;
window.triggerPasswordResetHelp = triggerPasswordResetHelp;
window.requestLoanExtension = requestLoanExtension;
window.toggleEmailNotif = toggleEmailNotif;
window.renderAdminDashboardPending = renderAdminDashboardPending;
window.renderAdminInventoryTable = renderAdminInventoryTable;
window.adjustBookStock = adjustBookStock;
window.deleteBook = deleteBook;
window.openAddBookModal = openAddBookModal;
window.submitNewBook = submitNewBook;
window.renderAdminLoansTable = renderAdminLoansTable;
window.adminReturnLoan = adminReturnLoan;
window.renderAdminUsersTable = renderAdminUsersTable;
window.toggleUserRole = toggleUserRole;
window.deleteUser = deleteUser;
window.openAddUserModal = openAddUserModal;
window.submitNewUser = submitNewUser;
window.renderAdminSalesTable = renderAdminSalesTable;
window.renderAdminQuotesManagement = renderAdminQuotesManagement;
window.publishAnnouncementFromDash = publishAnnouncementFromDash;
window.approveRequest = approveRequest;
window.confirmReject = confirmReject;
window.approveExtension = approveExtension;
window.rejectExtension = rejectExtension;
window.renderCoupons = renderCoupons;
window.claimCoupon = claimCoupon;
window.copyCoupon = copyCoupon;
window.renderUserBadges = renderUserBadges;
window.inspectBadge = inspectBadge;
window.equipBadge = equipBadge;
window.unequipBadge = unequipBadge;
window.renderMiniBadgesUnderName = renderMiniBadgesUnderName;
window.openReader = openReader;
window.renderReaderPage = renderReaderPage;
window.turnReaderPage = turnReaderPage;
window.open3DBookCover = open3DBookCover;
window.openBookFromCover = openBookFromCover;
window.closeBookToCover = closeBookToCover;
window.toggleBookOpenClose = toggleBookOpenClose;
window.setReaderTheme = setReaderTheme;
window.adjustReaderFontSize = adjustReaderFontSize;
window.openSpotlight = openSpotlight;
window.closeSpotlight = closeSpotlight;
window.handleSpotlightBackdropClick = handleSpotlightBackdropClick;
window.handleSpotlightInput = handleSpotlightInput;
window.executeSpotlightItem = executeSpotlightItem;
window.handleSpotlightKeyDown = handleSpotlightKeyDown;
window.updateSpotlightSelection = updateSpotlightSelection;
window.toggleFaqAccordion = toggleFaqAccordion;
window.filterFaqItems = filterFaqItems;
window.applyLanguage = applyLanguage;
window.toggleLanguage = toggleLanguage;
window.initCursorAndEffects = initCursorAndEffects;
window.renderCursorLoop = renderCursorLoop;
window.attachMagneticPull = attachMagneticPull;
window.init3DTiltCovers = init3DTiltCovers;
window.initHeroSlider = initHeroSlider;
window.showHero = showHero;
window.moveHero = moveHero;
window.restartHero = restartHero;

function initApp() {
  updateCarpetAnimation(0, true);
  updateSfxUi();
  initHeroSlider();
  renderBooks();
  renderQuotes();
  renderProfilePage();
  updateAllRealStatistics();
  initCursorAndEffects();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
