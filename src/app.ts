export function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setBackgroundColor('#000000');
    tg.setHeaderColor('#000000');
  }

  app.innerHTML = `
    <div class="camera-root">
      <video id="video" autoplay playsinline muted></video>
      <canvas id="canvas" hidden></canvas>

      <div class="controls">
        <button id="shoot">●</button>
      </div>
    </div>
  `;

  const video = document.getElementById('video') as HTMLVideoElement;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const shootBtn = document.getElementById('shoot') as HTMLButtonElement;

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',
      aspectRatio: 9 / 16,
      width: { ideal: 1080 },
      height: { ideal: 1920 }
    },
    audio: false
  }).then(stream => {
    video.srcObject = stream;
    video.play();
  }).catch(() => {
    alert('Нет доступа к камере');
  });

  shootBtn.onclick = () => {
    const w = 1080;
    const h = 1920;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    const photo = canvas.toDataURL('image/jpeg', 0.95);

    tg?.HapticFeedback?.impactOccurred('medium');

    tg?.showPopup({
      title: 'Снимок готов 📸',
      message: 'Следующий шаг — AI обработка',
      buttons: [{ type: 'ok' }]
    });

    console.log('PHOTO:', photo);
  };
}
