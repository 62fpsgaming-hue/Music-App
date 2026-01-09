import { tracks } from './tracks.js';
import * as Player from './player.js';
import { UI } from './ui.js';
import * as DynamicContent from './dynamicContent.js';

// Helper to bind multiple button IDs to the same handler
function bindButtons(ids, handler) {
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    Player.init();
    Player.loadInitialData();
    DynamicContent.initializeDynamicContent();
    bindEvents();
});

function bindEvents() {
    // Play/Pause - bind multiple buttons to one handler
    bindButtons(['playPauseBtn', 'miniPlayPause'], Player.togglePlayPause);

    // Prev/Next - bind multiple pairs
    bindButtons(['prevBtn', 'miniPrev'], Player.playPrevious);
    bindButtons(['nextBtn', 'miniNext'], Player.playNext);

    // Shuffle/Repeat/Queue
    bindButtons(['shuffleBtn'], Player.toggleShuffle);
    bindButtons(['repeatBtn'], Player.toggleRepeat);
    bindButtons(['queueBtn'], Player.toggleQueueView);

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
        progressBar.addEventListener('mousedown', () => { isDragging = true; });
        progressBar.addEventListener('click', handleDrag);
        document.addEventListener('mousemove', (e) => { if (isDragging) handleDrag(e); });
        document.addEventListener('mouseup', () => { isDragging = false; });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Call async search function
            Player.search(e.target.value);
        });

        // When clicking search box, ensure we are on search page
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
            // Extract genre from card text - handle both types of cards
            const genreNameEl = card.querySelector('.genre-name') || card.querySelector('.genre-name-white');
            if (genreNameEl) {
                const genreText = genreNameEl.textContent.trim();
                // Remove any icon text or extra whitespace
                const genreName = genreText.split(/\s+/)[0];
                Player.filterGenre(genreName);
            }
        });
    });
}
