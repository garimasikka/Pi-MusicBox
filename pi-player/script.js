// Define constants and variables
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const startFrequency = 261.63; // Middle C frequency
let isPlaying = false;
let digitIndex = 0;
let noteLength = 2000; // 2 seconds per note for a more gentle pace

// Make sure PI_DIGITS exists and is accessible
if (typeof PI_DIGITS === 'undefined') {
    console.error("PI_DIGITS variable not found! Check if pi-digits.js is loaded correctly.");
    // Create fallback digits if file not loaded
    window.PI_DIGITS = "3.1415926535897932384626433832795028841971693993751";
}

// Debug logging
console.log("PI digits loaded:", PI_DIGITS.substring(0, 20) + "... (" + PI_DIGITS.length + " chars)");

// Audio setup with different instrument sounds
function createEnvelope(gainNode, duration) {
    try {
        const attackTime = duration * 0.1;
        const decayTime = duration * 0.2;
        const releaseTime = duration * 0.7;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + attackTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + attackTime + decayTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    } catch (e) {
        console.error("Error in createEnvelope:", e);
        // Simple fallback if the complex envelope fails
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    }
}

// Function to play a sound based on the Pi digit
function playDigit(digit) {
    try {
        console.log("Playing digit:", digit);
        
        // Create audio nodes
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Choose oscillator type based on digit
        const oscillatorTypes = ['sine', 'triangle', 'sine', 'triangle', 'sine'];
        oscillator.type = oscillatorTypes[digit % oscillatorTypes.length];
        
        // Create scale - pentatonic scale for more pleasing sounds
        const pentatonicScale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
        const noteIndex = pentatonicScale[digit % pentatonicScale.length]; // Fix: Use modulo to prevent out-of-bounds
        
        // Set frequency based on scale note
        oscillator.frequency.setValueAtTime(
            startFrequency * Math.pow(2, noteIndex / 12), 
            audioContext.currentTime
        );
        
        // Apply envelope
        createEnvelope(gainNode, noteLength / 1000);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + noteLength / 1000);
    } catch (e) {
        console.error("Error playing digit:", e);
    }
}

// Function to play and display the next Pi digit
function playNextDigit() {
    if (!isPlaying) return;
    
    try {
        const digit = parseInt(PI_DIGITS.charAt(digitIndex), 10);
        
        // Skip non-numeric characters (like the decimal point)
        if (isNaN(digit)) {
            console.log("Skipping non-numeric character:", PI_DIGITS.charAt(digitIndex));
            digitIndex = (digitIndex + 1) % PI_DIGITS.length;
            setTimeout(playNextDigit, 100); // Try again quickly
            return;
        }
        
        playDigit(digit);
        displayPiDigit(PI_DIGITS.charAt(digitIndex));
        
        digitIndex = (digitIndex + 1) % PI_DIGITS.length;
        setTimeout(playNextDigit, noteLength);
    } catch (e) {
        console.error("Error in playNextDigit:", e);
        isPlaying = false;
        document.getElementById('playPauseIcon').textContent = '▶';
    }
}

// Function to display Pi digit on the screen
function displayPiDigit(digit) {
    try {
        const piDisplay = document.getElementById('piDisplay');
        
        // Clear previous digits if there are more than 3 showing
        if (piDisplay.children.length > 2) {
            piDisplay.removeChild(piDisplay.firstChild);
        }
        
        // Skip non-numeric characters
        if (isNaN(parseInt(digit, 10))) return;
        
        const digitElement = document.createElement('span');
        digitElement.classList.add('pi-digit', `pi-digit-${digit}`);
        digitElement.textContent = digit;
        piDisplay.appendChild(digitElement);
    } catch (e) {
        console.error("Error displaying digit:", e);
    }
}

// Event listener for the Play/Pause button
document.getElementById('playPauseButton').addEventListener('click', function() {
    try {
        console.log("Play/Pause button clicked");
        const playPauseIcon = document.getElementById('playPauseIcon');
        
        // Always try to resume the audio context first
        if (audioContext.state === 'suspended') {
            console.log("Resuming audio context");
            audioContext.resume().then(() => {
                console.log("Audio context resumed successfully");
            }).catch(err => {
                console.error("Error resuming audio context:", err);
            });
        }
        
        if (!isPlaying) {
            console.log("Starting playback");
            isPlaying = true;
            playNextDigit();
            playPauseIcon.textContent = '❚❚'; // Pause symbol
        } else {
            console.log("Stopping playback");
            isPlaying = false;
            playPauseIcon.textContent = '▶'; // Play symbol
        }
    } catch (e) {
        console.error("Error with play/pause button:", e);
    }
});

// Initialize display with pi symbol
window.addEventListener('DOMContentLoaded', function() {
    try {
        console.log("DOM loaded, initializing π MusicBox");
        const piDisplay = document.getElementById('piDisplay');
        const piSymbol = document.createElement('span');
        piSymbol.textContent = 'π';
        piSymbol.style.opacity = '0.5';
        piDisplay.appendChild(piSymbol);
    } catch (e) {
        console.error("Error initializing display:", e);
    }
});
