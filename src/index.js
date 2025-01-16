// const firstImage = new URL('./images/card_1.jpg', import.meta.url);
// const secondImage = new URL('./images/card_2.jpg', import.meta.url);
// const thirdImage = new URL('./images/card_3.jpg', import.meta.url)

import './pages/index.css';
import avatarImage from './images/avatar.jpg';

// Установите изображение как background-image
const profileImageDiv = document.querySelector('.profile__image');
profileImageDiv.style.backgroundImage = `url(${avatarImage})`;

const initialCards = [
  {
    name: "Архыз",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/arkhyz.jpg",
  },
  {
    name: "Челябинск",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/chelyabinsk-oblast.jpg",
  },
  {
    name: "Иваново",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/ivanovo.jpg",
  },
  {
    name: "Камчатка",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kamchatka.jpg",
  },
  {
    name: "Холмогорский",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kholmogorsky-rayon.jpg",
  },
  {
    name: "Байкал",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/baikal.jpg",
  }
];

// Функция для создания элемента карточки
function createCard(name, link, handleDeleteCard) {
  const cardTemplate = document.querySelector('#card-template');
  const cardElement = cardTemplate.content.cloneNode(true);
  // Установка значений вложенных элементов
  const cardTitle = cardElement.querySelector('.card__title');
  const cardImage = cardElement.querySelector('.card__image');
  cardTitle.textContent = name;
  cardImage.src = link;
  cardImage.alt = name;
  // Добавление обработчика клика для удаления карточки
  const deleteButton = cardElement.querySelector('.card__delete-button');
  deleteButton.addEventListener('click', handleDeleteCard);
  return cardElement;
}
// Обработчик события для удаления карточки
function handleDeleteCard(event) {
  const cardElement = event.target.closest('.places__item');
  if (cardElement) {
      cardElement.remove();
  }
}
// Функция для добавления карточек на страницу
function renderCards(cards, handleDeleteCard) {
  const placesList = document.querySelector('.places__list');
  cards.forEach((cardData) => {
      const cardElement = createCard(cardData.name, cardData.link, handleDeleteCard);
      placesList.appendChild(cardElement);
  });
}
// Вызов функции для добавления карточек на страницу при загрузке
renderCards(initialCards, handleDeleteCard);