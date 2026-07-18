


import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "./utils/api.js";
import { useAuth } from "./AuthContext.jsx";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    currThreadId,
    setCurrThreadId,
    setPrevChats,
    setNewChat,
    setSidebarOpen,
    setAllThreads,
    setAnimateReply,
  } = useContext(MyContext);

  const { idToken, logout, me } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currThreadId || !idToken) return;

    let cancelled = false;

    const loadPreviousChats = async () => {
      try {
        const data = await apiFetch(`/api/threads/${currThreadId}`, {
          token: idToken,
        });

        if (cancelled) return;

        setPrevChats(Array.isArray(data) ? data : []);
        setAnimateReply(false);
        setNewChat(false);
      } catch (err) {
        if (cancelled) return;

        if (err.message === "Thread not found") {
          setPrevChats([]);
          setNewChat(true);
          return;
        }

        console.error("Load previous chat error:", err.message);
      }
    };

    loadPreviousChats();

    return () => {
      cancelled = true;
    };
  }, [currThreadId, idToken]);

  const getReply = async () => {
    if (!prompt.trim() || !idToken) return;

    setNewChat(false);
    setSidebarOpen(false);
    setLoading(true);

    const userPrompt = prompt;
    setPrompt("");

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: userPrompt,
    };

    const botMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: "Thinking...",
    };

    // ✅ SAFE ADD
    setPrevChats((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [...safePrev, userMsg, botMsg];
    });

    setTimeout(() => {
      console.log("prevChats after adding:", userMsg, botMsg);
    }, 100);

    let threadId = currThreadId;

    const isNewThread = !threadId;

    if (isNewThread) {
        threadId = uuidv1();
    }

    try {

      setAnimateReply(true);
      // Send message to backend
      const res = await apiFetch("/api/chat", {
        method: "POST",
        token: idToken,
        body: JSON.stringify({
          message: userPrompt,
          threadId,
        }),
      });


      if (isNewThread) {
        setCurrThreadId(threadId);
      }




      const threads = await apiFetch("/api/threads", {
        token: idToken,
      });

      setAllThreads(
        threads.map((t) => ({
          threadId: t.threadId,
          title: t.title,
        }))
      );


      // Add new thread to sidebar only if it doesn't already exist
      setAllThreads((prev) => {
        const exists = prev.some((t) => t.threadId === res.thread.threadId);

        if (exists) return prev;

        return [
          {
            threadId: res.thread.threadId,
            title: res.thread.title,
          },
          ...prev,
        ];
      });



      // Replace "Thinking..." with AI reply
      setPrevChats((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];

        return safePrev.map((msg) =>
          msg.id === botMsg.id
            ? { ...msg, content: res.reply }
            : msg
        );
      });

    } catch (err) {
      console.error("Chat error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span className="menuIcon" onClick={() => setSidebarOpen((p) => !p)}>☰</span>

        <span>
          {me?.name || me?.email || "EsecGPT"} <i className="fa fa-angle-down" />
        </span>

        <div className="userIconDiv" onClick={() => setIsOpen(!isOpen)}>
          <span className="userIcon">
            <i className="fa fa-user" />
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">Upgrade plan</div>
          <div className="dropDownItem">Settings</div>
          <div
            className="dropDownItem"
            onClick={async () => {
              await logout();
              nav("/login");
            }}
          >
            Log out
          </div>
        </div>
      )}

      <div className="chatArea">
        <Chat />
        {loading && (
          <div className="loaderWrapper">
            <ScaleLoader color="#fff" />
          </div>
        )}
      </div>

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />
          <div id="submit" onClick={getReply}>
            ➤
          </div>
        </div>

        <p className="info">EsecGPT can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}

export default ChatWindow;