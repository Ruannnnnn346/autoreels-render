import React from "react";
import { Composition } from "remotion";
import { AutoReelsVideo } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AutoReels"
        component={AutoReelsVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={30 * 15} // default 15s (vai ser recalculado pelo server)
        defaultProps={{
          scenes: [
            { duration_s: 2, text: "HOOK", image_url: "" },
            { duration_s: 3, text: "PROVA", image_url: "" }
          ]
        }}
      />
    </>
  );
};
