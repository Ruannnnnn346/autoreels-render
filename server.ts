import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
  try {
    const { scenes } = req.body;

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

    res.json({ success: true, videoUrl: outputLocation });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Remotion server listening on port ${port}`);
});
