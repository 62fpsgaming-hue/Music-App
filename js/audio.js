let audioElement = null;

export function initAudio() {
    // Get the audio element from HTML
    audioElement = document.getElementById('audioPlayer');
    
    if (!audioElement) {
        console.warn('Audio element not found in DOM, creating new one');
        audioElement = new Audio();
        document.body.appendChild(audioElement);
    }
    
    audioElement.crossOrigin = "anonymous";
    
    // Add error handling
    audioElement.addEventListener('error', (e) => {
        const errors = {
            1: 'MEDIA_ERR_ABORTED - Fetching process aborted',
            2: 'MEDIA_ERR_NETWORK - Network error',
            3: 'MEDIA_ERR_DECODE - Decoding error',
            4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Format not supported'
        };
        console.error('Audio loading error:', errors[audioElement.error?.code] || 'Unknown error', audioElement.error);
        showAudioError(errors[audioElement.error?.code] || 'Audio playback failed');
    });

    // Loading states
    audioElement.addEventListener('loadstart', () => {
        console.log('Audio loading started...');
        showLoadingState(true);
    });

    audioElement.addEventListener('canplay', () => {
        console.log('Audio ready to play');
        showLoadingState(false);
    });
}

export function loadTrack(trackSrc) {
    if (!audioElement) {
        initAudio();
    }
    
    if (!trackSrc) {
        console.warn('No track source provided');
        showAudioError('No audio file specified');
        return;
    }
    
    console.log('Loading track:', trackSrc);
    audioElement.src = trackSrc;
    audioElement.load();
}

export function play() {
    if (audioElement) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.error('Error playing audio:', err);
                showAudioError('Unable to play audio: ' + err.message);
            });
        }
    }
}

export function pause() {
    if (audioElement) {
        audioElement.pause();
    }
}

export function stop() {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

export function setVolume(volume) {
    if (audioElement) {
        audioElement.volume = Math.max(0, Math.min(1, volume));
    }
}

export function getCurrentTime() {
    return audioElement ? audioElement.currentTime : 0;
}

export function setCurrentTime(time) {
    if (audioElement) {
        audioElement.currentTime = time;
    }
}

export function getDuration() {
    return audioElement ? audioElement.duration : 0;
}

export function onTimeUpdate(callback) {
    if (audioElement) {
        audioElement.addEventListener('timeupdate', callback);
    }
}

export function onEnded(callback) {
    if (audioElement) {
        audioElement.addEventListener('ended', callback);
    }
}

// Helper functions for UI feedback
function showLoadingState(isLoading) {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.style.opacity = isLoading ? '0.6' : '1';
        btn.style.pointerEvents = isLoading ? 'none' : 'auto';
    }
}

function showAudioError(message) {
    console.error('Audio Error:', message);
    // Show error in console and optionally in UI
    const errorEl = document.getElementById('audioError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}
