const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const buzzRoutes = require("./routes/buzzes");
const adminRoutes = require("./routes/admin");
const usersRoutes = require("./routes/users");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const USE_MOCK = process.env.USE_MOCK !== "false";

// NOTE: Mock data generation and buzz fetching moved to routes/buzzes.js
// This keeps the routing logic centralized

app.get("/api/health", (req, res) =>
  res.json({
    status: "Rumour Backend is alive.",
    dataSource: USE_MOCK ? "mock" : "firestore",
    useMock: USE_MOCK,
  }),
);

app.use("/api/buzzes", buzzRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);

app.get("/", (req, res) => {
  res.send(
    '<h2>Rumour Backend</h2><p>API server running. Use <a href="/api/health">/api/health</a> or the frontend at port 3000.</p>',
  );
});

// Error handling middleware BEFORE app.listen()
app.use((err, req, res, next) => {
  console.error("[RUMOUR] Unhandled error:", err?.stack || err);
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || "Server error" });
});

// Seed demo data when running in mock mode
if (USE_MOCK) {
  try {
    const { seedDemoBuzzes } = require("./services/buzzService");
    seedDemoBuzzes();
    console.log("[RUMOUR] Demo buzzes seeded for mock mode");
  } catch (err) {
    console.warn("[RUMOUR] Failed to seed demo buzzes:", err.message || err);
  }
}

// Start server LAST
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(
    `📡 [RUMOUR ENGINE] Transmitting on ${HOST}:${PORT} (USE_MOCK=${USE_MOCK})`,
  );
});
