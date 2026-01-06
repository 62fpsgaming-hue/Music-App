// ===== MINIMAL MUSIC PLAYER =====

// Global state
let currentSong = null;
let isPlaying = false;
let currentPage = 'home';
let playlist = [];
let favorites = [];
let audio = null;

// Initialize app
function init() {
  audio = document.getElementById('audioPlayer');
  loadData();
  setupEvents();
  setupSidebar();
  showPage('home');
  
  if (playlist.length > 0) {
    currentSong = playlist[0];
    updatePlayer();
  }
}

// Setup sidebar toggle
function setupSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `;
  toggleBtn.onclick = () => {
    const isCollapsed = sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed');
    document.querySelector('.app').classList.toggle('sidebar-collapsed');
    
    // Update icon
    toggleBtn.innerHTML = isCollapsed ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    ` : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
  };
  sidebar.insertBefore(toggleBtn, sidebar.firstChild);
}

// Setup event listeners
function setupEvents() {
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    };
  });

  // Player controls
  document.getElementById('playBtn').onclick = togglePlay;
  document.getElementById('prevBtn').onclick = prevSong;
  document.getElementById('nextBtn').onclick = nextSong;
  
  // Audio events
  audio.ontimeupdate = updateProgress;
  audio.onloadedmetadata = () => {
    document.getElementById('duration').textContent = formatTime(audio.duration);
  };
  audio.onended = nextSong;

  // Volume and progress
  document.getElementById('volumeSlider').oninput = (e) => {
    audio.volume = e.target.value / 100;
  };
  
  document.getElementById('progressSlider').oninput = (e) => {
    audio.currentTime = (e.target.value / 100) * audio.duration;
  };

  // Search
  document.getElementById('searchInput').oninput = (e) => {
    if (currentPage === 'library') {
      renderLibrary(e.target.value);
    }
  };

  // Modals
  document.getElementById('settingsLink').onclick = () => showModal('settingsModal');
  document.getElementById('aboutLink').onclick = () => showModal('aboutModal');
  document.getElementById('createPlaylistBtn').onclick = () => showModal('playlistModal');
  
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.onclick = (e) => hideModal(e.target.closest('.modal').id);
  });

  document.getElementById('clearStorageBtn').onclick = clearData;
  document.getElementById('savePlaylistBtn').onclick = savePlaylist;
}

// Page navigation
function showPage(page) {
  currentPage = page;
  
  // Update nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Show page
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = p.dataset.page === page ? 'block' : 'none';
  });

  // Render content
  switch(page) {
    case 'home': renderHome(); break;
    case 'library': renderLibrary(); break;
    case 'favorites': renderFavorites(); break;
    case 'playlists': renderPlaylists(); break;
  }
}

// Render home page
function renderHome() {
  const container = document.querySelector('#homePage .home-container');
  container.innerHTML = `
    <div class="featured-hero-card">
      <div class="hero-content">
        <div class="hero-badge">New Release</div>
        <h2>Discover Weekly</h2>
        <p>Your weekly mixtape of fresh music.</p>
        <button class="btn-primary hero-btn" onclick="playRandom()">
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
        <div class="quick-access-card" onclick="showPage('library')">
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <span>All Songs</span>
        </div>
        <div class="quick-access-card" onclick="showPage('favorites')">
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <span>Favorites</span>
        </div>
        <div class="quick-access-card" onclick="playRandom()">
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
        </div>
        <div class="quick-access-card" onclick="showPage('playlists')">
          <div class="quick-access-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9h12M6 12h12M6 15h12M9 3H3v18h6"></path>
              <circle cx="18" cy="16" r="5"></circle>
              <path d="M18 13v6l2 1"></path>
            </svg>
          </div>
          <span>Playlists</span>
        </div>
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
}

// Create song cards
function createCards(songs) {
  return songs.map(song => `
    <div class="song-card" onclick="playSong(${song.id})">
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

// Render library
function renderLibrary(search = '') {
  const list = document.getElementById('libraryList');
  const empty = document.getElementById('emptyLibrary');
  
  let songs = playlist;
  if (search) {
    songs = playlist.filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (songs.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
  } else {
    empty.style.display = 'none';
    list.innerHTML = createList(songs);
  }
}

// Render favorites
function renderFavorites() {
  const list = document.getElementById('favoritesList');
  const empty = document.getElementById('emptyFavorites');
  
  if (favorites.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
  } else {
    empty.style.display = 'none';
    list.innerHTML = createList(favorites);
  }
}

// Render playlists
function renderPlaylists() {
  const grid = document.getElementById('playlistsGrid');
  const empty = document.getElementById('emptyPlaylists');
  
  if (playlist.length === 0) {
    empty.style.display = 'block';
    grid.innerHTML = '';
  } else {
    empty.style.display = 'none';
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
  }
}

// Create song list
function createList(songs) {
  return songs.map(song => `
    <div class="song-item ${currentSong?.id === song.id ? 'active' : ''}" onclick="playSong(${song.id})">
      <div class="song-cover-small"></div>
      <div class="song-meta">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      <div class="song-album">${song.album}</div>
      <div class="song-duration">${formatTime(song.duration)}</div>
      <div class="song-actions">
        <button class="btn-icon fav-btn ${favorites.find(f => f.id === song.id) ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFav(${song.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Player functions
function playSong(id) {
  const song = playlist.find(s => s.id === id);
  if (!song) return;
  
  currentSong = song;
  audio.src = song.url;
  audio.play();
  isPlaying = true;
  updatePlayer();
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

function updatePlayer() {
  if (!currentSong) return;
  
  document.getElementById('playerTitle').textContent = currentSong.title;
  document.getElementById('playerArtist').textContent = currentSong.artist;
  
  const npTitle = document.getElementById('npCardTitle');
  const npArtist = document.getElementById('npCardArtist');
  if (npTitle) npTitle.textContent = currentSong.title;
  if (npArtist) npArtist.textContent = currentSong.artist;
  
  updatePlayBtn();
  
  // Update active states
  document.querySelectorAll('.song-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Re-render current page to show active state
  if (currentPage === 'library') renderLibrary();
  if (currentPage === 'favorites') renderFavorites();
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
  
  // Update current page
  if (currentPage === 'favorites') renderFavorites();
  if (currentPage === 'library') renderLibrary();
  if (currentPage === 'home') renderHome();
}

// Modal functions
function showModal(id) {
  document.getElementById(id).classList.add('active');
}

function hideModal(id) {
  document.getElementById(id).classList.remove('active');
}

function savePlaylist() {
  const name = document.getElementById('playlistName').value.trim();
  if (!name) return;
  
  alert(`Playlist "${name}" created!`);
  hideModal('playlistModal');
  document.getElementById('playlistName').value = '';
}

// Storage
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

function clearData() {
  if (confirm('Clear all data?')) {
    localStorage.clear();
    favorites = [];
    currentSong = null;
    isPlaying = false;
    audio.src = '';
    showPage('home');
  }
}

// Utilities
function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);