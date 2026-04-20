import React from "react";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { FadeUp, Pop, SlideWrapper } from "./shared";

export const Slide08Security: React.FC = () => {
  const accent = SLIDE_ACCENT[8];

  const services = [
    {
      name: "IAM", icon: "🔑", color: accent,
      role: "Identity & Access",
      points: ["Role-based access: ADMIN / SHOP / MEMBER", "Service accounts for FunctionGraph", "MFA enforcement for admins", "Least-privilege policies"],
    },
    {
      name: "KMS", icon: "🔐", color: COLORS.purple,
      role: "Key Management",
      points: ["Encrypts RDS at rest", "Wraps OBS bucket objects", "Rotates secrets every 90 days", "FIPS 140-2 compliant HSM"],
    },
    {
      name: "HSS", icon: "🛡️", color: COLORS.red,
      role: "Host Security",
      points: ["ECS vulnerability scanning", "Rootkit & malware detection", "Login anomaly alerts", "CIS benchmark hardening"],
    },
    {
      name: "VSS", icon: "🔬", color: COLORS.orange,
      role: "Vulnerability Scan",
      points: ["Weekly web app DAST scans", "Dependency CVE monitoring", "Port & service audit", "Remediation report to admin"],
    },
    {
      name: "NAT Gateway", icon: "🌐", color: COLORS.sky,
      role: "Network Address Translation",
      points: ["ECS outbound internet (OBS, AI APIs)", "No public IP on RDS", "Private subnet isolation", "SNAT table for Kubernetes pods"],
    },
    {
      name: "Cloud Connect", icon: "🔗", color: COLORS.teal,
      role: "Hybrid Connectivity",
      points: ["Future: connect on-prem SASSA systems", "Low-latency inter-region link", "VPN fallback path", "Bandwidth guarantees for data sync"],
    },
  ];

  return (
    <SlideWrapper accent={accent} slideNum={8} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Layer 8 of 8</span>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: "8px 0 0", letterSpacing: "-1px" }}>Security &amp; Networking</h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 32px" }}>
            Defence-in-depth — identity, encryption, host hardening, scanning, and network isolation.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
          {services.map((svc, i) => (
            <FadeUp key={svc.name} delay={12 + i * 10}>
              <div style={{
                borderRadius: 18, background: COLORS.bgCard,
                border: `1.5px solid ${svc.color}40`, padding: "22px 22px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${svc.color}18`, border: `1px solid ${svc.color}50`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>
                    {svc.icon}
                  </div>
                  <div>
                    <div style={{ color: svc.color, fontWeight: 900, fontSize: 18 }}>{svc.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{svc.role}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: `${svc.color}20`, margin: "10px 0 12px" }} />
                {svc.points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                    <span style={{ color: svc.color, fontSize: 13, flexShrink: 0 }}>›</span>
                    <span style={{ color: COLORS.textSub, fontSize: 12, lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>

        {/* DevOps strip */}
        <FadeUp delay={90}>
          <div style={{
            marginTop: 24, padding: "18px 24px", borderRadius: 14,
            background: `linear-gradient(135deg, ${accent}10, ${COLORS.primary}10)`,
            border: `1px solid ${accent}30`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 18 }}>🚀</span>
              <span style={{ color: COLORS.text, fontWeight: 800, fontSize: 14 }}>CI/CD Pipeline:</span>
              {["Developer", "→", "CodeArts (build + test)", "→", "SWR (container registry)", "→", "CCE / ECS deploy", "→", "PM2 restart"].map((s, i) => (
                <span key={i} style={{ color: s === "→" ? COLORS.textMuted : COLORS.textSub, fontSize: 13, fontWeight: s === "→" ? 400 : 600 }}>{s}</span>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};