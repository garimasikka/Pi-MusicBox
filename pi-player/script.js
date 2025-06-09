// Define constants and variables
let audioContext = null;
const noteMap = [
    261.63, // C4 (0)
    293.66, // D4 (1)
    329.63, // E4 (2)
    349.23, // F4 (3)
    392.00, // G4 (4)
    440.00, // A4 (5)
    493.88, // B4 (6)
    523.25, // C5 (7)
    587.33, // D5 (8)
    659.25  // E5 (9)
];
let isPlaying = false;
let digitIndex = 0;
let noteLength = 500; // 500ms per note for a more musical tempo

// Function to safely initialize audio context on user interaction
function initAudioContext() {
    if (audioContext === null) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return true;
        } catch (e) {
            return false;
        }
    }
    return true;
}

// Function to play a tone at a specific time with envelope for smoother transitions
function playToneAtTime(frequency, startTime, duration) {
    if (!audioContext) return false;
    try {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const attackTime = 0.05; // 50ms attack
        const decayTime = 0.05; // 50ms decay
        const sustainLevel = 0.5;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime);
        gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - decayTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        return true;
    } catch (e) {
        return false;
    }
}

// Function to schedule a batch of notes
function scheduleNotes(startIndex, count) {
    if (!isPlaying) return;
    const currentTime = audioContext.currentTime;
    for (let i = 0; i < count; i++) {
        const index = (startIndex + i) % PI_DIGITS.length;
        if (index === 1) continue; // Skip the decimal point
        const digit = parseInt(PI_DIGITS.charAt(index), 10);
        if (!isNaN(digit)) {
            const frequency = noteMap[digit];
            const startTime = currentTime + i * (noteLength / 1000);
            playToneAtTime(frequency, startTime, noteLength / 1000);
            setTimeout(() => displayPiDigit(digit), startTime * 1000);
        }
    }
    setTimeout(() => scheduleNotes((startIndex + count) % PI_DIGITS.length, count), count * noteLength);
}

// Function to display Pi digit on the screen (show last 10 digits)
function displayPiDigit(digit) {
    const piDisplay = document.getElementById('piDisplay');
    const digitElement = document.createElement('span');
    digitElement.classList.add('pi-digit', `pi-digit-${digit}`);
    digitElement.textContent = digit;
    piDisplay.appendChild(digitElement);
    if (piDisplay.children.length > 10) {
        piDisplay.removeChild(piDisplay.firstChild);
    }
}

// Event listener for the Play/Pause button
document.getElementById('playPauseButton').addEventListener('click', function() {
    if (!initAudioContext()) {
        return;
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const playPauseIcon = document.getElementById('playPauseIcon');
    if (!isPlaying) {
        isPlaying = true;
        digitIndex = 0;
        scheduleNotes(0, 10);
        playPauseIcon.textContent = '❚❚';
    } else {
        isPlaying = false;
        playPauseIcon.textContent = '▶';
    }
});

// Initialize display with pi symbol
window.addEventListener('DOMContentLoaded', function() {
    const piDisplay = document.getElementById('piDisplay');
    const piSymbol = document.createElement('span');
    piSymbol.textContent = 'π';
    piSymbol.style.opacity = '0.5';
    piDisplay.appendChild(piSymbol);
});