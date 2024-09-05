// game.js

const tileGenerator = new SVGTileGenerator(40);
const tileContainer = document.getElementById('tileContainer');
const newGameButton = document.getElementById('newGame');
let balloonLocations = new Map();
let wrongGuesses = 0;

function createNewGame(rows = 10, cols = 10) {
    tileContainer.innerHTML = '';
    balloonLocations.clear();
    wrongGuesses = 0;
    for (let i = 0; i < rows * cols; i++) {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'w-10 h-10 relative cursor-pointer';
        const tileSvg = tileGenerator.generateTile();
        const hasBalloon = Math.random() < 0.2; // 20% chance for a balloon
        if (hasBalloon) {
            const balloonSvg = tileGenerator.generateBalloon();
            tileDiv.innerHTML = tileSvg.replace('</svg>', `${balloonSvg}</svg>`);
            balloonLocations.set(i, true);
        } else {
            tileDiv.innerHTML = tileSvg;
        }
        tileDiv.dataset.index = i;
        tileDiv.addEventListener('click', handleTileClick);
        tileContainer.appendChild(tileDiv);
    }
}

function handleTileClick(event) {
    const tileDiv = event.currentTarget;
    const tileIndex = parseInt(tileDiv.dataset.index);
    
    if (balloonLocations.get(tileIndex)) {
        // Correct guess
        tileDiv.classList.add('vanish');
        const plusOne = document.createElement('div');
        plusOne.textContent = '+1';
        plusOne.className = 'absolute top-0 left-0 w-full h-full flex items-center justify-center text-green-500 font-bold plus-one';
        tileDiv.appendChild(plusOne);
        tileDiv.style.pointerEvents = 'none';
        balloonLocations.delete(tileIndex);
    } else {
        // Incorrect guess
        wrongGuesses++;
        tileContainer.querySelectorAll('.w-10').forEach(tile => tile.classList.add('shake'));
        setTimeout(() => {
            tileContainer.querySelectorAll('.w-10').forEach(tile => tile.classList.remove('shake'));
        }, 500);
        tileDiv.innerHTML = getSadSmiley(wrongGuesses);
    }
}

function getSadSmiley(wrongGuesses) {
    const svgStart = '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">';
    const svgEnd = '</svg>';
    const face = '<circle cx="20" cy="20" r="18" fill="yellow"/>';
    const leftEye = '<circle cx="12" cy="15" r="3" fill="black"/>';
    const rightEye = '<circle cx="28" cy="15" r="3" fill="black"/>';
    
    let mouth, tears;
    if (wrongGuesses <= 3) {
        // Slightly sad
        mouth = '<path d="M10 28 Q20 24 30 28" stroke="black" stroke-width="3" fill="none"/>';
    } else if (wrongGuesses <= 6) {
        // Very sad
        mouth = '<path d="M10 30 Q20 22 30 30" stroke="black" stroke-width="3" fill="none"/>';
    } else {
        // Crying
        mouth = '<path d="M10 32 Q20 20 30 32" stroke="black" stroke-width="3" fill="none"/>';
        tears = '<path d="M10 18 Q8 22 10 26" stroke="blue" stroke-width="2" fill="none"/>' +
                '<path d="M30 18 Q32 22 30 26" stroke="blue" stroke-width="2" fill="none"/>';
    }

    return svgStart + face + leftEye + rightEye + mouth + (tears || '') + svgEnd;
}

newGameButton.addEventListener('click', function() {
    window.location.reload();
});

// Initial game setup
createNewGame();