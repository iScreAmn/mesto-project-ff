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
  const favoriteButton = cardElement.querySelector('.card__favorite-button');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const isFavorited = favorites.includes(cardDetails.link);

  if (isFavorited) {
    favoriteButton.classList.add('is-favorited');
    favoriteButton.querySelector('i').classList.replace('fa-regular', 'fa-solid');
  }

  favoriteButton.addEventListener('click', () => {
    const index = favorites.indexOf(cardDetails.link);
    const isFavoritesTab = document.querySelector('.profile-tab-favorites')?.classList.contains('active');

    if (index !== -1) {
      favorites.splice(index, 1);
      favoriteButton.classList.remove('is-favorited');
      favoriteButton.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      if (isFavoritesTab) {
        cardElement.remove();
      }
    } else {
      favorites.push(cardDetails.link);
      favoriteButton.classList.add('is-favorited');
      favoriteButton.querySelector('i').classList.replace('fa-regular', 'fa-solid');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  });

  cardTitle.textContent = cardDetails.name;
  cardImage.src = cardDetails.link;
  cardImage.alt = cardDetails.name;

  const likeCountElement = cardElement.querySelector('.card__like-count');
  const storedLikes = JSON.parse(localStorage.getItem(`likes_${cardDetails.name}`)) || [];
  let likes = storedLikes;
  const userId = localStorage.getItem('userId') || 'defaultUser';

  function updateLikeDisplay() {
    const count = likes.length;

    if (count > 0) {
      likeCountElement.textContent = count;
      likeCountElement.style.display = 'block';
    } else {
      likeCountElement.style.display = 'none';
    }

    likeButton.classList.toggle('card__like-button_is-active', likes.includes(userId));
  }

  updateLikeDisplay();

  if (deleteButton) {
    deleteButton.addEventListener('click', onDeleteCard);
  }

  if (likeButton) {
    likeButton.addEventListener('click', () => {
      if (likes.includes(userId)) {
        likes = likes.filter(id => id !== userId);
      } else {
        likes.push(userId);
      }
      localStorage.setItem(`likes_${cardDetails.name}`, JSON.stringify(likes));
      updateLikeDisplay();
    });
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
