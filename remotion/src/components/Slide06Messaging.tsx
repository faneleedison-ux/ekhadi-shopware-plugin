import React from "react";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { Arrow, FadeUp, Pop, SlideWrapper } from "./shared";

export const Slide06Messaging: React.FC = () => {
  const accent = "#F97316";

  return (
    <SlideWrapper accent={accent} slideNum={6} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Layer 6 of 8</span>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: "8px 0 0", letterSpacing: "-1px" }}>Messaging &amp; Notifications</h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 36px" }}>
            SMN for instant alerts · Kafka for event streaming · RabbitMQ for async job queues.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 28, marginBottom: 32 }}>
          {/* SMN */}
          <FadeUp delay={10}>
            <div style={{
              borderRadius: 20, background: COLORS.bgCard,
              border: `2px solid ${accent}60`, padding: 28,
              boxShadow: `0 0 24px ${accent}25`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>📣</span>
                <div>
                  <div style={{ color: accent, fontWeight: 900, fontSize: 20 }}>SMN</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.active, boxShadow: `0 0 6px ${COLORS.active}` }} />
                    <span style={{ color: COLORS.active, fontSize: 11, fontWeight: 700 }}>ACTIVE</span>
                  </div>
                </div>
              </div>
              {[
                { trigger: "Credit approved", channel: "SMS → member", icon: "✅" },
                { trigger: "Low balance warning", channel: "SMS + push", icon: "⚠️" },
                { trigger: "SASSA pay-day", channel: "Broadcast SMS", icon: "💸" },
                { trigger: "Fraud detected", channel: "SMS → admin", icon: "🚨" },
                { trigger: "QR expiry warning", channel: "Push notification", icon: "⏱️" },
                { trigger: "Restock order filled", channel: "SMS → shop owner", icon: "📦" },
              ].map((item) => (
                <div key={item.trigger} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div>
                    <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{item.trigger}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{item.channel}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* DMS Kafka */}
          <FadeUp delay={20}>
            <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.yellow}40`, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>📨</span>
                <span style={{ color: COLORS.yellow, fontWeight: 900, fontSize: 20 }}>DMS Kafka</span>
              </div>
              <div style={{ color: COLORS.textSub, fontSize: 13, marginBottom: 18, lineHeight: 1.7 }}>
                High-throughput event streaming for real-time analytics ingestion.
              </div>
              {[
                "store-credit-events",
                "fraud-alerts",
                "restock-requests",
                "noticeboard-events",
              ].map((topic) => (
                <div key={topic} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 6,
                    background: `${COLORS.yellow}12`, border: `1px solid ${COLORS.yellow}30`,
                    fontFamily: "monospace", fontSize: 12, color: COLORS.yellow,
                  }}>
                    topic: {topic}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: `${COLORS.yellow}08` }}>
                <span style={{ color: COLORS.textMuted, fontSize: 11 }}>Consumed by: DLI, FunctionGraph, DataArts</span>
              </div>
            </div>
          </FadeUp>

          {/* DMS RabbitMQ */}
          <FadeUp delay={30}>
            <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.orange}40`, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🐇</span>
                <span style={{ color: COLORS.orange, fontWeight: 900, fontSize: 20 }}>DMS RabbitMQ</span>
              </div>
              <div style={{ color: COLORS.textSub, fontSize: 13, marginBottom: 18, lineHeight: 1.7 }}>
                Async job queue for background tasks that should not block the HTTP response.
              </div>
              {[
                { queue: "pdf-receipt-gen", desc: "Generate & upload to OBS" },
                { queue: "id-verify-pipeline", desc: "OCR → FRS → IVS chain" },
                { queue: "bulk-buy-notify", desc: "Notify when group funded" },
                { queue: "loyalty-recalc", desc: "Nightly points rollup" },
              ].map((q) => (
                <div key={q.queue} style={{ marginBottom: 10 }}>
                  <div style={{ color: COLORS.orange, fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>⬡ {q.queue}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 11, marginLeft: 16 }}>{q.desc}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* Message flow */}
        <FadeUp delay={85}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 12, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14 }}>📲</span>
            {["App Action", "→", "FunctionGraph", "→", "SMN", "→", "SMS / Push", "   |", "→", "Kafka", "→", "DLI Analytics", "   |", "→", "RabbitMQ", "→", "Background Worker"].map((s, i) => (
              <span key={i} style={{ color: s === "→" || s === "   |" ? COLORS.textMuted : COLORS.textSub, fontSize: 13, fontWeight: s === "→" ? 400 : 600 }}>{s}</span>
            ))}
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};