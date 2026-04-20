// Brand & palette
export const COLORS = {
  bg: "#0A0E1A",
  bgCard: "#111827",
  bgCardAlt: "#0F172A",
  border: "rgba(255,255,255,0.08)",
  primary: "#3B82F6",
  primaryGlow: "rgba(59,130,246,0.35)",
  accent: "#6366F1",
  accentGlow: "rgba(99,102,241,0.35)",
  sky: "#38BDF8",
  teal: "#2DD4BF",
  green: "#22C55E",
  yellow: "#FBBF24",
  orange: "#F97316",
  red: "#EF4444",
  purple: "#A855F7",
  pink: "#EC4899",
  white: "#FFFFFF",
  text: "rgba(255,255,255,0.9)",
  textSub: "rgba(255,255,255,0.5)",
  textMuted: "rgba(255,255,255,0.3)",
  active: "#22C55E",
};

export const FONT = {
  mono: "'Courier New', monospace",
  sans: "'Segoe UI', system-ui, sans-serif",
};

// Per-slide accent colour overrides
export const SLIDE_ACCENT: Record<number, string> = {
  0: "#3B82F6", // Intro
  1: "#EF4444", // Edge & Security
  2: "#F97316", // Compute
  3: "#3B82F6", // API Gateway
  4: "#2DD4BF", // Data
  5: "#A855F7", // AI
  6: "#FBBF24", // Analytics
  7: "#22C55E", // Observability
  8: "#6366F1", // DevOps / Security
  9: "#3B82F6", // Full picture / outro
};