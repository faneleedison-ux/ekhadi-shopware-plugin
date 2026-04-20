import React from "react";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { Arrow, FadeUp, SectionBand, ServiceChip, SlideWrapper } from "./shared";

export const Slide01Edge: React.FC = () => {
  const accent = SLIDE_ACCENT[1];

  return (
    <SlideWrapper accent={accent} slideNum={1} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        {/* Slide title */}
        <FadeUp delay={0}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Layer 1 of 8
            </span>
          </div>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: 0, letterSpacing: "-1px" }}>
            Edge &amp; Security Layer
          </h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 40px", fontWeight: 400 }}>
            First line of defence — every request from the internet passes through here before reaching compute.
          </p>
        </FadeUp>

        {/* Internet → services flow */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 32, marginBottom: 60 }}>
          {/* User side */}
          <FadeUp delay={10}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 40 }}>👥</div>
              <div style={{
                padding: "12px 20px", borderRadius: 12,
                background: `${COLORS.textMuted}15`, border: `1px solid ${COLORS.border}`,
                color: COLORS.text, fontWeight: 700, fontSize: 14,
              }}>
                Internet Users
              </div>
              <span style={{ color: COLORS.textSub, fontSize: 12 }}>Members · Shops · Admins</span>
            </div>
          </FadeUp>

          <Arrow delay={18} />

          {/* CDN */}
          <ServiceChip name="CDN" sub={"Static assets\nOBS-backed"} color={COLORS.green} delay={20} icon="🌐" />
          <Arrow delay={28} />
          {/* WAF */}
          <ServiceChip name="WAF" sub={"Web App Firewall\nOWASP rules"} color={accent} delay={30} icon="🛡️" />
          <Arrow delay={38} />
          {/* AAD */}
          <ServiceChip name="AAD" sub={"Anti-DDoS\nProtection"} color={COLORS.orange} delay={40} icon="🔰" />
          <Arrow delay={48} />
          {/* ELB */}
          <ServiceChip name="ELB" sub={"Elastic Load\nBalancer"} color={COLORS.sky} delay={50} icon="⚖️" />
        </div>

        {/* Detail cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
          {[
            {
              name: "CDN", color: COLORS.green, icon: "🌐",
              points: ["Cache JS/CSS/images at edge", "Backed by OBS storage bucket", "Reduces ECS load by ~70%"],
            },
            {
              name: "WAF", color: accent, icon: "🛡️",
              points: ["Blocks SQL injection & XSS", "Rate-limits per IP", "OWASP Top-10 ruleset"],
            },
            {
              name: "AAD", color: COLORS.orange, icon: "🔰",
              points: ["Absorbs volumetric DDoS", "Always-on scrubbing", "Protects 110.238.73.51"],
            },
            {
              name: "ELB", color: COLORS.sky, icon: "⚖️",
              points: ["Round-robin across ECS pods", "Health-check every 5 s", "Enables zero-downtime deploy"],
            },
          ].map((card, i) => (
            <FadeUp key={card.name} delay={60 + i * 12}>
              <div style={{
                borderRadius: 16,
                background: COLORS.bgCard,
                border: `1px solid ${card.color}30`,
                padding: "24px 24px",
                height: "100%",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{card.icon}</span>
                  <span style={{ color: card.color, fontWeight: 800, fontSize: 16 }}>{card.name}</span>
                </div>
                {card.points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: card.color, fontSize: 14, flexShrink: 0 }}>›</span>
                    <span style={{ color: COLORS.textSub, fontSize: 13, lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Flow summary tag */}
        <FadeUp delay={110}>
          <div style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 100,
            background: `${accent}12`,
            border: `1px solid ${accent}40`,
          }}>
            <span style={{ fontSize: 16 }}>🔴</span>
            <span style={{ color: COLORS.textSub, fontSize: 13 }}>
              All traffic: <strong style={{ color: COLORS.text }}>e-khadi.co.za</strong> →
              CDN → WAF → AAD → ELB → <strong style={{ color: COLORS.text }}>ECS:3000</strong>
            </span>
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};