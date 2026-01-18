export function initApp() {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="screen">
      <h1>AI CAM</h1>
      <button id="open">📸 Камера</button>
    </div>
  `;

  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setBackgroundColor('#000000');
  }
}
