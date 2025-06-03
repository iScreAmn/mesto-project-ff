// Функция для создания элемента карточки
export function createCardElement(cardDetails, onDeleteCard, onLikeCard, onImageClick) {
  const cardTemplate = document.querySelector('#card-template');
  if (!cardTemplate) {
    console.error('Шаблон карточки #card-template не найден.');
    const errorElement = document.createElement('div');
    errorElement.textContent = 'Ошибка: Шаблон карточки не найден.';
    return errorElement;
  }

  const cardFragment = cardTemplate.content.cloneNode(true);
  const cardElement = cardFragment.querySelector('.places__item'); 
  
  if (!cardElement) {
    console.error('Элемент .places__item не найден в шаблоне карточки.');
    const errorElement = document.createElement('div');
    errorElement.textContent = 'Ошибка: Структура шаблона карточки неверна.';
    return errorElement;
  }

  const cardTitle = cardElement.querySelector('.card__title');
  const cardImage = cardElement.querySelector('.card__image');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');

  cardTitle.textContent = cardDetails.name;
  cardImage.src = cardDetails.link;
  cardImage.alt = cardDetails.name;

  if (deleteButton) {
    deleteButton.addEventListener('click', onDeleteCard);
  }

  if (likeButton) {
    likeButton.addEventListener('click', onLikeCard);
  }
  
  if (onImageClick && cardImage) {
    cardImage.addEventListener('click', () => {
      onImageClick(cardDetails.name, cardDetails.link);
    });
  }

  return cardElement;
}

// Обработчик события для удаления карточки
export function handleDeleteCard(event) {
  const cardItem = event.target.closest('.places__item');
  if (cardItem) {
    cardItem.remove();
  }
}

// Функция-обработчик события лайка карточки
export function handleLikeCard(event) {
  event.target.classList.toggle('card__like-button_is-active');
}
