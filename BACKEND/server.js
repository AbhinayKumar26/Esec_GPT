


import express from "express";
import cors from "cors";
import "dotenv/config";

import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Middlewares
// app.use(cors());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.json({ limit: "1mb" }));


// Health check (to test server is ON)
// app.get("/health", (req, res) => {
//   res.json({ ok: true, message: "Server is running ✅" });
// });

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// app.get("/api/chat", (req, res) => {
//   res.send("GET Chat working");
// });

// app.post("/api/chat", (req, res) => {
//   res.send("Chat API working");
// });



// Routes
app.use("/api", chatRoutes);         // if chat.js uses /chat inside
app.use("/api/auth", authRoutes);    // /api/auth/register etc

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
