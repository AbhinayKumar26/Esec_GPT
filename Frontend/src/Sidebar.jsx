import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { useAuth } from "./AuthContext.jsx";
import { apiFetch } from "./utils/api";

// ✅ Vite image import (important)
import logo from "./assets/blacklogo.png";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
    sidebarOpen,
    setSidebarOpen,
  } = useContext(MyContext);

  const { idToken } = useAuth();

  const getAllThreads = async () => {
    try {


      const cached = localStorage.getItem("threads_cache");
      if (cached) {
        try {
          setAllThreads(JSON.parse(cached));
        } catch {}
      }

      // ✅ secure call using apiFetch + token
      const res = await apiFetch("/api/threads", { token: idToken });

      const filteredData = (Array.isArray(res) ? res : []).map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);

      localStorage.setItem("threads_cache", JSON.stringify(filteredData));
      setAllThreads(filteredData);

    } catch (err) {
      console.log("getAllThreads error:", err);
    }
  };

  useEffect(() => {
    
    if (!idToken) return;
    getAllThreads();
  }, [idToken]);

  const creatNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);

    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setSidebarOpen(false);
  };

  const deleteThread = async (threadId) => {
    try {
      await apiFetch(`/api/threads/${threadId}`, {
        method: "DELETE",
        token: idToken,
      });

      setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));

      if (threadId === currThreadId) {
        creatNewChat();
      }
    } catch (err) {
      console.log("deleteThread error:", err);
    }
  };

  return (
    <section className={`sidebar ${sidebarOpen ? "show" : ""}`}>
      <button onClick={creatNewChat}>
        <img src={logo} alt="gptLogo" className="logo" />
        <span>
          <i className="fa fa-pencil-square" aria-hidden="true"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads?.map((thread) => (
          <li
            key={thread.threadId}
            onClick={() => {
              setCurrThreadId(thread.threadId);
              setNewChat(false);
              setPrevChats([]);
              setSidebarOpen(false);
            }}
            className={thread.threadId === currThreadId ? "highlighted" : ""}
          >
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {thread.title}
            </span>

            <i
              className="fa fa-trash"
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>BY ESEC ♥</p>
      </div>
    </section>
  );
}

export default Sidebar;
