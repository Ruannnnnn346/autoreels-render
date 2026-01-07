import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AutoReels"
        component={Video}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300} // fallback; o server ajusta depois
        defaultProps={{
          scenes: [],
        }}
      />
    </>
  );
};
