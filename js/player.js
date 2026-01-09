import { tracks } from './tracks.js';
import * as Audio from './audio.js';
import { UI } from './ui.js';
import * as API from './api.js';

const state = {
    currentTrackIndex: 0,
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,
    isQueueActive: false,
    currentTime: 0,
    intervalId: null,
    queue: [],
    recentHistory: [],
    currentAPITrack: null // Track currently playing from API
};

export function init() {
    // Initialize audio system
    Audio.initAudio();
    
    // Set default volume
    Audio.setVolume(0.5);
    
    // Load initial track info into the UI (don't play it yet)
    const initialTrack = tracks[state.currentTrackIndex];
    if (initialTrack && initialTrack.src) {
        console.log('Initializing with track:', initialTrack.title);
        Audio.loadTrack(initialTrack.src);
        updatePlayerDisplay();
    } else {
        console.error('Initial track not found or missing src property');
    }
}

export function getCurrentState() {
    return state;
}

export function togglePlayPause() {
    state.isPlaying = !state.isPlaying;
    UI.updatePlayIcons(state.isPlaying);

    if (state.isPlaying) {
        startPlayback();
    } else {
        stopPlayback();
    }
}

function startPlayback() {
    if (state.intervalId) clearInterval(state.intervalId);

    const track = tracks[state.currentTrackIndex];
    
    // Load and play the audio file
    if (track.src) {
        console.log('Playing track:', track.title, 'from:', track.src);
        Audio.loadTrack(track.src);
        Audio.play();
    } else {
        console.error('No audio source found for track:', track.title);
    }

    addToHistory(state.currentTrackIndex);

    // Update time display based on actual audio playback
    state.intervalId = setInterval(() => {
        const currentTime = Audio.getCurrentTime();
        const duration = Audio.getDuration();
        
        if (!isNaN(duration) && duration > 0) {
            state.currentTime = currentTime;
            UI.updateTimeDisplay(currentTime, duration);
            
            // Check if track has ended
            if (currentTime >= duration) {
                onTrackEnd();
            }
        }
    }, 100);
}

function stopPlayback() {
    Audio.pause();
    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
}

function onTrackEnd() {
    if (state.isRepeat) {
        state.currentTime = 0;
        UI.updateTimeDisplay(0, tracks[state.currentTrackIndex].duration);
    } else {
        playNext(true);
    }
}

export function playNext(autoAdvance = false) {
    if (state.queue.length > 0) {
        const nextItem = state.queue.shift();
        
        // Handle API tracks in queue
        if (nextItem.isAPI && nextItem.data) {
            console.log('Playing queued API track:', nextItem.data.title);
            playTrack(-1, nextItem.data);
        } else {
            // Handle library tracks in queue
            playTrack(nextItem);
        }
        
        renderSidebarList();
        return;
    }

    if (state.isShuffle) {
        let nextIndex = state.currentTrackIndex;
        while (nextIndex === state.currentTrackIndex && tracks.length > 1) {
            nextIndex = Math.floor(Math.random() * tracks.length);
        }
        state.currentTrackIndex = nextIndex;
    } else {
        state.currentTrackIndex = (state.currentTrackIndex + 1) % tracks.length;
    }

    state.currentTime = 0;
    updatePlayerDisplay();
    if (state.isPlaying) startPlayback();
}

export function playPrevious() {
    if (state.currentTime > 3) {
        seek(0);
        return;
    }

    if (state.isShuffle) {
        let nextIndex = state.currentTrackIndex;
        while (nextIndex === state.currentTrackIndex && tracks.length > 1) {
            nextIndex = Math.floor(Math.random() * tracks.length);
        }
        state.currentTrackIndex = nextIndex;
    } else {
        state.currentTrackIndex = (state.currentTrackIndex - 1 + tracks.length) % tracks.length;
    }

    state.currentTime = 0;
    updatePlayerDisplay();
    if (state.isPlaying) startPlayback();
}

export function playTrack(index, apiTrackData = null) {
    // Handle API tracks
    if (apiTrackData && apiTrackData.isAPI && apiTrackData.src) {
        console.log('Playing API track preview:', apiTrackData);
        
        // Store API track data in state
        state.currentAPITrack = apiTrackData;
        state.currentTrackIndex = -1; // Indicate we're not playing from library
        state.currentTime = 0;
        state.isPlaying = false;
        
        // Stop any previous playback
        stopPlayback();
        
        // Create UI representation of API track
        const apiTrack = {
            title: apiTrackData.title || 'Unknown Track',
            artist: apiTrackData.artist || 'Unknown Artist',
            duration: apiTrackData.duration || 30, // 30-second preview
            genre: apiTrackData.genre || 'Music',
            favorite: false,
            coverColor: apiTrackData.coverColor || '#667eea',
            cover: apiTrackData.cover || ''
        };
        
        // Update UI with API track info
        UI.updatePlayerInfo(apiTrack, false, true); // true = isAPITrack
        UI.updateTimeDisplay(0, apiTrack.duration);
        
        // Load the preview URL
        Audio.loadTrack(apiTrackData.src);
        
        // Start playback after short delay to ensure audio is loaded
        setTimeout(() => {
            state.isPlaying = true;
            UI.updatePlayIcons(true);
            Audio.play();
            startAPIPlayback(apiTrack);
        }, 100);
        
        return;
    }

    // Handle library tracks
    if (!Number.isInteger(index) || index < 0 || index >= tracks.length) {
        console.error('Invalid track index:', index);
        return;
    }

    const track = tracks[index];
    if (!track) {
        console.error('Track not found at index:', index);
        return;
    }

    if (!track.src) {
        console.error('Track has no audio source:', track.title);
        return;
    }

    // Clear API track if playing library
    state.currentAPITrack = null;
    state.currentTrackIndex = index;
    state.currentTime = 0;
    updatePlayerDisplay();

    if (!state.isPlaying) {
        togglePlayPause();
    } else {
        stopPlayback();
        startPlayback();
    }
}

/**
 * Handle playback of API track preview with real-time updates
 */
function startAPIPlayback(apiTrack) {
    // Clear existing interval
    if (state.intervalId) clearInterval(state.intervalId);

    console.log('Starting API track playback with real-time sync');

    // Update time display in real-time
    state.intervalId = setInterval(() => {
        const currentTime = Audio.getCurrentTime();
        const duration = Audio.getDuration() || apiTrack.duration;
        
        if (!isNaN(duration) && duration > 0) {
            state.currentTime = currentTime;
            UI.updateTimeDisplay(currentTime, duration);
            
            // Check if preview has ended
            if (currentTime >= duration - 0.5) {
                console.log('API preview ended, stopping playback');
                stopPlayback();
                state.isPlaying = false;
                UI.updatePlayIcons(false);
            }
        }
    }, 100);
}

export function seek(percent) {
    const track = tracks[state.currentTrackIndex];
    const duration = Audio.getDuration();
    
    if (!isNaN(duration) && duration > 0) {
        const newTime = duration * percent;
        Audio.setCurrentTime(newTime);
        state.currentTime = newTime;
        UI.updateTimeDisplay(newTime, duration);
    }
}

function addToHistory(index) {
    state.recentHistory = state.recentHistory.filter(i => i !== index);
    state.recentHistory.unshift(index);
    if (state.recentHistory.length > 20) state.recentHistory.pop();
    refreshHistoryUI();
}

export function addToQueue(index, apiTrackData = null) {
    // Handle API tracks
    if (apiTrackData && apiTrackData.isAPI) {
        console.log(`Added API preview to queue: ${apiTrackData.title}`);
        // Store API track data in queue with special marker
        state.queue.push({ isAPI: true, data: apiTrackData });
    } else if (index >= 0 && index < tracks.length) {
        console.log(`Added ${tracks[index].title} to queue`);
        state.queue.push(index);
    } else {
        console.error('Invalid track index for queue:', index);
        return;
    }
    
    // Update UI if queue view is active
    if (state.isQueueActive) {
        renderSidebarList();
    }
    
    // Show queue indicator
    showQueueNotification();
}

export function toggleQueueView() {
    state.isQueueActive = !state.isQueueActive;
    UI.updateControlsState(state.isShuffle, state.isRepeat, state.isQueueActive);
    renderSidebarList();
}

export function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    if (state.isShuffle) state.isRepeat = false;
    UI.updateControlsState(state.isShuffle, state.isRepeat, state.isQueueActive);
}

export function toggleRepeat() {
    state.isRepeat = !state.isRepeat;
    if (state.isRepeat) state.isShuffle = false;
    UI.updateControlsState(state.isShuffle, state.isRepeat, state.isQueueActive);
}

function renderSidebarList() {
    if (state.isQueueActive) {
        // Map queue items - handle both API and library tracks
        const queueItems = state.queue.map((item, idx) => {
            if (item.isAPI && item.data) {
                return {
                    track: {
                        title: item.data.title,
                        artist: item.data.artist,
                        duration: item.data.duration,
                        genre: item.data.genre,
                        coverColor: item.data.coverColor,
                        cover: item.data.cover,
                        isFromAPI: true
                    },
                    originalIndex: -1,
                    isAPI: true
                };
            } else {
                // Library track
                return {
                    track: tracks[item],
                    originalIndex: item,
                    isAPI: false
                };
            }
        });
        UI.renderQueueOrPicks(queueItems, "Queue", playTrack);
    } else {
        // Show next up - only library tracks
        const nextUp = [];
        if (state.currentTrackIndex >= 0 && state.currentTrackIndex < tracks.length) {
            for (let i = 1; i <= 5 && tracks.length > 0; i++) {
                const idx = (state.currentTrackIndex + i) % tracks.length;
                nextUp.push({ track: tracks[idx], originalIndex: idx });
            }
        }
        UI.renderQueueOrPicks(nextUp, "Next Up", playTrack);
    }
}

function refreshHistoryUI() {
    const historyItems = state.recentHistory.map(idx => ({ track: tracks[idx], originalIndex: idx }));
    UI.renderRecentHistory(historyItems, playTrack, toggleFavorite);
}

function updatePlayerDisplay() {
    const track = tracks[state.currentTrackIndex];
    UI.updatePlayerInfo(track, track.favorite);
    // Use actual duration from audio or fallback to track duration
    const duration = Audio.getDuration() || track.duration;
    UI.updateTimeDisplay(state.currentTime, duration);
    UI.updateControlsState(state.isShuffle, state.isRepeat, state.isQueueActive);
    renderSidebarList();
}

export function toggleFavorite(index) {
    if (index === null || index === undefined) index = state.currentTrackIndex;

    if (tracks[index]) {
        tracks[index].favorite = !tracks[index].favorite;
        updatePlayerDisplay();
        refreshFavsList();
        refreshHistoryUI();
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value) search(searchInput.value);
    }
}

export function refreshFavsList() {
    const favItems = tracks
        .map((t, i) => ({ track: t, originalIndex: i }))
        .filter(x => x.track.favorite);
    UI.renderTrackList(favItems, 'favouriteList', playTrack, toggleFavorite);
}

export async function search(query) {
    if (!query) {
        UI.renderTrackList([], 'searchResults', playTrack, toggleFavorite);
        return;
    }

    const lower = query.toLowerCase();

    // Search in local library first
    const localResults = tracks
        .map((t, i) => ({ track: t, originalIndex: i }))
        .filter(item =>
            item.track.title.toLowerCase().includes(lower) ||
            item.track.artist.toLowerCase().includes(lower) ||
            item.track.genre.toLowerCase().includes(lower)
        );

    // Show loading state
    UI.renderTrackList([], 'searchResults', playTrack, toggleFavorite);
    const searchHeader = document.querySelector('#search h2');
    if (searchHeader) {
        searchHeader.innerHTML = 'Search Results <span style="font-size: 14px; color: #999;">(searching...)</span>';
    }

    // Search API for additional results
    let apiResults = [];
    try {
        const apiTracks = await API.searchSongs(query, 15);
        if (apiTracks && apiTracks.length > 0) {
            apiResults = apiTracks.map((t, i) => ({ 
                track: t, 
                originalIndex: -1, // API tracks don't have library index
                isFromAPI: true
            }));
        }
    } catch (error) {
        console.error('Error fetching from API:', error);
    }

    // Combine results: local first, then API results
    const combinedResults = [...localResults, ...apiResults];

    // Update header
    if (searchHeader) {
        const resultCount = combinedResults.length;
        searchHeader.innerHTML = `Search Results <span style="font-size: 12px; color: #999;">(${resultCount} found)</span>`;
    }

    // Render combined results
    UI.renderTrackList(combinedResults, 'searchResults', playTrack, toggleFavorite);
}

export function filterGenre(genreName) {
    const results = tracks
        .map((t, i) => ({ track: t, originalIndex: i }))
        .filter(item => item.track.genre.toLowerCase() === genreName.toLowerCase());

    UI.showPage('search');
    const searchHeader = document.querySelector('#search h2');
    if (searchHeader) searchHeader.textContent = `Genre: ${genreName}`;

    UI.renderTrackList(results, 'searchResults', playTrack, toggleFavorite);
}

export function loadInitialData() {
    // Only add existing tracks to history (we have tracks 0 and 1)
    addToHistory(0);
    addToHistory(1);
    refreshFavsList();
}

export function setVolume(volume) {
    Audio.setVolume(volume);
}

/**
 * Show queue notification to user
 */
function showQueueNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 130px;
        left: 50%;
        transform: translateX(-50%);
        background: #667eea;
        color: white;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 13px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    notification.textContent = `Added to queue (${state.queue.length} in queue)`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}
