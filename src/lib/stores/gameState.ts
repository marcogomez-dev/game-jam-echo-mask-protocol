import { writable } from "svelte/store";
import { Grid } from "../engine/Grid";

export interface Cell {
  x: number;
  y: number;
  isWall: boolean;
  visibility: number; // 0.0 to 1.0
  discovered: boolean; // if true, maybe show as dim grey? or strict roguelike darkness?
}

export interface Pulse {
  active: boolean;
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  startTime: number;
}

export interface StoryNote {
  id: string;
  x: number;
  y: number;
  text: string; // The encrypted or decrypted text
  originalText: string; // The raw text for reference
  read: boolean;
  revealed: boolean; // If true, shown on map (e.g. by Blue mask)
  isTutorial?: boolean; // Special flag for the L1 start note
}

import type { Enemy } from "../entities/Enemy";
import type { Mask } from "../entities/Mask";

export interface GameState {
  grid: Grid;
  cells: Cell[][];
  player: {
    x: number;
    y: number;
    visionRadius: number;
    pulseDurationBonus: number; // From Yellow Mask

    hasYellowMask: boolean;
    hasBlueMask: boolean;
    hasRedMask: boolean;
    foundStoryNotes: boolean[]; // tracks levels 1-10
  };
  pulse: Pulse | null;
  enemies: Enemy[];
  masks: Mask[];
  notes: StoryNote[];
  exit: { x: number; y: number; open: boolean; revealed: boolean } | null;
  level: number;
  levelTheme: "dark" | "cyan"; // "dark" for 1-10, "cyan" for 11+
}

export const createInitialState = (
  width: number,
  height: number,
  level: number = 1,
): GameState => {
  const grid = new Grid(width, height);
  const cells: Cell[][] = [];

  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        isWall: false, // Default empty
        visibility: 0,
        discovered: false,
      });
    }
    cells.push(row);
  }

  return {
    grid,
    cells,
    player: {
      x: Math.floor(width / 2),
      y: Math.floor(height / 2),
      visionRadius: 2,
      pulseDurationBonus: 0,

      hasYellowMask: false,
      hasBlueMask: false,
      hasRedMask: false,
      foundStoryNotes: new Array(10).fill(false),
    },
    pulse: null,
    enemies: [],
    masks: [],
    notes: [],
    exit: null,
    level: level,
    levelTheme: level > 10 ? "cyan" : "dark",
  };
};

export const gameState = writable<GameState>(createInitialState(25, 20));
