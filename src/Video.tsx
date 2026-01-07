import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';

interface SceneData {
  type: string;
  content: string;
  image_url?: string | null;
}

interface VideoProps {
  scenes: SceneData[];
}

export const Video: React.FC<VideoProps> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const framesPerScene = 150; // 5 segundos por cena a 30fps

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((scene, index) => (
        <Sequence
          key={index}
          from={index * framesPerScene}
          durationInFrames={framesPerScene}
        >
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40,
            }}
          >
            {scene.image_url && (
              <img
                src={scene.image_url}
                style={{
                  width: '100%',
                  height: '60%',
                  objectFit: 'cover',
                  borderRadius: 20,
                }}
              />
            )}
            <div
              style={{
                color: 'white',
                fontSize: 48,
                textAlign: 'center',
                marginTop: 40,
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {scene.content}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
