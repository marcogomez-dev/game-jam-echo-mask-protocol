import type { GameState } from "../stores/gameState";
import { Pathfinding, type Point } from "../systems/Pathfinding";

export type EnemyState = "IDLE" | "ALERT" | "CHASE";

export class Enemy {
  x: number;
  y: number;
  state: EnemyState = "IDLE";
  lastKnownPlayerPos: Point | null = null;
  direction: Point = { x: 0, y: 1 };
  stunned: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    // Random initial direction
    const dirs = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];
    this.direction = dirs[Math.floor(Math.random() * dirs.length)];
  }

  update(state: GameState) {
    // 0. Handle Stun
    if (this.stunned) {
      this.stunned = false;
      return;
    }

    // Check if should be alert
    const distToPlayer =
      Math.abs(this.x - state.player.x) + Math.abs(this.y - state.player.y);

    // If pulse active and close, or if player very close
    if (
      state.pulse &&
      state.pulse.active &&
      distToPlayer < state.pulse.maxRadius
    ) {
      this.state = "CHASE";
      this.lastKnownPlayerPos = { x: state.player.x, y: state.player.y };
    } else if (distToPlayer < 4) {
      // Passive hearing range
      this.state = "CHASE";
      this.lastKnownPlayerPos = { x: state.player.x, y: state.player.y };
    }

    // Move logic
    if (this.state === "CHASE" && this.lastKnownPlayerPos) {
      // 1. Confusion (20%)
      if (Math.random() < 0.2) {
        // Confusion! Move backwards
        const backX = this.x - this.direction.x;
        const backY = this.y - this.direction.y;

        // Only move back if valid (not wall)
        if (
          backX >= 0 &&
          backX < state.grid.width &&
          backY >= 0 &&
          backY < state.grid.height &&
          !state.cells[backY][backX].isWall
        ) {
          const collider = state.enemies.find(
            (e) => e !== this && e.x === backX && e.y === backY,
          );
          if (collider) {
            this.stunned = true;
            collider.stunned = true;
          } else {
            this.x = backX;
            this.y = backY;
          }
        }
        return;
      }

      // Relentless pursuit (no error)
      const path = Pathfinding.findPath(
        { x: this.x, y: this.y },
        this.lastKnownPlayerPos,
        state,
      );

      if (path.length > 1) {
        // path[0] is current, path[1] is next
        const next = path[1];
        const dx = next.x - this.x;
        const dy = next.y - this.y;

        // Check rotation
        if (this.direction.x === dx && this.direction.y === dy) {
          // Facing correct way, try move

          // Check Collision manually to apply Stun
          const collider = state.enemies.find(
            (e) => e !== this && e.x === next.x && e.y === next.y,
          );
          if (collider) {
            this.stunned = true;
            collider.stunned = true;
          } else {
            // Move (Player collision handled externally, or we allow overlap)
            this.x = next.x;
            this.y = next.y;
          }
        } else {
          // Wrong direction, Turn Logic

          // Check if 180 degree turn (Opposite)
          if (this.direction.x === -dx && this.direction.y === -dy) {
            // Cannot turn 180 instantly. Turn 90 degrees instead.
            // Pick a perpendicular direction.
            // E.g. if Up (0,-1), want Down (0,1). Turn Right (1,0).
            // Perpendicular: (y, -x) or (-y, x). Let's go clockwise (-y, x)?
            // If (0,-1) -> (1, 0) Right. Correct.

            this.direction = { x: -this.direction.y, y: this.direction.x };
          } else {
            // 90 degree turn or less (just set it)
            this.direction = { x: dx, y: dy };
          }
        }
      } else {
        // Reached last known or stuck
        if (Math.random() < 0.5) this.moveOneStep(state); // Small jitter if stuck
      }
    } else {
      // IDLE wander (Constant patrol)
      this.moveOneStep(state);
    }
  }

  moveOneStep(state: GameState) {
    // Strategy: Try forward (80%). If blocked/wall, pick random valid neighbor.

    const forwardX = this.x + this.direction.x;
    const forwardY = this.y + this.direction.y;

    // 80% chance to keep moving forward if valid
    const keepGoing = Math.random() < 0.8;
    const isForwardValid =
      forwardX >= 0 &&
      forwardX < state.grid.width &&
      forwardY >= 0 &&
      forwardY < state.grid.height &&
      !state.cells[forwardY][forwardX].isWall &&
      !this.isBlocked(state, forwardX, forwardY);

    if (keepGoing && isForwardValid) {
      this.x = forwardX;
      this.y = forwardY;
      return;
    }

    // Otherwise, pick a new valid direction/move
    const moves = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    // Filter moves that land on valid cells
    const validMoves = moves.filter((dir) => {
      const nx = this.x + dir.x;
      const ny = this.y + dir.y;
      return (
        nx >= 0 &&
        nx < state.grid.width &&
        ny >= 0 &&
        ny < state.grid.height &&
        !state.cells[ny][nx].isWall &&
        !this.isBlocked(state, nx, ny)
      );
    });

    if (validMoves.length > 0) {
      const choice = validMoves[Math.floor(Math.random() * validMoves.length)];

      if (choice.x === this.direction.x && choice.y === this.direction.y) {
        // Same dir, move
        this.x += choice.x;
        this.y += choice.y;
      } else {
        // Different dir, turn
        this.direction = choice;
      }
    }
  }

  isBlocked(state: GameState, x: number, y: number): boolean {
    // Collide with enemies. Player is a valid target/kill.
    return state.enemies.some((e) => e !== this && e.x === x && e.y === y);
  }
}
