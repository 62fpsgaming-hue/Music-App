import { tracks } from './tracks.js';
import * as Player from './player.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    Player.init();
    Player.loadInitialData();
    bindEvents();
});

function bindEvents() {
    // Play/Pause
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.addEventListener('click', Player.togglePlayPause);

    const miniPlayPause = document.getElementById('miniPlayPause');
    if (miniPlayPause) miniPlayPause.addEventListener('click', Player.togglePlayPause);

    // Prev/Next
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.addEventListener('click', Player.playPrevious);
    if (nextBtn) nextBtn.addEventListener('click', Player.playNext);

    const miniPrev = document.getElementById('miniPrev');
    const miniNext = document.getElementById('miniNext');
    if (miniPrev) miniPrev.addEventListener('click', Player.playPrevious);
    if (miniNext) miniNext.addEventListener('click', Player.playNext);

    // Shuffle/Repeat/Queue
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const queueBtn = document.getElementById('queueBtn');

    if (shuffleBtn) shuffleBtn.addEventListener('click', Player.toggleShuffle);
    if (repeatBtn) repeatBtn.addEventListener('click', Player.toggleRepeat);
    if (queueBtn) queueBtn.addEventListener('click', Player.toggleQueueView);

    // Favorites
    const playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
    if (playerFavoriteBtn) {
        playerFavoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Player.toggleFavorite(null); // current track
        });
    }

    // Progress Bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        let isDragging = false;

        const handleDrag = (e) => {
            const rect = progressBar.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            Player.seek(ratio);
        };

        progressBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) handleDrag(e);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        progressBar.addEventListener('click', handleDrag);
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // If empty, reset header
            const searchHeader = document.querySelector('#search h2');
            if (searchHeader) searchHeader.textContent = 'Search Results';
            Player.search(e.target.value);
        });

        // When clicking search box, ensure we are on search page?
        searchInput.addEventListener('focus', () => {
            UI.showPage('search');
        });
    }

    // Navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            if (target) UI.showPage(target);
        });
    });

    // Genre Cards
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        card.addEventListener('click', () => {
            // Extract genre from card text
            const genreName = card.querySelector('.genre-name').textContent;
            Player.filterGenre(genreName);
        });
    });
}
