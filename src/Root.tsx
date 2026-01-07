import { Composition } from 'remotion';
import { Video, VideoProps } from './Video';

export const RemotionRoot = () => {
  return (
    <Composition
      id="AutoReelsVideo"
      component={Video}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [],
      } as VideoProps}
    />
  );
};
