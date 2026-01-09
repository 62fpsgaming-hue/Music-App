// Handles all dynamic content generation from real data

import { tracks } from './tracks.js';
import * as API from './api.js';

/**
 * Initialize all dynamic content on page load
 */
export function initializeDynamicContent() {
    populateGenreCards();
    populateLibraryCards();
    populateQuickPicks();
}

/**
 * Populate genre cards with real track counts
 */
function populateGenreCards() {
    const genreContainer = document.querySelector('.genre-cards');
    if (!genreContainer) return;

    // Get all unique genres from tracks
    const genres = [...new Set(tracks.map(t => t.genre))];
    
    // Count tracks per genre
    const genreCounts = {};
    genres.forEach(genre => {
        genreCounts[genre] = tracks.filter(t => t.genre === genre).length;
    });

    // Get existing cards and update their counts dynamically
    const cards = genreContainer.querySelectorAll('.genre-card');
    cards.forEach((card, index) => {
        const genreNameEl = card.querySelector('.genre-name') || card.querySelector('.genre-name-white');
        if (genreNameEl) {
            const genreName = genreNameEl.textContent.split(' ')[0].toLowerCase();
            
            // Find matching genre in our data
            const matchingGenre = genres.find(g => g.toLowerCase() === genreName);
            
            if (matchingGenre) {
                const count = genreCounts[matchingGenre];
                const trackCountEl = card.querySelector('.track-count');
                if (trackCountEl) {
                    trackCountEl.textContent = `${count} ${count === 1 ? 'track' : 'tracks'}`;
                }
            }
        }
    });

    console.log('Genre cards populated with real data:', genreCounts);
}

/**
 * Populate library cards with real data
 */
function populateLibraryCards() {
    const libraryGrid = document.querySelector('.library-grid');
    if (!libraryGrid) return;

    // Create playlist cards from tracks data
    const playlists = [
        {
            title: 'All Tracks',
            meta: `${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'}`,
            color: '#667eea'
        },
        {
            title: 'Favorite Tracks',
            meta: `${tracks.filter(t => t.favorite).length} ${tracks.filter(t => t.favorite).length === 1 ? 'track' : 'tracks'}`,
            color: '#f093fb'
        },
        {
            title: 'By Genre',
            meta: `${[...new Set(tracks.map(t => t.genre))].length} ${[...new Set(tracks.map(t => t.genre))].length === 1 ? 'genre' : 'genres'}`,
            color: '#43e97b'
        },
        {
            title: 'Recently Played',
            meta: 'From history',
            color: '#fa709a'
        }
    ];

    // Update existing library cards
    const cards = libraryGrid.querySelectorAll('.library-card');
    cards.forEach((card, index) => {
        if (index < playlists.length) {
            const playlist = playlists[index];
            const titleEl = card.querySelector('.library-title');
            const metaEl = card.querySelector('.library-meta');
            const coverEl = card.querySelector('.library-cover');

            if (titleEl) titleEl.textContent = playlist.title;
            if (metaEl) metaEl.textContent = playlist.meta;
            if (coverEl) {
                coverEl.style.background = `linear-gradient(135deg, ${playlist.color}, ${playlist.color}dd)`;
            }
        }
    });

    console.log('Library cards populated with real data');
}

/**
 * Populate quick picks with real data
 */
function populateQuickPicks() {
    const quickPicksList = document.querySelector('.mini-list');
    if (!quickPicksList) return;

    // Create quick picks based on actual data
    const quickPicks = [
        {
            name: 'All Songs',
            count: tracks.length
        },
        {
            name: 'Favorites',
            count: tracks.filter(t => t.favorite).length
        },
        ...([...new Set(tracks.map(t => t.genre))].slice(0, 2).map(genre => ({
            name: `${genre} Hits`,
            count: tracks.filter(t => t.genre === genre).length
        })))
    ];

    // Update existing quick picks or add new ones
    const items = quickPicksList.querySelectorAll('.mini-item');
    items.forEach((item, index) => {
        if (index < quickPicks.length) {
            const pick = quickPicks[index];
            item.innerHTML = `<span class="pick-name">${pick.name}</span>`;
            item.dataset.pickType = pick.name.toLowerCase();
        }
    });

    console.log('Quick picks populated with real data');
}

/**
 * Update all content when tracks data changes
 * (call this after adding/removing tracks)
 */
export function refreshDynamicContent() {
    populateGenreCards();
    populateLibraryCards();
    populateQuickPicks();
}

/**
 * Get genre statistics
 */
export function getGenreStats() {
    const genres = {};
    tracks.forEach(track => {
        genres[track.genre] = (genres[track.genre] || 0) + 1;
    });
    return genres;
}

/**
 * Get library statistics
 */
export function getLibraryStats() {
    return {
        totalTracks: tracks.length,
        favorites: tracks.filter(t => t.favorite).length,
        genres: [...new Set(tracks.map(t => t.genre))].length,
        averageDuration: Math.round(tracks.reduce((sum, t) => sum + t.duration, 0) / tracks.length)
    };
}
