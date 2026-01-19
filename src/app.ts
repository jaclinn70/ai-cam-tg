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
        width: { ideal: 1080 },
        height: { ideal: 1920 }
      },
      audio: false
    });

    video.srcObject = stream;

    return new Promise<void>(resolve => {
      video.onloadedmetadata = async () => {
        await video.play();
        resolve();
      };
    });
  }

  // 🔄 Переключение камеры
  switchBtn.onclick = async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  // 📸 СНИМОК — ЖЁСТКО 9:16
  shotBtn.onclick = () => {
    if (!video.videoWidth || !video.videoHeight) {
      alert('Камера ещё не готова');
      return;
    }

    const targetRatio = 9 / 16;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const videoRatio = vw / vh;

    let sx = 0, sy = 0, sw = vw, sh = vh;

    if (videoRatio > targetRatio) {
      // обрезаем по ширине
      sh = vh;
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
    } else {
      // обрезаем по высоте
      sw = vw;
      sh = vw / targetRatio;
      sy = (vh - sh) / 2;
    }

    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 1080, 1920);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95);

    console.log('📸 SNAPSHOT OK', imageBase64.slice(0, 80));

    tg?.showAlert?.('Снимок готов 📸');
    tg?.HapticFeedback?.impactOccurred('medium');

    // 👉 дальше сюда пойдёт Gemini
  };

  startCamera();
}
