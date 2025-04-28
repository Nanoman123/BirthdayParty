// ─── FIREBASE INITIALIZATION ────────────────────────────────────────────────
// Paste your actual config values here (from the Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyD0cB5M3AcC0WYFqB7688e1_t_YgZ1ATU4",
  authDomain: "birthday-3a2c4.firebaseapp.com",
  databaseURL: "https://birthday-3a2c4-default-rtdb.firebaseio.com",
  projectId: "birthday-3a2c4",
  storageBucket: "birthday-3a2c4.appspot.com",
  messagingSenderId: "480801510523",
  appId: "1:480801510523:web:e8ff456ab9a1a2d889fede",
  measurementId: "G-PV96GGCCJX"
};

// Initialize Firebase & get a Realtime Database reference
firebase.initializeApp(firebaseConfig);
const db          = firebase.database();
const attendRef   = db.ref('attend');
const declineRef  = db.ref('decline');


// ─── YOUR UI LOGIC ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const correctPasscode = 'blackout';

  const passScreen    = document.getElementById('passcode-screen');
  const input         = document.getElementById('passcode-input');
  const submitBtn     = document.getElementById('submit-passcode');
  const loadingScreen = document.getElementById('loading-screen');
  const deniedScreen  = document.getElementById('denied-screen');
  const retryBtn      = document.getElementById('retry-button');
  const partyScreen   = document.getElementById('party-screen');
  const accessBanner  = document.getElementById('access-granted');
  const attendBtn     = document.getElementById('attend-btn');
  const declineBtn    = document.getElementById('decline-btn');
  const attendHeads   = document.getElementById('attend-heads');
  const declineHeads  = document.getElementById('decline-heads');
  const matrixAudio   = document.getElementById('matrix-audio');
  const partyAudio    = document.getElementById('party-audio');

  let matrixInterval;


  // ─── MATRIX EFFECT ────────────────────────────────────────────────────────────
  function startMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 16;
    const cols     = Math.floor(canvas.width / fontSize);
    const drops    = Array(cols).fill(1);

    matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, x) => {
        const text = String.fromCharCode(33 + Math.random() * 94);
        ctx.fillText(text, x * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[x] = 0;
        }
        drops[x]++;
      });
    }, 50);
  }

  function stopMatrix() {
    clearInterval(matrixInterval);
    const canvas = document.getElementById('matrix-canvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }


  // ─── LISTEN FOR REMOTE COUNTS ──────────────────────────────────────────────────
  attendRef.on('value', snap => {
    const count = snap.val() || 0;
    attendHeads.textContent  = '👤'.repeat(count);
  });
  declineRef.on('value', snap => {
    const count = snap.val() || 0;
    declineHeads.textContent = '👤'.repeat(count);
  });


  // ─── NAVIGATION & PASSCODE ───────────────────────────────────────────────────
  retryBtn.addEventListener('click', () => {
    deniedScreen.classList.add('hidden');
    passScreen.classList.remove('hidden');
    input.value = '';
  });

  submitBtn.addEventListener('click', () => {
    if (input.value === correctPasscode) {
      passScreen.classList.add('hidden');
      loadingScreen.classList.remove('hidden');

      matrixAudio.currentTime = 0;
      matrixAudio.play();
      startMatrix();

      // 5s matrix, then show ACCESS GRANTED 2s, then party
      setTimeout(() => {
        stopMatrix();
        matrixAudio.pause();
        accessBanner.classList.remove('hidden');

        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          partyScreen.classList.remove('hidden');
          partyAudio.currentTime = 0;
          partyAudio.play();
        }, 2000);

      }, 5000);

    } else {
      passScreen.classList.add('hidden');
      deniedScreen.classList.remove('hidden');
    }
  });


  // ─── RSVP BUTTONS ─────────────────────────────────────────────────────────────
  attendBtn.addEventListener('click', () => {
    // Atomically increment “attend” in Firebase
    attendRef.transaction(c => (c || 0) + 1);
    attendBtn.disabled  = true;
    declineBtn.disabled = true;
  });

  declineBtn.addEventListener('click', () => {
    // Atomically increment “decline” in Firebase
    declineRef.transaction(c => (c || 0) + 1);
    attendBtn.disabled  = true;
    declineBtn.disabled = true;
  });
});
