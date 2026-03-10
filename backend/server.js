import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Root – so visiting http://localhost:5000/ shows API is up
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Jumpstart API is running",
    endpoints: {
      health: "GET /api/health",
      register: "POST /api/v1/user/auth/register",
      login: "POST /api/v1/user/auth/login",
      socialLogin: "POST /api/v1/user/auth/social-login",
      init: "GET /api/v1/user/init (Bearer token required)",
    },
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Jumpstart API running" });
});

// Mount routes under /api/v1/user
app.use("/api/v1/user/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, msg: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, msg: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
