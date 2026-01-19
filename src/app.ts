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
    <div class="root">
      <div class="camera-frame">
        <video id="video" autoplay playsinline muted></video>
      </div>

      <div class="controls">
        <button id="switch">🔄</button>
        <button id="shot">🔴</button>
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
    } catch (e) {
      alert('Camera error');
    }
  }

  switchBtn.onclick = async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
    tg?.HapticFeedback?.impactOccurred('light');
  };

  shotBtn.onclick = () => {
    tg?.HapticFeedback?.impactOccurred('medium');
    console.log('SHOT');
  };

  startCamera();
}
