// iTunes Search API integration for dynamic song search

const ITUNES_API_URL = 'https://itunes.apple.com/search';

/**
 * Search for songs using iTunes API
 * @param {string} query - Search query (song name, artist, etc.)
 * @param {number} limit - Number of results to return (default: 20)
 * @returns {Promise<Array>} Array of track objects
 */
export async function searchSongs(query, limit = 20) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    try {
        const params = new URLSearchParams({
            term: query,
            media: 'music',
            entity: 'song',
            limit: limit
        });

        const response = await fetch(`${ITUNES_API_URL}?${params}`);
        
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Transform iTunes results into our track format
        if (data.results && data.results.length > 0) {
            return data.results.map((item, index) => formatTrackFromAPI(item, index));
        }

        return [];
    } catch (error) {
        console.error('Search API Error:', error);
        return [];
    }
}

/**
 * Transform iTunes API response into our track format
 * @param {Object} item - iTunes API track object
 * @param {number} index - Index for track ID
 * @returns {Object} Formatted track object
 */
function formatTrackFromAPI(item, index) {
    return {
        id: `api_${item.trackId || index}`,
        title: item.trackName || 'Unknown Title',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || 'Unknown Album',
        duration: Math.floor((item.trackTimeMillis || 0) / 1000), // Convert to seconds
        genre: item.primaryGenreName || 'Other',
        favorite: false,
        coverColor: getRandomColor(),
        src: item.previewUrl || '', // Preview URL from iTunes
        cover: item.artworkUrl100 || item.artworkUrl60 || '', // Album artwork
        preview: item.previewUrl || '', // 30-second preview
        isFromAPI: true
    };
}

/**
 * Get a random color for track artwork (if no artwork available)
 * @returns {string} Hex color code
 */
function getRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30b0fe',
        '#a8edea', '#fed6e3', '#ff9a9e', '#fecfef'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Validate if a track from API has playable preview
 * @param {Object} track - Track object from API
 * @returns {boolean} True if track has preview URL
 */
export function hasValidPreview(track) {
    return track.src && track.src.startsWith('https');
}
