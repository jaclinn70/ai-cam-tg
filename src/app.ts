export function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Telegram WebApp
  const tg = (window as any).Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();
    tg.setBackgroundColor('#000000');
    tg.setHeaderColor('#000000');
  }

  app.innerHTML = `
    <div class="screen">
      <h1>AI CAM</h1>
      <button id="openCam">📸 Камера</button>
    </div>
  `;

  const btn = document.getElementById('openCam');
  btn?.addEventListener('click', () => {
    alert('Следующий шаг — подключаем камеру 📷');
  });
}
