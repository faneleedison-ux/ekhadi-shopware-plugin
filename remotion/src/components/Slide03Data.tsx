import React from "react";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { Arrow, FadeUp, Pop, ServiceChip, SlideWrapper } from "./shared";

export const Slide03Data: React.FC = () => {
  const accent = SLIDE_ACCENT[4];

  return (
    <SlideWrapper accent={accent} slideNum={3} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        <FadeUp>
          <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Layer 3 of 8</span>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: "8px 0 0", letterSpacing: "-1px" }}>Data &amp; Cache Layer</h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 36px" }}>Persistent storage, fast cache, and object store — the three data tiers.</p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 28, marginBottom: 28 }}>
          {/* RDS */}
          <FadeUp delay={12}>
            <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `2px solid ${accent}60`, padding: 28, boxShadow: `0 0 24px ${accent}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🐘</span>
                <div>
                  <div style={{ color: accent, fontWeight: 900, fontSize: 20 }}>RDS for PostgreSQL</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.active, boxShadow: `0 0 6px ${COLORS.active}` }} />
                    <span style={{ color: COLORS.active, fontSize: 11, fontWeight: 700 }}>ACTIVE · 192.168.0.53:5432</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["Users", "Groups", "Credits", "Transactions", "Fraud Alerts", "QR Tokens", "Restock Orders", "Noticeboard"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: accent, fontSize: 12 }}>▪</span>
                    <span style={{ color: COLORS.textSub, fontSize: 12 }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "8px 14px", borderRadius: 8, background: `${accent}10`, border: `1px solid ${accent}30` }}>
                <span style={{ color: COLORS.textMuted, fontSize: 11 }}>Prisma ORM · db push · Private subnet · HA replicas</span>
              </div>
            </div>
          </FadeUp>

          {/* OBS */}
          <FadeUp delay={22}>
            <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.sky}40`, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🪣</span>
                <div>
                  <div style={{ color: COLORS.sky, fontWeight: 900, fontSize: 20 }}>OBS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.active, boxShadow: `0 0 6px ${COLORS.active}` }} />
                    <span style={{ color: COLORS.active, fontSize: 11, fontWeight: 700 }}>ACTIVE</span>
                  </div>
                </div>
              </div>
              {[
                { icon: "🪪", name: "ID documents", note: "OCR + FRS pipeline" },
                { icon: "🧾", name: "PDF receipts", note: "Signed URLs · 90 day TTL" },
                { icon: "💾", name: "DB backups", note: "Daily snapshot export" },
                { icon: "📦", name: "Static assets", note: "CDN origin" },
              ].map((item) => (
                <div key={item.name} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div>
                    <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* DCS + DWS */}
          <FadeUp delay={32}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.yellow}40`, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>⚡</span>
                  <span style={{ color: COLORS.yellow, fontWeight: 900, fontSize: 18 }}>DCS Redis 6</span>
                </div>
                <div style={{ color: COLORS.textSub, fontSize: 12, lineHeight: 1.7 }}>
                  Session cache · QR token store<br />
                  Rate limit counters · API response cache<br />
                  Sub-millisecond reads
                </div>
              </div>
              <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.accent}40`, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>🏭</span>
                  <span style={{ color: COLORS.accent, fontWeight: 900, fontSize: 18 }}>DWS</span>
                </div>
                <div style={{ color: COLORS.textSub, fontSize: 12, lineHeight: 1.7 }}>
                  Data Warehouse<br />
                  Aggregated analytics · Reporting<br />
                  Powers DataArts dashboards
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Flow */}
        <FadeUp delay={80}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderRadius: 12, background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
            {["App Request", "→", "DCS (cache hit?)", "→ YES →", "Return cached", "→ NO →", "RDS query", "→", "DCS set", "→", "Response"].map((s, i) => (
              <span key={i} style={{ color: s.includes("→") ? COLORS.textMuted : i === 0 ? COLORS.text : i === 2 ? COLORS.yellow : COLORS.textSub, fontSize: 13, fontWeight: s.includes("→") ? 400 : 600 }}>{s}</span>
            ))}
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};