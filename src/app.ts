export function initApp() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <video id="video" autoplay playsinline muted></video>

    <div class="controls">
      <button id="switch" class="btn">🔄</button>
      <button id="capture" class="btn capture"></button>
    </div>
  `;

  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setBackgroundColor('#000000');
  }

  const video = document.getElementById('video') as HTMLVideoElement;
  const switchBtn = document.getElementById('switch')!;
  const captureBtn = document.getElementById('capture')!;

  let stream: MediaStream | null = null;
  let facingMode: 'user' | 'environment' = 'environment';
  let initialized = false;

  async function startCamera() {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      video.srcObject = stream;

      await video.play();
    } catch (e) {
      console.error('Camera error', e);
    }
  }

  // 🔑 FIX for Telegram Mobile
  async function initCameraWithRetry() {
    await startCamera();

    // Telegram Mobile часто требует повтор
    if (!initialized) {
      initialized = true;
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  }

  switchBtn.addEventListener('click', async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
  });

  captureBtn.addEventListener('click', () => {
    tg?.showPopup({
      title: 'Снимок готов 📸',
      message: 'Следующий шаг — AI обработка',
      buttons: [{ type: 'ok' }]
    });
  });

  initCameraWithRetry();
}
