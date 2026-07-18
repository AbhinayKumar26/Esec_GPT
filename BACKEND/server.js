console.log("🔥 RUNNING server.js");


import express from "express";
import cors from "cors";
import "dotenv/config";

import chatRoutes from "./routes/chat.js";

import authRoutes from "./routes/auth.js";


const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "https://esec-gpt-2.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// Routes
app.use("/api", (req, res, next) => {
  console.log("👉 API ROUTE:", req.method, req.originalUrl);
  next();
}, chatRoutes);

app.use("/api/auth", (req, res, next) => {
  console.log("👉 AUTH ROUTE:", req.method, req.originalUrl);
  next();
}, authRoutes);  

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
