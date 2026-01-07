import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

// Manual CORS headers
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
  // 1. Extrair TODOS os parâmetros do body
  const { scenes, projectId, webhookUrl, webhookSecret } = req.body;

  console.log('Received render request for project:', projectId);
  console.log('Scenes:', JSON.stringify(scenes, null, 2));
  console.log('Webhook URL:', webhookUrl);

  // 2. Responder IMEDIATAMENTE (não bloquear)
  res.json({ 
    success: true, 
    message: 'Rendering started',
    projectId 
  });

  // 3. Renderizar em background
  try {
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

    console.log('Render completed successfully');

    // 4. Ler vídeo e converter para base64
    const videoBuffer = fs.readFileSync(outputLocation);
    const base64Video = videoBuffer.toString('base64');
    const videoUrl = `data:video/mp4;base64,${base64Video}`;

    // 5. Limpar arquivo
    fs.unlinkSync(outputLocation);

    // 6. CHAMAR WEBHOOK COM SUCESSO
    if (webhookUrl && webhookSecret) {
      try {
        console.log('Calling webhook with success...');
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': webhookSecret
          },
          body: JSON.stringify({
            projectId,
            videoUrl,
            status: 'completed'
          })
        });
        console.log('Webhook called successfully!');
      } catch (webhookError) {
        console.error('Failed to call webhook:', webhookError);
      }
    }

  } catch (error) {
    console.error('Render error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // 7. CHAMAR WEBHOOK COM ERRO
    if (webhookUrl && webhookSecret) {
      try {
        console.log('Calling webhook with error...');
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
        console.log('Error webhook called');
      } catch (webhookError) {
        console.error('Failed to call error webhook:', webhookError);
      }
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Remotion render server running on port ${PORT}`);
});
