import { formatDuration } from './utils.js';

export const UI = {
    // Switch between pages
    showPage(pageId) {
        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');

        document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
        const active = document.querySelector(`.menu-item[data-target="${pageId}"]`);
        if (active) active.classList.add('active');
    },

    // Update Player Bar & Sidebar Info
    updatePlayerInfo(track, isFavorite) {
        document.querySelectorAll('.player-title').forEach(el => el.textContent = track.title);
        document.querySelectorAll('.player-artist').forEach(el => el.textContent = track.artist);

        // Update styling of artwork placeholders based on track color
        const artworkDivs = document.querySelectorAll('.player-artwork .artwork-placeholder, .now-playing-card .artwork-placeholder');
        artworkDivs.forEach(div => {
            div.style.background = `linear-gradient(135deg, ${track.coverColor || '#6c5ce7'}, #2d3436)`;
        });

        // Update favorite icon in player
        const playerFavorite = document.querySelector('.player-favorite');
        if (playerFavorite) {
            UI.setHeartState(playerFavorite, isFavorite);
        }
    },

    // Helper for heart icon state
    setHeartState(element, isFavorite) {
        if (isFavorite) {
            element.classList.add('active', 'fas');
            element.classList.remove('far');
        } else {
            element.classList.remove('active', 'fas');
            element.classList.add('far');
        }
    },

    updatePlayIcons(isPlaying) {
        const mainIcon = document.querySelector('#playPauseBtn i');
        const miniIcon = document.querySelector('#miniPlayPause');

        const remove = isPlaying ? 'fa-play' : 'fa-pause';
        const add = isPlaying ? 'fa-pause' : 'fa-play';

        if (mainIcon) {
            mainIcon.classList.remove(remove);
            mainIcon.classList.add(add);
        }
        if (miniIcon) {
            miniIcon.classList.remove(remove);
            miniIcon.classList.add(add);
        }
    },

    updateTimeDisplay(currentTime, duration) {
        const currentEl = document.getElementById('currentTime');
        const totalEl = document.getElementById('totalTime');
        const fill = document.getElementById('progressFill');
        const handle = document.getElementById('progressHandle');

        if (currentEl) currentEl.textContent = formatDuration(currentTime);
        if (totalEl) totalEl.textContent = formatDuration(duration);

        if (fill && duration > 0) {
            const percent = Math.min(100, Math.max(0, (currentTime / duration) * 100));
            fill.style.width = `${percent}%`;
            if (handle) {
                handle.style.left = `${percent}%`;
            }
        }
    },

    updateControlsState(isShuffle, isRepeat, isQueueActive) {
        const shuffleBtn = document.getElementById('shuffleBtn');
        const repeatBtn = document.getElementById('repeatBtn');
        const queueBtn = document.getElementById('queueBtn');

        if (shuffleBtn) shuffleBtn.classList.toggle('active', isShuffle);
        if (repeatBtn) repeatBtn.classList.toggle('active', isRepeat);
        if (queueBtn) queueBtn.classList.toggle('active', isQueueActive);
    },

    updateFavoriteIcons(trackIndex, isFavorite) {
        const icons = document.querySelectorAll(`.track-favorite[data-track="${trackIndex}"]`);
        icons.forEach(icon => UI.setHeartState(icon, isFavorite));
    },

    // --- Dynamic List Rendering ---

    // Render Recent Listen History (Home Page)
    renderRecentHistory(historyItems, playCallback, toggleFavCallback) {
        const container = document.querySelector('.recent-list'); // targeting the specific list in home
        if (!container) return;

        if (historyItems.length === 0) {
            container.innerHTML = '<li class="recent-item">No recently played tracks.</li>';
            return;
        }

        container.innerHTML = historyItems.map((item, i) => {
            const { track, originalIndex } = item;
            return `
                <li class="recent-item" data-track="${originalIndex}">
                    <span class="track-number">${String(i + 1).padStart(2, '0')}</span>
                    <div class="track-artwork">
                        <div class="artwork-placeholder" style="background: ${track.coverColor}"></div>
                    </div>
                    <div class="track-info">
                        <p class="track-title">${track.title}</p>
                        <p class="track-artist">${track.artist}</p>
                    </div>
                    <span class="track-genre">${track.genre}</span>
                    <span class="track-duration">${formatDuration(track.duration)}</span>
                    <i class="${track.favorite ? 'fas active' : 'far'} fa-heart track-favorite" data-track="${originalIndex}"></i>
                </li>
            `;
        }).join('');

        this.bindListEvents(container, playCallback, toggleFavCallback);
    },

    // Generic list binder
    bindListEvents(container, playCallback, toggleFavCallback) {
        container.querySelectorAll('.recent-item, .search-result').forEach(el => {
            const idx = parseInt(el.dataset.track, 10);
            el.onclick = () => playCallback(idx);

            const heart = el.querySelector('.track-favorite');
            if (heart) {
                heart.onclick = (e) => {
                    e.stopPropagation();
                    toggleFavCallback(idx);
                };
            }
        });
    },

    // Render Search Results / Genre Filter Results
    renderTrackList(results, containerId, playCallback, toggleFavCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!results.length) {
            container.innerHTML = '<p class="search-empty">No tracks found.</p>';
            return;
        }

        container.innerHTML = results.map(item => {
            const { track, originalIndex } = item;
            const favClass = track.favorite ? 'fas active' : 'far';
            return `
                <div class="search-result" data-track="${originalIndex}">
                    <div class="artwork-placeholder small" style="background: ${track.coverColor}"></div>
                    <div>
                        <p class="track-title">${track.title}</p>
                        <p class="search-meta">${track.artist} • ${track.genre}</p>
                    </div>
                    <div class="search-actions">
                        <i class="${favClass} fa-heart track-favorite" data-track="${originalIndex}"></i>
                    </div>
                </div>
            `;
        }).join('');

        this.bindListEvents(container, playCallback, toggleFavCallback);
    },

    // Update the "Quick Picks" or "Queue" list in the Right Sidebar
    renderQueueOrPicks(items, title, PlayCallback) {
        const titleEl = document.querySelector('.right-sidebar h3');
        if (titleEl) titleEl.textContent = title;

        const list = document.querySelector('.mini-list');
        if (!list) return;

        list.innerHTML = items.map((item) => {
            const { track, originalIndex } = item;
            return `
                <li class="mini-item" data-track="${originalIndex}">
                    <div class="artwork-placeholder tiny" style="width: 32px; height: 32px; border-radius: 4px; background: ${track.coverColor}; margin-right: 10px;"></div>
                    <span>${track.title}</span>
                </li>
            `;
        }).join('');

        // Simple bind
        list.querySelectorAll('.mini-item').forEach(el => {
            const idx = parseInt(el.dataset.track, 10);
            el.addEventListener('click', () => PlayCallback(idx));
        });
    }
};
