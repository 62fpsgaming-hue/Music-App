document.addEventListener('DOMContentLoaded', () => {
  // State
  const audio = new Audio();
  let playlist = getStoredData() || getDefaultSongs();
  let currentIdx = -1;
  let isPlaying = false;

  // DOM Elements
  const els = {
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    progress: document.getElementById('progressSlider'),
    fill: document.getElementById('progressFill'),
    time: document.getElementById('currentTime'),
    duration: document.getElementById('duration'),
    volume: document.getElementById('volumeSlider'),
    library: document.getElementById('libraryList'),
    npTitle: document.getElementById('npCardTitle'),
    npArtist: document.getElementById('npCardArtist')
  };

  // --- Initialization ---
  renderLibrary();
  setupNavigation();
  setupPlayerEvents();

  // --- Core Player Logic ---
  function playSong(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentIdx = index;
    const song = playlist[index];
    
    // Update Audio
    if (audio.src !== song.url) audio.src = song.url;
    audio.play();
    isPlaying = true;

    // Update UI
    updatePlayerUI(song);
    renderLibrary(); // Re-render to show active state
  }

  function togglePlay() {
    if (currentIdx === -1) { playSong(0); return; }
    
    if (audio.paused) {
      audio.play();
      isPlaying = true;
    } else {
      audio.pause();
      isPlaying = false;
    }
    updatePlayIcon();
  }

  function nextSong() {
    playSong((currentIdx + 1) % playlist.length);
  }

  function prevSong() {
    playSong((currentIdx - 1 + playlist.length) % playlist.length);
  }

  // --- UI Updates ---
  function updatePlayerUI(song) {
    if (els.npTitle) els.npTitle.textContent = song.title;
    if (els.npArtist) els.npArtist.textContent = song.artist;
    updatePlayIcon();
  }

  function updatePlayIcon() {
    // Simple SVG toggle
    els.playBtn.innerHTML = isPlaying 
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' // Pause
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; // Play
  }

  function updateProgress() {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    
    if (els.progress) els.progress.value = percent;
    if (els.fill) els.fill.style.width = `${percent}%`;
    if (els.time) els.time.textContent = formatTime(audio.currentTime);
  }

  // --- Rendering ---
  function renderLibrary() {
    if (!els.library) return;
    
    els.library.innerHTML = playlist.map((song, idx) => `
      <div class="song-item ${idx === currentIdx ? 'active' : ''}" onclick="window.playSongGlobal(${idx})">
        <div class="song-cover-small"></div>
        <div class="song-meta">
          <div class="song-title">${song.title}</div>
          <div class="song-artist">${song.artist}</div>
        </div>
        <div class="song-duration">${formatTime(song.duration)}</div>
      </div>
    `).join('');
  }

  // --- Events ---
  function setupPlayerEvents() {
    // Buttons
    els.playBtn?.addEventListener('click', togglePlay);
    els.nextBtn?.addEventListener('click', nextSong);
    els.prevBtn?.addEventListener('click', prevSong);

    // Audio Object
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('loadedmetadata', () => {
      if(els.duration) els.duration.textContent = formatTime(audio.duration);
    });

    // Inputs
    els.progress?.addEventListener('input', (e) => {
      if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
    });
    
    els.volume?.addEventListener('input', (e) => {
      audio.volume = e.target.value / 100;
    });

    // Expose play function to global scope for HTML onclick
    window.playSongGlobal = playSong;
  }

  function setupNavigation() {
    const pages = document.querySelectorAll('.page');
    document.querySelectorAll('.nav-link input').forEach(input => {
      input.addEventListener('change', (e) => {
        const targetId = e.target.value + 'Page';
        pages.forEach(p => p.style.display = 'none');
        const target = document.getElementById(targetId);
        if(target) target.style.display = 'block';
      });
    });
  }

  // --- Utilities ---
  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function getStoredData() {
    try { return JSON.parse(localStorage.getItem('myMusicData')); } catch (e) { return null; }
  }

  function getDefaultSongs() {
    return [
      { title: 'Summer Breeze', artist: 'Kevin MacLeod', duration: 244, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { title: 'Sunny Afternoon', artist: 'Kevin MacLeod', duration: 200, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { title: 'Evening Walk', artist: 'Kevin MacLeod', duration: 203, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    ];
  }

});