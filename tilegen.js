// svg-tile-generator.js

class SVGTileGenerator {
  constructor(size = 50) {
    this.size = size;
  }

  generateRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  generateRandomTexture() {
    const textures = [
      'circles',
      'lines',
      'dots',
      'crosshatch',
      'zigzag'
    ];
    return textures[Math.floor(Math.random() * textures.length)];
  }

  createTexturePattern(texture, color) {
    const patterns = {
      circles: `<circle cx="${this.size / 4}" cy="${this.size / 4}" r="${this.size / 8}" fill="none" stroke="${color}" stroke-width="2" />
                <circle cx="${this.size * 3 / 4}" cy="${this.size * 3 / 4}" r="${this.size / 8}" fill="none" stroke="${color}" stroke-width="2" />`,
      lines: `<line x1="0" y1="0" x2="${this.size}" y2="${this.size}" stroke="${color}" stroke-width="2" />
              <line x1="0" y1="${this.size}" x2="${this.size}" y2="0" stroke="${color}" stroke-width="2" />`,
      dots: `<circle cx="${this.size / 4}" cy="${this.size / 4}" r="2" fill="${color}" />
             <circle cx="${this.size * 3 / 4}" cy="${this.size / 4}" r="2" fill="${color}" />
             <circle cx="${this.size / 4}" cy="${this.size * 3 / 4}" r="2" fill="${color}" />
             <circle cx="${this.size * 3 / 4}" cy="${this.size * 3 / 4}" r="2" fill="${color}" />`,
      crosshatch: `<line x1="0" y1="0" x2="${this.size}" y2="${this.size}" stroke="${color}" stroke-width="1" />
                   <line x1="0" y1="${this.size}" x2="${this.size}" y2="0" stroke="${color}" stroke-width="1" />
                   <line x1="${this.size / 2}" y1="0" x2="${this.size / 2}" y2="${this.size}" stroke="${color}" stroke-width="1" />
                   <line x1="0" y1="${this.size / 2}" x2="${this.size}" y2="${this.size / 2}" stroke="${color}" stroke-width="1" />`,
      zigzag: `<polyline points="0,0 ${this.size / 4},${this.size / 2} ${this.size / 2},0 ${this.size * 3 / 4},${this.size / 2} ${this.size},0" 
                         fill="none" stroke="${color}" stroke-width="2" />
               <polyline points="0,${this.size} ${this.size / 4},${this.size / 2} ${this.size / 2},${this.size} ${this.size * 3 / 4},${this.size / 2} ${this.size},${this.size}" 
                         fill="none" stroke="${color}" stroke-width="2" />`
    };
    return patterns[texture];
  }

  generateTile() {
    const backgroundColor = this.generateRandomColor();
    const textureColor = this.generateRandomColor();
    const texture = this.generateRandomTexture();
    const texturePattern = this.createTexturePattern(texture, textureColor);

    return `<svg width="${this.size}" height="${this.size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      ${texturePattern}
    </svg>`;
  }

  generateBalloon() {
    const balloonColor = this.generateRandomColor();
    const minSize = this.size / 6;
    const maxSize = this.size / 2;
    const balloonSize = minSize + Math.random() * (maxSize - minSize);
    const x = Math.random() * (this.size - balloonSize);
    const y = Math.random() * (this.size - balloonSize);

    const shapes = [
      `<circle cx="${x + balloonSize/2}" cy="${y + balloonSize/2}" r="${balloonSize/2}" fill="${balloonColor}" />`,
      `<ellipse cx="${x + balloonSize/2}" cy="${y + balloonSize/2}" rx="${balloonSize/2}" ry="${balloonSize/3}" fill="${balloonColor}" />`,
      `<polygon points="${x + balloonSize/2},${y} ${x},${y + balloonSize} ${x + balloonSize},${y + balloonSize}" fill="${balloonColor}" />`
    ];

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const stringLength = this.size - (y + balloonSize);
    const string = `<line x1="${x + balloonSize/2}" y1="${y + balloonSize}" x2="${x + balloonSize/2}" y2="${y + balloonSize + stringLength}" stroke="black" stroke-width="1" />`;

    return `${shape}${string}`;
  }

  addBalloonToTile(tileSvg) {
    const balloon = this.generateBalloon();
    return tileSvg.replace('</svg>', `${balloon}</svg>`);
  }

  generateTileWithRandomBalloon() {
    let tileSvg = this.generateTile();
    if (Math.random() < 0.2) { // 20% chance to add a balloon
      tileSvg = this.addBalloonToTile(tileSvg);
    }
    return tileSvg;
  }
}

// Export the class for use in other scripts
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SVGTileGenerator;
}
