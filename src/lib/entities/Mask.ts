export type MaskType = "YELLOW" | "BLUE" | "RED";

export interface Mask {
  type: MaskType;
  x: number;
  y: number;
  collected: boolean;
  revealed: boolean;
}

export const MASK_COLORS = {
  YELLOW: "#FFD700",
  BLUE: "#00FFFF",
  RED: "#FF3333",
};
