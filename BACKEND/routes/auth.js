console.log("🔥 auth.js loaded");

import express from "express";
import axios from "axios";
import { admin, db } from "../firebase.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import sendOTPEmail from "../utils/mailer.js";


const router = express.Router();


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


router.post("/forgot-password", async (req, res) => {
  console.log("========== FORGOT PASSWORD ==========");

  try {
    const { email } = req.body;
    console.log("Email:", email);

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    console.log("1. Checking user...");
    const user = await admin.auth().getUserByEmail(email);
    console.log("✔ User Found:", user.email);

    const otp = generateOTP();
    console.log("2. OTP:", otp);

    console.log("3. Saving OTP...");
    await db.collection("password_otps").doc(email).set({
      otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✔ OTP Saved");

    console.log("4. Sending Email...");
    await sendOTPEmail(email, otp);
    console.log("✔ Email Sent");

    console.log("========== SUCCESS ==========");

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.log("========== ERROR ==========");
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const otpDoc = await db.collection("password_otps").doc(email).get();

    if (!otpDoc.exists) {
      return res.status(404).json({
        error: "OTP not found",
      });
    }

    const data = otpDoc.data();

    if (data.otp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });

  }catch (err) {
      console.log("============= FORGOT PASSWORD ERROR =============");
      console.log(err);
      console.log("Message:", err.message);
      console.log("Code:", err.code);

      return res.status(500).json({
        error: err.message,
      });
    }
});



router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await admin.auth().getUserByEmail(email);

    // Update password
    await admin.auth().updateUser(user.uid, {
      password,
    });

    // Delete OTP after successful reset
    await db.collection("password_otps").doc(email).delete();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to reset password",
    });
  }
});






// =====================================================
// ✅ REGISTER (Create Firebase Auth user + save profile)
// POST /api/auth/register
// body: { name, email, password }
// =====================================================
router.post("/register", async (req, res) => {
  try {
    const { name = "", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save extra profile in Firestore (optional but recommended)
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: name || "",
      email: userRecord.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      name: name || "",
    });
  } catch (err) {
    console.log("Register error:", err.message);

    // Common Firebase errors
    if (err.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Registration failed" });
  }
});

// =====================================================
// ✅ LOGIN (Email/Password) using Firebase REST API
// POST /api/auth/login
// body: { email, password }
// returns: idToken, refreshToken
// =====================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing FIREBASE_WEB_API_KEY in .env" });
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    // Firebase returns idToken + refreshToken
    const { idToken, refreshToken, localId } = response.data;

    return res.json({
      message: "Login successful",
      uid: localId,
      idToken,
      refreshToken,
    });
  } catch (err) {
    console.log("Login error:", err.response?.data || err.message);

    const msg = err.response?.data?.error?.message;

    if (msg === "EMAIL_NOT_FOUND") return res.status(404).json({ error: "User not found" });
    if (msg === "INVALID_PASSWORD") return res.status(401).json({ error: "Wrong password" });
    if (msg === "USER_DISABLED") return res.status(403).json({ error: "User disabled" });

    return res.status(500).json({ error: "Login failed" });
  }
});

// =====================================================
// ✅ GET CURRENT USER (Protected)
// GET /api/auth/me
// Header: Authorization: Bearer <idToken>
// =====================================================
router.get("/me", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const doc = await db.collection("users").doc(uid).get();
    const profile = doc.exists ? doc.data() : null;

    return res.json({
      uid,
      email: req.user.email || "",
      profile,
    });
  } catch (err) {
    console.log("Me error:", err.message);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// =====================================================
// ✅ LOGOUT (Token revoke)
// POST /api/auth/logout
// Header: Authorization: Bearer <idToken>
// =====================================================
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    // revoke refresh tokens (forces re-login on next refresh)
    await admin.auth().revokeRefreshTokens(uid);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.log("Logout error:", err.message);
    return res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
