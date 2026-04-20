import React from "react";
import { Composition } from "remotion";
import { ArchDiagram } from "./compositions/ArchDiagram";

// 8 slides × 150 frames each + 60 intro + 90 outro = 1410 frames @ 30fps = 47s
const TOTAL_FRAMES = 1410;
const FPS = 30;

export const Root: React.FC = () => (
  <>
    <Composition
      id="ArchDiagram"
      component={ArchDiagram}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);