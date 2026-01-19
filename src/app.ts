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
          facingMode
        },
        audio: false
      });

      video.srcObject = stream;
      await video.play();
    } catch (e) {
      alert('Camera access error');
    }
  }

  switchBtn.onclick = async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  shotBtn.onclick = () => {
    if (!video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL('image/jpeg', 0.95);
    console.log('PHOTO:', image);

    tg?.HapticFeedback?.impactOccurred('medium');
  };

  startCamera();
}
