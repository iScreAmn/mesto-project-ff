import "./pages/index.css";
import "./blocks/theme/theme.css";
import avatarImage from "./images/avatar.jpg";
import { initialCards as importedInitialCards } from "./components/cards.js"; // Переименовываем для ясности
import { openModal, closeModal } from "./components/modal.js";
import { initThemeToggle } from "./components/theme.js";
import '@fortawesome/fontawesome-free/css/all.css';
import {
  createCardElement,
  handleLikeCard,
} from "./components/card.js";
import { saveProfileData, loadProfileData } from './data/storage.js';
import { initializePopupImageHandlers, openImagePopup } from './components/popup-image.js';

let currentCards = [...importedInitialCards]; // Объявляем и инициализируем currentCards в глобальной области видимости модуля

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', 'user_' + Math.random().toString(36).substr(2, 9));
  }
  initThemeToggle();

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
    const allFilled = inputsNew.every(input => input.value.trim() !== "");
    if (saveCardBtn) saveCardBtn.disabled = !allFilled;
    if (saveCardBtn) saveCardBtn.classList.toggle('disabled', !allFilled);
  }

  inputsNew.forEach(input => {
    input.addEventListener('input', toggleNewButton);
  });
  toggleNewButton();

  // Деактивировать кнопку "Сохранить" в форме обновления аватара
  const formAvatar = document.querySelector('.popup_type_avatar .popup__form');
  const saveAvatarBtn = formAvatar?.querySelector('.popup__button');
  const inputsAvatar = formAvatar ? Array.from(formAvatar.querySelectorAll('input[required]')) : [];

  function toggleAvatarButton() {
    const allFilled = inputsAvatar.every(input => input.value.trim() !== "");
    if (saveAvatarBtn) saveAvatarBtn.disabled = !allFilled;
    if (saveAvatarBtn) saveAvatarBtn.classList.toggle('disabled', !allFilled);
  }

  inputsAvatar.forEach(input => {
    input.addEventListener('input', toggleAvatarButton);
  });
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
    ...document.querySelectorAll(".nav-btn-theme, .nav-btn-profile, .theme-select-light, .theme-select-dark"),
  ];

  underlineTargets.forEach((btn) => {
    btn.addEventListener("click", () => {
      underlineTargets.forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // profile tab switching
  const profileTabs = [
    document.querySelector('.profile-tab-image'),
    document.querySelector('.profile-tab-favorites')
  ];

  // Set default active tab
  const defaultActiveTab = document.querySelector('.profile-tab-image');
  if (defaultActiveTab) {
    defaultActiveTab.classList.add('active');
  }

  profileTabs.forEach(tab => {
    if (!tab) return;
    tab.addEventListener('click', () => {
      profileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Вызов функции для добавления карточек на страницу при загрузке,
  // когда DOM гарантированно готов и currentCards доступна.
  renderCards(currentCards);
});

// Установите изображение как background-image
const profileImageDiv = document.querySelector(".profile__image");
profileImageDiv.style.backgroundImage = `url(${avatarImage})`;

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
const themeBtn = document.querySelector(".nav-btn-theme");
const profileBtn = document.querySelector(".nav-btn-profile");
const themeSubmenu = document.querySelector(".nav-submenu-theme");
const backBtn = document.querySelector(".nav-btn-back");
let cardToDelete = null; // Переменная для хранения карточки для удаления

// Функция для обработки удаления карточки из избранного на активной вкладке "Избранное"
function handleUnfavoriteFromActiveTab(cardLink) {
  currentCards = currentCards.filter(card => card.link !== cardLink);
}

// Функция для запроса на удаление карточки (открывает модальное окно)
function handleCardDeleteRequest(cardElementDOM) {
  cardToDelete = cardElementDOM; // cardElementDOM - это .places__item
  window.cardToDelete = cardElementDOM; // Также сохраняем в window для совместимости
  openModal(popupDelete);
}

// Функция для добавления карточек на страницу
function renderCards(cardsToRender) {
  placesList.innerHTML = ''; // Очищаем список перед рендерингом
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
// Начальный рендеринг карточек перенесен внутрь DOMContentLoaded

// Фильтрация по избранному и изображениям
// const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Эта переменная здесь больше не нужна в таком виде

const profileTabFavorites = document.querySelector('.profile-tab-favorites');
const profileTabImages = document.querySelector('.profile-tab-image');

if (profileTabFavorites) {
  profileTabFavorites.addEventListener('click', () => {
    const favLinks = JSON.parse(localStorage.getItem('favorites')) || [];
    // Фильтруем из currentCards
    const favoriteCards = currentCards.filter(card => favLinks.includes(card.link));
    renderCards(favoriteCards);
  });
}

if (profileTabImages) {
  profileTabImages.addEventListener('click', () => {
    renderCards(currentCards); // Отображаем currentCards
  });
}
// События для модального окна добавления
profileAddButton.addEventListener("click", () => openModal(popupNewCard));
closeButtonNewCard.addEventListener("click", () => closeModal(popupNewCard));
// Обработчик закрытия по оверлею для popupNewCard
popupNewCard.addEventListener("mousedown", (evt) => {
  if (evt.target === popupNewCard) {
    closeModal(popupNewCard);
  }
});

closeButtonAvatar.addEventListener("click", () => {
  // Очищаем форму при закрытии
  const avatarForm = popupAvatar.querySelector('.popup__form');
  if (avatarForm) {
    avatarForm.reset();
  }
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
    openModal(popupAvatar);
  });
}
if (burgerButton) {
  burgerButton.addEventListener("click", () => {
    burgerButton.classList.toggle("open");
  });
}

if (themeBtn && profileBtn && themeSubmenu && backBtn) {
  themeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileBtn.classList.add("hidden");
    themeBtn.classList.add("hidden");
    themeSubmenu.classList.add("visible");
  });

  backBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileBtn.classList.remove("hidden");
    themeBtn.classList.remove("hidden");
    themeSubmenu.classList.remove("visible");
  });
}

// profileBtn opens profile edit popup with filled values
if (profileBtn && popupEditProfile && profileEditButton) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const profileTitle = document.querySelector('.profile__title');
    const profileDescription = document.querySelector('.profile__description');
    const nameInput = popupEditProfile.querySelector('input[name="name"]');
    const descriptionInput = popupEditProfile.querySelector('input[name="description"]');
    nameInput.value = profileTitle.textContent;
    descriptionInput.value = profileDescription.textContent;
    openModal(popupEditProfile);
  });
}

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
    const linkInput = formNewCard.querySelector('input[name="link"]');

    const name = nameInput?.value.trim();
    const link = linkInput?.value.trim();

    if (!name || !link) {
      console.warn("Поля формы не должны быть пустыми.");
      return;
    }

    const newCardData = { name, link };

 

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

    closeModal(popupNewCard);
    evt.target.reset();
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
    if (window.cardToDelete) {
      const cardImageElement = window.cardToDelete.querySelector('.card__image');      
      if (cardImageElement) {
        const cardLinkToDelete = cardImageElement.src;

        // Удаляем из списка избранного
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favIndex = favorites.indexOf(cardLinkToDelete);
        if (favIndex !== -1) {
          favorites.splice(favIndex, 1);
          localStorage.setItem('favorites', JSON.stringify(favorites));
        }

        // Удаляем лайки
        localStorage.removeItem(`likes_${cardLinkToDelete}`);
        
        // Удаляем из текущего массива карточек
        currentCards = currentCards.filter(card => card.link !== cardLinkToDelete);
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
        renderCards(favoriteCardsToRender);
      } else if (isImagesTabActive) {
        renderCards(currentCards);
      }
    }
    closeModal(popupDelete);
  });
}
if (formAvatar) {
  formAvatar.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const linkInput = formAvatar.querySelector('input[name="link"]');
    const link = linkInput?.value.trim();

    if (!link) {
      console.warn("Поле ссылки не должно быть пустым.");
      return;
    }

    profileImageDiv.style.backgroundImage = `url(${link})`;

    saveProfileData({
      ...loadProfileData(),
      avatar: link
    });

    closeModal(popupAvatar);
    evt.target.reset();
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
    closeModal(popupAvatar);
  }
});
