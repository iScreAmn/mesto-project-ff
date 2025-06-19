import { openModal } from './modal.js';

// Переменные для навигации
let currentCardIndex = 0;
let allCards = [];
let isPopupOpen = false;

// Функция для обработки клавиатурных событий
function handleKeyboardNavigation(event) {
  if (!isPopupOpen) return;
  
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    handleNextImage();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    handlePrevImage();
  }
}

// Функция для обновления информации о пользователе в попапе
function updatePopupUserInfo() {
  const profileTitle = document.querySelector('.profile__title');
  const profileImage = document.querySelector('.profile__image');
  
  const popupUsername = document.querySelector('.popup__username');
  const popupPostUsername = document.querySelector('.popup__post-username');
  const popupAvatarImage = document.querySelector('.popup__avatar-image');
  
  if (profileTitle && popupUsername && popupPostUsername) {
    const username = profileTitle.textContent;
    popupUsername.textContent = username;
    popupPostUsername.textContent = username;
  }
  
  if (profileImage && popupAvatarImage) {
    const avatarSrc = window.getComputedStyle(profileImage).backgroundImage;
    const urlMatch = avatarSrc.match(/url\(["']?([^"']*)["']?\)/);
    if (urlMatch && urlMatch[1]) {
      popupAvatarImage.src = urlMatch[1];
    }
  }
}

// Функция для обновления названия поста
function updatePopupPostTitle(cardName) {
  const popupPostTitle = document.querySelector('.popup__post-title');
  if (popupPostTitle && cardName) {
    popupPostTitle.textContent = cardName;
  }
}

// Функция для получения всех видимых карточек
function getAllVisibleCards() {
  return Array.from(document.querySelectorAll('.places__item')).map(cardElement => {
    const cardImage = cardElement.querySelector('.card__image');
    const cardTitle = cardElement.querySelector('.card__title');
    return {
      name: cardTitle ? cardTitle.textContent : '',
      link: cardImage ? cardImage.src : '',
      element: cardElement
    };
  });
}

// Функция для обновления изображения в попапе
function updatePopupImage(cardData) {
  const popupImage = document.querySelector('.popup_type_image');
  const imageElement = popupImage.querySelector('.popup__image');
  
  if (imageElement && cardData) {
    imageElement.src = cardData.link;
    imageElement.alt = cardData.name;
    
    // Обновляем информацию о пользователе
    updatePopupUserInfo();
    
    // Обновляем название поста
    updatePopupPostTitle(cardData.name);
    
    // Обновляем состояние кнопок
    const likeButton = popupImage.querySelector('.popup-btn-like');
    const bookmarkButton = popupImage.querySelector('.popup-btn-bookmark');
    
    if (likeButton) updateLikeButtonState(likeButton, cardData.link);
    if (bookmarkButton) updateBookmarkButtonState(bookmarkButton, cardData.link);
  }
}

// Обработчики навигации
function handleNextImage() {
  allCards = getAllVisibleCards();
  if (allCards.length > 0) {
    currentCardIndex = (currentCardIndex + 1) % allCards.length;
    updatePopupImage(allCards[currentCardIndex]);
  }
}

function handlePrevImage() {
  allCards = getAllVisibleCards();
  if (allCards.length > 0) {
    currentCardIndex = (currentCardIndex - 1 + allCards.length) % allCards.length;
    updatePopupImage(allCards[currentCardIndex]);
  }
}

// Функция для обновления состояния кнопки лайка
function updateLikeButtonState(likeButton, imageSrc) {
  const userId = localStorage.getItem('userId') || 'defaultUser';
  const storedLikes = JSON.parse(localStorage.getItem(`likes_${imageSrc}`)) || [];
  
  if (storedLikes.includes(userId)) {
    likeButton.querySelector('i').classList.replace('fa-regular', 'fa-solid');
  } else {
    likeButton.querySelector('i').classList.replace('fa-solid', 'fa-regular');
  }
}

// Функция для обновления состояния кнопки закладки
function updateBookmarkButtonState(bookmarkButton, imageSrc) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  if (favorites.includes(imageSrc)) {
    bookmarkButton.querySelector('i').classList.replace('fa-regular', 'fa-solid');
  } else {
    bookmarkButton.querySelector('i').classList.replace('fa-solid', 'fa-regular');
  }
}

// Обработчик клика по кнопке лайка
export function handlePopupLike(event, imageSrc) {
  const likeButton = event.currentTarget;
  const userId = localStorage.getItem('userId') || 'defaultUser';
  let likes = JSON.parse(localStorage.getItem(`likes_${imageSrc}`)) || [];

  if (likes.includes(userId)) {
    likes = likes.filter(id => id !== userId);
  } else {
    likes.push(userId);
  }

  localStorage.setItem(`likes_${imageSrc}`, JSON.stringify(likes));
  updateLikeButtonState(likeButton, imageSrc);

  // Обновляем состояние лайка в карточке на странице
  const cardImage = document.querySelector(`.card__image[src="${imageSrc}"]`);
  if (cardImage) {
    const card = cardImage.closest('.places__item');
    const cardLikeButton = card.querySelector('.card__like-button');
    const likeCountElement = card.querySelector('.card__like-count');
    
    if (cardLikeButton) {
      cardLikeButton.classList.toggle('card__like-button_is-active', likes.includes(userId));
      
      // Обновляем счетчик лайков
      if (likeCountElement) {
        if (likes.length > 0) {
          likeCountElement.textContent = likes.length;
          likeCountElement.style.display = 'block';
        } else {
          likeCountElement.style.display = 'none';
        }
      }
    }
  }
}

// Обработчик клика по кнопке закладки
export function handlePopupBookmark(event, imageSrc) {
  const bookmarkButton = event.currentTarget;
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favorites.indexOf(imageSrc);

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(imageSrc);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateBookmarkButtonState(bookmarkButton, imageSrc);

  // Обновляем состояние закладки в карточке на странице
  const cardImage = document.querySelector(`.card__image[src="${imageSrc}"]`);
  if (cardImage) {
    const card = cardImage.closest('.places__item');
    const cardFavoriteButton = card.querySelector('.card__favorite-button');
    if (cardFavoriteButton) {
      if (favorites.includes(imageSrc)) {
        cardFavoriteButton.classList.add('is-favorited');
        cardFavoriteButton.querySelector('i').classList.replace('fa-regular', 'fa-solid');
      } else {
        cardFavoriteButton.classList.remove('is-favorited');
        cardFavoriteButton.querySelector('i').classList.replace('fa-solid', 'fa-regular');
      }
    }
  }
}

// Обработчик клика по кнопке удаления
export function handlePopupDelete(imageSrc, popupElement) {
  // Находим карточку и попап подтверждения удаления
  const cardImage = document.querySelector(`.card__image[src="${imageSrc}"]`);
  const deletePopup = document.querySelector('.popup_type_delete');
  
  if (cardImage && deletePopup) {
    const card = cardImage.closest('.places__item');
    if (card) {
      // Сохраняем ссылку на карточку для удаления
      window.cardToDelete = card;
      window.cardLinkToDelete = imageSrc;
      
      // Открываем попап подтверждения удаления
      openModal(deletePopup);
    }
  }
}

// Функция для открытия попапа изображения с обновленной информацией
export function openImagePopup(cardName, cardLink) {
  const popupImage = document.querySelector('.popup_type_image');
  const imageElement = popupImage.querySelector('.popup__image');
  
  if (imageElement) {
    // Получаем все видимые карточки и находим текущий индекс
    allCards = getAllVisibleCards();
    currentCardIndex = allCards.findIndex(card => card.link === cardLink);
    if (currentCardIndex === -1) currentCardIndex = 0;
    
    imageElement.src = cardLink;
    imageElement.alt = cardName;
    
    // Обновляем информацию о пользователе
    updatePopupUserInfo();
    
    // Обновляем название поста
    updatePopupPostTitle(cardName);
    
    // Устанавливаем флаг открытого попапа
    isPopupOpen = true;
    
    // Открываем попап
    openModal(popupImage);
  }
}

// Функция для закрытия попапа (экспортируем для использования в других модулях)
export function closeImagePopup() {
  isPopupOpen = false;
}

// Инициализация обработчиков для попапа изображения
export function initializePopupImageHandlers(popupElement) {
  const popupImage = popupElement.querySelector('.popup__image');
  const likeButton = popupElement.querySelector('.popup-btn-like');
  const bookmarkButton = popupElement.querySelector('.popup-btn-bookmark');
  const deleteButton = popupElement.querySelector('.popup-btn-delete');
  const nextButton = popupElement.querySelector('.popup-btn-next');
  const prevButton = popupElement.querySelector('.popup-btn-prev');
  const closeButton = popupElement.querySelector('.popup__close');

  // Добавляем обработчик клавиатуры
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Обработчик закрытия попапа
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      isPopupOpen = false;
    });
  }

  if (popupImage && likeButton && bookmarkButton && deleteButton) {
    // Обновляем состояние кнопок при открытии попапа
    const updateButtonStates = () => {
      const imageSrc = popupImage.src;
      updateLikeButtonState(likeButton, imageSrc);
      updateBookmarkButtonState(bookmarkButton, imageSrc);
      // Обновляем информацию о пользователе при каждом открытии
      updatePopupUserInfo();
    };

    // Наблюдаем за изменением src изображения
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          updateButtonStates();
        }
      });
    });

    observer.observe(popupImage, { attributes: true });

    // Добавляем обработчики событий
    likeButton.addEventListener('click', (e) => handlePopupLike(e, popupImage.src));
    bookmarkButton.addEventListener('click', (e) => handlePopupBookmark(e, popupImage.src));
    deleteButton.addEventListener('click', () => handlePopupDelete(popupImage.src, popupElement));
    
    // Добавляем обработчики навигации
    if (nextButton) {
      nextButton.addEventListener('click', handleNextImage);
    }
    
    if (prevButton) {
      prevButton.addEventListener('click', handlePrevImage);
    }
  }
} 