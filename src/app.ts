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

  async function startCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
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

  startCamera();
}
