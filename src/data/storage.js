export function saveProfileData(updatedFields) {
  const existing = loadProfileData() || {};
  const merged = { ...existing, ...updatedFields };
  localStorage.setItem('profileData', JSON.stringify(merged));
}

export function loadProfileData() {
  const data = localStorage.getItem('profileData');
  return data ? JSON.parse(data) : null;
}

// Функции для работы с карточками
export function saveCards(cards) {
  try {
    localStorage.setItem('userCards', JSON.stringify(cards));
    console.log(`💾 Сохранено ${cards.length} карточек в localStorage`);
  } catch (error) {
    console.warn('Не удалось сохранить карточки в localStorage:', error);
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