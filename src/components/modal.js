// Функция-обработчик события нажатия Esc (внутренняя)
function handleEscClose(evt) {
  if (evt.key === 'Escape') {
    // Ищем открытый попап. Лучше использовать класс, например, 'popup_is-opened'.
    // В данном примере ищем по стилю, что менее надежно.
    const openedPopup = document.querySelector('.popup[style*="display: flex"]'); 
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
  // Рекомендуется использовать классы: popupElement.classList.add('popup_is-opened');
  document.addEventListener('keydown', handleEscClose);
  popupElement.addEventListener('mousedown', handleOverlayClose); // mousedown, чтобы не закрывалось при выделении текста внутри
}

// Функция закрытия модального окна
export function closeModal(popupElement) {
  popupElement.style.display = 'none';
  // Рекомендуется использовать классы: popupElement.classList.remove('popup_is-opened');
  document.removeEventListener('keydown', handleEscClose);
  popupElement.removeEventListener('mousedown', handleOverlayClose);
}
