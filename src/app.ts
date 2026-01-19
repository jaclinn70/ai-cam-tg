import './style.css';

declare global {
  interface Window {
    Telegram?: any;
  }
}

const tg = window.Telegram?.WebApp;

/* ---------- STATE ---------- */
let currentMode: 'selfie' | 'object' = 'selfie';
let currentStream: MediaStream | null = null;

/* ---------- DOM ---------- */
const app = document.getElementById('app')!;

/* ---------- UI ---------- */
app.innerHTML = `
  <div class="container">
    <header>
      <h1>AI Camera</h1>
      <div class="modes">
        <button id="selfieBtn" class="active">🤳 Селфи</button>
        <button id="objectBtn">📦 Объект</button>
      </div>
    </header>

    <main>
      <video id="video" autoplay playsinline muted></video>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display:none"
      />

      <canvas id="canvas" style="display:none"></canvas>
    </main>

    <footer>
      <button id="shotBtn">🔴</button>
    </footer>
  </div>
`;

/* ---------- ELEMENTS ---------- */
const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

const selfieBtn = document.getElementById('selfieBtn')!;
const objectBtn = document.getElementById('objectBtn')!;
const shotBtn = document.getElementById('shotBtn')!;

/* ---------- INIT TG ---------- */
if (tg) {
  tg.ready();
  tg.expand();
  tg.setBackgroundColor('#000000');
  tg.setHeaderColor('#000000');
}

/* ---------- CAMERA ---------- */
async function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
}

async function startSelfieCamera() {
  await stopCamera();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1080 },
        height: { ideal: 1920 }
      },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;
    video.style.display = 'block';
  } catch (e) {
    alert('Не удалось открыть фронтальную камеру');
  }
}

/* ---------- MODE SWITCH ---------- */
selfieBtn.onclick = async () => {
  currentMode = 'selfie';
  selfieBtn.classList.add('active');
  objectBtn.classList.remove('active');
  await startSelfieCamera();
};

objectBtn.onclick = async () => {
  currentMode = 'object';
  selfieBtn.classList.remove('active');
  objectBtn.classList.add('active');

  await stopCamera();
  video.style.display = 'none';

  // Открываем СИСТЕМНУЮ камеру (заднюю)
  fileInput.click();
};

/* ---------- SHOT ---------- */
shotBtn.onclick = async () => {
  if (currentMode === 'selfie') {
    if (!currentStream) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL('image/jpeg', 0.95);
    console.log('SELFIE IMAGE', img);

    tg?.HapticFeedback?.impactOccurred('medium');
  }
};

/* ---------- FILE INPUT ---------- */
fileInput.onchange = () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = reader.result as string;
    console.log('OBJECT IMAGE', img);

    tg?.HapticFeedback?.impactOccurred('medium');
  };
  reader.readAsDataURL(file);
};

/* ---------- START ---------- */
startSelfieCamera();
