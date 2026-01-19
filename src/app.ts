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
      <div class="camera-frame">
        <video id="video" autoplay playsinline muted></video>

        <div class="controls">
          <button id="switch" class="btn">🔄</button>
          <button id="shot" class="btn capture"></button>
        </div>
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
          facingMode: { exact: facingMode },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      video.srcObject = stream;
      await video.play();
    } catch (err) {
      // 🔥 fallback — если environment не дался
      if (facingMode === 'environment') {
        facingMode = 'user';
        await startCamera();
        tg?.showAlert('Задняя камера недоступна');
      } else {
        tg?.showAlert('Camera access error');
      }
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

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95);
    console.log('PHOTO READY', imageBase64);

    tg?.HapticFeedback?.impactOccurred('medium');
  };

  startCamera();
}

