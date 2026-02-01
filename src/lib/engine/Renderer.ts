import type { Grid } from "./Grid";
import type { GameState } from "../stores/gameState";
import { MASK_COLORS } from "../entities/Mask";
import { translate } from "../cipher/glyphs";

export class Renderer {
  ctx: CanvasRenderingContext2D;
  grid: Grid;

  maskSprites: Record<string, HTMLCanvasElement> = {};
  maskLoaded = false;

  constructor(ctx: CanvasRenderingContext2D, grid: Grid) {
    this.ctx = ctx;
    this.grid = grid;

    const img = new Image();
    img.src = "/assets/simple_mask.png";
    img.onload = () => {
      this.processMaskSprites(img);
      this.maskLoaded = true;
    };
  }

  processMaskSprites(img: HTMLImageElement) {
    // 1. Create a base canvas to remove black background
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = img.width;
    baseCanvas.height = img.height;
    const bCtx = baseCanvas.getContext("2d")!;
    bCtx.drawImage(img, 0, 0);

    // Pixel manipulation: Black -> Transparent
    const imageData = bCtx.getImageData(
      0,
      0,
      baseCanvas.width,
      baseCanvas.height,
    );
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Threshold for black background (approximate)
      if (r < 50 && g < 50 && b < 50) {
        data[i + 3] = 0; // Alpha 0
      } else {
        data[i + 3] = 255; // Ensure opacity for content
      }
    }
    bCtx.putImageData(imageData, 0, 0);

    // 2. Generate Tinted Versions using MASK_COLORS
    Object.entries(MASK_COLORS).forEach(([type, color]) => {
      const tCanvas = document.createElement("canvas");
      tCanvas.width = img.width;
      tCanvas.height = img.height;
      const tCtx = tCanvas.getContext("2d")!;

      // Draw Transparent Base
      tCtx.drawImage(baseCanvas, 0, 0);

      // Tint: Keep Alpha (Sprite Shape), Fill with Color
      tCtx.globalCompositeOperation = "source-in";
      tCtx.fillStyle = color;
      tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);

      // Reset
      tCtx.globalCompositeOperation = "source-over";

      this.maskSprites[type] = tCanvas;
    });
  }

  clear(width: number, height: number) {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, width, height);
  }

  drawWalls(state: GameState) {
    this.ctx.lineWidth = 2;
    const isCyan = state.levelTheme === "cyan";
    const baseColor = isCyan ? "0, 255, 255" : "255, 255, 255";

    for (let y = 0; y < state.grid.height; y++) {
      for (let x = 0; x < state.grid.width; x++) {
        const cell = state.cells[y][x];
        if (cell.visibility > 0.01) {
          const pos = this.grid.toScreen({ x, y });

          // Fade effect: Alpha based on visibility
          const alpha = Math.max(0, Math.min(1, cell.visibility));

          if (cell.isWall) {
            this.ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
            this.ctx.shadowBlur = 0;
            this.ctx.strokeRect(
              pos.x,
              pos.y,
              this.grid.cellSize,
              this.grid.cellSize,
            );
          } else {
            // Draw faint dots for floor paths
            this.ctx.fillStyle = `rgba(${baseColor}, ${alpha * 0.3})`;
            const dotSize = Math.max(2, this.grid.cellSize * 0.1);
            const offset = (this.grid.cellSize - dotSize) / 2;
            this.ctx.fillRect(pos.x + offset, pos.y + offset, dotSize, dotSize);
          }
        }
      }
    }
  }

  drawNotes(state: GameState) {
    if (!state.notes) return;
    this.ctx.font = `bold ${Math.floor(this.grid.cellSize * 0.7)}px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (const note of state.notes) {
      const cell = state.cells[note.y][note.x];

      // Visibility Logic:
      // - UNREAD notes: Visible if Revealed (Blue Mask) OR Cell is visible.
      // - READ notes: Hidden unless Cell is visible.

      // Strictly hide unrevealed notes (requires Blue Mask for Story Notes)
      if (!note.revealed) continue;

      // If revealed, unread notes are always visible (Global Reveal effect of Blue Mask)
      // Read notes only visible if cell is lit
      if (note.read && cell.visibility < 0.1) continue;

      const pos = this.grid.toScreen({ x: note.x, y: note.y });
      const cx = pos.x + this.grid.cellSize / 2;
      const cy = pos.y + this.grid.cellSize / 2;

      if (note.read) {
        // Read: Paper Icon
        this.drawNoteIcon(cx, cy, this.grid.cellSize * 0.7, "#555555", false);
      } else {
        // Unread: White, Glow '?'
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.shadowColor = "#FFFFFF";
        this.ctx.shadowBlur = 15;
        this.ctx.font = `bold ${Math.floor(this.grid.cellSize * 0.7)}px monospace`;
        this.ctx.fillText("?", cx, cy);
        this.ctx.shadowBlur = 0;
      }
    }
  }

  drawNoteIcon(
    cx: number,
    cy: number,
    size: number,
    color: string,
    withGlow: boolean,
  ) {
    this.ctx.save();
    if (withGlow) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
    }

    this.ctx.fillStyle = color;
    const w = size * 0.7;
    const h = size * 0.9;
    const x = cx - w / 2;
    const y = cy - h / 2;

    // Draw Paper Shape
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + w * 0.7, y); // Fold start
    this.ctx.lineTo(x + w, y + h * 0.3);
    this.ctx.lineTo(x + w, y + h);
    this.ctx.lineTo(x, y + h);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw lines inside
    this.ctx.strokeStyle = "rgba(0,0,0,0.5)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const ly = y + h * 0.45 + i * h * 0.15;
      this.ctx.beginPath();
      this.ctx.moveTo(x + w * 0.2, ly);
      this.ctx.lineTo(x + w * 0.8, ly);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  render(state: GameState) {
    this.drawWalls(state);
    this.drawNotes(state);
    this.drawMasks(state);
    this.drawExit(state);
    state.enemies.forEach((e) => this.drawEnemy(e, state));
    this.drawPlayer(state.player);
    this.drawPulse(state);
    this.drawHUD(state);
  }

  drawHUD(state: GameState) {
    if (!this.maskLoaded) return;

    const y = 1;
    const cellSize = this.grid.cellSize;

    this.ctx.font = `bold ${Math.floor(cellSize * 0.7)}px monospace`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    // 1. Level
    const posLevel = this.grid.toScreen({ x: 2, y });
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(
      `${translate("NIVEL")} ${state.level}`,
      posLevel.x,
      posLevel.y + cellSize / 2,
    );

    // 2. Enemies
    const posEnemy = this.grid.toScreen({ x: 10, y });
    this.ctx.fillStyle = "#CC5500";
    this.ctx.fillText("▲", posEnemy.x, posEnemy.y + cellSize / 2);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(
      ` x ${state.enemies.length}`,
      posEnemy.x + cellSize,
      posEnemy.y + cellSize / 2,
    );

    // 3. Masks
    this.drawHUDMask(18, y, "YELLOW", state.player.hasYellowMask);
    this.drawHUDMask(20, y, "BLUE", state.player.hasBlueMask);
    this.drawHUDMask(22, y, "RED", state.player.hasRedMask);

    // 4. Story Notes (Levels 1-10)
    const baseWait = 26;
    for (let i = 0; i < 10; i++) {
      const noteFound = state.player.foundStoryNotes[i];
      const nx = baseWait + i;
      const posN = this.grid.toScreen({ x: nx, y });
      const cx = posN.x + cellSize / 2;
      const cy = posN.y + cellSize / 2;

      if (noteFound) {
        // Draw Level Number above
        this.ctx.fillStyle = "#00FFFF";
        this.ctx.textAlign = "center";
        this.ctx.font = `bold ${Math.floor(cellSize * 0.4)}px monospace`;
        this.ctx.fillText(`${i + 1}`, cx, cy - cellSize * 0.4);

        // Draw Paper Icon
        this.drawNoteIcon(
          cx,
          cy + cellSize * 0.1,
          cellSize * 0.6,
          "#FFFFFF",
          true,
        );
      } else {
        // Draw '?'
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#333";
        this.ctx.font = `bold ${Math.floor(cellSize * 0.5)}px monospace`;
        this.ctx.fillText("?", cx, cy);
      }
    }
  }

  drawHUDMask(x: number, y: number, type: string, active: boolean) {
    const pos = this.grid.toScreen({ x, y });
    const size = this.grid.cellSize;

    if (!this.maskSprites[type]) return;

    this.ctx.globalAlpha = active ? 1.0 : 0.3;
    if (!active) {
      this.ctx.filter = "grayscale(100%)";
    } else {
      const color = MASK_COLORS[type as keyof typeof MASK_COLORS];
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 15;
    }

    this.ctx.drawImage(this.maskSprites[type], pos.x, pos.y, size, size);

    this.ctx.filter = "none";
    this.ctx.shadowBlur = 0;
  }

  getHUDItem(
    screenX: number,
    screenY: number,
  ): { type: string; index?: number } | null {
    const cx = Math.floor(screenX / this.grid.cellSize);
    const cy = Math.floor(screenY / this.grid.cellSize);

    if (cy !== 1) return null;

    if (cx === 18) return { type: "MASK", index: 0 }; // Yellow
    if (cx === 20) return { type: "MASK", index: 1 }; // Blue
    if (cx === 22) return { type: "MASK", index: 2 }; // Red

    if (cx >= 26 && cx < 36) {
      return { type: "NOTE", index: cx - 26 };
    }

    return null;
  }

  drawMasks(state: GameState) {
    // Only draw uncollected masks
    state.masks.forEach((mask) => {
      if (mask.collected) return;
      if (!mask.revealed) return;

      this.drawMask(mask, state);
    });
  }

  drawMask(mask: any, state: GameState) {
    const pos = this.grid.toScreen({ x: mask.x, y: mask.y });
    const size = this.grid.cellSize * 1.5;
    const cx = pos.x + this.grid.cellSize / 2 - size / 2;
    const cy = pos.y + this.grid.cellSize / 2 - size / 2;

    const glowColor =
      mask.type === "YELLOW"
        ? "#FFD700"
        : mask.type === "BLUE"
          ? "#00FFFF"
          : "#FF3333";

    if (this.maskLoaded && this.maskSprites[mask.type]) {
      // Sprite rendering
      // Add glow
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15;
      this.ctx.drawImage(this.maskSprites[mask.type], cx, cy, size, size);
      this.ctx.shadowBlur = 0;
    } else {
      // Fallback: White Circle with colored Glow
      const center = {
        x: pos.x + this.grid.cellSize / 2,
        y: pos.y + this.grid.cellSize / 2,
      };
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, this.grid.cellSize / 3, 0, Math.PI * 2);
      this.ctx.fillStyle = "#FFFFFF"; // Mask is white
      this.ctx.shadowColor = glowColor; // Glow is colored
      this.ctx.shadowBlur = 15;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  drawExit(state: GameState) {
    if (!state.exit || (!state.exit.open && !state.exit.revealed)) return;
    // Exit visibility logic

    const pos = this.grid.toScreen({ x: state.exit.x, y: state.exit.y });
    const cx = pos.x + this.grid.cellSize / 2;
    const cy = pos.y + this.grid.cellSize / 2;

    // Glowing Portal
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, this.grid.cellSize * 0.6, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = "#FFFFFF";
    this.ctx.shadowBlur = 20;
    this.ctx.stroke();

    // Inner light
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  drawEnemy(enemy: any, state: GameState) {
    const cell = state.cells[enemy.y][enemy.x];
    if (cell.visibility <= 0.01) return;

    const pos = this.grid.toScreen({ x: enemy.x, y: enemy.y });
    const size = this.grid.cellSize;

    // Default direction if somehow missing (shouldn't happen)
    const dir = enemy.direction || { x: 0, y: 1 };
    const angle = Math.atan2(dir.y, dir.x);

    const cx = pos.x + size / 2;
    const cy = pos.y + size / 2;
    const radius = size * 0.4; // Slightly smaller than half-cell

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);

    // Draw Triangle pointing to RIGHT (0 rads) from (0,0)
    // Tip at (radius, 0)
    // Base at (-radius, -radius/2) and (-radius, radius/2)
    this.ctx.beginPath();
    this.ctx.moveTo(radius, 0);
    this.ctx.lineTo(-radius, -radius * 0.7);
    this.ctx.lineTo(-radius, radius * 0.7);
    this.ctx.closePath();

    if (enemy.stunned) {
      this.ctx.fillStyle = "#888888"; // Grey for stunned
    } else {
      this.ctx.fillStyle = enemy.state === "CHASE" ? "#FF0000" : "#CC5500";
    }
    this.ctx.fill();

    this.ctx.restore();
  }

  drawPlayer(player: any) {
    const screenPos = this.grid.toScreen({ x: player.x, y: player.y });
    const size = this.grid.cellSize;
    const padding = Math.max(2, size * 0.1);

    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = Math.max(1, size * 0.05);

    // Glow Effect
    this.ctx.shadowColor = "#FFFFFF";
    this.ctx.shadowBlur = 10;

    // Draw square
    this.ctx.strokeRect(
      screenPos.x + padding,
      screenPos.y + padding,
      size - padding * 2,
      size - padding * 2,
    );

    // Center Light
    const cx = screenPos.x + size / 2;
    const cy = screenPos.y + size / 2;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  drawPulse(state: GameState) {
    if (!state.pulse || !state.pulse.active) return;

    // Interpolate pulse position if needed, but grid based is fine for now
    const center = this.grid.toScreen({ x: state.pulse.x, y: state.pulse.y });
    const cx = center.x + this.grid.cellSize / 2;
    const cy = center.y + this.grid.cellSize / 2;

    const radiusPx = state.pulse.currentRadius * this.grid.cellSize;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}
