import { createContext, useState } from "react";

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);

  const [currThreadId, setCurrThreadId] = useState(null);
  const [allThreads, setAllThreads] = useState([]);

  // ✅ ADD THESE (needed by Sidebar/ChatWindow)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <MyContext.Provider
      value={{
        prompt,
        setPrompt,
        reply,
        setReply,
        prevChats,
        setPrevChats,
        newChat,
        setNewChat,
        currThreadId,
        setCurrThreadId,
        allThreads,
        setAllThreads,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
