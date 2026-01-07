import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// Interface para os dados das cenas
interface SceneData {
  type: string;
  content: string;
  image_url?: string | null;
}

app.post('/render', async (req, res) => {
  try {
    const { projectId, scenes } = req.body;

    console.log('Received render request:', { projectId, scenesCount: scenes?.length });

    if (!scenes || scenes.length === 0) {
      return res.status(400).json({ error: 'No scenes provided' });
    }

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve('./src/index.ts'),
      webpackOverride: (config) => config,
    });

    // Select the composition - IMPORTANTE: usar "AutoReelsVideo"
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'AutoReelsVideo', // <-- Certifique-se que este ID corresponde ao Root.tsx
      inputProps: { scenes },
    });

    // Generate output path
    const outputPath = path.resolve(`./out/${projectId}.mp4`);

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { scenes },
    });

    // Return the video URL (adjust based on your hosting)
    const videoUrl = `https://autoreels-render.onrender.com/videos/${projectId}.mp4`;

    console.log('Render completed:', videoUrl);

    res.json({
      success: true,
      videoUrl,
      duration: composition.durationInFrames / composition.fps,
    });

  } catch (error) {
    console.error('Render error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Render failed: ${message}` });
  }
});

// Serve static video files
app.use('/videos', express.static(path.resolve('./out')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Remotion server running on port ${PORT}`);
});
