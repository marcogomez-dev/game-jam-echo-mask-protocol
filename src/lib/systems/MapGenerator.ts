import {
  createInitialState,
  type GameState,
  type Cell,
} from "../stores/gameState";
import { Enemy } from "../entities/Enemy";

import { getStoryText } from "./StoryManager";

import { GameSettings } from "../config/GameSettings";

export class MapGenerator {
  static generate(width: number, height: number, level: number = 1): GameState {
    let state = createInitialState(width, height, level);
    state.enemies = []; // Ensure empty
    const HUD_ROWS = 3;

    // 1. Generate Topology (The Map Layout)
    if (GameSettings.MAP_GENERATOR_TYPE === "CITY") {
      state.cells = this.generateCityTopology(width, height, HUD_ROWS);
    } else {
      state.cells = this.generateCavesTopology(width, height, HUD_ROWS);
    }

    // 2. Validate & Fix Topology (Ensure Center is Clear)
    const cx = Math.floor(width / 2);
    const cy = Math.floor(HUD_ROWS + (height - HUD_ROWS) / 2);
    state.player.x = cx;
    state.player.y = cy;
    state.cells[cy][cx].isWall = false;

    // Clear neighbors of start for safety
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (
          cy + dy < height &&
          cy + dy >= 0 &&
          cx + dx < width &&
          cx + dx >= 0
        ) {
          state.cells[cy + dy][cx + dx].isWall = false;
        }
      }
    }

    // 4. Connectivity Check (Flood Fill) & Distance Map
    const visited = new Set<string>();
    const distanceMap = new Map<string, number>(); // "x,y" -> steps

    const queue: { x: number; y: number; steps: number }[] = [
      { x: cx, y: cy, steps: 0 },
    ];
    visited.add(`${cx},${cy}`);
    distanceMap.set(`${cx},${cy}`, 0);

    let maxSteps = 0;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.steps > maxSteps) maxSteps = curr.steps;

      const neighbors = [
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x, y: curr.y - 1 },
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
          if (!state.cells[n.y][n.x].isWall && !visited.has(`${n.x},${n.y}`)) {
            visited.add(`${n.x},${n.y}`);
            distanceMap.set(`${n.x},${n.y}`, curr.steps + 1);
            queue.push({ ...n, steps: curr.steps + 1 });
          }
        }
      }
    }

    // Fill unreachable areas (Skip HUD)
    let filledCount = 0;
    for (let y = HUD_ROWS; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!state.cells[y][x].isWall && !visited.has(`${x},${y}`)) {
          state.cells[y][x].isWall = true; // Fill isolated pockets
          filledCount++;
        }
      }
    }

    // Helper to find random cell on distance range
    const findCellBySteps = (
      minS: number,
      maxS: number,
      excludeNearPlayer = true,
    ): { x: number; y: number } | null => {
      const candidates: { x: number; y: number }[] = [];
      distanceMap.forEach((steps, key) => {
        if (steps >= minS && steps <= maxS) {
          const [x, y] = key.split(",").map(Number);
          if (y < HUD_ROWS) return; // Strictly exclude HUD area
          if (excludeNearPlayer && steps < 5) return; // Too close
          candidates.push({ x, y });
        }
      });
      if (candidates.length === 0) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    // 6. Spawn Enemies
    state.enemies = [];
    const enemyCount = Math.min(
      GameSettings.ENEMY_BASE_COUNT,
      Math.max(0, level - 1),
    );

    if (enemyCount > 0) {
      // Collect valid candidates (far enough from start)
      const candidates: { x: number; y: number }[] = [];
      distanceMap.forEach((steps, key) => {
        if (steps > 15) {
          const [x, y] = key.split(",").map(Number);
          if (y >= HUD_ROWS) {
            candidates.push({ x, y });
          }
        }
      });

      // Shuffle candidates
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      // Spawn distinct enemies
      for (let i = 0; i < enemyCount && i < candidates.length; i++) {
        state.enemies.push(new Enemy(candidates[i].x, candidates[i].y));
      }
    }

    // 7. Spawn Masks & Exit & Notes
    const storyData = getStoryText(level);

    // Yellow (Easy): 20-40%
    const p1 = findCellBySteps(maxSteps * 0.2, maxSteps * 0.4);
    if (p1)
      state.masks.push({
        type: "YELLOW",
        x: p1.x,
        y: p1.y,
        collected: false,
        revealed: level !== 1,
      });

    // Blue (Medium): 40-60%
    const p2 = findCellBySteps(maxSteps * 0.4, maxSteps * 0.6);
    if (p2)
      state.masks.push({
        type: "BLUE",
        x: p2.x,
        y: p2.y,
        collected: false,
        revealed: false,
      });

    // Story Note (60-80%)
    const pNote = findCellBySteps(maxSteps * 0.6, maxSteps * 0.8);
    if (pNote) {
      state.notes.push({
        id: `story-note-${level}`,
        x: pNote.x,
        y: pNote.y,
        text: storyData.text,
        originalText: storyData.original,
        read: false,
        revealed: false,
      });
    }

    // Red (Hard): 80-95%
    const p3 = findCellBySteps(maxSteps * 0.8, maxSteps * 0.95);
    if (p3)
      state.masks.push({
        type: "RED",
        x: p3.x,
        y: p3.y,
        collected: false,
        revealed: false,
      });

    // Exit: The Farthest Point (95-100%)
    const exitP = findCellBySteps(maxSteps * 0.95, maxSteps);
    let exitPos = exitP;
    if (!exitPos) {
      // Fallback
      let maxD = -1;
      distanceMap.forEach((v, k) => {
        if (v > maxD) {
          const [x, y] = k.split(",").map(Number);
          if (y < HUD_ROWS) return;
          maxD = v;
          exitPos = { x, y };
        }
      });
    }

    // Set Exit
    if (exitPos) {
      state.exit = { x: exitPos.x, y: exitPos.y, open: false, revealed: false };
    }

    // Level 1 Specifics
    if (level === 1) {
      state.notes.push({
        id: "tutorial-note",
        x: cx,
        y: cy,
        text: "",
        originalText: "",
        read: false,
        revealed: true, // Always visible
        isTutorial: true,
      });
    }

    return state;
  }

  static generateCavesTopology(
    width: number,
    height: number,
    HUD_ROWS: number,
  ): Cell[][] {
    let cells: Cell[][] = [];
    // Init Empty
    for (let y = 0; y < height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          isWall: false,
          visibility: 0,
          discovered: false,
        });
      }
      cells.push(row);
    }

    // 0. Force HUD Structure (Rows 0-2)
    for (let x = 0; x < width; x++) {
      cells[0][x].isWall = true; // Top Border
      cells[1][x].isWall = x === 0 || x === width - 1;
      cells[1][x].visibility = 1.0;
      cells[2][x].isWall = true; // Bottom Border (Divider)
    }

    // 1. Random Noise
    for (let y = HUD_ROWS; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (Math.random() < 0.45) cells[y][x].isWall = true;
      }
    }

    // 2. Cellular Automata Smoothing
    for (let i = 0; i < 5; i++) {
      cells = this.smooth(cells, width, height, HUD_ROWS);
    }

    // 3. Radial Zone Clearing (Keep original logic loosely)
    const cx = Math.floor(width / 2);
    const cy = Math.floor(HUD_ROWS + (height - HUD_ROWS) / 2);
    const maxRadius =
      Math.sqrt(width * width + (height - HUD_ROWS) * (height - HUD_ROWS)) / 2;

    for (let y = HUD_ROWS; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const normalizedDist = Math.sqrt(dx * dx + dy * dy) / maxRadius;

        if (normalizedDist < 0.2) cells[y][x].isWall = false;
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1)
          cells[y][x].isWall = true;
      }
    }
    return cells;
  }

  static generateCityTopology(
    width: number,
    height: number,
    HUD_ROWS: number,
  ): Cell[][] {
    let cells: Cell[][] = [];
    // 1. Init ALL FLOORS (Default)
    for (let y = 0; y < height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          isWall: false,
          visibility: 0,
          discovered: false,
        });
      }
      cells.push(row);
    }

    // 2. Build Grid of "City Blocks" (Walls)
    // Block size: 2x2 to 3x3
    // Spacing (Roads): 2 cells wide
    const blockSize = 2;
    const roadWidth = 2; // Always wide

    // Borders
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y < HUD_ROWS || y === height - 1 || x === 0 || x === width - 1) {
          cells[y][x].isWall = true;
        }
        if (y === 1 && x > 0 && x < width - 1) cells[y][x].isWall = false; // HUD clean
      }
    }
    // HUD Line
    for (let x = 0; x < width; x++) cells[2][x].isWall = true;

    // Procedural Blocks
    // Iterate grid
    for (let y = HUD_ROWS + 2; y < height - 2; y += blockSize + roadWidth) {
      for (let x = 2; x < width - 2; x += blockSize + roadWidth) {
        // Place a block here? (80% chance)
        if (Math.random() < 0.9) {
          // Determine block size (random 1 to 3) quite small to allow movement
          const bsX = 1 + Math.floor(Math.random() * 3);
          const bsY = 1 + Math.floor(Math.random() * 3);

          for (let by = 0; by < bsY; by++) {
            for (let bx = 0; bx < bsX; bx++) {
              const wy = y + by;
              const wx = x + bx;
              if (wy < height - 1 && wx < width - 1) {
                cells[wy][wx].isWall = true;
              }
            }
          }
        }
      }
    }

    return cells;
  }

  static smooth(
    cells: Cell[][],
    w: number,
    h: number,
    minY: number = 0,
  ): Cell[][] {
    // Deep copy to avoid mutating while reading
    const newCells: Cell[][] = JSON.parse(JSON.stringify(cells));

    for (let y = minY; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const neighbors = this.countWallNeighbors(cells, x, y, w, h);

        if (neighbors > 4) {
          newCells[y][x].isWall = true;
        } else if (neighbors < 4) {
          newCells[y][x].isWall = false;
        }
        // if == 4, keep same
      }
    }

    return newCells;
  }

  static countWallNeighbors(
    cells: Cell[][],
    x: number,
    y: number,
    w: number,
    h: number,
  ): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
          count++; // Edges count as walls
        } else if (cells[ny][nx].isWall) {
          count++;
        }
      }
    }
    return count;
  }
}
