export function initThemeToggle() {
  const themeToggle = document.querySelector('.theme');
  const html = document.documentElement;

  const checkbox = document.querySelector('.switch');
  const lightBtn = document.querySelector('.theme-select-light');
  const darkBtn = document.querySelector('.theme-select-dark');

  // Получение сохранённой темы из localStorage или системной настройки
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  // Установка текущей темы
  setTheme(currentTheme);
  if (checkbox) {
    checkbox.checked = currentTheme === 'dark';
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      setTheme('light');
      localStorage.setItem('theme', 'light');
      if (checkbox) checkbox.checked = false;
    });
  }

  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
      if (checkbox) checkbox.checked = true;
    });
  }

  // Обработчик переключения темы
  themeToggle.addEventListener('click', () => {
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  if (checkbox) {
    checkbox.addEventListener('change', () => {
      const newTheme = checkbox.checked ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
  }
}