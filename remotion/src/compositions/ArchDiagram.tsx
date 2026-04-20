import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Slide00Intro } from "../components/Slide00Intro";
import { Slide01Edge } from "../components/Slide01Edge";
import { Slide02Compute } from "../components/Slide02Compute";
import { Slide03Data } from "../components/Slide03Data";
import { Slide04AI } from "../components/Slide04AI";
import { Slide05Analytics } from "../components/Slide05Analytics";
import { Slide06Messaging } from "../components/Slide06Messaging";
import { Slide07Observability } from "../components/Slide07Observability";
import { Slide08Security } from "../components/Slide08Security";
import { Slide09FullPicture } from "../components/Slide09FullPicture";

// Each slide duration in frames (at 30fps)
const INTRO_DUR = 90;     // 3s  — intro cinematic
const SLIDE_DUR = 150;    // 5s  — each architecture slide
const OUTRO_DUR = 120;    // 4s  — full picture stays on screen

// Slide start offsets
const S0 = 0;
const S1 = S0 + INTRO_DUR;
const S2 = S1 + SLIDE_DUR;
const S3 = S2 + SLIDE_DUR;
const S4 = S3 + SLIDE_DUR;
const S5 = S4 + SLIDE_DUR;
const S6 = S5 + SLIDE_DUR;
const S7 = S6 + SLIDE_DUR;
const S8 = S7 + SLIDE_DUR;
const S9 = S8 + SLIDE_DUR;

export const ArchDiagram: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={S0} durationInFrames={INTRO_DUR}>
      <Slide00Intro />
    </Sequence>
    <Sequence from={S1} durationInFrames={SLIDE_DUR}>
      <Slide01Edge />
    </Sequence>
    <Sequence from={S2} durationInFrames={SLIDE_DUR}>
      <Slide02Compute />
    </Sequence>
    <Sequence from={S3} durationInFrames={SLIDE_DUR}>
      <Slide03Data />
    </Sequence>
    <Sequence from={S4} durationInFrames={SLIDE_DUR}>
      <Slide04AI />
    </Sequence>
    <Sequence from={S5} durationInFrames={SLIDE_DUR}>
      <Slide05Analytics />
    </Sequence>
    <Sequence from={S6} durationInFrames={SLIDE_DUR}>
      <Slide06Messaging />
    </Sequence>
    <Sequence from={S7} durationInFrames={SLIDE_DUR}>
      <Slide07Observability />
    </Sequence>
    <Sequence from={S8} durationInFrames={SLIDE_DUR}>
      <Slide08Security />
    </Sequence>
    <Sequence from={S9} durationInFrames={OUTRO_DUR}>
      <Slide09FullPicture />
    </Sequence>
  </AbsoluteFill>
);