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
    name: "Switzerland",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/arkhyz.jpg",
  },
  {
    name: "Ukraine",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/chelyabinsk-oblast.jpg",
  },
  {
    name: "Serbia",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/ivanovo.jpg",
  },
  {
    name: "Norway",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kamchatka.jpg",
  },
  {
    name: "Poland",
    link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kholmogorsky-rayon.jpg",
  },
  {
    name: "Arctic",
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



// ADD BUTTON LOGIC

const addButton = document.querySelector('.profile__add-button'); // Кнопка для открытия
const popup = document.querySelector('.popup_type_new-card'); // Модальное окно для добавления
const addCloseButton = popup.querySelector('.popup__close'); // Кнопка закрытия для добавления
const editButton = document.querySelector('.profile__edit-button'); // Кнопка "Редактировать"
const editModal = document.querySelector('.popup_type_edit'); // Модальное окно редактирования
const editCloseButton = editModal.querySelector('.popup__close'); // Кнопка закрытия для редактирования

// Функция открытия модального окна для добавления
function openAddPopup() {
  popup.style.display = 'flex'; // Показываем модальное окно для добавления
}

// Функция закрытия модального окна для добавления
function closeAddPopup() {
  popup.style.display = 'none'; // Скрываем модальное окно для добавления
}

// События для модального окна добавления
addButton.addEventListener('click', openAddPopup); // Открытие при нажатии на кнопку добавления
addCloseButton.addEventListener('click', closeAddPopup); // Закрытие при нажатии на крестик

// Функция открытия модального окна для редактирования
function openEditPopup() {
  editModal.style.display = 'flex'; // Показываем модальное окно для редактирования
}

// Функция закрытия модального окна для редактирования
function closeEditPopup() {
  editModal.style.display = 'none'; // Скрываем модальное окно для редактирования
}

// События для модального окна редактирования
editButton.addEventListener('click', openEditPopup); // Открытие при нажатии на кнопку редактирования
editCloseButton.addEventListener('click', closeEditPopup); // Закрытие при нажатии на крестик