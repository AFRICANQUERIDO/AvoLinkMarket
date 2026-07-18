import express from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: express.Express) {
  // 1. Target the true compiled location shown in your build logs
  let clientPath = path.resolve("/opt/render/project/src/dist/public");

  if (!fs.existsSync(clientPath)) {
    // Local fallback relative to your running server directory
    clientPath = path.resolve(__dirname, "../dist/public");
  }

  console.log(`[Express] Serving static frontend files from: ${clientPath}`);

  app.use(express.static(clientPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
}