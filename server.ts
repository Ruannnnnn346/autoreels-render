import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

// Manual CORS headers instead of cors package
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', compositions: ['MainVideo'] });
});

app.post('/render', async (req, res) => {
  try {
    const { scenes } = req.body;

    console.log('Received render request with scenes:', JSON.stringify(scenes, null, 2));

    const bundleLocation = await bundle({
      entryPoint: path.resolve('./src/index.ts'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MainVideo',
      inputProps: { scenes },
    });

    const outputLocation = `out/${Date.now()}.mp4`;

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: { scenes },
    });

    // Read the file and convert to base64 or return URL
    const videoBuffer = fs.readFileSync(outputLocation);
    const base64Video = videoBuffer.toString('base64');

    // Clean up the file
    fs.unlinkSync(outputLocation);

    res.json({
      success: true,
      videoUrl: `data:video/mp4;base64,${base64Video}`,
    });
  } catch (error) {
    console.error('Render error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Render failed: ${errorMessage}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Remotion render server running on port ${PORT}`);
});
// Após renderizar o vídeo com sucesso, adicione isso:
if (webhookUrl && webhookSecret) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret
      },
      body: JSON.stringify({
        projectId,
        videoUrl: outputUrl, // URL do vídeo gerado
        status: 'completed'
      })
    });
    console.log('Webhook called successfully');
  } catch (webhookError) {
    console.error('Failed to call webhook:', webhookError);
  }
}

// Em caso de erro na renderização:
if (webhookUrl && webhookSecret) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': webhookSecret
    },
    body: JSON.stringify({
      projectId,
      status: 'failed',
      error: errorMessage
    })
  });
}
