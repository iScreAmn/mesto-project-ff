// Централизованное управление блокировкой скролла
class ScrollLockManager {
  constructor() {
    this.lockCount = 0;
    this.originalBodyOverflow = '';
  }

  // Заблокировать скролл
  lock() {
    if (this.lockCount === 0) {
      // Запоминаем исходное значение overflow только при первой блокировке
      this.originalBodyOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
      // console.log('🔒 Скролл заблокирован');
    }
    this.lockCount++;
    // console.log(`📊 Активных блокировок: ${this.lockCount}`);
  }

  // Разблокировать скролл
  unlock() {
    if (this.lockCount > 0) {
      this.lockCount--;
      // console.log(`📊 Активных блокировок: ${this.lockCount}`);
      
      if (this.lockCount === 0) {
        // Восстанавливаем исходное значение только когда все блокировки сняты
        document.body.style.overflow = this.originalBodyOverflow;
        // console.log('🔓 Скролл разблокирован');
      }
    }
  }

  // Принудительно разблокировать (для экстренных случаев)
  forceUnlock() {
    this.lockCount = 0;
    document.body.style.overflow = this.originalBodyOverflow;
    // console.log('🚨 Принудительная разблокировка скролла');
  }

  // Получить количество активных блокировок
  getLockCount() {
    return this.lockCount;
  }
}

// Создаем единственный экземпляр
const scrollLockManager = new ScrollLockManager();

// Экспортируем функции
export function lockScroll() {
  scrollLockManager.lock();
}

export function unlockScroll() {
  scrollLockManager.unlock();
}

export function forceUnlockScroll() {
  scrollLockManager.forceUnlock();
}

export function getScrollLockCount() {
  return scrollLockManager.getLockCount();
} 