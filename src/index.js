import "./pages/index.css";
import "./blocks/theme/theme.css";
import avatarImage from "./images/avatar.jpg";
import { initialCards } from "./components/cards.js";
import { openModal, closeModal } from "./components/modal.js";
import { initThemeToggle } from "./components/theme.js";
import {
  createCardElement,
  handleDeleteCard,
  handleLikeCard,
} from "./components/card.js";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
});

// Установите изображение как background-image
const profileImageDiv = document.querySelector(".profile__image");
profileImageDiv.style.backgroundImage = `url(${avatarImage})`;

// DOM-элементы
const placesList = document.querySelector(".places__list");
const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");

const popupEditProfile = document.querySelector(".popup_type_edit");
const popupNewCard = document.querySelector(".popup_type_new-card");
const popupImage = document.querySelector(".popup_type_image");

const closeButtonEditProfile = popupEditProfile.querySelector(".popup__close");
const closeButtonNewCard = popupNewCard.querySelector(".popup__close");
const closeButtonImage = popupImage
  ? popupImage.querySelector(".popup__close")
  : null;

// Функция для добавления карточек на страницу
function renderCards(cards) {
  cards.forEach((cardData) => {
    const cardElement = createCardElement(
      cardData,
      handleDeleteCard,
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

// События для модального окна редактирования
profileEditButton.addEventListener("click", () => {
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

    closeModal(popupEditProfile);
  });
}

const formNewCard = popupNewCard.querySelector(".popup__form");
if (formNewCard) {
  formNewCard.addEventListener("submit", (evt) => {
    evt.preventDefault();

    closeModal(popupNewCard);
    evt.target.reset(); // Очистка формы
  });
}
