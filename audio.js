let audioContext = null;
let oscillator = null;
let gainNode = null;

export function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.1; // Lower volume
    } catch (e) {
        console.log('Audio context not supported');
    }
}

export function generateContinuousTone(frequency, isPlaying) {
    if (!audioContext || !isPlaying) return;

    // Ensure context is running
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    oscillator.start();
}

export function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
}

export function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}
