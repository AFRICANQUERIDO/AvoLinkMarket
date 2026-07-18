import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session"; // 🚀 Imported session manager
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();

// 🔒 Configure & Activate Session Storage Middleware
// This intercepts requests and assigns secure, tracking cookies automatically
app.use(
  session({
    secret: process.env.SESSION_SECRET || "avolink-global-fallback-secret-key-123!",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevents client-side scripts from reading the cookie header
      secure: process.env.NODE_ENV === "production", // Forces HTTPS when deployed live
      maxAge: 24 * 60 * 60 * 1000, // Valid for exactly 24 hours
    },
  })
);

// Unified Body Parsers with 5MB Limits + rawBody verification mapping
app.use(express.json({ 
  limit: '5mb',
  verify: (req, _res, buf) => { (req as any).rawBody = buf; }
}));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// 📜 Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      console.log(`[Express] ${logLine}`);
    }
  });

  next();
});

// Register routes
(async () => {
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`[Express] Server running on port ${port}`);
});
})();