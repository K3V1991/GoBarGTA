// Internationalization (i18n) for GoBarGTA
// Handles language detection, switching, and RTL support

const SUPPORTED_LANGS = ['en', 'de', 'ru', 'fr', 'zh', 'es', 'hi', 'ar'];
const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'gobargta-lang';

const LANG_LABELS = {
  en: 'EN', de: 'DE', ru: 'RU', fr: 'FR',
  zh: 'ZH', es: 'ES', hi: 'HI', ar: 'AR'
};

// RTL languages
const RTL_LANGS = ['ar'];

let currentLang = DEFAULT_LANG;

// Detect browser language
function detectBrowserLang() {
  const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}

// Get stored language or detect
function getSavedLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  return detectBrowserLang();
}

// Set text for a single element
function setElementText(el, key) {
  const t = translations[currentLang];
  if (!t || !(key in t)) return;

  const value = t[key];
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    el.placeholder = value;
  } else if (key === 'page_title') {
    document.title = value;
  } else {
    el.innerHTML = value;
  }
}

// Apply all translations
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    setElementText(el, key);
  });

  // Update html lang attribute
  document.documentElement.lang = currentLang;

  // Handle RTL
  if (RTL_LANGS.includes(currentLang)) {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  // Update language switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// Switch language
function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations();
}

// Initialize
function initI18n() {
  currentLang = getSavedLang();
  applyTranslations();
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initI18n);

// Theme Toggle
const THEME_KEY = 'gobargta-theme';

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.checked = theme === 'dark';
}

function initTheme() {
  const saved = getSavedTheme();
  setTheme(saved);

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      setTheme(toggle.checked ? 'dark' : 'light');
    });
  }
}

document.addEventListener('DOMContentLoaded', initTheme);

// Community Poll
const POLL_KEY = 'gobargta-poll';

function getPollData() {
  const data = localStorage.getItem(POLL_KEY);
  return data ? JSON.parse(data) : { barbie: 0, godzilla: 0, gta: 0 };
}

function savePollData(data) {
  localStorage.setItem(POLL_KEY, JSON.stringify(data));
}

function updatePollUI() {
  const data = getPollData();
  const total = data.barbie + data.godzilla + data.gta;

  document.querySelectorAll('[data-poll-bar]').forEach(bar => {
    const key = bar.dataset.pollBar;
    const pct = total > 0 ? (data[key] / total * 100) : 0;
    bar.style.width = pct + '%';
  });

  document.querySelectorAll('[data-poll-percent]').forEach(el => {
    const key = el.dataset.pollPercent;
    const pct = total > 0 ? (data[key] / total * 100) : 0;
    el.textContent = Math.round(pct) + '%';
  });

  document.querySelectorAll('[data-poll-count]').forEach(el => {
    el.textContent = total;
  });
}

function handleVote(choice) {
  const data = getPollData();
  data[choice]++;
  savePollData(data);

  document.querySelectorAll('.poll-card').forEach(card => {
    card.classList.remove('voted');
    card.querySelector('.poll-btn').disabled = true;
  });

  document.querySelector(`[data-poll="${choice}"]`).classList.add('voted');
  updatePollUI();
  localStorage.setItem('gobargta-poll-voted', choice);
}

function initPoll() {
  const voted = localStorage.getItem('gobargta-poll-voted');

  document.querySelectorAll('.poll-btn').forEach(btn => {
    btn.addEventListener('click', () => handleVote(btn.dataset.vote));
  });

  if (voted) {
    document.querySelector(`[data-poll="${voted}"]`)?.classList.add('voted');
    document.querySelectorAll('.poll-btn').forEach(btn => btn.disabled = true);
  }

  updatePollUI();
}

document.addEventListener('DOMContentLoaded', initPoll);
