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
    
    reader.onload = async (e) => {
      // Очищаем предыдущее превью
      previewContainer.innerHTML = '';
      
      // Сжимаем изображение для экономии места
      let imageData = e.target.result;
      const originalSize = imageData.length;
      
      try {
        imageData = await this.compressImage(imageData, 0.8); // 80% качества
        const compressedSize = imageData.length;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        console.log(`🗜️ Изображение сжато на ${savings}% (${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB)`);
      } catch (error) {
        console.warn('⚠️ Не удалось сжать изображение, используем оригинал:', error);
      }
      
      // Создаем элементы превью
      const img = document.createElement('img');
      img.src = imageData;
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
      
      // Сохраняем сжатый base64 в data-атрибуте input'а для дальнейшего использования
      inputElement.dataset.base64 = imageData;
    };
    
    reader.onerror = () => {
      this.showError(uploadContainer, 'Ошибка при чтении файла');
    };
    
    reader.readAsDataURL(file);
  }

  // Функция для сжатия изображений
  compressImage(base64String, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Устанавливаем максимальные размеры для экономии места
        const maxWidth = 1200;  // Увеличено для лучшего качества
        const maxHeight = 900;
        
        let { width, height } = img;
        
        // Пропорциональное уменьшение только если изображение слишком большое
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Улучшенное качество рендеринга
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Сжимаем с указанным качеством
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Не удалось загрузить изображение для сжатия'));
      };
      
      img.src = base64String;
    });
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

  // Сбросить состояние загрузчика файлов
  resetFileUpload(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const uploadContainer = input.closest('.popup__file-upload');
    const previewContainer = input.parentElement.querySelector('.popup__image-preview');
    
    if (uploadContainer && previewContainer) {
      // Очищаем input
      input.value = '';
      delete input.dataset.base64;
      
      // Очищаем превью и состояния
      this.clearPreview(previewContainer, uploadContainer);
    }
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

export function resetFileUpload(inputId) {
  return fileUploadManager.resetFileUpload(inputId);
} 