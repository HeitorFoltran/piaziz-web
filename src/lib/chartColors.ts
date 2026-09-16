export const PALETTE = [
  "hsl(228, 48%, 46%)",
  "hsl(140, 55%, 40%)",
  "hsl(36,  90%, 52%)",
  "hsl(280, 50%, 50%)",
  "hsl(0,   65%, 52%)",
  "hsl(190, 70%, 42%)",
  "hsl(56,  88%, 45%)",
  "hsl(330, 60%, 50%)",
];

export function corPorIndice(i: number) {
  return PALETTE[i % PALETTE.length];
}
