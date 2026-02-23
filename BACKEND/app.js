// import authRoutes from "./routes/auth.js";


// app.use("/api/auth", authRoutes);


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import chatRoutes from "./routes/chat.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Backend running (Firebase)");
});

app.use("/api", chatRoutes);

export default app;

