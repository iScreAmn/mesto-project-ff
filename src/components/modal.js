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
  if (evt.target === evt.currentTarget) { // Закрываем, если клик был по самому оверлею
    closeModal(evt.currentTarget);
  }
}

// Функция открытия модального окна
export function openModal(popupElement) {
  popupElement.style.display = 'flex';
  popupElement.classList.add('popup_is-opened');
  document.addEventListener('keydown', handleEscClose);
  popupElement.addEventListener('mousedown', handleOverlayClose); // mousedown, чтобы не закрывалось при выделении текста внутри
}

// Функция закрытия модального окна
export function closeModal(popupElement) {
  popupElement.style.display = 'none';
  popupElement.classList.remove('popup_is-opened');
  document.removeEventListener('keydown', handleEscClose);
  popupElement.removeEventListener('mousedown', handleOverlayClose);
}
