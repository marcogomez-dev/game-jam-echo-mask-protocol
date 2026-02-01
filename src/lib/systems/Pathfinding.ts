import type { GameState } from "../stores/gameState";

export interface Point {
  x: number;
  y: number;
}

export class Pathfinding {
  static findPath(start: Point, end: Point, state: GameState): Point[] {
    const openSet: Point[] = [start];
    const cameFrom = new Map<string, Point>();

    const gScore = new Map<string, number>();
    gScore.set(`${start.x},${start.y}`, 0);

    const fScore = new Map<string, number>();
    fScore.set(`${start.x},${start.y}`, this.heuristic(start, end));

    const openSetHash = new Set<string>(); // optimization
    openSetHash.add(`${start.x},${start.y}`);

    let closestToTarget = start;
    let minDist = Infinity;

    let iterations = 0;
    while (openSet.length > 0) {
      iterations++;
      // Limit iterations to prevent infinite freeze if logic bug (safety)
      if (iterations > 1000) break;

      // Get lowest fScore
      let current = openSet[0];

      let lowestF = fScore.get(`${current.x},${current.y}`) ?? Infinity;
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        const f = fScore.get(`${openSet[i].x},${openSet[i].y}`) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = openSet[i];
          currentIndex = i;
        }
      }

      // Track closest approach
      const dist = this.heuristic(current, end);
      if (dist < minDist) {
        minDist = dist;
        closestToTarget = current;
      }

      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.splice(currentIndex, 1);
      openSetHash.delete(`${current.x},${current.y}`);

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.x < 0 ||
          neighbor.x >= state.grid.width ||
          neighbor.y < 0 ||
          neighbor.y >= state.grid.height
        )
          continue;

        if (state.cells[neighbor.y][neighbor.x].isWall) {
          continue;
        }

        // Calculate tentative G score
        // BUG FIX: Use ?? instead of || because 0 is falsy!
        const score = gScore.get(`${current.x},${current.y}`);
        const currentG = score !== undefined ? score : Infinity;

        const tentativeG = currentG + 1;

        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const neighborG = gScore.get(neighborKey) ?? Infinity;

        if (tentativeG < neighborG) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, end));

          if (!openSetHash.has(neighborKey)) {
            openSet.push(neighbor);
            openSetHash.add(neighborKey);
          }
        }
      }
    }

    // Fallback: If no full path, return path to closest point found
    if (closestToTarget !== start) {
      return this.reconstructPath(cameFrom, closestToTarget);
    }

    return []; // No path
  }

  static heuristic(a: Point, b: Point): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan
  }

  static reconstructPath(
    cameFrom: Map<string, Point>,
    current: Point,
  ): Point[] {
    const totalPath = [current];
    while (cameFrom.has(`${current.x},${current.y}`)) {
      current = cameFrom.get(`${current.x},${current.y}`)!;
      totalPath.unshift(current);
    }
    return totalPath;
  }
}
