export function initThemeToggle() {
  const themeToggle = document.querySelector('.theme');
  const html = document.documentElement;

  // Получение сохранённой темы из localStorage или системной настройки
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  // Установка текущей темы
  setTheme(currentTheme);

  // Обработчик переключения темы
  themeToggle.addEventListener('click', () => {
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    setTimeout(() => {
    }, 300);
  }
}