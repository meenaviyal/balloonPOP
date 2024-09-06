// game.js

const tileGenerator = new SVGTileGenerator(40);
const tileContainer = document.getElementById('tileContainer');
const newGameButton = document.getElementById('newGame');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

let balloonLocations = new Map();
let wrongGuesses = 0;
let score = 0;
let timeLeft = 20;
let gameTimer;

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
    wrongGuesses = 0;
    score = 0;
    timeLeft = 20;
    updateScore();
    updateTimer();
    gameOverElement.classList.add('hidden');

    for (let i = 0; i < rows * cols; i++) {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        const tileSvg = tileGenerator.generateTile(tileSize);
        const hasBalloon = Math.random() < 0.2; // 20% chance for a balloon
        if (hasBalloon) {
            const balloonSvg = tileGenerator.generateBalloon(tileSize);
            tileDiv.innerHTML = tileSvg.replace('</svg>', `${balloonSvg}</svg>`);
            balloonLocations.set(i, true);
        } else {
            tileDiv.innerHTML = tileSvg;
        }
        tileDiv.dataset.index = i;
        tileDiv.addEventListener('click', handleTileClick);
        tileContainer.appendChild(tileDiv);
    }

    startTimer();
}


function handleTileClick(event) {
    if (timeLeft <= 0) return;
    const tileDiv = event.currentTarget;
    const tileIndex = parseInt(tileDiv.dataset.index);
    if (balloonLocations.get(tileIndex)) {
        // Correct guess
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
        wrongGuesses++;
        tileContainer.querySelectorAll('.tile').forEach(tile => tile.classList.add('shake'));
        setTimeout(() => {
            tileContainer.querySelectorAll('.tile').forEach(tile => tile.classList.remove('shake'));
        }, 500);
        tileDiv.innerHTML = getSadSmiley(wrongGuesses);
        score = Math.max(0, score - 1);
        updateScore();
    }
}

function getSadSmiley(wrongGuesses) {
    const negativeEmoticonsSorted = [
        "😐", "😑", "😕", "🙁", "☹️", "😒", "😞", "😟", "😔", "😓",
        "😥", "😣", "😖", "😧", "😩", "😫", "😰", "😭", "😢"
    ];

    // Calculate the index based on wrongGuesses
    const index = Math.min(Math.floor(wrongGuesses / 2), negativeEmoticonsSorted.length - 1);

    // Return the emoticon wrapped in a span with a class for styling
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

function endGame() {
    clearInterval(gameTimer);
    
    const tiles = tileContainer.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        tile.style.setProperty('--vanish-delay', index);
        tile.classList.add('vanish-end');
    });

    setTimeout(() => {
        gameOverElement.classList.remove('hidden');
        finalScoreElement.textContent = `Final Score: ${score}`;
    }, tiles.length * 50 + 500); // Wait for all tiles to vanish before showing game over
}


newGameButton.addEventListener('click', function() {
    window.location.reload();
});

// Initial game setup
createNewGame();