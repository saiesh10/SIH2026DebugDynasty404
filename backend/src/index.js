import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import minesRouter from "./routes/mines.js";
import complianceRouter from "./routes/compliance.js";
import inspectionsRouter from "./routes/inspections.js";
import correctiveActionsRouter from "./routes/correctiveActions.js";
import riskRouter from "./routes/risk.js";
import dashboardRouter from "./routes/dashboard.js";
import fieldReportsRouter from "./routes/fieldReports.js";
import registryRouter from "./routes/registry.js";
import notificationsRouter from "./routes/notifications.js";
import { startAlertScheduler } from "./jobs/alertScheduler.js";
import { testDatabaseConnection } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.get("/health", async (req, res) => {
  try {
    const databaseReady = await testDatabaseConnection();
    res.status(databaseReady ? 200 : 503).json({
      status: databaseReady ? "ok" : "degraded",
      service: "khanrakshak-backend",
      database: databaseReady ? "connected" : "unavailable",
      message: databaseReady
        ? "Database connection successful."
        : "Database is unavailable. Start PostgreSQL and confirm DATABASE_URL.",
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      service: "khanrakshak-backend",
      database: "unavailable",
      message: "Database is unavailable. Start PostgreSQL and confirm DATABASE_URL.",
      error: error.message,
    });
  }
});

app.use("/api/mines", minesRouter);
app.use("/api/compliance", complianceRouter);
app.use("/api/inspections", inspectionsRouter);
app.use("/api/corrective-actions", correctiveActionsRouter);
app.use("/api/risk", riskRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/field-reports", fieldReportsRouter);
app.use("/api", registryRouter);
app.use("/api/notifications", notificationsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`KhanRakshak backend running on port ${PORT}`);
  startAlertScheduler();
});
