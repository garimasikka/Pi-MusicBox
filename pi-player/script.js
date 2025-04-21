// Define constants and variables
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const startFrequency = 261.63; // Middle C frequency
let isPlaying = false;
let digitIndex = 0;
let noteLength = 2000; // 2 seconds per note for a more gentle pace

// Audio setup with different instrument sounds
function createEnvelope(gainNode, duration) {
    const attackTime = duration * 0.1;
    const decayTime = duration * 0.2;
    const releaseTime = duration * 0.7;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + attackTime + decayTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
}

// Function to play a sound based on the Pi digit
function playDigit(digit) {
    // Create audio nodes
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const reverbNode = audioContext.createConvolver();
    
    // Choose oscillator type based on digit
    const oscillatorTypes = ['sine', 'triangle', 'sine', 'triangle', 'sine'];
    oscillator.type = oscillatorTypes[digit % oscillatorTypes.length];
    
    // Create scale - pentatonic scale for more pleasing sounds
    const pentatonicScale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
    const noteIndex = pentatonicScale[digit];
    
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
}

// Function to play and display the next Pi digit
function playNextDigit() {
    if (!isPlaying) return;
    
    const digit = parseInt(PI_DIGITS.charAt(digitIndex), 10);
    playDigit(digit);
    displayPiDigit(PI_DIGITS.charAt(digitIndex));
    
    digitIndex = (digitIndex + 1) % PI_DIGITS.length;
    setTimeout(playNextDigit, noteLength); // Slower pace
}

// Function to display Pi digit on the screen
function displayPiDigit(digit) {
    const piDisplay = document.getElementById('piDisplay');
    
    // Clear previous digits if there are more than 3 showing
    if (piDisplay.children.length > 2) {
        piDisplay.removeChild(piDisplay.firstChild);
    }
    
    const digitElement = document.createElement('span');
    digitElement.classList.add('pi-digit', `pi-digit-${digit}`);
    digitElement.textContent = digit;
    piDisplay.appendChild(digitElement);
    
    // No need to remove immediately - let animation handle fading
}

// Event listener for the Play/Pause button
document.getElementById('playPauseButton').addEventListener('click', function() {
    const playPauseIcon = document.getElementById('playPauseIcon');
    
    if (audioContext.state === 'suspended') {
        audioContext.resume(); 
    }
    
    if (!isPlaying) {
        isPlaying = true;
        playNextDigit();
        playPauseIcon.textContent = '❚❚'; // Standardized pause symbol
    } else {
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
});
