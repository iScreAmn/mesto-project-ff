import "./pages/index.css";
import "./blocks/theme/theme.css";
import avatarImage from "./images/avatar.jpg";
import { initialCards } from "./components/cards.js";
import { openModal, closeModal } from "./components/modal.js";
import { initThemeToggle } from "./components/theme.js";
import '@fortawesome/fontawesome-free/css/all.css';
import {
  createCardElement,
  handleLikeCard,
} from "./components/card.js";
import { saveProfileData, loadProfileData } from './data/storage.js';

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  const savedProfile = loadProfileData();
  if (savedProfile) {
    const profileTitle = document.querySelector(".profile__title");
    const profileDescription = document.querySelector(".profile__description");
    profileTitle.textContent = savedProfile.name;
    profileDescription.textContent = savedProfile.description;
    if (savedProfile.avatar) {
      profileImageDiv.style.backgroundImage = `url(${savedProfile.avatar})`;
    }
  }
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

// Функция для добавления карточек на страницу
function renderCards(cards) {
  cards.forEach((cardData) => {
    const cardElement = createCardElement(
      cardData,
      null,
      handleLikeCard,
      openImagePopup
    );
    placesList.appendChild(cardElement);
  });
}
// Вызов функции для добавления карточек на страницу при загрузке
renderCards(initialCards);
// События для модального окна добавления
profileAddButton.addEventListener("click", () => openModal(popupNewCard));
closeButtonNewCard.addEventListener("click", () => closeModal(popupNewCard));
// Обработчик закрытия по оверлею для popupNewCard
popupNewCard.addEventListener("mousedown", (evt) => {
  if (evt.target === popupNewCard) {
    closeModal(popupNewCard);
  }
});

closeButtonAvatar.addEventListener("click", () => closeModal(popupAvatar));
closeButtonDelete.addEventListener("click", () => closeModal(popupDelete));
if (profileImage && popupAvatar) {
  profileImage.addEventListener("click", () => openModal(popupAvatar));
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

// Функция открытия модального окна изображения карточки
function openImagePopup(name, link) {
  if (popupImage) {
    const imageElement = popupImage.querySelector(".popup__image");
    const captionElement = popupImage.querySelector(".popup__caption");
    if (imageElement && captionElement) {
      imageElement.src = link;
      imageElement.alt = name;
      captionElement.textContent = name;
      openModal(popupImage);
    } else {
      console.error(
        "Элементы .popup__image или .popup__caption не найдены в попапе изображения."
      );
    }
  } else {
    console.error("Попап .popup_type_image не найден.");
  }
}

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
      null,
      handleLikeCard,
      openImagePopup
    );

    // Добавляем карточку в начало списка
    placesList.prepend(newCardElement);

    closeModal(popupNewCard);
    evt.target.reset();
  });
}

const formAvatar = popupAvatar.querySelector(".popup__form");

const formDelete = popupDelete.querySelector(".popup__form");
const confirmDeleteButton = popupDelete.querySelector(".popup__button-delete");
let cardToDelete = null;

// При клике на иконку удаления — сохранить карточку в переменную
placesList.addEventListener("click", (evt) => {
  if (evt.target.classList.contains("card__delete-button")) {
    cardToDelete = evt.target.closest(".card");
    openModal(popupDelete);
  }
});

// Подтверждение удаления
if (confirmDeleteButton) {
  confirmDeleteButton.addEventListener("click", () => {
    if (cardToDelete) {
      cardToDelete.remove();
      cardToDelete = null;
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
