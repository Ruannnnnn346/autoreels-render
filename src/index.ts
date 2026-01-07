import express from "express";
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const app = express();
app.use(express.json({ limit: "20mb" }));

const publicDir = path.join(process.cwd(), "public");
const rendersDir = path.join(publicDir, "renders");
fs.mkdirSync(rendersDir, { recursive: true });
app.use("/renders", express.static(rendersDir));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "autoreels-render", message: "online" });
});

app.post("/render", async (req, res) => {
  try {
    const timeline = req.body?.timeline;
    if (!timeline?.scenes || !Array.isArray(timeline.scenes)) {
      return res.status(400).json({
        ok: false,
        error: "missing_scenes",
        message: "Envie { timeline: { scenes: [...] } }",
      });
    }

    const cwd = process.cwd();

    // ✅ entryPoint FIXO (o correto pro seu repo)
    const entryPoint = path.join(cwd, "src", "index.ts");

    // Debug forte pra parar de adivinhar
    const srcDir = path.join(cwd, "src");
    const srcFiles = fs.existsSync(srcDir) ? fs.readdirSync(srcDir) : [];
    console.log("[DEBUG] cwd:", cwd);
    console.log("[DEBUG] entryPoint:", entryPoint, "exists?", fs.existsSync(entryPoint));
    console.log("[DEBUG] srcDir exists?", fs.existsSync(srcDir), "files:", srcFiles);

    if (!fs.existsSync(entryPoint)) {
      return res.status(500).json({
        ok: false,
        error: "entrypoint_not_found",
        message: "Não achei src/index.ts no servidor.",
        cwd,
        entryPoint,
        srcFiles,
      });
    }

    const serveUrl = await bundle({ entryPoint });

    const composition = await selectComposition({
      serveUrl,
      id: "AutoReels",
      inputProps: { scenes: timeline.scenes },
    });

    const fps = 30;
    const totalFrames = timeline.scenes.reduce((acc: number, s: any) => {
      const d = Math.max(1, Math.round(Number(s.duration_s || 2) * fps));
      return acc + d;
    }, 0);

    const outName = `render_${Date.now()}.mp4`;
    const outPath = path.join(rendersDir, outName);

    await renderMedia({
      composition: { ...composition, durationInFrames: totalFrames },
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps: { scenes: timeline.scenes },
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const videoUrl = `${baseUrl}/renders/${outName}`;

    return res.json({
      ok: true,
      videoUrl,
      export_url: videoUrl,
      duration_s: totalFrames / fps,
    });
  } catch (err: any) {
    console.error("[ERROR]", err);
    return res.status(500).json({
      ok: false,
      error: "render_failed",
      message: err?.message ?? "Erro desconhecido",
    });
  }
});

const port = Number(process.env.PORT || 10000);
app.listen(port, () => console.log(`Render server on :${port}`));
