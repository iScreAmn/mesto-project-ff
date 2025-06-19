import { closeImagePopup } from './popup-image.js';

// Функция-обработчик события нажатия Esc (внутренняя)
function handleEscClose(evt) {
  if (evt.key === 'Escape') {
    // Ищем открытый попап по классу 'popup_is-opened'.
    const openedPopup = document.querySelector('.popup.popup_is-opened');
    
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
}

// Функция-обработчик события клика по оверлею (внутренняя)
function handleOverlayClose(evt) {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.currentTarget);
  }
}

// Функция открытия модального окна
export function openModal(popupElement) {
  // console.log('Открытие модального окна:', popupElement);
  popupElement.classList.add('popup_is-animated');
  popupElement.style.display = 'flex';
  requestAnimationFrame(() => {
    popupElement.classList.add('popup_is-opened');
  });
  document.addEventListener('keydown', handleEscClose);
  popupElement.addEventListener('mousedown', handleOverlayClose);
}

// Функция закрытия модального окна
export function closeModal(popupElement) {
  // Проверяем, если закрывается попап изображения
  if (popupElement && popupElement.classList.contains('popup_type_image')) {
    closeImagePopup();
  }
  
  popupElement.classList.remove('popup_is-opened');
  popupElement.addEventListener('transitionend', function handler(evt) {
    if (evt.propertyName === 'opacity') {
      popupElement.classList.remove('popup_is-animated');
      popupElement.style.display = 'none';
      popupElement.removeEventListener('transitionend', handler);
    }
  });
  document.removeEventListener('keydown', handleEscClose);
  popupElement.removeEventListener('mousedown', handleOverlayClose);
}
