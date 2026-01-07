// Lightweight player: minimal functions, no complex data structures
document.addEventListener('DOMContentLoaded', function () {
  var audio = document.getElementById('audioPlayer');
  var mainPlayBtn = document.getElementById('playBtn');

  function setNowPlaying(title, artist) {
    var playerTitle = document.getElementById('playerTitle');
    var playerArtist = document.getElementById('playerArtist');
    var npTitle = document.getElementById('npCardTitle');
    var npArtist = document.getElementById('npCardArtist');
    if (playerTitle) playerTitle.textContent = title || 'Soundbox';
    if (playerArtist) playerArtist.textContent = artist || 'Select a song';
    if (npTitle) npTitle.textContent = title || 'Select a song';
    if (npArtist) npArtist.textContent = artist || 'No song selected';
  }

  function updatePlayIcon() {
    if (!mainPlayBtn) return;
    if (audio && !audio.paused) {
      mainPlayBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
    } else {
      mainPlayBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  }

  function playSong(url, title, artist, el) {
    if (!url) return;
    if (audio.src !== url) audio.src = url;
    audio.play();
    setNowPlaying(title, artist);
    // mark playing item
    document.querySelectorAll('.song-item').forEach(function(i){ i.removeAttribute('data-playing'); });
    if (el) el.setAttribute('data-playing','true');
    updatePlayIcon();
  }

  // Progress / time updates
  var progressFill = document.getElementById('progressFill');
  var progressSlider = document.getElementById('progressSlider');
  var currentTimeEl = document.getElementById('currentTime');
  var durationEl = document.getElementById('duration');
  var volumeSlider = document.getElementById('volumeSlider');

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' + secs : secs);
  }

  function updateProgress() {
    if (!audio || !audio.duration) return;
    var percent = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressSlider) progressSlider.value = percent;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  }

  function updateDuration() {
    if (!audio || !audio.duration) return;
    if (durationEl) durationEl.textContent = formatTime(audio.duration);
  }

  if (progressSlider) {
    progressSlider.addEventListener('input', function(e){
      if (!audio.duration) return;
      var val = Number(e.target.value);
      audio.currentTime = (val/100) * audio.duration;
    });
  }

  if (volumeSlider) {
    // initialize volume from slider
    audio.volume = Number(volumeSlider.value || 100) / 100;
    volumeSlider.addEventListener('input', function(e){
      audio.volume = Number(e.target.value) / 100;
    });
  }

  if (audio) {
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', updatePlayIcon);
    audio.addEventListener('pause', updatePlayIcon);
    audio.addEventListener('ended', function(){
      // clear playing marker on end
      document.querySelectorAll('.song-item').forEach(function(i){ i.removeAttribute('data-playing'); });
      updatePlayIcon();
    });
  }

  function togglePlay() {
    if (!audio) return;
    if (audio.paused) audio.play(); else audio.pause();
    updatePlayIcon();
  }

  // Attach listeners to song items and fav buttons
  document.querySelectorAll('.song-item').forEach(function(item){
    item.addEventListener('click', function(e){
      if (e.target.closest('.fav-btn')) return;
      var url = item.getAttribute('data-url');
      var title = item.querySelector('.song-title') && item.querySelector('.song-title').textContent;
      var artist = item.querySelector('.song-artist') && item.querySelector('.song-artist').textContent;
      playSong(url, title, artist, item);
    });
    var fav = item.querySelector('.fav-btn');
    if (fav) {
      fav.addEventListener('click', function(ev){
        ev.stopPropagation();
        fav.classList.toggle('active');
        // persist simple favorite ids in localStorage
        try {
          var favs = JSON.parse(localStorage.getItem('favIds') || '[]');
          var id = item.dataset.id;
          var idx = favs.indexOf(id);
          if (idx > -1) favs.splice(idx,1); else favs.push(id);
          localStorage.setItem('favIds', JSON.stringify(favs));
        } catch (err) { /* ignore storage errors */ }
      });
    }
  });

  // initialize fav state from storage
  try {
    var stored = JSON.parse(localStorage.getItem('favIds') || '[]');
    document.querySelectorAll('.song-item').forEach(function(it){ if (stored.indexOf(it.dataset.id) > -1) { var b = it.querySelector('.fav-btn'); if (b) b.classList.add('active'); } });
  } catch(e) {}

  if (mainPlayBtn) mainPlayBtn.addEventListener('click', function(){
    // simple play/pause toggle
    if (!audio.src) {
      // play first song if none selected
      var first = document.querySelector('.song-item');
      if (first) first.click();
      return;
    }
    togglePlay();
  });

  // update icon on native play/pause
  if (audio) {
    audio.addEventListener('play', updatePlayIcon);
    audio.addEventListener('pause', updatePlayIcon);
  }
});
// ===== LIGHTWEIGHT MUSIC PLAYER =====

// Global state
let currentSong = null;
let isPlaying = false;
let playlist = [];
let favorites = [];
const audio = new Audio();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupPageNavigation();
  setupAudioEvents();
  setupModalHandlers();
  setupSearch();
  setupStorageButton();
  renderAllPages();
});

// Page Navigation with adio Buttons
function setupPageNavigation() {
  document.querySelectorAll('.page-radio').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const page = e.target.value;
      document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
      document.getElementById(page + 'Page').style.display = 'block';
      document.querySelector('.app').setAttribute('data-page', page);
    });
  });
}

// Audio Events
function setupAudioEvents() {
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressSlider = document.getElementById('progressSlider');
  const volumeSlider = document.getElementById('volumeSlider');

  // Play/Pause
  playBtn.addEventListener('click', togglePlay);
  
  // Navigation
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  
  // Progress bar interaction
  progressSlider.addEventListener('input', (e) => {
    audio.currentTime = (e.target.value / 100) * audio.duration;
  });
  
  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
  });
  
  // Audio events
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('duration').textContent = formatTime(audio.duration);
  });
  audio.addEventListener('ended', nextSong);
}

// Modal Handlers - Using HTML Dialog Element
function setupModalHandlers() {
  // Open modals with hash links
  document.querySelectorAll('.modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('href').substring(1);
      document.getElementById(modalId).showModal();
    });
  });
  
  // Close modals
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.target.closest('.modal').close();
    });
  });
  
  // Close modal on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  });
  
  // Playlist form submit
  const playlistForm = document.getElementById('playlistForm');
  if (playlistForm) {
    playlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('playlistName').value.trim();
      if (name) {
        alert(`Playlist "${name}" created!`);
        playlistForm.reset();
        document.getElementById('playlistModal').close();
      }
    });
  }
}

// Search Functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    renderLibrary(query);
  });
}

// Clear Storage Button
function setupStorageButton() {
  const clearBtn = document.getElementById('clearStorageBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all data?')) {
        localStorage.clear();
        favorites = [];
        playlist = [];
        currentSong = null;
        isPlaying = false;
        audio.src = '';
        renderAllPages();
      }
    });
  }
}

// Render all pages
function renderAllPages() {
  renderHome();
  renderLibrary();
  renderFavorites();
  renderPlaylists();
  updateNowPlayingCard();
}

// Home Page
function renderHome() {
  const container = document.querySelector('#homePage .home-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="featured-hero-card">
      <div class="hero-content">
        <div class="hero-badge">New Release</div>
        <h2>Discover Weekly</h2>
        <p>Your weekly mixtape of fresh music.</p>
        <button class="btn-primary hero-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play Mix
        </button>
      </div>
      <div class="hero-artwork">
        <div class="hero-cover"></div>
      </div>
    </div>

    <div class="home-section">
      <h3>Your Music Stats</h3>
      <div class="stats-cards-grid">
        <div class="stats-card">
          <div class="stats-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="stats-info">
            <h4>${playlist.length}</h4>
            <p>Songs</p>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div class="stats-info">
            <h4>${favorites.length}</h4>
            <p>Favorites</p>
          </div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <h3>Quick Access</h3>
      <div class="quick-access-grid">
        <label class="quick-access-card">
          <input type="radio" name="page" value="library" class="page-radio" hidden>
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <span>All Songs</span>
        </label>
        <label class="quick-access-card">
          <input type="radio" name="page" value="favorites" class="page-radio" hidden>
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <span>Favorites</span>
        </label>
        <button class="quick-access-card" onclick="playRandom()">
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </div>
          <span>Shuffle</span>
        </button>
        <label class="quick-access-card">
          <input type="radio" name="page" value="playlists" class="page-radio" hidden>
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9h12M6 12h12M6 15h12M9 3H3v18h6"></path>
              <circle cx="18" cy="16" r="5"></circle>
              <path d="M18 13v6l2 1"></path>
            </svg>
          </div>
          <span>Playlists</span>
        </label>
      </div>
    </div>

    <div class="home-section">
      <h3>Recent Songs</h3>
      <div class="carousel-container">
        <div class="carousel-track">
          ${createCards(playlist.slice(0, 6))}
        </div>
      </div>
    </div>
  `;
  
  // Setup quick access cards
  document.querySelectorAll('.quick-access-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.querySelector(`input[value="${e.target.value}"][name="page"]`).click();
      }
    });
  });
  
  // Setup song card clicks
  document.querySelectorAll('.song-card').forEach((card, idx) => {
    card.addEventListener('click', () => playSong(playlist[idx % playlist.length].id));
  });
}

// Library Page
function renderLibrary(search = '') {
  const list = document.getElementById('libraryList');
  const empty = document.getElementById('emptyLibrary');
  if (!list) return;
  
  let songs = playlist;
  if (search) {
    songs = playlist.filter(s => 
      s.title.toLowerCase().includes(search) ||
      s.artist.toLowerCase().includes(search)
    );
  }
  
  if (songs.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
  } else {
    list.innerHTML = createSongList(songs);
    empty.style.display = 'none';
    setupSongListListeners();
  }
}

// Favorites Page
function renderFavorites() {
  const list = document.getElementById('favoritesList');
  const empty = document.getElementById('emptyFavorites');
  if (!list) return;
  
  if (favorites.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
  } else {
    list.innerHTML = createSongList(favorites);
    empty.style.display = 'none';
    setupSongListListeners();
  }
}

// Playlists Page
function renderPlaylists() {
  const grid = document.getElementById('playlistsGrid');
  const empty = document.getElementById('emptyPlaylists');
  if (!grid) return;
  
  if (playlist.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
  } else {
    grid.innerHTML = `
      <div class="playlist-card">
        <div class="playlist-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9h12M6 12h12M6 15h12M9 3H3v18h6"></path>
            <circle cx="18" cy="16" r="5"></circle>
            <path d="M18 13v6l2 1"></path>
          </svg>
        </div>
        <h4>All Songs</h4>
        <div class="playlist-count">${playlist.length} songs</div>
      </div>
    `;
    empty.style.display = 'none';
  }
}

// Helper: Create song cards
function createCards(songs) {
  return songs.map(song => `
    <div class="song-card">
      <div class="song-card-cover">
        <div class="song-card-play">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div class="song-card-info">
        <div class="song-card-title">${song.title}</div>
        <div class="song-card-artist">${song.artist}</div>
      </div>
    </div>
  `).join('');
}

// Helper: Create song list
function createSongList(songs) {
  return songs.map(song => `
    <div class="song-item ${currentSong?.id === song.id ? 'active' : ''}">
      <div class="song-cover-small"></div>
      <div class="song-meta">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      <div class="song-album">${song.album}</div>
      <div class="song-duration">${formatTime(song.duration)}</div>
      <div class="song-actions">
        <button class="btn-icon fav-btn ${favorites.find(f => f.id === song.id) ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Setup song list listeners
function setupSongListListeners() {
  document.querySelectorAll('.song-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.fav-btn')) {
        const title = item.querySelector('.song-title').textContent;
        const song = playlist.find(s => s.title === title);
        if (song) playSong(song.id);
      }
    });
    
    item.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const title = item.querySelector('.song-title').textContent;
      const song = playlist.find(s => s.title === title) || favorites.find(s => s.title === title);
      if (song) toggleFav(song.id);
    });
  });
}

// Player Functions
function playSong(id) {
  const song = playlist.find(s => s.id === id);
  if (!song) return;
  
  currentSong = song;
  audio.src = song.url;
  audio.play();
  isPlaying = true;
  updatePlayBtn();
  updateNowPlayingCard();
  renderAllPages();
}

function togglePlay() {
  if (!currentSong && playlist.length > 0) {
    playSong(playlist[0].id);
    return;
  }
  
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
  updatePlayBtn();
}

function nextSong() {
  if (!currentSong || playlist.length === 0) return;
  const index = playlist.findIndex(s => s.id === currentSong.id);
  const nextIndex = (index + 1) % playlist.length;
  playSong(playlist[nextIndex].id);
}

function prevSong() {
  if (!currentSong || playlist.length === 0) return;
  const index = playlist.findIndex(s => s.id === currentSong.id);
  const prevIndex = (index - 1 + playlist.length) % playlist.length;
  playSong(playlist[prevIndex].id);
}

function playRandom() {
  if (playlist.length === 0) return;
  const randomIndex = Math.floor(Math.random() * playlist.length);
  playSong(playlist[randomIndex].id);
}

function updatePlayBtn() {
  document.getElementById('playBtn').innerHTML = isPlaying ? 
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
    </svg>` : 
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>`;
}

function updateProgress() {
  if (!audio.duration) return;
  
  const percent = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressSlider').value = percent;
  document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
}

function updateNowPlayingCard() {
  if (!currentSong) {
    document.getElementById('npCardTitle').textContent = 'Select a song';
    document.getElementById('npCardArtist').textContent = 'No song selected';
  } else {
    document.getElementById('npCardTitle').textContent = currentSong.title;
    document.getElementById('npCardArtist').textContent = currentSong.artist;
  }
}

// Favorites
function toggleFav(id) {
  const song = playlist.find(s => s.id === id);
  if (!song) return;
  
  const index = favorites.findIndex(f => f.id === id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(song);
  }
  
  saveData();
  renderAllPages();
}

// Data Persistence
function loadData() {
  try {
    const data = localStorage.getItem('musicData');
    if (data) {
      const parsed = JSON.parse(data);
      favorites = parsed.favorites || [];
      playlist = parsed.playlist || [];
    }
  } catch (e) {
    console.error('Load error:', e);
  }
  
  // Initialize with sample data if empty
  if (playlist.length === 0) {
    playlist = [
      { id: 1, title: 'Summer Breeze', artist: 'Kevin MacLeod', album: 'Free Music', duration: 244, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 2, title: 'Sunny Afternoon', artist: 'Kevin MacLeod', album: 'Free Music', duration: 200, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 3, title: 'Evening Walk', artist: 'Kevin MacLeod', album: 'Free Music', duration: 203, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 4, title: 'Upbeat Groove', artist: 'Kevin MacLeod', album: 'Free Music', duration: 322, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { id: 5, title: 'Night Vibes', artist: 'Kevin MacLeod', album: 'Free Music', duration: 269, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: 6, title: 'Electric Dreams', artist: 'Kevin MacLeod', album: 'Free Music', duration: 172, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
    ];
    saveData();
  }
}

function saveData() {
  try {
    localStorage.setItem('musicData', JSON.stringify({ playlist, favorites }));
  } catch (e) {
    console.error('Save error:', e);
  }
}

// Utilities
function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}