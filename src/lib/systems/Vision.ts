import type { GameState } from "../stores/gameState";

export class VisionSystem {
  static PULSE_SPEED = 0.03;
  static FADE_RATE = 0.002; // Opacity loss per ms

  static update(state: GameState, dt: number) {
    // 1. Handle Pulse Expansion
    if (state.pulse && state.pulse.active) {
      state.pulse.currentRadius += this.PULSE_SPEED * dt;

      if (state.pulse.currentRadius >= state.pulse.maxRadius) {
        state.pulse.active = false;
      }

      // Reveal cells within the current ring (thick ring)
      const ringWidth = 2; // Thickness of the pulse wave
      const innerR = Math.max(0, state.pulse.currentRadius - ringWidth);
      const outerR = state.pulse.currentRadius;

      const cx = state.pulse.x;
      const cy = state.pulse.y;

      // Optimization: Only iterate bounding box of the pulse
      const minX = Math.max(0, Math.floor(cx - outerR));
      const maxX = Math.min(state.grid.width - 1, Math.ceil(cx + outerR));
      const minY = Math.max(0, Math.floor(cy - outerR));
      const maxY = Math.min(state.grid.height - 1, Math.ceil(cy + outerR));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist >= innerR && dist <= outerR) {
            // Reveal
            state.cells[y][x].visibility = 1.0;
            state.cells[y][x].discovered = true;
          }
        }
      }
    }

    // 2. Handle Fade Out
    for (let y = 0; y < state.grid.height; y++) {
      for (let x = 0; x < state.grid.width; x++) {
        const cell = state.cells[y][x];

        // Ambient Vision (Player Glow / Footsteps)
        const pdx = x - state.player.x;
        const pdy = y - state.player.y;
        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

        const ambientRadius = state.player.visionRadius;

        if (pDist <= ambientRadius) {
          const brightness = 1.0 - (pDist / ambientRadius) * 0.5;
          cell.visibility = Math.max(cell.visibility, brightness);
          cell.discovered = true;
        } else {
          if (cell.visibility > 0) {
            cell.visibility -= this.FADE_RATE * dt;
            if (cell.visibility < 0) cell.visibility = 0;
          }
        }
      }
    }
  }

  static triggerPulse(state: GameState) {
    // Pulse radius is 3x the current ambient radius
    const maxRadius = state.player.visionRadius * 3;

    state.pulse = {
      active: true,
      x: state.player.x,
      y: state.player.y,
      currentRadius: 0,
      maxRadius: maxRadius,
      startTime: Date.now(),
    };
  }
}
