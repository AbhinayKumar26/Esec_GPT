import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("❌ Missing Firebase env vars. Check .env");
}

// ✅ very important for Windows .env
privateKey = privateKey.replace(/\\n/g, "\n");

// ✅ initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// ✅ Force REST instead of gRPC (fixes TLS socket issues)
const db = admin.firestore();
db.settings({ preferRest: true });

export { admin, db };
