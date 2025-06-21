// Компонент для управления языками и переводами
class I18nManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translations = {};
    this.fallbackLanguage = 'en';
  }

  async init() {
    try {
      // Загружаем переводы для текущего языка
      await this.loadTranslations(this.currentLanguage);
      
      // Загружаем fallback язык если текущий не русский
      if (this.currentLanguage !== this.fallbackLanguage) {
        await this.loadTranslations(this.fallbackLanguage);
      }
      
      this.applyTranslations();
      this.attachEventListeners();
      this.setActiveLanguageOption();
      
      console.log(`I18n system initialized with language: ${this.currentLanguage}`);
    } catch (error) {
      console.error('Error initializing i18n:', error);
    }
  }

  async loadTranslations(language) {
    try {
      let translationsModule;
      if (language === 'ru') {
        translationsModule = await import('../data/locales/ru.json');
      } else if (language === 'en') {
        translationsModule = await import('../data/locales/en.json');
      }
      
      if (translationsModule) {
        this.translations[language] = translationsModule.default || translationsModule;
      }
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
      
      // Fallback: загружаем переводы через fetch
      try {
        const response = await fetch(`/src/data/locales/${language}.json`);
        if (response.ok) {
          this.translations[language] = await response.json();
        }
      } catch (fetchError) {
        console.error(`Fallback fetch also failed for ${language}:`, fetchError);
      }
    }
  }

  // Получить перевод по ключу
  t(key, lang = this.currentLanguage) {
    const keys = key.split('.');
    let translation = this.translations[lang];
    
    // Проходим по вложенным ключам
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        translation = undefined;
        break;
      }
    }
    
    // Если перевод не найден, пробуем fallback язык
    if (!translation && lang !== this.fallbackLanguage) {
      return this.t(key, this.fallbackLanguage);
    }
    
    return translation || key; // Возвращаем ключ если перевод не найден
  }

  // Применить переводы к элементам с data-i18n атрибутами
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT') {
        // Для input элементов обновляем placeholder
        element.placeholder = translation;
      } else {
        // Для остальных элементов обновляем textContent
        element.textContent = translation;
      }
    });
  }

  // Переключить язык
  async switchLanguage(language) {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    
    // Загружаем переводы если их еще нет
    if (!this.translations[language]) {
      await this.loadTranslations(language);
    }
    
    this.applyTranslations();
    this.setActiveLanguageOption();
    
    console.log(`Language switched to: ${language}`);
  }

  // Установить активную опцию языка в меню
  setActiveLanguageOption() {
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
      option.classList.remove('active');
      if (option.classList.contains(`language-option-${this.currentLanguage}`)) {
        option.classList.add('active');
      }
    });
  }

  // Привязать обработчики событий
  attachEventListeners() {
    // Обработчик для кнопки языка в навигации
    const navItemLanguage = document.querySelector('.nav-item-language');
    const languageSubmenu = document.querySelector('.nav-submenu-language');
    
    if (navItemLanguage && languageSubmenu) {
      navItemLanguage.addEventListener('click', () => {
        languageSubmenu.classList.add('open');
      });
    }

    // Обработчик для кнопки "назад" в подменю языка
    const navBackLanguage = document.querySelector('.nav-back-language');
    if (navBackLanguage && languageSubmenu) {
      navBackLanguage.addEventListener('click', () => {
        languageSubmenu.classList.remove('open');
      });
    }

    // Обработчики для опций языка
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
      option.addEventListener('click', () => {
        const language = this.getLanguageFromClass(option);
        this.switchLanguage(language);
      });
    });
  }

  // Определить язык по CSS классу кнопки
  getLanguageFromClass(element) {
    if (element.classList.contains('language-option-ru')) {
      return 'ru';
    } else if (element.classList.contains('language-option-en')) {
      return 'en';
    }
    return 'ru'; // по умолчанию
  }

  // Получить текущий язык
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Создаем единственный экземпляр
const i18nManager = new I18nManager();

// Экспортируем функции
export function initI18n() {
  return i18nManager.init();
}

export function t(key) {
  return i18nManager.t(key);
}

export function switchLanguage(language) {
  return i18nManager.switchLanguage(language);
}

export function getCurrentLanguage() {
  return i18nManager.getCurrentLanguage();
} 