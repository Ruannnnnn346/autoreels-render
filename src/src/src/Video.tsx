import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";

type Scene = {
  duration_s: number;
  text: string;
  image_url?: string;
};

export const AutoReelsVideo: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();

  // Converte cenas em janelas de frames
  const fps = 30;
  let acc = 0;
  const windows = scenes.map((s) => {
    const start = acc;
    const dur = Math.max(1, Math.round((s.duration_s || 2) * fps));
    acc += dur;
    return { ...s, start, end: start + dur, dur };
  });

  const current = windows.find((w) => frame >= w.start && frame < w.end) ?? windows[0];

  // zoom leve
  const progress = (frame - current.start) / Math.max(1, current.dur);
  const scale = interpolate(progress, [0, 1], [1.02, 1.08]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0b" }}>
      {current?.image_url ? (
        <AbsoluteFill style={{ transform: `scale(${scale})` }}>
          <Img
            src={current.image_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#111" }} />
      )}

      <AbsoluteFill
        style={{
          padding: 80,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.05,
            maxWidth: 900,
            textTransform: "uppercase",
            textShadow: "0 8px 30px rgba(0,0,0,0.6)"
          }}
        >
          {current?.text ?? ""}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
