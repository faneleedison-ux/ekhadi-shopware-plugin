import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { FadeUp, Pop, SlideWrapper } from "./shared";

const MetricBar: React.FC<{ label: string; value: number; max: number; color: string; delay: number }> = ({ label, value, max, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 60 } });
  const pct = (value / max) * 100 * progress;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ color: COLORS.textSub, fontSize: 12, fontFamily: FONT.sans }}>{label}</span>
        <span style={{ color, fontSize: 12, fontWeight: 700, fontFamily: FONT.sans }}>{Math.round(value * progress)}{label.includes("ms") ? " ms" : label.includes("%") ? "%" : ""}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: `${COLORS.white}08` }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>
    </div>
  );
};

export const Slide07Observability: React.FC = () => {
  const accent = SLIDE_ACCENT[7];

  return (
    <SlideWrapper accent={accent} slideNum={7} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Layer 7 of 8</span>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: "8px 0 0", letterSpacing: "-1px" }}>Observability &amp; Ops</h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 36px" }}>
            Full-stack visibility — metrics, logs, traces, and audit trail in one place.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 22, marginBottom: 28 }}>
          {[
            {
              name: "Cloud Eye", icon: "👁️", color: accent,
              desc: "Infrastructure metrics",
              metrics: [
                { label: "ECS CPU %", value: 34, max: 100 },
                { label: "RDS connections", value: 42, max: 100 },
                { label: "Memory %", value: 52, max: 100 },
              ],
            },
            {
              name: "LTS", icon: "📋", color: COLORS.sky,
              desc: "Log aggregation",
              lines: [
                { t: "12:34:01", l: "INFO", m: "POST /api/qr/redeem 200" },
                { t: "12:34:02", l: "WARN", m: "QR token near expiry" },
                { t: "12:34:05", l: "ERROR", m: "RDS conn timeout retry" },
                { t: "12:34:08", l: "INFO", m: "SMN SMS sent to +2782…" },
              ],
            },
            {
              name: "AOM", icon: "📡", color: COLORS.purple,
              desc: "APM + distributed traces",
              spans: [
                { name: "API Gateway", ms: 3, color: COLORS.primary },
                { name: "Next.js", ms: 12, color: COLORS.sky },
                { name: "Prisma → RDS", ms: 28, color: COLORS.teal },
                { name: "DCS Redis", ms: 2, color: COLORS.yellow },
                { name: "SMN", ms: 8, color: COLORS.orange },
              ],
            },
            {
              name: "CTS", icon: "🗃️", color: COLORS.green,
              desc: "Compliance audit trail",
              events: [
                "Admin created member",
                "Credit limit changed",
                "Fraud alert resolved",
                "Shop deactivated",
                "Schema migration",
              ],
            },
          ].map((card, i) => (
            <FadeUp key={card.name} delay={12 + i * 10}>
              <div style={{
                borderRadius: 18, background: COLORS.bgCard,
                border: `1.5px solid ${card.color}40`, padding: "20px 18px", height: "100%",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{card.icon}</span>
                  <span style={{ color: card.color, fontWeight: 900, fontSize: 16 }}>{card.name}</span>
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 14 }}>{card.desc}</div>

                {"metrics" in card && (card as typeof card & { metrics: {label:string;value:number;max:number}[] }).metrics.map((m, mi) => (
                  <MetricBar key={m.label} label={m.label} value={m.value} max={m.max} color={card.color} delay={30 + i * 10 + mi * 5} />
                ))}

                {"lines" in card && (card as typeof card & { lines: {t:string;l:string;m:string}[] }).lines.map((l) => (
                  <div key={l.m} style={{ marginBottom: 6, fontFamily: "monospace" }}>
                    <span style={{ color: COLORS.textMuted, fontSize: 10 }}>{l.t} </span>
                    <span style={{ color: l.l === "ERROR" ? COLORS.red : l.l === "WARN" ? COLORS.yellow : COLORS.green, fontSize: 10, fontWeight: 700 }}>[{l.l}] </span>
                    <span style={{ color: COLORS.textSub, fontSize: 10 }}>{l.m}</span>
                  </div>
                ))}

                {"spans" in card && (
                  <div>
                    {(card as typeof card & { spans: {name:string;ms:number;color:string}[] }).spans.map((span) => (
                      <div key={span.name} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ color: COLORS.textMuted, fontSize: 10 }}>{span.name}</span>
                          <span style={{ color: span.color, fontSize: 10, fontWeight: 700 }}>{span.ms}ms</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 3, background: `${COLORS.white}08` }}>
                          <div style={{ width: `${(span.ms / 53) * 100}%`, height: "100%", borderRadius: 3, background: span.color }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ color: accent, fontSize: 10, fontWeight: 700, marginTop: 4 }}>Total: 53ms p50</div>
                  </div>
                )}

                {"events" in card && (card as typeof card & { events: string[] }).events.map((ev) => (
                  <div key={ev} style={{ display: "flex", gap: 7, marginBottom: 7 }}>
                    <span style={{ color: card.color, fontSize: 12 }}>✓</span>
                    <span style={{ color: COLORS.textSub, fontSize: 11 }}>{ev}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>

        {/* CBR backup */}
        <FadeUp delay={70}>
          <div style={{
            display: "flex", gap: 20, padding: "18px 24px",
            borderRadius: 14, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>💾</span>
              <div>
                <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 14 }}>CBR — Cloud Backup &amp; Recovery</div>
                <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Daily RDS snapshot · Offsite OBS copy · 30-day retention · 4-hour RTO for full restore</div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};