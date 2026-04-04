// import "./ChatWindow.css";
// import Chat from "./Chat.jsx";
// import { MyContext } from "./MyContext.jsx";
// import { useContext, useState, useEffect } from "react";
// import { v1 as uuidv1 } from "uuid";
// import { ScaleLoader } from "react-spinners";
// import { useNavigate } from "react-router-dom";

// import { apiFetch } from "./utils/api.js";
// import { useAuth } from "./AuthContext.jsx";

// function ChatWindow() {
//   const {
//     prompt,
//     setPrompt,
//     currThreadId,
//     setCurrThreadId,
//     setPrevChats,
//     setNewChat,
//     setSidebarOpen,
//   } = useContext(MyContext);

//   const { idToken, logout, me } = useAuth();
//   const nav = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     if (!currThreadId || !idToken) return;

//     const loadPreviousChats = async () => {
//       try {
//         const data = await apiFetch(`/api/threads/${currThreadId}`, { token: idToken });
//         setPrevChats(Array.isArray(data) ? data : []);
//         setNewChat(false);
//       } catch (err) {
//         console.log("Load previous chat error:", err.message);
//       }
//     };

//     loadPreviousChats();
//   }, [currThreadId, idToken, setPrevChats, setNewChat]);

//   const getReply = async () => {
//     if (!prompt.trim() || !idToken) return;

//     setNewChat(false);
//     setSidebarOpen(false);
//     setLoading(true);

//     const userPrompt = prompt;
//     setPrompt("");

//     setPrevChats((prev) => [
//       ...(Array.isArray(prev) ? prev : []),
//       { role: "user", content: userPrompt },
//     ]);

//     let threadId = currThreadId;
//     if (!threadId) {
//       threadId = uuidv1();
//       setCurrThreadId(threadId);
//     }

//     try {
//       const res = await apiFetch("/api/chat", {
//         method: "POST",
//         token: idToken,
//         body: JSON.stringify({ message: userPrompt, threadId }),
//       });

//       setPrevChats((prev) => [
//         ...(Array.isArray(prev) ? prev : []),
//         { role: "assistant", content: res.reply },
//       ]);
//     } catch (err) {
//       console.error("Chat error:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chatWindow">
//       <div className="navbar">
//         <span className="menuIcon" onClick={() => setSidebarOpen((p) => !p)}>☰</span>

//         <span>
//           {me?.name || me?.email || "EsecGPT"} <i className="fa fa-angle-down" />
//         </span>

//         <div className="userIconDiv" onClick={() => setIsOpen(!isOpen)}>
//           <span className="userIcon">
//             <i className="fa fa-user" />
//           </span>
//         </div>
//       </div>

//       {isOpen && (
//         <div className="dropDown">
//           <div className="dropDownItem"><i className="fa fa-cloud-upload" /> Upgrade plan</div>
//           <div className="dropDownItem"><i className="fa fa-cog" /> Settings</div>
//           <div
//             className="dropDownItem"
//             onClick={async () => {
//               await logout();
//               nav("/login");
//             }}
//           >
//             <i className="fa fa-sign-out" /> Log out
//           </div>
//         </div>
//       )}

//       <div className="chatArea">
//         <Chat />
//         {loading && (
//           <div className="loaderWrapper">
//             <ScaleLoader color="#fff" />
//           </div>
//         )}
//       </div>

//       <div className="chatInput">
//         <div className="inputBox">
//           <input
//             placeholder="Ask anything"
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && getReply()}
//           />
//           <div id="submit" onClick={getReply}>
//             <i className="fa fa-paper-plane" />
//           </div>
//         </div>

//         <p className="info">EsecGPT can make mistakes. Check important info.</p>
//       </div>
//     </div>
//   );
// }

// export default ChatWindow;



















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
  } = useContext(MyContext);

  const { idToken, logout, me } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currThreadId || !idToken) return;

    const loadPreviousChats = async () => {
      try {
        const data = await apiFetch(`/api/threads/${currThreadId}`, { token: idToken });
        setPrevChats(Array.isArray(data) ? data : []);
        setNewChat(false);
      } catch (err) {
        console.log("Load previous chat error:", err.message);
      }
    };

    loadPreviousChats();
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

    let threadId = currThreadId;
    if (!threadId) {
      threadId = uuidv1();
      setCurrThreadId(threadId);
    }

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        token: idToken,
        body: JSON.stringify({ message: userPrompt, threadId }),
      });

      // ✅ SAFE REPLACE
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