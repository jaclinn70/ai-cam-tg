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

      <div class="controls">
        <button id="shoot">●</button>
      </div>
    </div>
  `;

  const video = document.getElementById('video') as HTMLVideoElement;

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',
      aspectRatio: 9 / 16,
      width: { ideal: 1080 },
      height: { ideal: 1920 }
    },
    audio: false
  })
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => {
    alert('Нет доступа к камере');
    console.error(err);
  });
}
