// game.js

const tileGenerator = new SVGTileGenerator(40);
const initialScreen = document.getElementById('initialScreen');
const gameScreen = document.getElementById('gameScreen');
const tileContainer = document.getElementById('tileContainer');
const newGameButton = document.getElementById('newGame');
const startButton = document.getElementById('startButton');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const totalCountElement = document.getElementById('totalCount');
const playAgainButton = document.getElementById('playAgain');

let balloonLocations = new Map();
let bombLocation;
let skullLocations = new Set();
let wrongGuesses = 0;
let score = 0;
let totalCount = 0;
let timeLeft = 20;
let gameTimer;

// Audio setup with pooling
class SoundPool {
    constructor(src, poolSize = 3) {
        this.sounds = Array(poolSize).fill().map(() => new Audio(src));
        this.currentIndex = 0;
    }

    play() {
        this.sounds[this.currentIndex].currentTime = 0;
        this.sounds[this.currentIndex].play();
        this.currentIndex = (this.currentIndex + 1) % this.sounds.length;
    }
}

const popSoundPool = new SoundPool('pop.mp3', 3);
const errSoundPool = new SoundPool('err.mp3', 3);


function getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
}


function createNewGame() {
    const isMobile = window.innerWidth < 640;
    const rows = 10;
    const cols = isMobile ? 5 : 10;
    const pixelRatio = getDevicePixelRatio();
    const tileSize = Math.round(40 * pixelRatio);
    tileContainer.innerHTML = '';
    balloonLocations.clear();
    skullLocations.clear();
    bombLocation = null;
    wrongGuesses = 0;
    score = 0;
    timeLeft = 20;
    updateScore();
    updateTimer();
    gameOverElement.classList.add('hidden');
    const totalTiles = rows * cols;
    const allIndices = [...Array(totalTiles).keys()];
    
    // Place bomb
    bombLocation = allIndices.splice(Math.floor(Math.random() * allIndices.length), 1)[0];
    
    // Place skulls
    for (let i = 0; i < 2; i++) {
      const skullIndex = allIndices.splice(Math.floor(Math.random() * allIndices.length), 1)[0];
      skullLocations.add(skullIndex);
    }
  
    for (let i = 0; i < totalTiles; i++) {
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile';
      let tileSvg = tileGenerator.generateTile(tileSize);
  
      if (i === bombLocation) {
        tileSvg = addEmoticonToTile(tileSvg, '💣', tileSize);
      } else if (skullLocations.has(i)) {
        tileSvg = addEmoticonToTile(tileSvg, '💀', tileSize);
      } else {
        const hasBalloon = Math.random() < 0.2; // 20% chance for a balloon
        if (hasBalloon) {
          const balloonSvg = tileGenerator.generateBalloon(tileSize);
          tileSvg = tileSvg.replace('</svg>', `${balloonSvg}</svg>`);
          balloonLocations.set(i, true);
        }
      }
  
      tileDiv.innerHTML = tileSvg;
      tileDiv.dataset.index = i;
      tileDiv.addEventListener('click', handleTileClick);
      tileContainer.appendChild(tileDiv);
    }
  
    totalCount = balloonLocations.size;
    totalCountElement.innerHTML = totalCount;
    startTimer();
  }
  
  function addEmoticonToTile(tileSvg, emoji, tileSize) {
    const emojiSize = Math.round(tileSize * 0.6); // Adjust size as needed
    const x = Math.round((tileSize - emojiSize) / 2);
    const y = Math.round((tileSize - emojiSize) / 2);
    
    const emojiSvg = `
      <text x="${x}" y="${y + emojiSize * 0.8}" font-family="Arial" font-size="${emojiSize}px" fill="black">
        ${emoji}
      </text>
    `;
    
    return tileSvg.replace('</svg>', `${emojiSvg}</svg>`);
  }


function handleTileClick(event) {
    if (timeLeft <= 0) return;
    const tileDiv = event.currentTarget;
    const tileIndex = parseInt(tileDiv.dataset.index);

    if (tileIndex === bombLocation) {
        // Game over - bomb clicked
        tileDiv.classList.add('bomb-shake');
        // const explosionSound = new Audio('explosion.mp3');
        // explosionSound.play();
        setTimeout(() => {
            endGame(true);
        }, 1000); // Wait for the shake animation to finish
        return;
    }

    if (skullLocations.has(tileIndex)) {
        // Skull clicked - reduce time and score
        timeLeft = Math.max(0, timeLeft - 5);
        score = Math.max(0, score - 1); // Reduce score by 1, but not below 0
        updateTimer();
        updateScore();
        tileDiv.classList.add('vanish');
        tileDiv.style.pointerEvents = 'none';
        
        // Display -1 score animation
        const minusOne = document.createElement('div');
        minusOne.textContent = '-1';
        minusOne.className = 'minus-one';
        tileDiv.appendChild(minusOne);
        
        errSoundPool.play(); // Play error sound for skull click
        return;
    }

    if (balloonLocations.get(tileIndex)) {
        // Correct guess - balloon
        popSoundPool.play();
        tileDiv.classList.add('vanish');
        const plusOne = document.createElement('div');
        plusOne.textContent = '+1';
        plusOne.className = 'plus-one';
        tileDiv.appendChild(plusOne);
        tileDiv.style.pointerEvents = 'none';
        balloonLocations.delete(tileIndex);
        score++;
        updateScore();
    } else {
        // Incorrect guess
        errSoundPool.play();
        wrongGuesses++;
        tileContainer.querySelectorAll('.tile').forEach(tile => tile.classList.add('shake'));
        setTimeout(() => {
            tileContainer.querySelectorAll('.tile').forEach(tile => tile.classList.remove('shake'));
        }, 500);
        tileDiv.innerHTML = getSadSmiley(wrongGuesses);
        updateScore();
    }

    if (balloonLocations.size === 0) {
        endGame(false);
    }
}

function getSadSmiley(wrongGuesses) {
    const negativeEmoticonsSorted = [
        "😐", "😑", "😕", "🙁", "☹️", "😒", "😞", "😟", "😔", "😓",
        "😥", "😣", "😖", "😧", "😩", "😫", "😰", "😭", "😢"
    ];

    const index = Math.min(Math.floor(wrongGuesses / 2), negativeEmoticonsSorted.length - 1);

    return `<span class="noto-emoji">${negativeEmoticonsSorted[index]}</span>`;
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function updateTimer() {
    timerElement.textContent = `Time: ${timeLeft}s`;
}

function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function doConfetti(){
    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}

function endGame(hitBomb = false) {
    clearInterval(gameTimer);
    
    const tiles = tileContainer.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        tile.style.setProperty('--vanish-delay', index);
        tile.classList.add('vanish-end');
    });
    setTimeout(() => {
        gameOverElement.classList.remove('hidden');
        finalScoreElement.textContent = hitBomb ? "BOOM! Game Over!" : `Final Score: ${score}`;
    }, tiles.length * 50 + 500);
    if (score === totalCount && !hitBomb) {
        doConfetti();
    }
}

function startGame() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    createNewGame();
}

startButton.addEventListener('click', startGame);

newGameButton.addEventListener('click', createNewGame);

playAgainButton.addEventListener('click', () => {
    gameOverElement.classList.add('hidden');
    createNewGame();
});

// Initial setup
initialScreen.style.display = 'block';
gameScreen.style.display = 'none';

function createSampleTiles() {
    const withBalloonsContainer = document.getElementById('sampleTilesWithBalloons');
    const withoutBalloonsContainer = document.getElementById('sampleTilesWithoutBalloons');
    const tileSize = 40; // Adjust this size as needed

    function createTile(container, hasBalloon) {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        
        const tileSvg = tileGenerator.generateTile(tileSize);
        if (hasBalloon) {
            const balloonSvg = tileGenerator.generateBalloon(tileSize);
            tileDiv.innerHTML = tileSvg.replace('</svg>', `${balloonSvg}</svg>`);
        } else {
            tileDiv.innerHTML = tileSvg;
        }
        
        container.appendChild(tileDiv);
    }

    // Create 4 tiles with balloons
    for (let i = 0; i < 4; i++) {
        createTile(withBalloonsContainer, true);
    }

    // Create 4 tiles without balloons
    for (let i = 0; i < 4; i++) {
        createTile(withoutBalloonsContainer, false);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', createSampleTiles);
