import { AbsoluteFill, Img, Sequence, useCurrentFrame, interpolate } from "remotion";

interface Scene {
  content: string;
  image_url?: string;
}

interface VideoSceneProps {
  scenes: Scene[];
}

const SingleScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      {scene.image_url && (
        <Img
          src={scene.image_url}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.3,
          }}
        />
      )}
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: "48px",
            color: "white",
            fontFamily: "Arial, sans-serif",
            lineHeight: 1.4,
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            maxWidth: "900px",
          }}
        >
          {scene.content}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const VideoScene: React.FC<VideoSceneProps> = ({ scenes }) => {
  const framesPerScene = 90; // 3 segundos a 30fps

  if (!scenes || scenes.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "white", fontSize: "32px" }}>No scenes provided</p>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {scenes.map((scene, index) => (
        <Sequence key={index} from={index * framesPerScene} durationInFrames={framesPerScene}>
          <SingleScene scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
