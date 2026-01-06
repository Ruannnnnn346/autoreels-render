import express from "express";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "autoreels-render", message: "online" });
});

app.post("/render", (req, res) => {
  const timeline = req.body?.timeline ?? null;
  res.json({
    ok: true,
    received: !!timeline,
    hint: "Servidor online. Próximo passo: integrar Remotion."
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
