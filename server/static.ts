import express from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: express.Express) {
  // 1. Check Render's absolute deployment path first, fallback to relative locally
  let clientPath = path.resolve("/opt/render/project/src/client/dist");

  if (!fs.existsSync(clientPath)) {
    clientPath = path.resolve(__dirname, "../client/dist");
  }

  console.log(`[Express] Serving static frontend files from: ${clientPath}`);

  app.use(express.static(clientPath));

  app.get("*", (req, res, next) => {
    // 2. Prevent API routes from accidentally getting served index.html if they 404
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    res.sendFile(path.join(clientPath, "index.html"));
  });
}