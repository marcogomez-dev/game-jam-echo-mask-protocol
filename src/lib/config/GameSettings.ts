export const GameSettings = {
  // Map Generation
  // 'CAVES': Original Cellular Automata (Organic, narrow, risky)
  // 'CITY': Pac-Man style blocks (Wide corridors, loops, tactical)
  MAP_GENERATOR_TYPE: "CITY" as "CAVES" | "CITY",

  // Gameplay Balance
  ENEMY_BASE_COUNT: 24,
  ENEMY_SPAWN_START_LEVEL: 1, // Start appearing from level 1?
};
