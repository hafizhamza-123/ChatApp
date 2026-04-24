import express from "express";
import cors from "cors";
import centralRoutes from "./routes/index.route.js";

const getAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(",").map((origin) => origin.trim()))
    .filter(Boolean);

  return configuredOrigins.length > 0
    ? configuredOrigins
    : ["http://localhost:5173"];
};

const createApp = () => {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests and localhost tooling.
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "API is healthy" });
  });

  app.use("/api", centralRoutes);

  return app;
};

export default createApp;
