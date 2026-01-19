export function initApp() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div id="container">
      <video id="video" playsinline muted></video>

      <div class="controls">
        <button id="start">▶️ Включить камеру</button>
        <button id="switch" disabled>🔄</button>
      </div>
    </div>
  `;

  const tg = (window as any).Telegram?.WebApp;
  tg?.ready();
  tg?.expand();
  tg?.setBackgroundColor('#000000');

  const video = document.getElementById('video') as HTMLVideoElement;
  const startBtn = document.getElementById('start')!;
  const switchBtn = document.getElementById('switch')!;

  let stream: MediaStream | null = null;
  let cameras: MediaDeviceInfo[] = [];
  let currentIndex = 0;

  async function startCamera() {
    // 🔑 ПЕРВЫЙ ЗАПУСК — ТОЛЬКО ПО КЛИКУ
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter(d => d.kind === 'videoinput');

    switchBtn.removeAttribute('disabled');
    startBtn.remove();
  }

  async function switchCamera() {
    if (!cameras.length) return;

    currentIndex = (currentIndex + 1) % cameras.length;

    // ❗️ВАЖНО: getUserMedia ВНУТРИ КЛИКА
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: cameras[currentIndex].deviceId } },
      audio: false
    });

    stream?.getTracks().forEach(t => t.stop());
    stream = newStream;

    video.srcObject = stream;
    await video.play();
  }

  startBtn.addEventListener('click', startCamera);
  switchBtn.addEventListener('click', switchCamera);
}

