import express from "express";
import path from "path";

export function serveStatic(app: express.Express) {
  const clientPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}
