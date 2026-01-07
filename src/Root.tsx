import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [],
      }}
    />
  );
};
