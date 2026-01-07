import { Composition } from "remotion";
import { Video } from "./Video";  // ← Importa de ./Video, não ./components/MainVideo

export interface SceneData {
  id: string;
  order_index: number;
  image_url: string | null;
  narration_text: string | null;
  duration: number;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={Video}  // ← Usa o componente Video
        durationInFrames={300}
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
