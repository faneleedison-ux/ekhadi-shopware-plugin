import React from "react";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { FadeUp, Pop, SlideWrapper } from "./shared";

const AI_SERVICES = [
  {
    name: "ModelArts",
    icon: "🧠",
    color: "#A855F7",
    tagline: "AI Stock Forecast",
    points: ["Prophet time-series model", "Per-product demand prediction", "Restock recommendations", "Trains on 30-day sales history"],
  },
  {
    name: "OCR",
    icon: "🪪",
    color: "#3B82F6",
    tagline: "ID Document Scan",
    points: ["SASSA card text extraction", "SA ID book parsing", "Name / ID number / DOB", "Triggers FRS face match"],
  },
  {
    name: "FRS",
    icon: "🤳",
    color: "#EC4899",
    tagline: "Face Recognition",
    points: ["Selfie vs ID photo compare", "Liveness check (blink test)", "Fraud identity verification", "1:1 match confidence score"],
  },
  {
    name: "NLP",
    icon: "💬",
    color: "#22C55E",
    tagline: "Financial Advisor Bot",
    points: ["Afrikaans + isiZulu + English", "Savings tips · Debt advice", "Budget coaching", "Stokvel group insights"],
  },
  {
    name: "IVS",
    icon: "🎥",
    color: "#F97316",
    tagline: "Video Verification",
    points: ["Short video liveness proof", "Anti-spoofing (photo attacks)", "Async processing via FunctionGraph", "Result stored in OBS"],
  },
  {
    name: "CSS",
    icon: "🔍",
    color: "#38BDF8",
    tagline: "Smart Search",
    points: ["Full-text product search", "Elastic index on OBS data", "Fuzzy matching for shop items", "Powers restock search UX"],
  },
];

export const Slide04AI: React.FC = () => {
  const accent = SLIDE_ACCENT[5];

  return (
    <SlideWrapper accent={accent} slideNum={4} totalSlides={10}>
      <div style={{ padding: "55px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Layer 4 of 8</span>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: "8px 0 0", letterSpacing: "-1px" }}>AI Intelligence Layer</h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 32px" }}>
            Six Huawei AI services — from forecasting stock to verifying grant recipients.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
          {AI_SERVICES.map((svc, i) => (
            <FadeUp key={svc.name} delay={12 + i * 10}>
              <div style={{
                borderRadius: 18,
                background: COLORS.bgCard,
                border: `1.5px solid ${svc.color}40`,
                padding: "22px 22px",
                height: "100%",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${svc.color}20`,
                    border: `1px solid ${svc.color}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    {svc.icon}
                  </div>
                  <div>
                    <div style={{ color: svc.color, fontWeight: 900, fontSize: 18 }}>{svc.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{svc.tagline}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: `${svc.color}20`, margin: "12px 0" }} />
                {svc.points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                    <span style={{ color: svc.color, fontSize: 13, flexShrink: 0, marginTop: 1 }}>›</span>
                    <span style={{ color: COLORS.textSub, fontSize: 12, lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Pipeline footer */}
        <FadeUp delay={90}>
          <div style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 24px",
            borderRadius: 12,
            background: `${accent}10`,
            border: `1px solid ${accent}30`,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 16 }}>🔗</span>
            {["Member uploads selfie + ID", "→", "OBS stores files", "→", "OCR extracts text", "→", "FRS matches face", "→", "IVS liveness check", "→", "IDVerification record updated"].map((s, i) => (
              <span key={i} style={{
                color: s === "→" ? COLORS.textMuted : COLORS.textSub,
                fontSize: 13,
                fontWeight: s === "→" ? 400 : 600,
              }}>{s}</span>
            ))}
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};