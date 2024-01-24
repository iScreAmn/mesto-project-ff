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