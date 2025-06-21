export function saveProfileData(updatedFields) {
  const existing = loadProfileData() || {};
  const merged = { ...existing, ...updatedFields };
  localStorage.setItem('profileData', JSON.stringify(merged));
}

export function loadProfileData() {
  const data = localStorage.getItem('profileData');
  return data ? JSON.parse(data) : null;
}

// Функция для проверки размера localStorage
function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

// Функция для проверки доступного места (в байтах)
function getAvailableSpace() {
  const maxSize = 5 * 1024 * 1024; // 5MB - типичный лимит
  const currentSize = getStorageSize();
  return maxSize - currentSize;
}

// Функция для очистки старых данных при нехватке места
function cleanupOldData() {
  console.log('🧹 Очистка старых данных для освобождения места...');
  
  // Удаляем старые лайки (оставляем только последние 50)
  const likeKeys = Object.keys(localStorage).filter(key => key.startsWith('likes_'));
  if (likeKeys.length > 50) {
    const keysToRemove = likeKeys.slice(0, likeKeys.length - 50);
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Удалено ${keysToRemove.length} старых записей лайков`);
  }
  
  // Очищаем корзину если она слишком большая
  const trashCards = loadTrashCards();
  if (trashCards.length > 10) {
    const reducedTrash = trashCards.slice(0, 10);
    saveTrashCards(reducedTrash);
    console.log(`🗑️ Сокращена корзина до 10 элементов`);
  }
}

// Функция для сжатия изображений (уменьшение качества)
function compressBase64Image(base64String, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Устанавливаем максимальные размеры
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = img;
      
      // Пропорциональное уменьшение
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Сжимаем с указанным качеством
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.src = base64String;
  });
}

// Функции для работы с карточками
export function saveCards(cards) {
  try {
    const dataToSave = JSON.stringify(cards);
    const dataSize = dataToSave.length;
    
    console.log(`📊 Размер данных для сохранения: ${(dataSize / 1024).toFixed(1)} KB`);
    console.log(`📊 Доступно места: ${(getAvailableSpace() / 1024).toFixed(1)} KB`);
    
    // Проверяем, поместятся ли данные
    if (dataSize > getAvailableSpace()) {
      console.log('⚠️ Недостаточно места, выполняем очистку...');
      cleanupOldData();
      
      // Если все еще не хватает места, сжимаем изображения
      if (dataSize > getAvailableSpace()) {
        console.log('🗜️ Сжимаем изображения для экономии места...');
        // Здесь можно добавить логику сжатия, но это асинхронная операция
        // Пока просто ограничиваем количество карточек
        const maxCards = 20;
        if (cards.length > maxCards) {
          cards = cards.slice(0, maxCards);
          console.log(`📉 Ограничено количество карточек до ${maxCards}`);
        }
      }
    }
    
    localStorage.setItem('userCards', JSON.stringify(cards));
    console.log(`💾 Сохранено ${cards.length} карточек в localStorage`);
  } catch (error) {
    console.error('❌ Не удалось сохранить карточки в localStorage:', error);
    
    if (error.name === 'QuotaExceededError') {
      // Экстренная очистка
      console.log('🚨 Экстренная очистка данных...');
      cleanupOldData();
      
      // Пробуем сохранить только последние 10 карточек
      try {
        const limitedCards = cards.slice(0, 10);
        localStorage.setItem('userCards', JSON.stringify(limitedCards));
        console.log(`💾 Сохранено ${limitedCards.length} карточек после экстренной очистки`);
        
        // Показываем уведомление пользователю
        showStorageWarning();
      } catch (secondError) {
        console.error('❌ Даже экстренное сохранение не удалось:', secondError);
        showStorageCriticalError();
      }
    }
  }
}

export function loadCards() {
  try {
    const data = localStorage.getItem('userCards');
    const cards = data ? JSON.parse(data) : [];
    console.log(`📂 Загружено ${cards.length} карточек из localStorage`);
    return cards;
  } catch (error) {
    console.warn('Не удалось загрузить карточки из localStorage:', error);
    return [];
  }
}

// Функция для очистки карточек
export function clearCards() {
  localStorage.removeItem('userCards');
}

// Функции для работы с корзиной
export function saveTrashCards(cards) {
  try {
    localStorage.setItem('trashCards', JSON.stringify(cards));
    console.log(`🗑️ Сохранено ${cards.length} карточек в корзине`);
  } catch (error) {
    console.warn('Не удалось сохранить корзину в localStorage:', error);
    
    if (error.name === 'QuotaExceededError') {
      // Ограничиваем корзину до 5 элементов
      const limitedCards = cards.slice(0, 5);
      try {
        localStorage.setItem('trashCards', JSON.stringify(limitedCards));
        console.log(`🗑️ Сохранено ${limitedCards.length} карточек в корзине после ограничения`);
      } catch (secondError) {
        console.error('❌ Не удалось сохранить даже ограниченную корзину:', secondError);
      }
    }
  }
}

export function loadTrashCards() {
  try {
    const data = localStorage.getItem('trashCards');
    const cards = data ? JSON.parse(data) : [];
    console.log(`📂 Загружено ${cards.length} карточек из корзины`);
    return cards;
  } catch (error) {
    console.warn('Не удалось загрузить корзину из localStorage:', error);
    return [];
  }
}

// Функция для очистки корзины
export function clearTrashCards() {
  localStorage.removeItem('trashCards');
}

// Функции для показа уведомлений пользователю
function showStorageWarning() {
  // Можно добавить toast уведомление или модальное окно
  console.log('⚠️ Хранилище заполнено, некоторые старые данные были удалены');
  
  // Простое уведомление через alert (можно заменить на более красивое)
  if (window.confirm('Хранилище заполнено. Некоторые старые данные были удалены. Хотите очистить корзину для освобождения места?')) {
    clearTrashCards();
    console.log('🗑️ Корзина очищена пользователем');
  }
}

function showStorageCriticalError() {
  alert('Критическая ошибка: не удается сохранить данные. Попробуйте очистить браузер или использовать меньше изображений.');
}

// Экспортируем функции для управления хранилищем
export { getStorageSize, getAvailableSpace, cleanupOldData, compressBase64Image };