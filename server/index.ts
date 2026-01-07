import express from "express";
import cors from "cors";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos de vídeo gerados
app.use("/videos", express.static(path.join(process.cwd(), "out")));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/render", async (req, res) => {
  try {
    const { projectId, timeline } = req.body;

    if (!projectId || !timeline?.scenes) {
      return res.status(400).json({ error: "projectId and timeline.scenes are required" });
    }

    console.log(`Starting render for project: ${projectId}`);
    console.log(`Scenes count: ${timeline.scenes.length}`);

    // IMPORTANTE: O caminho deve ser src/index.ts (NÃO src/src/index.ts)
    const entryPoint = path.join(process.cwd(), "src", "index.ts");
    
    console.log(`Entry point: ${entryPoint}`);
    console.log(`Entry point exists: ${fs.existsSync(entryPoint)}`);

    // Criar bundle do Remotion
    const bundleLocation = await bundle({
      entryPoint,
      onProgress: (progress) => {
        console.log(`Bundling: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`Bundle created at: ${bundleLocation}`);

    // Dados para a composição
    const inputProps = {
      scenes: timeline.scenes,
    };

    // Selecionar composição
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "VideoScene",
      inputProps,
    });

    // Criar pasta de saída
    const outDir = path.join(process.cwd(), "out");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outputPath = path.join(outDir, `${projectId}.mp4`);

    // Renderizar vídeo
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      onProgress: ({ progress }) => {
        console.log(`Rendering: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`Video rendered successfully: ${outputPath}`);

    // Retornar URL do vídeo
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
    const videoUrl = `${baseUrl}/videos/${projectId}.mp4`;

    res.json({
      success: true,
      videoUrl,
      duration: composition.durationInFrames / composition.fps,
    });

  } catch (error: any) {
    console.error("Render error:", error);
    res.status(500).json({ 
      error: error.message || "Unknown error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Remotion server running on port ${PORT}`);
});
