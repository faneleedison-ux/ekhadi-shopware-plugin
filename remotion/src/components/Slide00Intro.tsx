import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SLIDE_ACCENT } from "./tokens";
import { FadeUp, Pop, SlideWrapper } from "./shared";

export const Slide00Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = SLIDE_ACCENT[0];

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const glowOpacity = interpolate(frame, [0, 40, 80], [0, 1, 0.6], { extrapolateRight: "clamp" });

  const services = [
    { name: "ECS", color: COLORS.orange },
    { name: "RDS", color: COLORS.sky },
    { name: "OBS", color: COLORS.teal },
    { name: "FunctionGraph", color: COLORS.purple },
    { name: "SMN", color: COLORS.yellow },
    { name: "ModelArts", color: COLORS.pink },
    { name: "CDN", color: COLORS.green },
    { name: "WAF", color: COLORS.red },
    { name: "API Gateway", color: COLORS.primary },
    { name: "DWS", color: COLORS.accent },
  ];

  return (
    <SlideWrapper accent={accent} slideNum={0} totalSlides={10}>
      {/* Centre logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Glow ring */}
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}${Math.round(glowOpacity * 80).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px rgba(255,255,255,0.6), 0 0 120px ${accent}80`,
          }}
        >
          <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: 32, fontFamily: FONT.sans }}>eK</span>
        </div>

        <FadeUp delay={15}>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: COLORS.white,
              margin: 0,
              letterSpacing: "-1px",
              fontFamily: FONT.sans,
              textAlign: "center",
              textShadow: `0 0 40px ${accent}80`,
            }}
          >
            e-Khadi
          </h1>
        </FadeUp>

        <FadeUp delay={25}>
          <p
            style={{
              fontSize: 22,
              color: COLORS.textSub,
              margin: 0,
              fontFamily: FONT.sans,
              textAlign: "center",
              letterSpacing: "0.05em",
            }}
          >
            Stokvel Credit Platform · Huawei Cloud Architecture
          </p>
        </FadeUp>

        <FadeUp delay={35}>
          <div
            style={{
              marginTop: 8,
              padding: "10px 28px",
              borderRadius: 100,
              border: `1.5px solid ${accent}60`,
              background: `${accent}15`,
            }}
          >
            <span style={{ color: accent, fontWeight: 700, fontSize: 14, fontFamily: FONT.sans, letterSpacing: "0.1em" }}>
              38 HUAWEI CLOUD SERVICES · 10 LAYERS
            </span>
          </div>
        </FadeUp>
      </div>

      {/* Orbiting service pills */}
      {services.map((svc, i) => {
        const angle = (i / services.length) * 2 * Math.PI;
        const orbitR = 420;
        const delay = 20 + i * 6;
        const prog = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 60 } });
        const x = 960 + Math.cos(angle) * orbitR * prog;
        const y = 540 + Math.sin(angle) * orbitR * 0.55 * prog;
        return (
          <div
            key={svc.name}
            style={{
              position: "absolute",
              left: x - 44,
              top: y - 16,
              opacity: prog,
              padding: "8px 16px",
              borderRadius: 100,
              background: `${svc.color}18`,
              border: `1px solid ${svc.color}50`,
              fontFamily: FONT.sans,
            }}
          >
            <span style={{ color: svc.color, fontWeight: 700, fontSize: 12 }}>{svc.name}</span>
          </div>
        );
      })}
    </SlideWrapper>
  );
};