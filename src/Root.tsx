import React from 'react';
import { Composition } from 'remotion';
import { AutoReelsVideo } from './Video';

// Definindo o tipo das props
interface SceneData {
  type: string;
  content: string;
  image_url?: string | null;
}

interface VideoProps {
  scenes: SceneData[];
}

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={AutoReelsVideo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [] as SceneData[],
      }}
    />
  );
};
