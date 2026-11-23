// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 2000);
});

// ===== CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  if (cursorFollower) {
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
  }
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .gallery-item, .tab, .char-card, .mem-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorFollower.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hover'));
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== HERO STARS =====
const heroStars = document.getElementById('heroStars');
for (let i = 0; i < 30; i++) {
  const star = document.createElement('div');
  star.className = 'hero-star';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 60 + '%';
  star.style.animationDelay = Math.random() * 3 + 's';
  heroStars.appendChild(star);
}

// ===== HERO BILBY INTERACTION =====
const heroBilby = document.getElementById('heroBilby');
heroBilby.addEventListener('click', () => {
  heroBilby.style.animation = 'none';
  heroBilby.style.transform = 'translateY(-60px) scale(1.1)';
  setTimeout(() => {
    heroBilby.style.transform = '';
    heroBilby.style.animation = 'float 4s ease-in-out infinite';
  }, 600);
});

// ===== COUNTERS =====
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, 20);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ===== VIDEO LINK =====
const mainVideo = document.getElementById('mainVideo');
const videoOverlay = document.getElementById('videoOverlay');
const videoUrlInput = document.getElementById('videoUrlInput');
const linkStatus = document.getElementById('linkStatus');

videoOverlay.addEventListener('click', () => {
  videoOverlay.classList.add('hidden');
  if (mainVideo.querySelector('source').src || mainVideo.src) {
    mainVideo.play().catch(() => {});
  }
});

function applyVideoLink() {
  const url = videoUrlInput.value.trim();
  if (!url) {
    linkStatus.textContent = '⚠️ Вставь ссылку на видео';
    linkStatus.className = 'link-status error';
    return;
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    videoOverlay.classList.add('hidden');
    const frame = document.getElementById('videoFrame');
    frame.innerHTML = `<iframe style="width:100%;height:100%;border:none" src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    linkStatus.textContent = '✅ YouTube видео загружено!';
    linkStatus.className = 'link-status success';
    return;
  }

  // VK
  if (url.includes('vk.com/video')) {
    videoOverlay.classList.add('hidden');
    const frame = document.getElementById('videoFrame');
    frame.innerHTML = `<iframe style="width:100%;height:100%;border:none" src="${url.replace('vk.com/video', 'vk.com/video_ext.php')}" allowfullscreen allow="autoplay"></iframe>`;
    linkStatus.textContent = '✅ VK видео загружено!';
    linkStatus.className = 'link-status success';
    return;
  }

  // MP4 / direct
  mainVideo.querySelector('source').src = url;
  mainVideo.load();
  mainVideo.play().catch(() => {});
  videoOverlay.classList.add('hidden');
  linkStatus.textContent = '✅ Видео загружено!';
  linkStatus.className = 'link-status success';
}

function setPreset(type) {
  const presets = {
    mp4: 'https://www.w3schools.com/html/mov_bbb.mp4',
    youtube: 'https://www.youtube.com/watch?v=DEMO_VIDEO',
    vk: 'https://vk.com/video-123456_7890'
  };
  videoUrlInput.value = presets[type];
  linkStatus.textContent = '💡 Ссылка вставлена — нажми «Применить»';
  linkStatus.className = 'link-status';
}

// ===== TABS =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('game-' + tab.dataset.game).classList.add('active');
  });
});

// ===== CATCH GAME =====
let catchRunning = false, catchScore = 0, catchTime = 30, catchTimer, catchSpawner;
let playerX = 50, playerY = 50;
const catchArena = document.getElementById('catchArena');
const catchPlayer = document.getElementById('catchPlayer');
const catchScoreEl = document.getElementById('catchScore');
const catchBestEl = document.getElementById('catchBest');
const catchTimeEl = document.getElementById('catchTime');

catchArena.addEventListener('mousemove', e => {
  if (!catchRunning) return;
  const rect = catchArena.getBoundingClientRect();
  playerX = ((e.clientX - rect.left) / rect.width) * 100;
  playerY = ((e.clientY - rect.top) / rect.height) * 100;
  catchPlayer.style.left = playerX + '%';
  catchPlayer.style.top = playerY + '%';
});
catchArena.addEventListener('touchmove', e => {
  if (!catchRunning) return;
  const rect = catchArena.getBoundingClientRect();
  const t = e.touches[0];
  playerX = ((t.clientX - rect.left) / rect.width) * 100;
  playerY = ((t.clientY - rect.top) / rect.height) * 100;
  catchPlayer.style.left = playerX + '%';
  catchPlayer.style.top = playerY + '%';
  e.preventDefault();
}, { passive: false });

function startCatch() {
  if (catchRunning) return;
  catchRunning = true; catchScore = 0; catchTime = 30;
  catchScoreEl.textContent = '0'; catchTimeEl.textContent = '30';
  catchArena.querySelectorAll('.falling-star, .falling-enemy').forEach(e => e.remove());

  catchTimer = setInterval(() => {
    catchTime--;
    catchTimeEl.textContent = catchTime;
    if (catchTime <= 0) endCatch();
  }, 1000);

  catchSpawner = setInterval(spawnCatchObject, 700);
}

function spawnCatchObject() {
  if (!catchRunning) return;
  const isEnemy = Math.random() < 0.25;
  const obj = document.createElement('div');
  obj.className = isEnemy ? 'falling-enemy' : 'falling-star';
  obj.textContent = isEnemy ? '🦅' : '⭐';
  obj.style.left = Math.random() * 90 + 5 + '%';
  const dur = 1.8 + Math.random() * 1.5;
  obj.style.animation = `fall ${dur}s linear forwards`;
  catchArena.appendChild(obj);

  const check = setInterval(() => {
    const oRect = obj.getBoundingClientRect();
    const pRect = catchPlayer.getBoundingClientRect();
    const dx = Math.abs((oRect.left + oRect.width/2) - (pRect.left + pRect.width/2));
    const dy = Math.abs((oRect.top + oRect.height/2) - (pRect.top + pRect.height/2));
    if (dx < 45 && dy < 45) {
      clearInterval(check);
      if (isEnemy) {
        endCatch(); obj.remove();
      } else {
        catchScore += 10;
        catchScoreEl.textContent = catchScore;
        obj.remove();
      }
    }
    if (oRect.top > catchArena.getBoundingClientRect().bottom) clearInterval(check);
  }, 60);

  setTimeout(() => obj.remove(), dur * 1000 + 200);
}

function endCatch() {
  catchRunning = false;
  clearInterval(catchTimer);
  clearInterval(catchSpawner);
  catchArena.querySelectorAll('.falling-star, .falling-enemy').forEach(e => e.remove());
  const best = parseInt(localStorage.getItem('bilbyBest') || '0');
  if (catchScore > best) {
    localStorage.setItem('bilbyBest', catchScore);
    catchBestEl.textContent = catchScore;
  }
}

catchBestEl.textContent = localStorage.getItem('bilbyBest') || '0';

// ===== MEMORY GAME =====
const memoryGrid = document.getElementById('memoryGrid');
const memMovesEl = document.getElementById('memMoves');
const memPairsEl = document.getElementById('memPairs');
const memTimeEl = document.getElementById('memTime');
let memFlipped = [], memMoves = 0, memPairs = 0, memLock = false, memTimer, memSeconds = 0;

const memIcons = ['🦊', '🐣', '🦅', '🌵', '⭐', '🏜️'];

function startMemory() {
  clearInterval(memTimer);
  memFlipped = []; memMoves = 0; memPairs = 0; memLock = false; memSeconds = 0;
  memMovesEl.textContent = '0'; memPairsEl.textContent = '0/6'; memTimeEl.textContent = '0';
  memoryGrid.innerHTML = '';

  const deck = [...memIcons, ...memIcons].sort(() => Math.random() - 0.5);
  deck.forEach(icon => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.innerHTML = `<div class="mem-inner">
      <div class="mem-front">?</div>
      <div class="mem-back">${icon}</div>
    </div>`;
    card.dataset.icon = icon;
    card.addEventListener('click', () => flipCard(card));
    memoryGrid.appendChild(card);
  });

  memTimer = setInterval(() => { memSeconds++; memTimeEl.textContent = memSeconds; }, 1000);
}

function flipCard(card) {
  if (memLock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  memFlipped.push(card);

  if (memFlipped.length === 2) {
    memMoves++;
    memMovesEl.textContent = memMoves;
    memLock = true;
    if (memFlipped[0].dataset.icon === memFlipped[1].dataset.icon) {
      memFlipped.forEach(c => c.classList.add('matched'));
      memPairs++;
      memPairsEl.textContent = memPairs + '/6';
      memFlipped = []; memLock = false;
      if (memPairs === 6) {
        clearInterval(memTimer);
        setTimeout(() => alert(`🎉 Победа! Ходов: ${memMoves}, Время: ${memSeconds}с`), 400);
      }
    } else {
      setTimeout(() => {
        memFlipped.forEach(c => c.classList.remove('flipped'));
        memFlipped = []; memLock = false;
      }, 900);
    }
  }
}

// ===== QUIZ =====
const quizData = [
  { q: 'В каком году вышел мультфильм «Билби»?', a: ['2016', '2018', '2020', '2019'], correct: 1 },
  { q: 'Кто главный герой мультфильма?', a: ['Птенец', 'Кенгуру', 'Билби', 'Змея'], correct: 2 },
  { q: 'Сколько длится мультфильм?', a: ['5 минут', '8 минут', '15 минут', '3 минуты'], correct: 1 },
  { q: 'Какая студия создала мультфильм?', a: ['Pixar', 'Disney', 'DreamWorks', 'Sony'], correct: 2 },
  { q: 'Кого спасает Билби?', a: ['Птенца', 'Котёнка', 'Ящерицу', 'Другого билби'], correct: 0 }
];
let quizIndex = 0, quizScore = 0, quizActive = false;

function startQuiz() {
  quizIndex = 0; quizScore = 0; quizActive = true;
  document.getElementById('quizScore').textContent = '0';
  showQuestion();
}

function showQuestion() {
  if (quizIndex >= quizData.length) {
    document.getElementById('quizQuestion').textContent = '🏆 Викторина завершена!';
    document.getElementById('quizAnswers').innerHTML = '';
    document.getElementById('quizResult').textContent = `Твой результат: ${quizScore}/${quizData.length} правильных!`;
    quizActive = false;
    return;
  }
  const q = quizData[quizIndex];
  document.getElementById('quizQ').textContent = (quizIndex + 1) + '/' + quizData.length;
  document.getElementById('quizQuestion').textContent = q.q;
  document.getElementById('quizResult').textContent = '';
  const ansBox = document.getElementById('quizAnswers');
  ansBox.innerHTML = '';
  q.a.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-answer';
    btn.textContent = ans;
    btn.onclick = () => {
      if (!quizActive) return;
      if (i === q.correct) { btn.classList.add('correct'); quizScore++; document.getElementById('quizScore').textContent = quizScore; }
      else { btn.classList.add('wrong'); btn.parentNode.children[q.correct].classList.add('correct'); }
      quizActive = false;
      setTimeout(() => { quizIndex++; quizActive = true; showQuestion(); }, 900);
    };
    ansBox.appendChild(btn);
  });
}

// ===== GALLERY LIGHTBOX =====
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const placeholder = item.querySelector('.gallery-placeholder');
    content.textContent = placeholder.textContent;
    content.style.background = placeholder.style.background || getComputedStyle(placeholder).background;
    content.className = 'lightbox-content ' + placeholder.className;
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target.id === 'lightbox') closeLightbox();
});

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.char-card, .timeline-item, .gallery-item, .fact-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s, transform 0.6s';
  revealObserver.observe(el);
});
