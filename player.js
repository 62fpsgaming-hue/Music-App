import { tracks } from './tracks.js';
import * as Audio from './audio.js';
import { UI } from './ui.js';

const state = {
    currentTrackIndex: 0,
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,
    isQueueActive: false,
    currentTime: 0,
    intervalId: null,
    queue: [],
    recentHistory: []
};

export function init() {
    Audio.initAudio();
    updatePlayerDisplay();
    renderSidebarList();
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

    Audio.resumeAudioContext();
    const track = tracks[state.currentTrackIndex];

    const baseFreq = 200 + (track.genre.length * 30) + (state.currentTrackIndex * 20);
    Audio.generateContinuousTone(baseFreq, state.isPlaying);

    addToHistory(state.currentTrackIndex);

    state.intervalId = setInterval(() => {
        state.currentTime++;
        if (state.currentTime >= track.duration) {
            state.currentTime = track.duration;
            onTrackEnd();
        }
        UI.updateTimeDisplay(state.currentTime, track.duration);
    }, 1000);
}

function stopPlayback() {
    Audio.stopTone();
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
        const nextIndex = state.queue.shift();
        playTrack(nextIndex);
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

export function playTrack(index) {
    if (index >= 0 && index < tracks.length) {
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
}

export function seek(percent) {
    const track = tracks[state.currentTrackIndex];
    state.currentTime = Math.round(track.duration * percent);
    UI.updateTimeDisplay(state.currentTime, track.duration);
}

function addToHistory(index) {
    state.recentHistory = state.recentHistory.filter(i => i !== index);
    state.recentHistory.unshift(index);
    if (state.recentHistory.length > 20) state.recentHistory.pop();
    refreshHistoryUI();
}

export function addToQueue(index) {
    state.queue.push(index);
    if (state.isQueueActive) renderSidebarList();
    console.log(`Added ${tracks[index].title} to queue`);
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
        const queueItems = state.queue.map(idx => ({ track: tracks[idx], originalIndex: idx }));
        UI.renderQueueOrPicks(queueItems, "Queue", playTrack);
    } else {
        const nextUp = [];
        for (let i = 1; i <= 5; i++) {
            const idx = (state.currentTrackIndex + i) % tracks.length;
            nextUp.push({ track: tracks[idx], originalIndex: idx });
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
    UI.updateTimeDisplay(state.currentTime, track.duration);
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

export function search(query) {
    if (!query) {
        UI.renderTrackList([], 'searchResults', playTrack, toggleFavorite);
        return;
    }
    const lower = query.toLowerCase();
    const results = tracks
        .map((t, i) => ({ track: t, originalIndex: i }))
        .filter(item =>
            item.track.title.toLowerCase().includes(lower) ||
            item.track.artist.toLowerCase().includes(lower) ||
            item.track.genre.toLowerCase().includes(lower)
        );
    UI.renderTrackList(results, 'searchResults', playTrack, toggleFavorite);
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
    addToHistory(0);
    addToHistory(2);
    addToHistory(4);
    refreshFavsList();
}
