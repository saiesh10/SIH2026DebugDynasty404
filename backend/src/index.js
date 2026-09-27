import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import minesRouter from "./routes/mines.js";
import complianceRouter from "./routes/compliance.js";
import inspectionsRouter from "./routes/inspections.js";
import correctiveActionsRouter from "./routes/correctiveActions.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "khanrakshak-backend",
  });
});

app.use("/api/mines", minesRouter);
app.use("/api/compliance", complianceRouter);
app.use("/api/inspections", inspectionsRouter);
app.use("/api/corrective-actions", correctiveActionsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`KhanRakshak backend running on port ${PORT}`);
});
