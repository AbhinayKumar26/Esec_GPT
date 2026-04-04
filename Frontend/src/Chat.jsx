// import "./chat.css";
// import { useContext, useState, useEffect } from "react";
// import { MyContext } from "./MyContext.jsx";
// import ReactMarkdown from "react-markdown";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";

// function Chat() {
//   const { newChat, prevChats } = useContext(MyContext);
//   const [latestReply, setLatestReply] = useState(null);

 
//   useEffect(() => {
//     if (!Array.isArray(prevChats) || prevChats.length === 0) return;

//     const lastChat = prevChats[prevChats.length - 1];

//     if (!lastChat || lastChat.role !== "assistant" || !lastChat.content) return;

//     const words = lastChat.content.split(" ");
//     let index = 0;

//     setLatestReply("");

//     const interval = setInterval(() => {
//       setLatestReply(words.slice(0, index + 1).join(" "));
//       index++;

//       if (index >= words.length) clearInterval(interval);
//     }, 40);

//     return () => clearInterval(interval);
//   }, [prevChats]);


//   useEffect(() => {
//     if (newChat) {
//       setLatestReply(null);
//     }
//   }, [newChat]);

//   return (
//     <>
//       {newChat && (
//         <div className="newChatTitle">
//           <h1>Start a New Chat</h1>
//         </div>
//       )}

//       <div className="chats">
//         {Array.isArray(prevChats) &&
//           prevChats.map((chat, idx) => (
//             <div
//               key={idx}
//               className={chat.role === "user" ? "userDiv" : "gptDiv"}
//             >
//               {chat.role === "user" ? (
//                 <p className="userMessage">{chat.content}</p>
//               ) : (
//                 <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
//                   {chat.content}
//                 </ReactMarkdown>
//               )}
//             </div>
//           ))}

//         {latestReply && (
//           <div className="gptDiv">
//             <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
//               {latestReply}
//             </ReactMarkdown>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// export default Chat;














import "./chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState("");

  useEffect(() => {
    if (!Array.isArray(prevChats) || prevChats.length === 0) return;

    const lastChat = prevChats[prevChats.length - 1];

    if (!lastChat || lastChat.role !== "assistant") return;

    const words = lastChat.content.split(" ");
    let index = 0;

    setLatestReply("");

    const interval = setInterval(() => {
      setLatestReply(words.slice(0, index + 1).join(" "));
      index++;

      if (index >= words.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats]);

  useEffect(() => {
    if (newChat) setLatestReply("");
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
      </div>
    </>
  );
}

export default Chat;