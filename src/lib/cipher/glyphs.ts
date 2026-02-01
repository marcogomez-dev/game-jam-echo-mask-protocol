const USE_CIPHER = true; // TOGGLE THIS: true = Glyphs, false = Normal Text

const GLYPH_MAP: Record<string, string> = {
  // --- Letras Mejoradas ---
  A: "Δ",
  B: "ß",
  C: "⊂",
  D: "Ð",
  E: "Σ",
  F: "ʄ",
  G: "Ç",
  H: "╫",
  I: "I",
  J: "ʝ",
  K: "₭",
  L: "Ŀ",
  M: "Ɱ",
  N: "Π",
  O: "Ø",
  P: "¶",
  Q: "Ω",
  R: "Я",
  S: "§",
  T: "†",
  U: "U",
  V: "V",
  W: "ω",
  X: "x",
  Y: "¥",
  Z: "ζ",
};

export function translate(text: string): string {
  const upperText = text.toUpperCase();

  if (!USE_CIPHER) {
    return upperText;
  }

  return upperText
    .split("")
    .map((c) => GLYPH_MAP[c] || c)
    .join("");
}
