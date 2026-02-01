export interface Position {
  x: number;
  y: number;
}

export class Grid {
  width: number;
  height: number;
  cellSize: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  resize(canvasWidth: number, canvasHeight: number) {
    // Calculate cell size to fit map in canvas while maintaining aspect ratio
    // Use 95% of available space to have a small padding
    const padding = 20;
    const availableW = canvasWidth - padding * 2;
    const availableH = canvasHeight - padding * 2;

    const cellW = availableW / this.width;
    const cellH = availableH / this.height;

    // Integer cell size for crisp rendering, but at least 1px
    this.cellSize = Math.max(1, Math.floor(Math.min(cellW, cellH)));

    // Center the grid
    const gridPixelWidth = this.width * this.cellSize;
    const gridPixelHeight = this.height * this.cellSize;

    this.offsetX = Math.floor((canvasWidth - gridPixelWidth) / 2);
    this.offsetY = Math.floor((canvasHeight - gridPixelHeight) / 2);
  }

  toScreen(pos: Position): Position {
    return {
      x: this.offsetX + pos.x * this.cellSize,
      y: this.offsetY + pos.y * this.cellSize,
    };
  }
}
