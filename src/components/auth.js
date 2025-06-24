// Импорт необходимых модулей
import { t } from './i18n.js';

// Компонент для управления авторизацией
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  // Инициализация системы авторизации
  init() {
    this.checkAuthStatus();
    this.initAuthForm();
    this.initLogoutButton();
    this.updateUI();
  }

  // Проверяем статус авторизации из localStorage
  checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.isAuthenticated = true;
    }
  }

  // Инициализация формы авторизации/регистрации
  initAuthForm() {
    const authForm = document.querySelector('.auth-form');
    const toggleModeBtn = document.querySelector('.auth-toggle-mode');
    const authTitle = document.querySelector('.auth-title');
    const authSubmitBtn = document.querySelector('.auth-submit');
    const confirmPasswordField = document.querySelector('.auth-confirm-password-field');
    const signupCard = document.querySelector('.auth-signup-card');
    const facebookLogin = document.querySelector('.auth-facebook-login');
    const forgotPassword = document.querySelector('.auth-forgot-password');

    if (!authForm) return;

    let isLoginMode = true;

    // Функция обновления UI в зависимости от режима
    const updateModeUI = () => {
      if (isLoginMode) {
        authTitle.textContent = t('auth.welcome_subtitle');
        authSubmitBtn.textContent = t('auth.login_button');
        confirmPasswordField.style.display = 'none';
        if (signupCard) {
          signupCard.innerHTML = `У вас нет аккаунта? <button type="button" class="auth-toggle-mode">${t('auth.toggle_to_register')}</button>`;
        }
        if (facebookLogin) facebookLogin.style.display = 'flex';
        if (forgotPassword) forgotPassword.style.display = 'block';
      } else {
        authTitle.textContent = t('auth.register_title');
        authSubmitBtn.textContent = t('auth.register_button');
        confirmPasswordField.style.display = 'block';
        if (signupCard) {
          signupCard.innerHTML = `Уже есть аккаунт? <button type="button" class="auth-toggle-mode">${t('auth.toggle_to_login')}</button>`;
        }
        if (facebookLogin) facebookLogin.style.display = 'none';
        if (forgotPassword) forgotPassword.style.display = 'none';
      }
      
      // Переназначаем обработчик после обновления HTML
      const newToggleBtn = document.querySelector('.auth-toggle-mode');
      if (newToggleBtn) {
        newToggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          isLoginMode = !isLoginMode;
          updateModeUI();
        });
      }
    };

    // Переключение между режимами входа и регистрации
    if (toggleModeBtn) {
      toggleModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateModeUI();
      });
    }

    // Инициализируем UI
    updateModeUI();

    // Обработка отправки формы
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(authForm);
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (isLoginMode) {
        this.login(email, password);
      } else {
        if (password !== confirmPassword) {
          this.showAuthError(t('auth.error_passwords_mismatch'));
          return;
        }
        this.register(email, password);
      }
    });
  }

  // Вход в систему
  login(email, password) {
    console.log('🔐 Попытка входа:', email, password);
    
    // Простая проверка - в реальном приложении это делается на сервере
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('👥 Зарегистрированные пользователи:', users);
    
    // Для демо - создаем тестового пользователя, если его нет
    if (users.length === 0) {
      const testUser = {
        id: 'user_demo',
        email: 'test@test.com',
        password: 'test123',
        registeredAt: new Date().toISOString()
      };
      users.push(testUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      console.log('✨ Создан тестовый пользователь: test@test.com / test123');
    }
    
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      console.log('✅ Вход успешен');
      this.currentUser = { email: user.email, id: user.id };
      this.isAuthenticated = true;
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.showMainContent();
      this.updateUI();
      this.hideAuthError();
    } else {
      console.log('❌ Неверные данные для входа');
      this.showAuthError(t('auth.error_invalid_credentials'));
    }
  }

  // Регистрация нового пользователя
  register(email, password) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Проверяем, не существует ли уже пользователь с таким email
    if (users.find(u => u.email === email)) {
      this.showAuthError(t('auth.error_user_exists'));
      return;
    }

    // Создаем нового пользователя
    const newUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email,
      password: password, // В реальном приложении пароль должен быть захеширован
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // Автоматически входим в систему после регистрации
    this.currentUser = { email: newUser.email, id: newUser.id };
    this.isAuthenticated = true;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    this.showMainContent();
    this.updateUI();
    this.hideAuthError();
  }

  // Выход из системы
  logout() {
    // Закрываем боковое меню перед выходом
    if (typeof window.closeDropdownMenu === 'function') {
      window.closeDropdownMenu();
    }
    
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('currentUser');
    this.showAuthContent();
    this.updateUI();
  }

  // Инициализация кнопки выхода
  initLogoutButton() {
    const logoutBtn = document.querySelector('.nav-item-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  // Показать/скрыть контент в зависимости от состояния авторизации
  showMainContent() {
    console.log('🏠 Переключение на главную страницу...');
    
    // Закрываем боковое меню перед показом основного контента
    if (typeof window.closeDropdownMenu === 'function') {
      window.closeDropdownMenu();
    }
    
    const authPage = document.querySelector('.auth-page');
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('.header');
    const dropdownOverlay = document.querySelector('.dropdown-overlay');
    
    console.log('📄 Найденные элементы:', {
      authPage: !!authPage,
      mainContent: !!mainContent,
      header: !!header,
      dropdownOverlay: !!dropdownOverlay
    });
    
    if (authPage) {
      authPage.style.display = 'none';
      console.log('🚫 Скрыта страница авторизации');
    }
    if (mainContent) {
      mainContent.style.display = 'block';
      console.log('✅ Показан основной контент');
    }
    if (header) {
      header.style.display = 'block';
      console.log('✅ Показан header');
    }
    if (dropdownOverlay) {
      dropdownOverlay.style.display = 'block';
      console.log('✅ Показан dropdown overlay');
    }
    
    // Инициализируем главный контент после авторизации
    this.initMainContent();
  }

  // Инициализация главного контента после авторизации
  initMainContent() {
    // Отложенная инициализация для избежания циклических зависимостей
    setTimeout(() => {
      // Инициализируем модули, которые должны работать только после авторизации
      if (typeof window.initMainAppContent === 'function') {
        window.initMainAppContent();
      }
      
      // Переинициализируем footer переключатели языка
      if (typeof window.reinitFooterLanguageSwitchers === 'function') {
        window.reinitFooterLanguageSwitchers();
      }
    }, 100);
  }

  showAuthContent() {
    const authPage = document.querySelector('.auth-page');
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('.header');
    const dropdownOverlay = document.querySelector('.dropdown-overlay');
    
    if (authPage) authPage.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (header) header.style.display = 'none';
    if (dropdownOverlay) dropdownOverlay.style.display = 'none';
  }

  // Обновление UI в зависимости от состояния авторизации
  updateUI() {
    const profileNavItem = document.querySelector('.nav-item-profile');
    const storageNavItem = document.querySelector('.nav-item-storage');
    const logoutNavItem = document.querySelector('.nav-item-logout');

    if (this.isAuthenticated) {
      // Показываем элементы для авторизованных пользователей
      if (profileNavItem) profileNavItem.style.display = 'flex';
      if (storageNavItem) storageNavItem.style.display = 'flex';
      if (logoutNavItem) logoutNavItem.style.display = 'flex';
      this.showMainContent();
    } else {
      // Скрываем элементы для неавторизованных пользователей
      if (profileNavItem) profileNavItem.style.display = 'none';
      if (storageNavItem) storageNavItem.style.display = 'none';
      if (logoutNavItem) logoutNavItem.style.display = 'none';
      this.showAuthContent();
    }
  }

  // Показать ошибку авторизации
  showAuthError(message) {
    const errorElement = document.querySelector('.auth-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  // Скрыть ошибку авторизации
  hideAuthError() {
    const errorElement = document.querySelector('.auth-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  // Получить текущего пользователя
  getCurrentUser() {
    return this.currentUser;
  }

  // Проверить, авторизован ли пользователь
  isUserAuthenticated() {
    return this.isAuthenticated;
  }
}

// Создаем экземпляр менеджера авторизации
const authManager = new AuthManager();

// Экспортируем функции для использования в других модулях
export function initAuth() {
  authManager.init();
}

export function getCurrentUser() {
  return authManager.getCurrentUser();
}

export function isAuthenticated() {
  return authManager.isUserAuthenticated();
}

export function logout() {
  authManager.logout();
} 