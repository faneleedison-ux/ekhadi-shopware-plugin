import React from "react";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { Arrow, FadeUp, Pop, SlideWrapper } from "./shared";

export const Slide05Analytics: React.FC = () => {
  const accent = SLIDE_ACCENT[6];

  const pipeline = [
    { name: "RDS", icon: "🐘", color: COLORS.teal, note: "Source of truth" },
    { name: "DMS Kafka", icon: "📨", color: COLORS.orange, note: "Event stream" },
    { name: "DLI", icon: "⚡", color: accent, note: "Spark Streaming" },
    { name: "DWS", icon: "🏭", color: COLORS.accent, note: "Warehouse" },
    { name: "DataArts", icon: "📊", color: COLORS.primary, note: "Dashboards" },
  ];

  return (
    <SlideWrapper accent={accent} slideNum={5} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Layer 5 of 8</span>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: "8px 0 0", letterSpacing: "-1px" }}>Analytics Pipeline</h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 36px" }}>
            Real-time and batch processing — from raw transactions to actionable dashboards.
          </p>
        </FadeUp>

        {/* Pipeline flow */}
        <FadeUp delay={10}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "28px 32px",
            borderRadius: 20,
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            marginBottom: 32,
          }}>
            {pipeline.map((step, i) => (
              <React.Fragment key={step.name}>
                <Pop delay={12 + i * 10}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 100 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 16,
                      background: `${step.color}20`, border: `2px solid ${step.color}60`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                    }}>
                      {step.icon}
                    </div>
                    <span style={{ color: step.color, fontWeight: 800, fontSize: 13 }}>{step.name}</span>
                    <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{step.note}</span>
                  </div>
                </Pop>
                {i < pipeline.length - 1 && <Arrow delay={20 + i * 10} color={step.color} />}
              </React.Fragment>
            ))}
            {/* Branch to MRS */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 12 }}>
              <Pop delay={60}>
                <div style={{ padding: "8px 16px", borderRadius: 10, background: `${COLORS.pink}15`, border: `1px solid ${COLORS.pink}40` }}>
                  <div style={{ color: COLORS.pink, fontWeight: 700, fontSize: 13 }}>MRS Hadoop</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 10 }}>Batch · weekly aggregates</div>
                </div>
              </Pop>
            </div>
          </div>
        </FadeUp>

        {/* Detail cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20 }}>
          {[
            {
              name: "DMS Kafka", icon: "📨", color: COLORS.orange,
              lines: ["Event bus for all transactions", "Topic: store-credit-events", "Consumed by DLI + FunctionGraph", "3 partition · 7-day retention"],
            },
            {
              name: "DLI (Spark)", icon: "⚡", color: accent,
              lines: ["Streaming fraud pattern detection", "Hourly aggregation jobs", "Joins Kafka stream with RDS dims", "Writes summaries → DWS"],
            },
            {
              name: "DataArts Studio", icon: "📊", color: COLORS.primary,
              lines: ["Admin analytics dashboards", "Area-level spend heatmaps", "Group repayment rates", "Export to Excel / PDF"],
            },
            {
              name: "MRS Hadoop", icon: "🗂️", color: COLORS.pink,
              lines: ["Weekly batch ETL", "Historical trend analysis", "Cohort repayment studies", "Feeds ModelArts training data"],
            },
          ].map((card, i) => (
            <FadeUp key={card.name} delay={70 + i * 10}>
              <div style={{
                borderRadius: 16, background: COLORS.bgCard,
                border: `1.5px solid ${card.color}30`, padding: "20px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{card.icon}</span>
                  <span style={{ color: card.color, fontWeight: 800, fontSize: 14 }}>{card.name}</span>
                </div>
                {card.lines.map((l) => (
                  <div key={l} style={{ display: "flex", gap: 7, marginBottom: 6 }}>
                    <span style={{ color: card.color, fontSize: 12 }}>›</span>
                    <span style={{ color: COLORS.textSub, fontSize: 11, lineHeight: 1.5 }}>{l}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </SlideWrapper>
  );
};