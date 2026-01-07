import { Composition } from "remotion";
import { VideoScene } from "./compositions/VideoScene";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoScene"
        component={VideoScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [],
        }}
        calculateMetadata={({ props }) => {
          const scenes = props.scenes || [];
          const framesPerScene = 90; // 3 segundos por cena
          const totalFrames = Math.max(scenes.length * framesPerScene, 150);
          return {
            durationInFrames: totalFrames,
          };
        }}
      />
    </>
  );
};
