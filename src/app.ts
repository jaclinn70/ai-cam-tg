import './style.css';

declare global {
  interface Window {
    Telegram?: any;
  }
}

export function initApp() {
  const tg = window.Telegram?.WebApp;

  let facingMode: 'user' | 'environment' = 'environment';
  let stream: MediaStream | null = null;

  const app = document.getElementById('app')!;
  app.innerHTML = `
    <video id="video" autoplay playsinline muted></video>

    <div class="controls">
      <button id="switch" class="btn">🔄</button>
      <button id="shot" class="btn capture"></button>
    </div>

    <canvas id="canvas" style="display:none"></canvas>
  `;

  const video = document.getElementById('video') as HTMLVideoElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const switchBtn = document.getElementById('switch')!;
  const shotBtn = document.getElementById('shot')!;

  if (tg) {
    tg.ready();
    tg.expand();
    tg.setBackgroundColor('#000');
    tg.setHeaderColor('#000');
  }

  async function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  async function startCamera() {
    await stopCamera();

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        aspectRatio: 9 / 16,
        width: { ideal: 1080 },
        height: { ideal: 1920 }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
  }

  // 🔄 Переключение камеры
  switchBtn.onclick = async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  // 📸 СНИМОК
  shotBtn.onclick = () => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, vw, vh);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95);

    console.log('📸 SNAPSHOT READY', imageBase64.slice(0, 50));

    tg?.showAlert?.('Снимок готов 📸');
    tg?.HapticFeedback?.impactOccurred('medium');

    // 👉 дальше сюда пойдёт Gemini
  };

  startCamera();
}
