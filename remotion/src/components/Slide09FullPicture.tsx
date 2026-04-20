import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { FadeUp, Pop, SlideWrapper } from "./shared";

interface LayerRow {
  label: string;
  color: string;
  services: string[];
}

const LAYERS: LayerRow[] = [
  { label: "Edge", color: COLORS.red, services: ["CDN", "WAF", "AAD", "ELB"] },
  { label: "API", color: COLORS.primary, services: ["API Gateway"] },
  { label: "Compute", color: COLORS.orange, services: ["ECS ★", "CCE", "AS", "FunctionGraph ★", "SWR", "CodeArts"] },
  { label: "Data", color: COLORS.teal, services: ["RDS ★", "OBS ★", "DCS Redis", "DWS"] },
  { label: "Messaging", color: COLORS.yellow, services: ["SMN ★", "DMS Kafka", "DMS RabbitMQ"] },
  { label: "AI", color: COLORS.purple, services: ["ModelArts", "OCR", "FRS", "NLP", "IVS", "CSS"] },
  { label: "Analytics", color: COLORS.accent, services: ["DLI", "MRS", "DataArts Studio"] },
  { label: "Observability", color: COLORS.green, services: ["Cloud Eye", "LTS", "AOM", "CTS", "CBR"] },
  { label: "Security", color: COLORS.pink, services: ["IAM", "KMS", "HSS", "VSS", "NAT", "Cloud Connect"] },
];

export const Slide09FullPicture: React.FC = () => {
  const accent = SLIDE_ACCENT[9];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlideWrapper accent={accent} slideNum={9} totalSlides={10}>
      <div style={{ padding: "50px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <h2 style={{ fontSize: 46, fontWeight: 900, color: COLORS.white, margin: "0 0 6px", letterSpacing: "-1px" }}>
            Full Architecture Overview
          </h2>
          <p style={{ color: COLORS.textSub, fontSize: 16, margin: "0 0 28px" }}>
            38 services · 9 layers · one cohesive platform for SASSA grant recipients
          </p>
        </FadeUp>

        {/* Internet bar */}
        <FadeUp delay={5}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 40,
            padding: "14px 24px", borderRadius: 12,
            background: `${COLORS.white}06`, border: `1px solid ${COLORS.border}`,
            marginBottom: 16,
          }}>
            {["👥 Members (Mobile)", "🏪 Shop Owners", "👤 Admins"].map((u) => (
              <span key={u} style={{ color: COLORS.textSub, fontSize: 14, fontWeight: 600 }}>{u}</span>
            ))}
          </div>
        </FadeUp>

        {/* Down arrow */}
        <FadeUp delay={10}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 2, height: 16, background: `${COLORS.primary}60` }} />
              <span style={{ color: COLORS.primary, fontSize: 14 }}>▼</span>
            </div>
          </div>
        </FadeUp>

        {/* Layers grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LAYERS.map((layer, li) => {
            const prog = spring({ frame: frame - 15 - li * 6, fps, config: { damping: 20, stiffness: 80 } });
            return (
              <div
                key={layer.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: prog,
                  transform: `translateX(${interpolate(prog, [0, 1], [-40, 0])}px)`,
                }}
              >
                {/* Layer label */}
                <div style={{
                  width: 100, flexShrink: 0,
                  color: layer.color, fontWeight: 800, fontSize: 12,
                  letterSpacing: "0.1em", textAlign: "right",
                  textTransform: "uppercase",
                }}>
                  {layer.label}
                </div>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: layer.color, flexShrink: 0 }} />
                {/* Service chips */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {layer.services.map((svc) => (
                    <div
                      key={svc}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: `${layer.color}12`,
                        border: `1px solid ${layer.color}${svc.includes("★") ? "80" : "35"}`,
                        boxShadow: svc.includes("★") ? `0 0 12px ${layer.color}35` : "none",
                      }}
                    >
                      <span style={{ color: svc.includes("★") ? layer.color : COLORS.textSub, fontWeight: svc.includes("★") ? 800 : 500, fontSize: 12 }}>
                        {svc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <FadeUp delay={80}>
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.teal, boxShadow: `0 0 8px ${COLORS.teal}` }} />
              <span style={{ color: COLORS.textMuted, fontSize: 12 }}>★ Active in production today</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: `${COLORS.white}20` }} />
              <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Planned / recommended</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ padding: "8px 18px", borderRadius: 100, background: `${accent}15`, border: `1px solid ${accent}40` }}>
              <span style={{ color: accent, fontWeight: 700, fontSize: 12 }}>38 services · Huawei Developer Competition 2026</span>
            </div>
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};