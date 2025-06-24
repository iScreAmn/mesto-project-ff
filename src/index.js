import "./pages/index.css";
import "./blocks/theme/theme.css";
import "./blocks/auth/auth.css";
import avatarImage from "./images/avatar.jpg";
import mestoImage from "./images/mesto_image.png";
import { initialCards as importedInitialCards } from "./components/cards.js"; // Переименовываем для ясности
import { openModal, closeModal } from "./components/modal.js";
import { initThemeToggle } from "./components/theme.js";
import { initI18n, switchLanguage } from "./components/i18n.js";
import { initAuth, isAuthenticated } from "./components/auth.js";
import { initFileUpload, getImageBase64, hasFile, resetFileUpload } from "./components/file-upload.js";
import { lockScroll, unlockScroll } from "./components/scroll-lock.js";
import '@fortawesome/fontawesome-free/css/all.css';
import {
  createCardElement,
  createTrashCardElement,
  handleLikeCard,
} from "./components/card.js";
import { saveProfileData, loadProfileData, saveCards, loadCards, saveTrashCards, loadTrashCards, getStorageSize, getAvailableSpace, cleanupOldData, clearTrashCards } from './data/storage.js';
import { initializePopupImageHandlers, openImagePopup } from './components/popup-image.js';

// Загружаем карточки из localStorage, если есть, иначе используем начальные
const savedCards = loadCards();
let currentCards = savedCards.length > 0 ? savedCards : [...importedInitialCards];

// Загружаем корзину
let trashCards = loadTrashCards();

document.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', 'user_' + Math.random().toString(36).substr(2, 9));
  }
  
  // Проверяем состояние хранилища при загрузке
  const storageSize = getStorageSize();
  const availableSpace = getAvailableSpace();
  console.log(`📊 Использование localStorage: ${(storageSize / 1024).toFixed(1)} KB`);
  console.log(`📊 Доступно места: ${(availableSpace / 1024).toFixed(1)} KB`);
  
  // Предупреждаем если места мало
  if (availableSpace < 1024 * 1024) { // Меньше 1MB
    console.warn('⚠️ Мало места в localStorage, рекомендуется очистка');
  }
  
  // Инициализируем системы
  initThemeToggle();
  await initI18n();
  initAuth();
  
  // Сделаем switchLanguage глобальной функцией для доступа из других модулей
  window.switchLanguage = switchLanguage;

  // Инициализация обработчиков для попапа изображения
  const popupImage = document.querySelector('.popup_type_image');
  if (popupImage) {
    initializePopupImageHandlers(popupImage);
  }

  // Деактивировать кнопку "Сохранить" в форме редактирования профиля, пока все поля не заполнены
  const formEdit = document.querySelector('.popup_type_edit .popup__form');
  const saveProfileBtn = formEdit?.querySelector('.popup__button');
  const inputsEdit = formEdit ? Array.from(formEdit.querySelectorAll('input[required]')) : [];

  function toggleEditButton() {
    const allFilled = inputsEdit.every(input => input.value.trim() !== "");
    if (saveProfileBtn) saveProfileBtn.disabled = !allFilled;
    if (saveProfileBtn) saveProfileBtn.classList.toggle('disabled', !allFilled);
  }

  inputsEdit.forEach(input => {
    input.addEventListener('input', toggleEditButton);
  });
  toggleEditButton();

  // Деактивировать кнопку "Сохранить" в форме добавления карточки
  const formNew = document.querySelector('.popup_type_new-card .popup__form');
  const saveCardBtn = formNew?.querySelector('.popup__button');
  const inputsNew = formNew ? Array.from(formNew.querySelectorAll('input[required]')) : [];

  function toggleNewButton() {
    const nameInput = formNew?.querySelector('input[name="place-name"]');
    const imageInput = formNew?.querySelector('input[name="image-file"]');
    
    const nameValid = nameInput?.value.trim() !== "";
    const imageValid = imageInput?.files.length > 0;
    const allValid = nameValid && imageValid;
    
    if (saveCardBtn) saveCardBtn.disabled = !allValid;
    if (saveCardBtn) saveCardBtn.classList.toggle('disabled', !allValid);
  }

  // Обработчик для текстового поля
  const nameInput = formNew?.querySelector('input[name="place-name"]');
  if (nameInput) {
    nameInput.addEventListener('input', toggleNewButton);
  }
  
  // Обработчик для файлового поля убран - используется встроенная логика в file-upload.js
  
  toggleNewButton();

  // Деактивировать кнопку "Сохранить" в форме обновления аватара
  const formAvatar = document.querySelector('.popup_type_avatar .popup__form');
  const saveAvatarBtn = formAvatar?.querySelector('.popup__button');

  function toggleAvatarButton() {
    const avatarInput = formAvatar?.querySelector('input[name="avatar-file"]');
    const avatarValid = avatarInput?.files.length > 0;
    
    if (saveAvatarBtn) saveAvatarBtn.disabled = !avatarValid;
    if (saveAvatarBtn) saveAvatarBtn.classList.toggle('disabled', !avatarValid);
  }

  // Обработчик для файлового поля аватара убран - используется встроенная логика в file-upload.js
  
  toggleAvatarButton();

  // Стилизация отключённой кнопки при загрузке
  if (saveProfileBtn) {
    saveProfileBtn.classList.toggle('disabled', saveProfileBtn.disabled);
  }
  if (saveCardBtn) {
    saveCardBtn.classList.toggle('disabled', saveCardBtn.disabled);
  }
  if (saveAvatarBtn) {
    saveAvatarBtn.classList.toggle('disabled', saveAvatarBtn.disabled);
  }

  const savedProfile = loadProfileData();
  if (savedProfile) {
    const profileTitle = document.querySelector(".profile__title");
    const profileDescription = document.querySelector(".profile__description");
    if (savedProfile.name) profileTitle.textContent = savedProfile.name;
    if (savedProfile.description) profileDescription.textContent = savedProfile.description;
    if (savedProfile.avatar) {
      profileImageDiv.style.backgroundImage = `url(${savedProfile.avatar})`;
    }
  }

  // underline nav/profile/theme
  const underlineTargets = [
    ...document.querySelectorAll(".nav-btn-profile"),
  ];

  underlineTargets.forEach((btn) => {
    btn.addEventListener("click", () => {
      underlineTargets.forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // profile tab switching with smooth animation
  const profileTabs = [
    document.querySelector('.profile-tab-image'),
    document.querySelector('.profile-tab-favorites')
  ];

  // Set default active tab and reset to images on page load
  const profileTabImage = document.querySelector('.profile-tab-image');
  const profileTabFavs = document.querySelector('.profile-tab-favorites');
  
  // Всегда сбрасываем на вкладку изображений при загрузке страницы
  if (profileTabImage && profileTabFavs) {
    profileTabFavs.classList.remove('active');
    profileTabImage.classList.add('active');
  }

  profileTabs.forEach(tab => {
    if (!tab) return;
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Убираем активный класс со всех вкладок
      profileTabs.forEach(t => t.classList.remove('active'));
      
      // Добавляем активный класс к нажатой вкладке сразу
      tab.classList.add('active');
    });
  });

  // Инициализируем контент только для авторизованных пользователей
  if (isAuthenticated()) {
    initFileUpload();
    
    // Вызов функции для добавления карточек на страницу при загрузке,
    // когда DOM гарантированно готов и currentCards доступна.
    renderCards(currentCards, false, true);
    
    // Если это первый запуск (карточки загружены из начальных данных), сохраняем их
    if (savedCards.length === 0 && currentCards.length > 0) {
      saveCards(currentCards);
    }
    
    // Обновляем состояние кнопок форм после инициализации
    toggleNewButton();
    toggleAvatarButton();
  }
});

// Функция для переинициализации footer переключателей языка
window.reinitFooterLanguageSwitchers = function() {
  const footerSwitches = document.querySelectorAll('.footer__language-switch');
  
  footerSwitches.forEach(switchElement => {
    const dropdownBtn = switchElement.querySelector('.footer__lang-dropdown-btn');
    const options = switchElement.querySelectorAll('.footer__lang-option');
    
    // Клонируем элементы для удаления старых обработчиков
    if (dropdownBtn) {
      const newDropdownBtn = dropdownBtn.cloneNode(true);
      dropdownBtn.parentNode.replaceChild(newDropdownBtn, dropdownBtn);
      
      newDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchElement.classList.toggle('open');
      });
    }
    
    options.forEach(option => {
      const newOption = option.cloneNode(true);
      option.parentNode.replaceChild(newOption, option);
      
      newOption.addEventListener('click', (e) => {
        e.stopPropagation();
        const language = newOption.getAttribute('data-lang');
        switchLanguage(language);
        switchElement.classList.remove('open');
      });
    });
  });
  
  // Переинициализируем глобальный обработчик закрытия
  document.addEventListener('click', () => {
    footerSwitches.forEach(switchElement => {
      switchElement.classList.remove('open');
    });
  });
};

// Функция для инициализации главного контента после авторизации
window.initMainAppContent = function() {
  // Файловые загрузки уже инициализированы в основном DOMContentLoaded
  
  // Вызов функции для добавления карточек на страницу
  renderCards(currentCards, false, true);
  
  // Если это первый запуск (карточки загружены из начальных данных), сохраняем их
  const savedCards = loadCards();
  if (savedCards.length === 0 && currentCards.length > 0) {
    saveCards(currentCards);
  }
  
  // Обновляем состояние кнопок форм
  const toggleNewButton = () => {
    const formNew = document.querySelector('.popup_type_new-card .popup__form');
    const saveCardBtn = formNew?.querySelector('.popup__button');
    const nameInput = formNew?.querySelector('input[name="place-name"]');
    const imageInput = formNew?.querySelector('input[name="image-file"]');
    
    const nameValid = nameInput?.value.trim() !== "";
    const imageValid = imageInput?.files.length > 0;
    const allValid = nameValid && imageValid;
    
    if (saveCardBtn) saveCardBtn.disabled = !allValid;
    if (saveCardBtn) saveCardBtn.classList.toggle('disabled', !allValid);
  };
  
  const toggleAvatarButton = () => {
    const formAvatar = document.querySelector('.popup_type_avatar .popup__form');
    const saveAvatarBtn = formAvatar?.querySelector('.popup__button');
    const avatarInput = formAvatar?.querySelector('input[name="avatar-file"]');
    const avatarValid = avatarInput?.files.length > 0;
    
    if (saveAvatarBtn) saveAvatarBtn.disabled = !avatarValid;
    if (saveAvatarBtn) saveAvatarBtn.classList.toggle('disabled', !avatarValid);
  };
  
  toggleNewButton();
  toggleAvatarButton();
  
  // Делаем функции валидации глобально доступными
  window.toggleNewButton = toggleNewButton;
  window.toggleAvatarButton = toggleAvatarButton;
};

// Установите изображение как background-image
const profileImageDiv = document.querySelector(".profile__image");
profileImageDiv.style.backgroundImage = `url(${avatarImage})`;

// Установите изображение для auth mockup
const mestoMockupImage = document.querySelector("#mesto-mockup-image");
if (mestoMockupImage) {
  mestoMockupImage.src = mestoImage;
}

// DOM-элементы
const placesList = document.querySelector(".places__list");
const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");
const profileImage = document.querySelector(".profile__image");

const popupEditProfile = document.querySelector(".popup_type_edit");
const popupNewCard = document.querySelector(".popup_type_new-card");
const popupImage = document.querySelector(".popup_type_image");
const popupAvatar = document.querySelector(".popup_type_avatar");
const popupDelete = document.querySelector(".popup_type_delete");

const closeButtonEditProfile = popupEditProfile.querySelector(".popup__close");
const closeButtonNewCard = popupNewCard.querySelector(".popup__close");
const closeButtonImage = popupImage
  ? popupImage.querySelector(".popup__close")
  : null;
const closeButtonAvatar = popupAvatar.querySelector(".popup__close");
const closeButtonDelete = popupDelete.querySelector(".popup__close");
const burgerButton = document.querySelector(".navigation__button");
const dropdownOverlay = document.querySelector(".dropdown-overlay");
const dropdownClose = document.querySelector(".dropdown-close");
const navItemProfile = document.querySelector(".nav-item-profile");
let cardToDelete = null; // Переменная для хранения карточки для удаления

// Функция для обработки удаления карточки из избранного на активной вкладке "Избранное"
function handleUnfavoriteFromActiveTab(cardLink) {
  currentCards = currentCards.filter(card => card.link !== cardLink);
  // Сохраняем обновленный список карточек в localStorage
  saveCards(currentCards);
  
  // Если активна вкладка избранного, перерисовываем её
  const isFavoritesTabActive = profileTabFavorites?.classList.contains('active');
  if (isFavoritesTabActive) {
    const favLinks = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteCards = currentCards.filter(card => favLinks.includes(card.link));
    renderCards(favoriteCards, true);
  }
}

// Функция для запроса на удаление карточки (открывает модальное окно)
function handleCardDeleteRequest(cardElementDOM) {
  cardToDelete = cardElementDOM; // cardElementDOM - это .places__item
  window.cardToDelete = cardElementDOM; // Также сохраняем в window для совместимости
  openModal(popupDelete);
}

// Функция для добавления карточек на страницу
function renderCards(cardsToRender, isFromFavorites = false, isMainTab = false) {
  placesList.innerHTML = ''; // Очищаем список перед рендерингом
  
  // Если это вкладка избранного и карточек нет, показываем плейсхолдер
  if (isFromFavorites && cardsToRender.length === 0) {
    const emptyPlaceholder = document.createElement('div');
    emptyPlaceholder.className = 'favorites-empty-placeholder';
    emptyPlaceholder.innerHTML = `
      <i class="fa-regular fa-bookmark favorites-empty-icon"></i>
      <p class="favorites-empty-text">Добавьте изображение в избранное</p>
    `;
    placesList.appendChild(emptyPlaceholder);
    return;
  }
  
  // Если это основная вкладка и карточек нет, показываем плейсхолдер с кнопкой добавления
  if (isMainTab && cardsToRender.length === 0) {
    const emptyPlaceholder = document.createElement('div');
    emptyPlaceholder.className = 'main-empty-placeholder';
    emptyPlaceholder.innerHTML = `
      <i class="fa-regular fa-images main-empty-icon"></i>
      <p class="main-empty-text">Начните добавлять ваш контент</p>
      <button class="main-empty-add-button" type="button">
        <i class="fa-solid fa-plus"></i>
      </button>
    `;
    placesList.appendChild(emptyPlaceholder);
    
    // Добавляем обработчик клика на кнопку в плейсхолдере
    const addButton = emptyPlaceholder.querySelector('.main-empty-add-button');
    addButton.addEventListener('click', () => {
      openModal(popupNewCard);
    });
    
    return;
  }
  
  cardsToRender.forEach((cardData) => {
    const cardElement = createCardElement(
      cardData,
      handleCardDeleteRequest, // Передаем обработчик запроса на удаление
      handleLikeCard,
      openImagePopup,
      handleUnfavoriteFromActiveTab // Передаем новый обработчик
    );
    placesList.appendChild(cardElement);
  });
}

// Функция для отображения карточек из корзины
function renderTrashCards(trashCardsToRender) {
  placesList.innerHTML = ''; // Очищаем список перед рендерингом
  
  // Если корзина пуста, показываем плейсхолдер
  if (trashCardsToRender.length === 0) {
    const emptyPlaceholder = document.createElement('div');
    emptyPlaceholder.className = 'trash-empty-placeholder';
    emptyPlaceholder.innerHTML = `
      <i class="fa-regular fa-trash-can trash-empty-icon"></i>
      <p class="trash-empty-text">Здесь будет удаленный контент</p>
    `;
    placesList.appendChild(emptyPlaceholder);
    return;
  }
  
  trashCardsToRender.forEach((cardData) => {
    const cardElement = createTrashCardElement(
      cardData,
      handleRestoreCard, // Передаем обработчик восстановления
      handlePermanentDeleteRequest // Передаем обработчик окончательного удаления
    );
    placesList.appendChild(cardElement);
  });
}

// Функция для перемещения карточки в корзину
function moveCardToTrash(cardData) {
  // Добавляем дату удаления
  cardData.deletedAt = new Date().toISOString();
  
  // Добавляем в корзину
  trashCards.unshift(cardData);
  saveTrashCards(trashCards);
  
  // Удаляем из основного списка
  currentCards = currentCards.filter(card => card.link !== cardData.link);
  saveCards(currentCards);
  
  console.log(`🗑️ Карточка "${cardData.name}" перемещена в корзину`);
}

// Функция для восстановления карточки из корзины
function handleRestoreCard(cardData, cardElement) {
  // Удаляем из корзины
  trashCards = trashCards.filter(card => card.link !== cardData.link);
  saveTrashCards(trashCards);
  
  // Очищаем дату удаления
  delete cardData.deletedAt;
  
  // Добавляем обратно в основной список
  currentCards.unshift(cardData);
  saveCards(currentCards);
  
  // Удаляем элемент из DOM
  cardElement.remove();
  
  // Перерисовываем корзину
  renderTrashCards(trashCards);
  
  console.log(`♻️ Карточка "${cardData.name}" восстановлена из корзины`);
}

// Функция для запроса окончательного удаления карточки из корзины
function handlePermanentDeleteRequest(cardData, cardElement) {
  // Сохраняем данные для использования в обработчике подтверждения
  window.permanentDeleteCardData = cardData;
  window.permanentDeleteCardElement = cardElement;
  
  // Открываем модальное окно подтверждения удаления
  const popupDelete = document.querySelector('.popup_type_delete');
  openModal(popupDelete);
}

// Функция для окончательного удаления карточки из корзины
function permanentDeleteCard(cardData, cardElement) {
  // Удаляем из корзины
  trashCards = trashCards.filter(card => card.link !== cardData.link);
  saveTrashCards(trashCards);
  
  // Удаляем все связанные данные из localStorage
  localStorage.removeItem(`likes_${cardData.link}`);
  
  // Также удаляем из избранного если была там
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favIndex = favorites.indexOf(cardData.link);
  if (favIndex !== -1) {
    favorites.splice(favIndex, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  // Удаляем элемент из DOM
  cardElement.remove();
  
  // Перерисовываем корзину
  renderTrashCards(trashCards);
  
  console.log(`🗑️ Карточка "${cardData.name}" окончательно удалена`);
}
// Начальный рендеринг карточек перенесен внутрь DOMContentLoaded

// Фильтрация по избранному и изображениям
// const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Эта переменная здесь больше не нужна в таком виде

const profileTabFavorites = document.querySelector('.profile-tab-favorites');
const profileTabImages = document.querySelector('.profile-tab-image');
const profileTabTrash = document.querySelector('.profile-tab-trash');

if (profileTabFavorites) {
  profileTabFavorites.addEventListener('click', () => {
    // Переключаем активную вкладку
    document.querySelector('.profile-tab-image').classList.remove('active');
    document.querySelector('.profile-tab-trash').classList.remove('active');
    profileTabFavorites.classList.add('active');
    
    const favLinks = JSON.parse(localStorage.getItem('favorites')) || [];
    // Фильтруем из currentCards
    const favoriteCards = currentCards.filter(card => favLinks.includes(card.link));
    renderCards(favoriteCards, true); // Передаем флаг isFromFavorites = true
  });
}

if (profileTabImages) {
  profileTabImages.addEventListener('click', () => {
    // Переключаем активную вкладку
    document.querySelector('.profile-tab-favorites').classList.remove('active');
    document.querySelector('.profile-tab-trash').classList.remove('active');
    profileTabImages.classList.add('active');
    
    renderCards(currentCards, false, true); // Передаем флаг isMainTab = true
  });
}

if (profileTabTrash) {
  profileTabTrash.addEventListener('click', () => {
    // Переключаем активную вкладку
    document.querySelector('.profile-tab-image').classList.remove('active');
    document.querySelector('.profile-tab-favorites').classList.remove('active');
    profileTabTrash.classList.add('active');
    
    renderTrashCards(trashCards); // Отображаем карточки из корзины
  });
}
// События для модального окна добавления
profileAddButton.addEventListener("click", () => openModal(popupNewCard));
closeButtonNewCard.addEventListener("click", () => {
  // Очищаем форму при закрытии
  const newCardForm = popupNewCard.querySelector('.popup__form');
  if (newCardForm) {
    newCardForm.reset();
  }
  
  // Сбрасываем состояние загрузчика файлов
  resetFileUpload('place-image-upload');
  
  closeModal(popupNewCard);
});
// Обработчик закрытия по оверлею для popupNewCard
popupNewCard.addEventListener("mousedown", (evt) => {
  if (evt.target === popupNewCard) {
    // Очищаем форму при закрытии
    const newCardForm = popupNewCard.querySelector('.popup__form');
    if (newCardForm) {
      newCardForm.reset();
    }
    
    // Сбрасываем состояние загрузчика файлов
    resetFileUpload('place-image-upload');
    
    closeModal(popupNewCard);
  }
});

closeButtonAvatar.addEventListener("click", () => {
  // Очищаем форму при закрытии
  const avatarForm = popupAvatar.querySelector('.popup__form');
  if (avatarForm) {
    avatarForm.reset();
  }
  
  // Сбрасываем состояние загрузчика файлов
  resetFileUpload('avatar-upload');
  
  closeModal(popupAvatar);
});
closeButtonDelete.addEventListener("click", () => closeModal(popupDelete));
if (profileImage && popupAvatar) {
  profileImage.addEventListener("click", () => {
    // Очищаем форму при открытии
    const avatarForm = popupAvatar.querySelector('.popup__form');
    if (avatarForm) {
      avatarForm.reset();
      // Деактивируем кнопку после сброса формы
      const saveAvatarBtn = avatarForm.querySelector('.popup__button');
      if (saveAvatarBtn) {
        saveAvatarBtn.disabled = true;
        saveAvatarBtn.classList.add('disabled');
      }
    }
    
    // Сбрасываем состояние загрузчика файлов
    resetFileUpload('avatar-upload');
    
    openModal(popupAvatar);
  });
}
// Современное выпадающее меню
if (burgerButton && dropdownOverlay) {
  // Открытие меню
  burgerButton.addEventListener("click", (e) => {
    e.stopPropagation();
    burgerButton.classList.toggle("open");
    dropdownOverlay.classList.toggle("open");
    
    // Используем централизованное управление скроллом
    if (dropdownOverlay.classList.contains("open")) {
      lockScroll();
    } else {
      unlockScroll();
    }
  });

  // Закрытие меню по клику на кнопку закрытия
  if (dropdownClose) {
    dropdownClose.addEventListener("click", () => {
      closeDropdownMenu();
    });
  }

  // Закрытие меню по клику на оверлей
  dropdownOverlay.addEventListener("click", (e) => {
    if (e.target === dropdownOverlay) {
      closeDropdownMenu();
    }
  });

  // Закрытие меню по ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdownOverlay.classList.contains("open")) {
      closeDropdownMenu();
    }
  });
}

// Функция закрытия меню
function closeDropdownMenu() {
  const burgerButtonElement = document.querySelector('.navigation__button');
  const dropdownOverlayElement = document.querySelector('.dropdown-overlay');
  
  if (burgerButtonElement) {
    burgerButtonElement.classList.remove("open");
  }
  if (dropdownOverlayElement) {
    dropdownOverlayElement.classList.remove("open");
  }
  
  // Закрываем подменю темы, если оно есть
  const themeSubmenu = document.querySelector(".nav-submenu-theme");
  if (themeSubmenu) {
    themeSubmenu.classList.remove("open");
  }
  
  // Закрываем подменю языка, если оно есть
  const languageSubmenu = document.querySelector(".nav-submenu-language");
  if (languageSubmenu) {
    languageSubmenu.classList.remove("open");
  }
  
  // Используем централизованное управление скроллом
  if (typeof unlockScroll === 'function') {
    unlockScroll();
  }
}

// Делаем функцию глобально доступной
window.closeDropdownMenu = closeDropdownMenu;

// Глобальная функция для рендеринга пустой вкладки избранного
window.renderEmptyFavorites = function() {
  renderCards([], true);
};

// Обработчики навигации
if (navItemProfile) {
  navItemProfile.addEventListener("click", () => {
    // Открываем попап редактирования профиля
    const profileTitle = document.querySelector(".profile__title");
    const profileDescription = document.querySelector(".profile__description");
    const nameInput = popupEditProfile.querySelector('input[name="name"]');
    const descriptionInput = popupEditProfile.querySelector('input[name="description"]');
    nameInput.value = profileTitle.textContent;
    descriptionInput.value = profileDescription.textContent;
    
    closeDropdownMenu();
    openModal(popupEditProfile);
  });
}

// Обработчик для очистки хранилища
const navItemStorage = document.querySelector('.nav-item-storage');
if (navItemStorage) {
  navItemStorage.addEventListener("click", () => {
    closeDropdownMenu();
    
    const currentSize = getStorageSize();
    const availableSpace = getAvailableSpace();
    
    const message = `Текущее использование: ${(currentSize / 1024).toFixed(1)} KB\nДоступно места: ${(availableSpace / 1024).toFixed(1)} KB\n\nОчистить старые данные?`;
    
    if (confirm(message)) {
      cleanupOldData();
      
      // Показываем результат
      const newSize = getStorageSize();
      const freed = currentSize - newSize;
      
      if (freed > 0) {
        alert(`Освобождено ${(freed / 1024).toFixed(1)} KB места!`);
      } else {
        alert('Нет данных для очистки.');
      }
      
      console.log(`🧹 Очистка завершена. Освобождено: ${(freed / 1024).toFixed(1)} KB`);
    }
  });
}

// Старый обработчик profileBtn удален, используется новый в dropdown menu

// События для модального окна редактирования
profileEditButton.addEventListener("click", () => {
  const profileTitle = document.querySelector(".profile__title");
  const profileDescription = document.querySelector(".profile__description");
  const nameInput = popupEditProfile.querySelector('input[name="name"]');
  const descriptionInput = popupEditProfile.querySelector('input[name="description"]');
  nameInput.value = profileTitle.textContent;
  descriptionInput.value = profileDescription.textContent;
  openModal(popupEditProfile);
});
closeButtonEditProfile.addEventListener("click", () =>
  closeModal(popupEditProfile)
);

// Функция openImagePopup теперь импортируется из popup-image.js

if (closeButtonImage) {
  closeButtonImage.addEventListener("click", () => closeModal(popupImage));
}

// Обработчики отправки форм (заготовки)
const formEditProfile = popupEditProfile.querySelector(".popup__form");
if (formEditProfile) {
  formEditProfile.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const nameInput = formEditProfile.querySelector('input[name="name"]');
    const descriptionInput = formEditProfile.querySelector('input[name="description"]');
    const profileTitle = document.querySelector(".profile__title");
    const profileDescription = document.querySelector(".profile__description");
    profileTitle.textContent = nameInput.value;
    profileDescription.textContent = descriptionInput.value;
    saveProfileData({
      ...loadProfileData(),
      name: nameInput.value,
      description: descriptionInput.value
    });
    closeModal(popupEditProfile);
  });
}

const formNewCard = popupNewCard.querySelector(".popup__form");
if (formNewCard) {
  formNewCard.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const nameInput = formNewCard.querySelector('input[name="place-name"]');
    const name = nameInput?.value.trim();
    
    // Получаем base64 изображения
    const imageBase64 = getImageBase64('place-image-upload');

    if (!name || !imageBase64) {
      console.warn("Поля формы не должны быть пустыми.");
      return;
    }

    const newCardData = { name, link: imageBase64 };

    // Создание новой карточки с использованием готовой функции
    const newCardElement = createCardElement(
      newCardData,
      handleCardDeleteRequest, // Передаем обработчик запроса на удаление
      handleLikeCard,
      openImagePopup,
      handleUnfavoriteFromActiveTab // Передаем новый обработчик
    );

    // Добавляем карточку в начало списка
    placesList.prepend(newCardElement);
    currentCards.unshift(newCardData); // Обновляем currentCards
    
    // Сохраняем обновленный список карточек в localStorage
    saveCards(currentCards);

    // Если активна основная вкладка, перерисовываем её для обновления плейсхолдера
    const isImagesTabActive = profileTabImages?.classList.contains('active');
    if (isImagesTabActive) {
      renderCards(currentCards, false, true);
    }

    closeModal(popupNewCard);
    evt.target.reset();
    
    // Сбрасываем состояние загрузчика файлов
    resetFileUpload('place-image-upload');
  });
}

const formAvatar = popupAvatar.querySelector(".popup__form");
const formDelete = popupDelete.querySelector(".popup__form");
const confirmDeleteButton = popupDelete.querySelector(".popup__button-delete");
let cardLinkToDelete = null; // Теперь cardLinkToDelete хранит ссылку на удаляемое изображение

// При клике на иконку удаления — сохранить карточку в переменную
placesList.addEventListener("click", (evt) => {
  if (evt.target.classList.contains("card__delete-button")) {
    const cardElement = evt.target.closest(".places__item");
    if (cardElement) {
      cardLinkToDelete = cardElement.querySelector('.card__image').src; // Сохраняем ссылку на изображение
      cardToDelete = cardElement; // Сохраняем карточку для глобального доступа
      window.cardToDelete = cardElement; // Также сохраняем в window для совместимости
      handleCardDeleteRequest(cardElement);
    }
  }
});

// Подтверждение удаления
if (confirmDeleteButton) {
  confirmDeleteButton.addEventListener("click", () => {
    // Проверяем, какой тип удаления: из корзины или обычное
    if (window.permanentDeleteCardData && window.permanentDeleteCardElement) {
      // Окончательное удаление из корзины
      permanentDeleteCard(window.permanentDeleteCardData, window.permanentDeleteCardElement);
      
      // Очищаем временные данные
      window.permanentDeleteCardData = null;
      window.permanentDeleteCardElement = null;
      
    } else if (window.cardToDelete) {
      // Обычное удаление (перемещение в корзину)
      const cardImageElement = window.cardToDelete.querySelector('.card__image');      
      if (cardImageElement) {
        const cardLinkToDelete = cardImageElement.src;
        
        // Находим данные карточки
        const cardData = currentCards.find(card => card.link === cardLinkToDelete);
        if (cardData) {
          // Перемещаем в корзину вместо окончательного удаления
          moveCardToTrash(cardData);

          // Удаляем из списка избранного
          let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
          const favIndex = favorites.indexOf(cardLinkToDelete);
          if (favIndex !== -1) {
            favorites.splice(favIndex, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
          }

          // Лайки оставляем, они могут понадобиться при восстановлении
          // localStorage.removeItem(`likes_${cardLinkToDelete}`);
        }
      }
      
      // Удаляем DOM-элемент карточки
      window.cardToDelete.remove();
      window.cardToDelete = null;
      window.cardLinkToDelete = null;

      // Закрываем попап изображения, если он открыт
      const imagePopup = document.querySelector('.popup_type_image');
      if (imagePopup && imagePopup.classList.contains('popup_is-opened')) {
        closeModal(imagePopup);
      }

      // Перерисовываем активную вкладку
      const isFavoritesTabActive = profileTabFavorites?.classList.contains('active');
      const isImagesTabActive = profileTabImages?.classList.contains('active');

      if (isFavoritesTabActive) {
        const currentLocalFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoriteCardsToRender = currentCards.filter(card => currentLocalFavorites.includes(card.link));
        renderCards(favoriteCardsToRender, true); // Передаем флаг isFromFavorites = true
      } else if (isImagesTabActive) {
        renderCards(currentCards, false, true);
      }
    }
    closeModal(popupDelete);
  });
}
if (formAvatar) {
  formAvatar.addEventListener("submit", (evt) => {
    evt.preventDefault();

    // Получаем base64 аватара
    const avatarBase64 = getImageBase64('avatar-upload');

    if (!avatarBase64) {
      console.warn("Необходимо выбрать изображение для аватара.");
      return;
    }

    profileImageDiv.style.backgroundImage = `url(${avatarBase64})`;

    saveProfileData({
      ...loadProfileData(),
      avatar: avatarBase64
    });

    closeModal(popupAvatar);
    evt.target.reset();
    
    // Сбрасываем состояние загрузчика файлов
    resetFileUpload('avatar-upload');
  });
}

// Обработчик закрытия по оверлею для popupAvatar
popupAvatar.addEventListener("mousedown", (evt) => {
  if (evt.target === popupAvatar) {
    // Очищаем форму при закрытии
    const avatarForm = popupAvatar.querySelector('.popup__form');
    if (avatarForm) {
      avatarForm.reset();
    }
    
    // Сбрасываем состояние загрузчика файлов
    resetFileUpload('avatar-upload');
    
    closeModal(popupAvatar);
  }
});
