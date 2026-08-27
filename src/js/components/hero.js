import { el } from '../utils/helpers.js';

let heroIndex = 0;
let heroTimer = null;

export function getHeroSlides() {
  return [...document.querySelectorAll('.hero-slide')];
}

export function showHero(i) {
  const heroSlides = getHeroSlides();
  if (heroSlides.length === 0) return;
  heroIndex = (i + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, index) => slide.classList.toggle('active', index === heroIndex));
}

export function moveHero(dir) {
  showHero(heroIndex + dir);
  restartHero();
}

export function restartHero() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => showHero(heroIndex + 1), 6500);
}

export function initHeroSlider() {
  const slider = el('heroSlider');
  if (slider) {
    slider.addEventListener('mouseenter', () => {
      if (heroTimer) clearInterval(heroTimer);
    });
    slider.addEventListener('mouseleave', restartHero);
  }
  restartHero();
}
