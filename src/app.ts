import './style.css';

declare global {
  interface Window {
    Telegram?: any;
  }
}

export function initApp() {
  const tg = window.Telegram?.WebApp;

  let facingMode: 'user' | 'environment' = 'user';
  let stream: MediaStream | null = null;

  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="camera-shell">
      <video id="video" autoplay playsinline muted></video>

      <div class="controls">
        <button id="switch" class="btn">🔄</button>
        <button id="shot" class="btn capture"></button>
      </div>
    </div>
  `;

  const video = document.getElementById('video') as HTMLVideoElement;
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

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      video.srcObject = stream;
      await video.play();
    } catch {
      tg?.showAlert('Camera access error');
    }
  }

  switchBtn.onclick = async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  shotBtn.onclick = () => {
    if (!video.videoWidth || !video.videoHeight) {
      tg?.showAlert('Камера не готова');
      return;
    }

    // 🎯 ГАРАНТИРОВАННЫЙ 9:16 КРОП
    const targetW = 1080;
    const targetH = 1920;
    const targetRatio = targetW / targetH;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const videoRatio = vw / vh;

    let sx = 0, sy = 0, sw = vw, sh = vh;

    if (videoRatio > targetRatio) {
      // видео шире — режем по бокам
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
    } else {
      // видео выше — режем сверху/снизу
      sh = vw / targetRatio;
      sy = (vh - sh) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);

    const photo = canvas.toDataURL('image/jpeg', 0.95);
    console.log('PHOTO READY', photo);

    tg?.HapticFeedback?.impactOccurred('medium');
  };

  startCamera();
}
