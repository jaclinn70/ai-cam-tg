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

  shotBtn.onclick = async () => {
    tg?.HapticFeedback?.impactOccurred('medium');

    // 🔹 Делаем снимок с видео
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

    // 🔹 Пример вызова Gemini
    const result = await runGemini(
      imageBase64,
      'Сделай художественную обработку фото'
    );

    console.log('Gemini result:', result);
  };

  startCamera();
}

/* =====================================================
   🔮 Gemini API — клиентская функция
   ===================================================== */

async function runGemini(imageBase64: string, prompt: string) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      prompt,
    }),
  });

  const data = await res.json();
  return data;
}
