// import { admin } from "../firebase.js";

// export const requireAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || "";

//     // Expect: "Bearer <token>"
//     const token = authHeader.startsWith("Bearer ")
//       ? authHeader.split("Bearer ")[1]
//       : null;

//     if (!token) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded; // contains uid, email, etc.
//     next();
//   } catch (err) {
//     console.log("Auth middleware error:", err.message);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };



import { admin } from "../firebase.js";

export const requireAuth = async (req, res, next) => {
  console.log("==================================");
  console.log("🔥 requireAuth called");
  console.log("URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("Authorization Header:", req.headers.authorization);
  console.log("==================================");

  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;

    console.log("✅ User:", decoded.email);

    next();
  } catch (err) {
    console.log("❌ Auth Error:", err.message);
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
