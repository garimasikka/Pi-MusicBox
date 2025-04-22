// Define constants and variables
let audioContext = null; // We'll initialize this on first click
const startFrequency = 261.63; // Middle C frequency
let isPlaying = false;
let digitIndex = 0;
let noteLength = 2000; // 2 seconds per note

// Function to safely initialize audio context on user interaction
function initAudioContext() {
    if (audioContext === null) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("Audio context initialized:", audioContext.state);
            return true;
        } catch (e) {
            console.error("Failed to create audio context:", e);
            return false;
        }
    }
    return true;
}

// Simplified sound function - basic tone
function playTone(frequency, duration) {
    try {
        if (!audioContext) return false;
        
        console.log(`Playing tone: ${frequency}Hz`);
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5;
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
        
        return true;
    } catch (e) {
        console.error("Error playing tone:", e);
        return false;
    }
}

// Function to play a sound based on the Pi digit
function playDigit(digit) {
    // Map digit to note (simple mapping)
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
    
    const frequency = noteMap[digit];
    return playTone(frequency, noteLength / 1000);
}

// Function to play and display the next Pi digit
function playNextDigit() {
    if (!isPlaying) return;
    
    // Skip the decimal point
    if (digitIndex === 1) digitIndex = 2;
    
    const digit = parseInt(PI_DIGITS.charAt(digitIndex), 10);
    
    if (!isNaN(digit)) {
        const success = playDigit(digit);
        if (success) {
            displayPiDigit(digit);
        } else {
            console.error("Failed to play digit");
            debugLog("Failed to play digit");
        }
    }
    
    digitIndex = (digitIndex + 1) % PI_DIGITS.length;
    setTimeout(playNextDigit, noteLength);
}

// Function to display Pi digit on the screen
function displayPiDigit(digit) {
    const piDisplay = document.getElementById('piDisplay');
    
    // Clear previous digits if there are more than 3
    if (piDisplay.children.length > 2) {
        piDisplay.removeChild(piDisplay.firstChild);
    }
    
    const digitElement = document.createElement('span');
    digitElement.classList.add('pi-digit', `pi-digit-${digit}`);
    digitElement.textContent = digit;
    piDisplay.appendChild(digitElement);
    
    // Log to debug
    debugLog(`Displayed digit: ${digit}`);
}

// Event listener for the Play/Pause button
document.getElementById('playPauseButton').addEventListener('click', function() {
    debugLog("Button clicked!");
    
    // Initialize audio context (must happen on user interaction)
    if (!initAudioContext()) {
        debugLog("Failed to initialize audio context");
        return;
    }
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        debugLog("Resuming audio context...");
        audioContext.resume().then(() => {
            debugLog("Audio context resumed");
        }).catch(err => {
            debugLog("Error resuming: " + err);
        });
    }
    
    const playPauseIcon = document.getElementById('playPauseIcon');
    
    if (!isPlaying) {
        debugLog("Starting playback");
        isPlaying = true;
        digitIndex = 0; // Start from beginning
        playNextDigit();
        playPauseIcon.textContent = '❚❚'; // Pause symbol
        
        // Test sound immediately
        playTone(440, 0.3); // Play A4 for 300ms as a test
    } else {
        debugLog("Stopping playback");
        isPlaying = false;
        playPauseIcon.textContent = '▶'; // Play symbol
    }
});

// Initialize display with pi symbol
window.addEventListener('DOMContentLoaded', function() {
    const piDisplay = document.getElementById('piDisplay');
    const piSymbol = document.createElement('span');
    piSymbol.textContent = 'π';
    piSymbol.style.opacity = '0.5';
    piDisplay.appendChild(piSymbol);
    
    debugLog("DOM loaded");
});

// Helper function to show debug info
function debugLog(msg) {
    console.log(msg);
    const debug = document.getElementById('debug');
    debug.style.display = 'block';
    const line = document.createElement('div');
    line.textContent = msg;
    debug.appendChild(line);
    // Limit number of messages
    if (debug.children.length > 20) {
        debug.removeChild(debug.children[1]);
    }
}
