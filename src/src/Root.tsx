import { Composition } from "remotion";
import { Video } from "./Video";

export const Root = () => {
  return (
    <>
      <Composition
        id="AutoReels"
        component={Video}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
