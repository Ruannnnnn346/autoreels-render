import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/render', async (req, res) => {
  try {
    const { projectId, timeline } = req.body;
    
    console.log('Rendering video for project:', projectId);
    console.log('Scenes:', timeline?.scenes?.length || 0);

    // IMPORTANTE: o entryPoint aponta para src/index.ts
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'src', 'index.ts'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MainVideo',
      inputProps: { scenes: timeline?.scenes || [] },
    });

    const outputPath = path.join('/tmp', `video-${projectId}-${Date.now()}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { scenes: timeline?.scenes || [] },
    });

    const videoBuffer = fs.readFileSync(outputPath);
    const base64Video = videoBuffer.toString('base64');
    const videoUrl = `data:video/mp4;base64,${base64Video}`;

    fs.unlinkSync(outputPath);

    res.json({
      success: true,
      videoUrl,
      duration: composition.durationInFrames / composition.fps,
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Remotion server running on port ${PORT}`);
});
