import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
app.use(express.json({ limit: '50mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Render endpoint
app.post('/render', async (req, res) => {
  const { scenes, projectId } = req.body;

  if (!scenes || !Array.isArray(scenes)) {
    return res.status(400).json({ error: 'scenes array is required' });
  }

  console.log(`Starting render for project ${projectId} with ${scenes.length} scenes`);

  try {
    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'src', 'index.ts'),
      onProgress: (progress) => {
        console.log(`Bundling: ${Math.round(progress * 100)}%`);
      },
    });

    console.log('Bundle complete:', bundleLocation);

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MainVideo',
      inputProps: { scenes },
    });

    console.log('Composition selected:', composition.id);

    // Create temp output path
    const outputDir = path.join(os.tmpdir(), 'remotion-renders');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `${projectId}-${Date.now()}.mp4`);

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { scenes },
      onProgress: ({ progress }) => {
        console.log(`Rendering: ${Math.round(progress * 100)}%`);
      },
    });

    console.log('Render complete:', outputPath);

    // Read the file and send as base64 or upload to storage
    const videoBuffer = fs.readFileSync(outputPath);
    const base64Video = videoBuffer.toString('base64');

    // Clean up
    fs.unlinkSync(outputPath);

    res.json({
      success: true,
      videoUrl: `data:video/mp4;base64,${base64Video}`,
      message: 'Video rendered successfully',
    });

  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      error: `Render failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Remotion render server running on port ${PORT}`);
});
