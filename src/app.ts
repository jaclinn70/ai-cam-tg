export function initApp() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <video id="video" autoplay playsinline muted></video>

    <div class="controls">
      <button id="switch">🔄</button>
    </div>
  `;

  const tg = (window as any).Telegram?.WebApp;
  tg?.ready();
  tg?.expand();
  tg?.setBackgroundColor('#000000');

  const video = document.getElementById('video') as HTMLVideoElement;
  const switchBtn = document.getElementById('switch')!;

  let stream: MediaStream | null = null;
  let cameras: MediaDeviceInfo[] = [];
  let currentCamera = 0;

  async function startInitialCamera() {
    // 🔑 ВСЕГДА СТАРТУЕМ С ФРОНТАЛКИ
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    // 🔑 ПОСЛЕ РАЗРЕШЕНИЯ МОЖНО ПОЛУЧИТЬ СПИСОК КАМЕР
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter(d => d.kind === 'videoinput');
  }

  async function switchCamera() {
    if (!cameras.length) return;

    currentCamera = (currentCamera + 1) % cameras.length;

    // ⚠️ НЕ ОСТАНАВЛИВАЕМ ВИДЕО, ТОЛЬКО МЕНЯЕМ TRACK
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: cameras[currentCamera].deviceId } },
      audio: false
    });

    const newTrack = newStream.getVideoTracks()[0];

    const sender = (stream as any)
      .getVideoTracks()[0];

    stream?.getTracks().forEach(t => t.stop());
    stream = newStream;

    video.srcObject = stream;
    await video.play();
  }

  switchBtn.addEventListener('click', switchCamera);

  startInitialCamera();
}
