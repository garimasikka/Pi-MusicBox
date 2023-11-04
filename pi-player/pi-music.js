// Define constants and variables
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const startFrequency = 261.63; // Middle C frequency
const piDigits = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
// You can make this string as long as you want, this is just an example.
let isPlaying = false;
let digitIndex = 0;

// Function to play a sound based on the Pi digit
function playDigit(digit) {
  // Create and configure the oscillator
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // Mapping digits to a scale
  const noteIndex = scale[digit % scale.length];
  oscillator.frequency.setValueAtTime(startFrequency * Math.pow(2, noteIndex / 12), audioContext.currentTime);

  // Create and configure the gain for fading in/out
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

  // Connect nodes and play the sound
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}

// Function to play and display the next Pi digit
function playNextDigit() {
  if (!isPlaying) return;
  const digit = parseInt(piDigits.charAt(digitIndex), 10);
  playDigit(digit);
  displayPiDigit(piDigits.charAt(digitIndex)); // Display the digit
  digitIndex = (digitIndex + 1) % piDigits.length;
  setTimeout(playNextDigit, 400); // Adjust time as needed
}


// Function to display Pi digit on the screen
function displayPiDigit(digit) {
  const piDisplay = document.getElementById('piDisplay');
  const digitElement = document.createElement('span');
  digitElement.classList.add('pi-digit', `pi-digit-${digit}`);
  digitElement.textContent = digit;
  piDisplay.appendChild(digitElement);

  // Remove the digit after the animation completes
  setTimeout(() => {
    piDisplay.removeChild(digitElement);
  }, 400); // Matches the note duration
}

// Event listener for the Play/Pause button
document.getElementById('playPauseButton').addEventListener('click', function() {
  const playPauseIcon = document.getElementById('playPauseIcon');
  if (audioContext.state === 'suspended') {
    audioContext.resume(); // Resume the audio context if needed
  }

  if (!isPlaying) {
    isPlaying = true;
    playNextDigit();
    playPauseIcon.textContent = '▐▐'; // Changed to double vertical bars as pause symbol
  } else {
    isPlaying = false;
    playPauseIcon.textContent = '▶'; // Change to play symbol
    // Add any additional logic needed to pause the sound if necessary
  }
});