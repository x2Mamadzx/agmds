import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ─── Trust proxy (Replit sits behind a reverse proxy) ────────────────────────
app.set("trust proxy", 1);

// ─── HTTP security headers (helmet) ─────────────────────────────────────────
// Prevents clickjacking, XSS injection, MIME sniffing, enforces HTTPS, etc.
app.use(
  helmet({
    contentSecurityPolicy: false, // frontend served separately; API is JSON-only
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// ─── CORS — only allow requests from your own domain ────────────────────────
const ALLOWED_ORIGINS = [
  "https://agmds.com",
  "https://agence-e-site.replit.app",
  // Dev preview domains
  /^https:\/\/[a-zA-Z0-9-]+\.replit\.dev$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no origin header)
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin),
      );
      // Pass false (not an error) — cors library silently drops the header,
      // browser blocks the request; no 500 leak.
      callback(null, allowed);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Admin-Password"],
    credentials: false,
  }),
);

// ─── Global rate limiter — anti-flood / anti-DDoS ───────────────────────────
// 300 requests per 15 minutes per IP across all endpoints
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => req.path === "/api/healthz",
  }),
);

// ─── Request body size limits — prevents payload flooding ───────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ─── Request logging ─────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Global error handler — never leak stack traces ─────────────────────────
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  // Payload too large (body > 16kb)
  if (err.type === "entity.too.large" || err.status === 413) {
    res.status(413).json({ error: "Requête trop volumineuse." });
    return;
  }
  // CORS rejection
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  logger.error(err, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
