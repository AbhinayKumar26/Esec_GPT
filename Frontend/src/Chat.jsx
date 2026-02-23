import "./chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  // ✅ Typing effect ONLY for assistant reply
  useEffect(() => {
    if (!Array.isArray(prevChats) || prevChats.length === 0) return;

    const lastChat = prevChats[prevChats.length - 1];

    if (!lastChat || lastChat.role !== "assistant" || !lastChat.content) return;

    const words = lastChat.content.split(" ");
    let index = 0;

    setLatestReply(""); // reset before typing

    const interval = setInterval(() => {
      setLatestReply(words.slice(0, index + 1).join(" "));
      index++;

      if (index >= words.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats]);

  // ✅ Reset typing when starting new chat
  useEffect(() => {
    if (newChat) {
      setLatestReply(null);
    }
  }, [newChat]);

  return (
    <>
      {newChat && (
        <div className="newChatTitle">
          <h1>Start a New Chat</h1>
        </div>
      )}

      <div className="chats">
        {Array.isArray(prevChats) &&
          prevChats.map((chat, idx) => (
            <div
              key={idx}
              className={chat.role === "user" ? "userDiv" : "gptDiv"}
            >
              {chat.role === "user" ? (
                <p className="userMessage">{chat.content}</p>
              ) : (
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {chat.content}
                </ReactMarkdown>
              )}
            </div>
          ))}

        {latestReply && (
          <div className="gptDiv">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {latestReply}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
