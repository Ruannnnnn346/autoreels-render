import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';

interface Scene {
  type: string;
  content: string;
  image_url?: string | null;
}

export interface VideoProps {
  scenes: Scene[];
}

export const Video = ({ scenes }: VideoProps) => {
  const frame = useCurrentFrame();
  const sceneIndex = Math.min(Math.floor(frame / 90), Math.max(0, scenes.length - 1));
  const scene = scenes[sceneIndex];

  if (!scene) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: 48 }}>Carregando...</div>
      </AbsoluteFill>
    );
  }

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
