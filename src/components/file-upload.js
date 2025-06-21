// Компонент для обработки загрузки файлов
import { t } from './i18n.js';

class FileUploadManager {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  }

  init() {
    this.attachEventListeners();
    console.log('File upload system initialized');
  }

  attachEventListeners() {
    // Обработчики для загрузки изображения места
    const placeImageInput = document.getElementById('place-image-upload');
    const placeImagePreview = document.getElementById('place-image-preview');
    
    if (placeImageInput) {
      placeImageInput.addEventListener('change', (e) => {
        this.handleFileSelect(e, placeImagePreview, 'place');
      });
    }

    // Обработчики для загрузки аватара
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        this.handleFileSelect(e, avatarPreview, 'avatar');
      });
    }
  }

  handleFileSelect(event, previewContainer, type) {
    const file = event.target.files[0];
    const uploadContainer = event.target.closest('.popup__file-upload');
    
    if (!file) {
      this.clearPreview(previewContainer, uploadContainer);
      return;
    }

    // Валидация файла
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      this.showError(uploadContainer, validation.error);
      event.target.value = ''; // Очищаем input
      return;
    }

    // Обновляем UI
    this.updateUploadUI(uploadContainer, file.name);
    
    // Создаем превью
    this.createPreview(file, previewContainer, uploadContainer, event.target);
  }

  validateFile(file) {
    // Проверка типа файла
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Поддерживаются только изображения (JPEG, PNG, GIF, WebP)'
      };
    }

    // Проверка размера файла
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: 'Размер файла не должен превышать 5MB'
      };
    }

    return { isValid: true };
  }

  createPreview(file, previewContainer, uploadContainer, inputElement) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // Очищаем предыдущее превью
      previewContainer.innerHTML = '';
      
      // Создаем элементы превью
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Preview';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'popup__image-preview-remove';
      removeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
      removeBtn.type = 'button';
      
      // Обработчик удаления превью
      removeBtn.addEventListener('click', () => {
        this.clearPreview(previewContainer, uploadContainer);
        inputElement.value = '';
      });
      
      // Добавляем элементы в контейнер
      previewContainer.appendChild(img);
      previewContainer.appendChild(removeBtn);
      previewContainer.classList.add('has-image');
      
      // Сохраняем base64 в data-атрибуте input'а для дальнейшего использования
      inputElement.dataset.base64 = e.target.result;
    };
    
    reader.onerror = () => {
      this.showError(uploadContainer, 'Ошибка при чтении файла');
    };
    
    reader.readAsDataURL(file);
  }

  updateUploadUI(uploadContainer, fileName) {
    uploadContainer.classList.remove('error');
    uploadContainer.classList.add('has-file');
    
    const label = uploadContainer.querySelector('.popup__file-label span');
    if (label) {
      label.textContent = `${t('forms.file_selected')}: ${fileName}`;
    }
  }

  showError(uploadContainer, errorMessage) {
    uploadContainer.classList.remove('has-file');
    uploadContainer.classList.add('error');
    
    // Показываем ошибку (можно добавить toast или другой UI элемент)
    console.error('File upload error:', errorMessage);
    
    // Опционально: показать сообщение об ошибке в UI
    const label = uploadContainer.querySelector('.popup__file-label span');
    if (label) {
      const originalText = label.textContent;
      label.textContent = errorMessage;
      label.style.color = '#e74c3c';
      
      setTimeout(() => {
        label.textContent = originalText;
        label.style.color = '';
        uploadContainer.classList.remove('error');
      }, 3000);
    }
  }

  clearPreview(previewContainer, uploadContainer) {
    previewContainer.innerHTML = '';
    previewContainer.classList.remove('has-image');
    uploadContainer.classList.remove('has-file', 'error');
    
    const label = uploadContainer.querySelector('.popup__file-label span');
    if (label) {
      // Восстанавливаем оригинальный текст из data-i18n
      const i18nKey = label.getAttribute('data-i18n');
      if (i18nKey) {
        label.textContent = t(i18nKey);
      }
    }
  }

  // Получить base64 изображения из input'а
  getImageBase64(inputId) {
    const input = document.getElementById(inputId);
    return input?.dataset.base64 || null;
  }

  // Проверить, выбран ли файл
  hasFile(inputId) {
    const input = document.getElementById(inputId);
    return input?.files.length > 0;
  }
}

// Создаем единственный экземпляр
const fileUploadManager = new FileUploadManager();

// Экспортируем функции
export function initFileUpload() {
  fileUploadManager.init();
}

export function getImageBase64(inputId) {
  return fileUploadManager.getImageBase64(inputId);
}

export function hasFile(inputId) {
  return fileUploadManager.hasFile(inputId);
} 