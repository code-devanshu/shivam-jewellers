// Shared sonner style overrides so toasts match the site's rose-gold/brown/blush
// theme instead of the Toaster's default `richColors` green/red palette.

export const themedToastStyle = {
  background: "#fff",
  border: "1px solid #ffe4e4",
  color: "#2c1810",
} as const;

export const errorToastStyle = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
} as const;
