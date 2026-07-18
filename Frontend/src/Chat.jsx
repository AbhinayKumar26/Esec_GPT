

import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const {
    newChat,
    prevChats,
    animateReply,
    setAnimateReply,
  } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!animateReply) {
      setLatestReply("");
      return;
    }

    if (!Array.isArray(prevChats) || prevChats.length === 0) return;

    const lastChat = prevChats[prevChats.length - 1];

    if (!lastChat || lastChat.role !== "assistant") return;

    const words = lastChat.content.split(" ");
    let index = 0;

    setLatestReply("");

    const interval = setInterval(() => {
      setLatestReply(words.slice(0, index + 1).join(" "));
      index++;

      if (index >= words.length) {
        clearInterval(interval);
        setAnimateReply(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats, animateReply]);

  useEffect(() => {
    if (newChat) setLatestReply("");
  }, [newChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [prevChats, latestReply]);

  return (
    <>
      {newChat && (
        <div className="newChatTitle">
          <h1>Start a New Chat</h1>
        </div>
      )}

      <div className="chats">
        {Array.isArray(prevChats) &&
          prevChats.map((chat, idx) => {
            const isLast = idx === prevChats.length - 1;

            return (
              <div
                key={chat.id || idx}
                className={chat.role === "user" ? "userDiv" : "gptDiv"}
              >
                {chat.role === "user" ? (
                  <p className="userMessage">{chat.content}</p>
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {isLast && latestReply ? latestReply : chat.content}
                  </ReactMarkdown>
                )}
              </div>
            );
          })}
          <div ref={bottomRef}></div>
      </div>

    </>
  );
}

export default Chat;