import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Scene = {
  duration_s?: number;
  text?: string;
  image_url?: string;
};

export const Video: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // calcula em que cena o frame atual está
  let start = 0;
  let currentIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    const d = Math.max(1, Math.round((Number(scenes[i].duration_s ?? 2)) * fps));
    if (frame >= start && frame < start + d) {
      currentIndex = i;
      break;
    }
    start += d;
  }

  const scene = scenes[currentIndex] ?? {};
  const localFrame = frame - start;

  const fadeIn = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(localFrame, [Math.max(0, (Number(scene.duration_s ?? 2) * fps) - 10), Number(scene.duration_s ?? 2) * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {scene.image_url ? (
        <Img
          src={scene.image_url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
          }}
        />
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ color: "white", fontSize: 64, fontWeight: 800, opacity }}>
            Sem imagem
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ justifyContent: "flex-end", padding: 80 }}>
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            textShadow: "0 6px 20px rgba(0,0,0,0.7)",
            opacity,
          }}
        >
          {scene.text ?? ""}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
