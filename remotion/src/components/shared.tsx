import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "./tokens";

// ─── Spring-in container ────────────────────────────────────────────────────
export const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [28, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Slide-in from left ──────────────────────────────────────────────────────
export const SlideIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  from?: "left" | "right";
  style?: React.CSSProperties;
}> = ({ children, delay = 0, from = "left", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 90 } });
  const dir = from === "left" ? -1 : 1;
  return (
    <div
      style={{
        opacity: Math.min(progress * 2, 1),
        transform: `translateX(${interpolate(progress, [0, 1], [dir * 60, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Scale pop ───────────────────────────────────────────────────────────────
export const Pop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  return (
    <div
      style={{
        opacity: Math.min(progress * 2, 1),
        transform: `scale(${interpolate(progress, [0, 1], [0.6, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Service chip ────────────────────────────────────────────────────────────
export const ServiceChip: React.FC<{
  name: string;
  sub?: string;
  color: string;
  active?: boolean;
  delay?: number;
  icon?: string;
}> = ({ name, sub, color, active = false, delay = 0, icon }) => (
  <Pop delay={delay}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "14px 18px",
        borderRadius: 14,
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1.5px solid ${color}55`,
        boxShadow: active ? `0 0 20px ${color}55, 0 0 6px ${color}33` : "none",
        minWidth: 100,
        position: "relative",
        fontFamily: FONT.sans,
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 7,
            right: 8,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: COLORS.active,
            boxShadow: `0 0 8px ${COLORS.active}`,
          }}
        />
      )}
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 700, fontFamily: FONT.sans, textAlign: "center" }}>
        {name}
      </span>
      {sub && (
        <span style={{ color: COLORS.textSub, fontSize: 10, fontFamily: FONT.sans, textAlign: "center", lineHeight: 1.3 }}>
          {sub}
        </span>
      )}
    </div>
  </Pop>
);

// ─── Section header band ─────────────────────────────────────────────────────
export const SectionBand: React.FC<{
  label: string;
  color: string;
  delay?: number;
  icon?: string;
}> = ({ label, color, delay = 0, icon }) => (
  <SlideIn delay={delay}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingBottom: 10,
        borderBottom: `1px solid ${color}40`,
        marginBottom: 20,
      }}
    >
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.15em",
          textTransform: "uppercase" as const,
          color,
          fontFamily: FONT.sans,
        }}
      >
        {label}
      </span>
    </div>
  </SlideIn>
);

// ─── Arrow connector ─────────────────────────────────────────────────────────
export const Arrow: React.FC<{ delay?: number; label?: string; color?: string; vertical?: boolean }> = ({
  delay = 0,
  label,
  color = COLORS.textMuted,
  vertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 60 } });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        gap: 4,
        opacity: progress,
        fontFamily: FONT.sans,
      }}
    >
      {label && <span style={{ color: COLORS.textMuted, fontSize: 10 }}>{label}</span>}
      <span style={{ color, fontSize: vertical ? 22 : 18, lineHeight: 1 }}>{vertical ? "↓" : "→"}</span>
    </div>
  );
};

// ─── Full slide wrapper ───────────────────────────────────────────────────────
export const SlideWrapper: React.FC<{
  children: React.ReactNode;
  accent: string;
  slideNum: number;
  totalSlides: number;
}> = ({ children, accent, slideNum, totalSlides }) => (
  <div
    style={{
      width: 1920,
      height: 1080,
      background: COLORS.bg,
      position: "relative",
      overflow: "hidden",
      fontFamily: FONT.sans,
    }}
  >
    {/* Ambient background orb */}
    <div
      style={{
        position: "absolute",
        top: -200,
        right: -200,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: -150,
        left: -150,
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.accent}12 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />

    {/* Top accent bar */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${COLORS.accent})` }} />

    {/* Slide counter */}
    <div
      style={{
        position: "absolute",
        bottom: 28,
        right: 40,
        display: "flex",
        gap: 6,
      }}
    >
      {Array.from({ length: totalSlides }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === slideNum ? 24 : 6,
            height: 6,
            borderRadius: 3,
            background: i === slideNum ? accent : COLORS.textMuted,
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>

    {/* Logo watermark */}
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 40,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 14px rgba(255,255,255,0.5)",
        }}
      >
        <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: 11 }}>eK</span>
      </div>
      <span style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: 600 }}>e-Khadi · Huawei Cloud Architecture</span>
    </div>

    {children}
  </div>
);