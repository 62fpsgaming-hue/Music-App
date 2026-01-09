import { formatDuration } from './utils.js';

export const UI = {
    // Helper to get favorite class string
    getFavClass(isFavorite) {
        return isFavorite ? 'fas active' : 'far';
    },

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
    updatePlayerInfo(track, isFavorite, isAPITrack = false) {
        document.querySelectorAll('.player-title').forEach(el => el.textContent = track.title);
        document.querySelectorAll('.player-artist').forEach(el => el.textContent = track.artist);

        // Update styling of artwork placeholders based on track color or cover image
        const artworkDivs = document.querySelectorAll('.player-artwork .artwork-placeholder, .now-playing-card .artwork-placeholder');
        artworkDivs.forEach(div => {
            if (track.cover && track.cover.startsWith('http')) {
                // Use album artwork if available
                div.style.background = `url('${track.cover}') center/cover`;
            } else {
                // Fall back to gradient
                div.style.background = `linear-gradient(135deg, ${track.coverColor || '#6c5ce7'}, #2d3436)`;
            }
        });

        // Update API track indicator
        const nowPlayingCard = document.querySelector('.now-playing-card');
        if (nowPlayingCard) {
            if (isAPITrack) {
                nowPlayingCard.classList.add('api-track');
            } else {
                nowPlayingCard.classList.remove('api-track');
            }
        }

        // Update favorite icon in player
        const playerFavorite = document.querySelector('.player-favorite');
        if (playerFavorite) {
            UI.setHeartState(playerFavorite, isFavorite);
        }
        
        // Update player favorite button
        const playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
        if (playerFavoriteBtn) {
            const heartIcon = playerFavoriteBtn.querySelector('i');
            if (heartIcon) {
                UI.setHeartState(heartIcon, isFavorite);
            }
        }
    },

    // Helper for heart icon state
    setHeartState(element, isFavorite) {
        element.classList.toggle('fas', isFavorite);
        element.classList.toggle('far', !isFavorite);
        element.classList.toggle('active', isFavorite);
    },

    updatePlayIcons(isPlaying) {
        const mainBtn = document.querySelector('#playPauseBtn');
        const mainIcon = mainBtn?.querySelector('i');
        const miniIcon = document.querySelector('#miniPlayPause');
        const remove = isPlaying ? 'fa-play' : 'fa-pause';
        const add = isPlaying ? 'fa-pause' : 'fa-play';
        
        // Update icons
        [mainIcon, miniIcon].filter(Boolean).forEach(icon => {
            icon.classList.remove(remove);
            icon.classList.add(add);
        });
        
        // Add playing state to main button
        if (mainBtn) {
            mainBtn.classList.toggle('playing', isPlaying);
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
                    <i class="${this.getFavClass(track.favorite)} fa-heart track-favorite" data-track="${originalIndex}"></i>
                </li>
            `;
        }).join('');

        this.bindListEvents(container, playCallback, toggleFavCallback);
    },

    // Generic list binder
    bindListEvents(container, playCallback, toggleFavCallback, queueCallback = null) {
        container.querySelectorAll('.recent-item, .search-result').forEach(el => {
            const idx = parseInt(el.dataset.track, 10);
            const isAPI = el.dataset.isApi === 'true';
            const apiSrc = el.dataset.apiSrc;

            el.onclick = (e) => {
                // Don't trigger play if queue or favorite button clicked
                if (e.target.closest('.track-favorite') || e.target.closest('.track-queue')) {
                    return;
                }
                
                if (isAPI && apiSrc) {
                    // For API results, get full track data from element
                    const title = el.querySelector('.track-title').textContent.replace('[Preview]', '').trim();
                    const [artist, genre] = el.querySelector('.search-meta').textContent.split(' • ');
                    const artworkEl = el.querySelector('.artwork-placeholder.small');
                    const bgStyle = artworkEl.getAttribute('style');
                    
                    // Extract color or image from style
                    let coverColor = '#667eea';
                    let coverImage = '';
                    if (bgStyle.includes('url(')) {
                        const match = bgStyle.match(/url\('([^']+)'\)/);
                        if (match) coverImage = match[1];
                    } else {
                        const match = bgStyle.match(/background: ([^;]+)/);
                        if (match) coverColor = match[1];
                    }
                    
                    // Construct full API track data
                    const apiTrackData = {
                        isAPI: true,
                        src: apiSrc,
                        title: title,
                        artist: artist ? artist.trim() : 'Unknown Artist',
                        genre: genre ? genre.trim() : 'Music',
                        duration: 30, // 30-second preview
                        cover: coverImage,
                        coverColor: coverColor
                    };
                    
                    console.log('Playing API track:', apiTrackData);
                    playCallback(idx, apiTrackData);
                } else {
                    playCallback(idx);
                }
            };

            const heart = el.querySelector('.track-favorite');
            if (heart) {
                heart.onclick = (e) => {
                    e.stopPropagation();
                    toggleFavCallback(idx);
                };
            }

            const queueBtn = el.querySelector('.track-queue');
            if (queueBtn && queueCallback) {
                queueBtn.onclick = (e) => {
                    e.stopPropagation();
                    
                    if (isAPI && apiSrc) {
                        // Get API track data for queue
                        const title = el.querySelector('.track-title').textContent.replace('[Preview]', '').trim();
                        const [artist, genre] = el.querySelector('.search-meta').textContent.split(' • ');
                        const artworkEl = el.querySelector('.artwork-placeholder.small');
                        const bgStyle = artworkEl.getAttribute('style');
                        
                        let coverColor = '#667eea';
                        let coverImage = '';
                        if (bgStyle.includes('url(')) {
                            const match = bgStyle.match(/url\('([^']+)'\)/);
                            if (match) coverImage = match[1];
                        } else {
                            const match = bgStyle.match(/background: ([^;]+)/);
                            if (match) coverColor = match[1];
                        }
                        
                        const apiTrackData = {
                            isAPI: true,
                            src: apiSrc,
                            title: title,
                            artist: artist ? artist.trim() : 'Unknown Artist',
                            genre: genre ? genre.trim() : 'Music',
                            duration: 30,
                            cover: coverImage,
                            coverColor: coverColor
                        };
                        
                        queueCallback(idx, apiTrackData);
                    } else {
                        queueCallback(idx);
                    }
                };
            }
        });
    },

    // Render Search Results / Genre Filter Results
    renderTrackList(results, containerId, playCallback, toggleFavCallback, queueCallback = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!results.length) {
            container.innerHTML = '<p class="search-empty">No tracks found.</p>';
            return;
        }

        container.innerHTML = results.map(item => {
            const { track, originalIndex, isFromAPI } = item;
            const badge = isFromAPI ? '<span style="font-size: 11px; background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">Preview</span>' : '';
            const queueBtn = queueCallback ? `<i class="fas fa-plus-circle track-queue" data-track="${originalIndex}" title="Add to queue" style="cursor: pointer; font-size: 16px; color: #666;"></i>` : '';
            return `
                <div class="search-result" data-track="${originalIndex}" data-is-api="${isFromAPI ? 'true' : 'false'}" data-api-src="${track.src || ''}">
                    <div class="artwork-placeholder small" style="background: ${track.cover ? `url('${track.cover}') center/cover` : track.coverColor}"></div>
                    <div>
                        <p class="track-title">${track.title}${badge}</p>
                        <p class="search-meta">${track.artist} • ${track.genre}</p>
                    </div>
                    <div class="search-actions">
                        ${queueBtn}
                        <i class="${this.getFavClass(track.favorite)} fa-heart track-favorite" data-track="${originalIndex}"></i>
                    </div>
                </div>
            `;
        }).join('');

        this.bindListEvents(container, playCallback, toggleFavCallback, queueCallback);
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
