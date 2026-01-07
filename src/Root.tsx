import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';

interface SceneData {
  type: string;
  content: string;
  image_url?: string | null;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={Video}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [] as SceneData[],
        }}
      />
    </>
  );
};
