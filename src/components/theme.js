// Компонент для управления темами
class ThemeManager {
  constructor() {
    this.themeOptions = null;
    this.navItemTheme = null;
    this.themeSubmenu = null;
    this.navBack = null;
    this.currentTheme = localStorage.getItem('theme') || 'light';
  }

  init() {
    this.bindElements();
    this.setInitialTheme();
    this.attachEventListeners();
    console.log('Theme system initialized');
  }

  bindElements() {
    this.themeOptions = document.querySelectorAll(".theme-option");
    this.navItemTheme = document.querySelector(".nav-item-theme");
    this.themeSubmenu = document.querySelector(".nav-submenu-theme");
    this.navBack = document.querySelector(".nav-back");
  }

  setInitialTheme() {
    // Применяем сохраненную тему
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Устанавливаем активную опцию в меню
    setTimeout(() => {
      const activeOption = document.querySelector(`.theme-option-${this.currentTheme}`);
      if (activeOption) {
        this.themeOptions.forEach(opt => opt.classList.remove("active"));
        activeOption.classList.add("active");
      }
    }, 100);
  }

  attachEventListeners() {
    // Открытие подменю темы
    if (this.navItemTheme && this.themeSubmenu) {
      this.navItemTheme.addEventListener("click", () => {
        this.themeSubmenu.classList.add("open");
      });
    }

    // Закрытие подменю темы
    if (this.navBack && this.themeSubmenu) {
      this.navBack.addEventListener("click", () => {
        this.themeSubmenu.classList.remove("open");
      });
    }

    // Обработчики выбора темы
    this.themeOptions.forEach(option => {
      option.addEventListener("click", () => {
        const theme = this.getThemeFromClass(option);
        this.switchTheme(theme, option);
      });
    });
  }

  switchTheme(theme, selectedOption) {
    // Переключаем тему
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
    
    // Обновляем активную опцию
    this.themeOptions.forEach(opt => opt.classList.remove("active"));
    selectedOption.classList.add("active");
    
    console.log(`Тема переключена на: ${theme}`);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    const option = document.querySelector(`.theme-option-${theme}`);
    if (option) {
      this.switchTheme(theme, option);
    }
  }

  getThemeFromClass(element) {
    // Определяем тему по CSS классу кнопки
    if (element.classList.contains('theme-option-dark')) {
      return 'dark';
    } else if (element.classList.contains('theme-option-light')) {
      return 'light';
    }
    return 'light'; // по умолчанию
  }
}

// Создаем единственный экземпляр
const themeManager = new ThemeManager();

// Экспортируем функцию инициализации для совместимости
export function initThemeToggle() {
  themeManager.init();
}

// Экспортируем дополнительные методы для расширенного использования
export function getCurrentTheme() {
  return themeManager.getCurrentTheme();
}

export function setTheme(theme) {
  themeManager.setTheme(theme);
}