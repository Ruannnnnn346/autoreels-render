import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';

interface Scene {
  type: string;
  content: string;
  image_url?: string | null;
}

interface VideoProps {
  scenes: Scene[];
}

export const Video: React.FC<VideoProps> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const sceneIndex = Math.min(Math.floor(frame / 90), scenes.length - 1);
  const scene = scenes[sceneIndex] || { type: 'hook', content: 'Carregando...' };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scene.image_url && (
        <Img src={scene.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 40,
        right: 40,
        color: 'white',
        fontSize: 48,
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      }}>
        {scene.content}
      </div>
    </AbsoluteFill>
  );
};
