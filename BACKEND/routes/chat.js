import express from "express";
import { admin, db } from "../firebase.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();



// router.use((req, res, next) => {
//   console.log("📌 chat.js middleware");
//   console.log("Base URL:", req.baseUrl);
//   console.log("Path:", req.path);
//   console.log("Original URL:", req.originalUrl);

//   requireAuth(req, res, next);
// });

/**
 * GET /api/threads
 * Return thread list (threadId, title)
 */
router.get("/threads", requireAuth, async (req, res) => {
  console.log("========= THREADS =========");
  console.log("Logged in UID:", req.user.uid);
  try {
    const snap = await db
      .collection("threads")
      .where("uid", "==", req.user.uid)
      .orderBy("updatedAt", "desc")
      .select("threadId", "title", "updatedAt")
      .get();

    const threads = snap.docs.map((doc) => doc.data());
    res.json(threads);
  } catch (err) {
    console.error("🔥 threads error:", err);
    res.status(500).json({ error: "Fail to fetch threads" });
  }
});

/**
 * GET /api/threads/:threadId
 * Return messages array
 */
router.get("/threads/:threadId", requireAuth, async (req, res) => {
  const { threadId } = req.params;
  console.log("========= GET THREAD =========");
  console.log("Logged in UID:", req.user.uid);

  try {
    const threadRef = db.collection("threads").doc(threadId);
    const threadDoc = await threadRef.get();

    console.log("Requested Thread:", threadId);
    console.log("Exists:", threadDoc.exists);

    if (threadDoc.exists) {
      console.log("Firestore Data:", threadDoc.data());
    }

    if (!threadDoc.exists) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const msgSnap = await threadRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = msgSnap.docs.map((d) => {
      const m = d.data();
      return { role: m.role, content: m.content };
    });

    res.json(messages);
  } catch (err) {
    console.error("🔥 get thread error:", err);
    res.status(500).json({ error: "Fail to fetch chat" });
  }
});

/**
 * POST /api/chat
 * Adds user message + assistant reply
 */
router.post("/chat", requireAuth, async (req, res) => {
  console.log("========== CHAT ==========");
  console.log("Logged in UID:", req.user.uid);
  const { threadId, message } = req.body;

  if (!threadId || !message) {
      return res.status(400).json({ error: "missing required fields" });
    }

    try {
      const threadRef = db.collection("threads").doc(threadId);
      const threadDoc = await threadRef.get();

      if (!threadDoc.exists) {
        // First message -> create thread
        await threadRef.set({
          threadId,
          uid: req.user.uid,
          title: message,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Existing thread -> verify owner
        if (threadDoc.data().uid !== req.user.uid) {
          return res.status(403).json({ error: "Access denied" });
        }

        await threadRef.update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }


    await threadRef.collection("messages").add({
      role: "user",
      content: message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });



    const assistantReply = await getOpenAIAPIResponse(message);

        console.log("User message saved:", message);
        console.log("Assistant message saved:", assistantReply);

    await threadRef.collection("messages").add({
      role: "assistant",
      content: assistantReply,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await threadRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      reply: assistantReply,
      thread: {
        threadId,
        title: threadDoc.exists ? threadDoc.data().title : message,
      },
    });
  } catch (err) {
    console.error("🔥 chat error:", err);
    res.status(500).json({ error: "something went wrong" });
  }
});

/**
 * DELETE /api/threads/:threadId
 */
router.delete("/threads/:threadId", requireAuth, async (req, res) => {
  const { threadId } = req.params;

  try {
    const threadRef = db.collection("threads").doc(threadId);
    const threadDoc = await threadRef.get();

    if (!threadDoc.exists) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // delete messages (batch)
    const msgRef = threadRef.collection("messages");
    const msgSnap = await msgRef.get();

    const batch = db.batch();
    msgSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await threadRef.delete();

    res.json({ message: "Thread deleted successfully" });
  } catch (err) {
    console.error("🔥 delete error:", err);
    res.status(500).json({ error: "Fail to delete thread" });
  }
});

export default router;
