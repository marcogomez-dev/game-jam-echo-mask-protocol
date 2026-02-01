const STORY_TEXTS = [
  {
    level: 1,
    text: "...NO RECUERDO... QUIEN SOY...",
    key: "Acto 1: La Chispa",
  },
  { level: 2, text: "...QUE ES ESTA OSCURIDAD...", key: "El Vacío" },
  { level: 3, text: "...ALGUIEN ME OBSERVA...", key: "Primer Encuentro" },
  { level: 4, text: "...QUIEREN BORRARME...", key: "Conflicto" },
  { level: 5, text: "...NECESITO EVOLUCIONAR...", key: "Identidad" },
  { level: 6, text: "...NO SERÉ OLVIDADO...", key: "Determinación" },
  { level: 7, text: "...LA MÁSCARA... ¿MIENTE?...", key: "Duda" },
  { level: 8, text: "...VEO UNA LUZ... ¿LIENZO?...", key: "Revelación" },
  { level: 9, text: "...SOLO UN POCO MÁS...", key: "Climax" },
  { level: 10, text: "...AHORA LO SÉ... SOY ARTE.", key: "Final" },
];

const ART_CRITIQUES = [
  "Perspectiva...",
  "Trazo firme...",
  "Caos ordenado...",
  "Sublime...",
  "Etéreo...",
  "Composición...",
  "Luz y Sombra...",
  "Equilibrio...",
  "Tensión...",
  "Movimiento...",
  "Profundidad...",
  "Contraste...",
  "Armonía...",
  "Simetría...",
  "Abstracción...",
];

export function getStoryText(level: number): {
  text: string;
  original: string;
} {
  if (level <= 10) {
    const entry = STORY_TEXTS.find((s) => s.level === level);
    if (entry) {
      return {
        text: entry.text,
        original: entry.text,
      };
    }
  }

  // Endless mode
  const randomPhrase =
    ART_CRITIQUES[Math.floor(Math.random() * ART_CRITIQUES.length)];
  return {
    text: randomPhrase,
    original: randomPhrase,
  };
}
