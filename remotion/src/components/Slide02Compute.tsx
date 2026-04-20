import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { FadeUp, Pop, ServiceChip, SlideWrapper } from "./shared";

export const Slide02Compute: React.FC = () => {
  const accent = SLIDE_ACCENT[2];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barProgress = spring({ frame: frame - 60, fps, config: { damping: 22, stiffness: 70 } });

  return (
    <SlideWrapper accent={accent} slideNum={2} totalSlides={10}>
      <div style={{ padding: "60px 80px", fontFamily: FONT.sans }}>
        <FadeUp delay={0}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Layer 2 of 8
            </span>
          </div>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: COLORS.white, margin: 0, letterSpacing: "-1px" }}>
            Compute Layer
          </h2>
          <p style={{ color: COLORS.textSub, fontSize: 18, margin: "10px 0 36px" }}>
            Where the Next.js application runs — from single ECS today to Kubernetes at scale.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
          {/* ECS Card — active */}
          <FadeUp delay={15}>
            <div style={{
              borderRadius: 20, background: COLORS.bgCard,
              border: `2px solid ${accent}60`,
              padding: 28,
              boxShadow: `0 0 30px ${accent}30`,
              gridColumn: "1",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 28 }}>🖥️</span>
                  <span style={{ color: accent, fontWeight: 900, fontSize: 22 }}>ECS</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: `${COLORS.active}20`, border: `1px solid ${COLORS.active}60` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.active, boxShadow: `0 0 6px ${COLORS.active}` }} />
                  <span style={{ color: COLORS.active, fontWeight: 700, fontSize: 11 }}>LIVE</span>
                </div>
              </div>
              <p style={{ color: COLORS.textSub, fontSize: 13, margin: "0 0 16px", lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.text }}>110.238.73.51</strong><br />
                Next.js 14 · Node 18 · PM2<br />
                Nginx → :3000<br />
                4 vCPU · 8 GB RAM
              </p>
              {/* CPU meter */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 11 }}>CPU</span>
                  <span style={{ color: accent, fontWeight: 700, fontSize: 11 }}>
                    {Math.round(barProgress * 34)}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `${COLORS.white}10` }}>
                  <div style={{ width: `${barProgress * 34}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${accent}, ${COLORS.yellow})` }} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 11 }}>RAM</span>
                  <span style={{ color: COLORS.sky, fontWeight: 700, fontSize: 11 }}>
                    {Math.round(barProgress * 52)}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `${COLORS.white}10` }}>
                  <div style={{ width: `${barProgress * 52}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${COLORS.sky}, ${COLORS.primary})` }} />
                </div>
              </div>
            </div>
          </FadeUp>

          {/* CCE Card */}
          <FadeUp delay={25}>
            <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.primary}30`, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 28 }}>☸️</span>
                <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: 22 }}>CCE</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted, padding: "3px 10px", borderRadius: 100, border: `1px solid ${COLORS.border}` }}>Scale tier</span>
              </div>
              <p style={{ color: COLORS.textSub, fontSize: 13, margin: "0 0 18px", lineHeight: 1.7 }}>
                Cloud Container Engine<br />
                Kubernetes cluster for<br />
                high-traffic periods
              </p>
              {/* Pod chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["ekhadi-app", "worker", "forecast-ai", "cron-jobs"].map((pod, i) => (
                  <Pop key={pod} delay={40 + i * 8}>
                    <div style={{
                      padding: "6px 12px", borderRadius: 8,
                      background: `${COLORS.primary}15`,
                      border: `1px solid ${COLORS.primary}40`,
                    }}>
                      <span style={{ color: COLORS.primary, fontSize: 11, fontWeight: 600 }}>{pod}</span>
                    </div>
                  </Pop>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: `${COLORS.primary}08`, border: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textMuted, fontSize: 12 }}>SWR → CCE image pull → Pod autoscale</span>
              </div>
            </div>
          </FadeUp>

          {/* AS Card */}
          <FadeUp delay={35}>
            <div style={{ borderRadius: 20, background: COLORS.bgCard, border: `1.5px solid ${COLORS.teal}30`, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 28 }}>📈</span>
                <span style={{ color: COLORS.teal, fontWeight: 900, fontSize: 22 }}>AS</span>
              </div>
              <p style={{ color: COLORS.textSub, fontSize: 13, margin: "0 0 18px", lineHeight: 1.7 }}>
                Auto Scaling Group<br />
                Scales ECS instances<br />
                on CPU / memory triggers
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} style={{
                    flex: 1, height: 40, borderRadius: 6,
                    background: n <= 2 ? `${COLORS.teal}30` : `${COLORS.white}08`,
                    border: `1px solid ${n <= 2 ? COLORS.teal + "60" : COLORS.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: n <= 2 ? COLORS.teal : COLORS.textMuted, fontSize: 12, fontWeight: 700 }}>
                      {n <= 2 ? "●" : "○"}
                    </span>
                  </div>
                ))}
              </div>
              <span style={{ color: COLORS.textMuted, fontSize: 11 }}>min 1 · current 2 · max 4 instances</span>
              <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: `${COLORS.teal}08`, border: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textMuted, fontSize: 12 }}>SASSA pay-day spike → auto scales out in &lt;90s</span>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* FunctionGraph row */}
        <FadeUp delay={70}>
          <div style={{ marginTop: 28, borderRadius: 16, background: COLORS.bgCard, border: `1.5px solid ${COLORS.purple}40`, padding: "20px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <span style={{ color: COLORS.purple, fontWeight: 800, fontSize: 18 }}>FunctionGraph</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.active, boxShadow: `0 0 6px ${COLORS.active}` }} />
              <span style={{ color: COLORS.active, fontSize: 11, fontWeight: 700 }}>ACTIVE</span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { name: "fraud-scanner", trigger: "Cron every 1h", color: COLORS.red },
                { name: "grant-countdown", trigger: "Cron daily 06:00", color: COLORS.yellow },
                { name: "sms-notify", trigger: "SMN event", color: COLORS.orange },
                { name: "restock-alert", trigger: "DMS Kafka event", color: COLORS.teal },
                { name: "loyalty-calc", trigger: "DB trigger", color: COLORS.purple },
              ].map((fn, i) => (
                <Pop key={fn.name} delay={75 + i * 8}>
                  <div style={{
                    padding: "10px 16px", borderRadius: 10,
                    background: `${fn.color}12`, border: `1px solid ${fn.color}40`,
                  }}>
                    <div style={{ color: fn.color, fontWeight: 700, fontSize: 12 }}>λ {fn.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 3 }}>{fn.trigger}</div>
                  </div>
                </Pop>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </SlideWrapper>
  );
};