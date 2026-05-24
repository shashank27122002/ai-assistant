import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("chat");

  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // FETCH CHAT HISTORY
  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/history`
      );

      setHistory(response.data.chats);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setChat((prev) => [...prev, userMessage]);

    const currentMessage = message;

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: currentMessage,
          conversationId: selectedChat?._id || null,
        }
      );

      const aiMessage = {
        role: "assistant",
        content: response.data.reply,
      };

      setChat((prev) => [...prev, aiMessage]);

      setSelectedChat(response.data.conversation);

      fetchHistory();
    } catch (error) {
      console.log(error);

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    }

    setLoading(false);
  };

  // ANALYZE RESUME
  const analyzeResume = async () => {
    if (!resumeFile) return;

    const formData = new FormData();

    formData.append("resume", resumeFile);

    try {
      setResumeLoading(true);

      const response = await axios.post(
        `${API_URL}/api/resume/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResumeAnalysis(response.data.analysis);
    } catch (error) {
      console.log(error);
    }

    setResumeLoading(false);
  };

  return (
    <div className="h-screen bg-black text-white flex">

      {/* SIDEBAR */}
      <div className="w-80 border-r border-gray-800 p-4 overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            AI Assistant
          </h2>

          <button
            onClick={() => {
              setChat([]);
              setSelectedChat(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm"
          >
            New
          </button>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                setSelectedChat(item);
                setChat(item.messages);
                setActiveTab("chat");
              }}
              className={`p-3 rounded-xl cursor-pointer transition border ${
                selectedChat?._id === item._id
                  ? "bg-blue-600 border-blue-500"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800"
              }`}
            >
              <p className="font-semibold truncate">
                {item.title}
              </p>

              <p className="text-sm text-gray-400 mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAV */}
        <div className="border-b border-gray-800 p-4 flex gap-4">

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-xl ${
              activeTab === "chat"
                ? "bg-blue-600"
                : "bg-gray-900"
            }`}
          >
            Chat
          </button>

          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-2 rounded-xl ${
              activeTab === "resume"
                ? "bg-green-600"
                : "bg-gray-900"
            }`}
          >
            Resume Analyzer
          </button>
        </div>

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {chat.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-500 text-xl">
                  Start a new conversation 🚀
                </div>
              )}

              {chat.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-3xl p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 ml-auto"
                      : "bg-gray-800"
                  }`}
                >
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}

              {loading && (
                <div className="bg-gray-800 p-4 rounded-2xl w-fit">
                  Thinking...
                </div>
              )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-gray-800 flex gap-2">

              <input
                type="text"
                placeholder="Ask anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
              >
                Send
              </button>
            </div>
          </>
        )}

        {/* RESUME TAB */}
        {activeTab === "resume" && (
          <div className="flex-1 overflow-y-auto p-8">

            <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-3xl font-bold mb-8">
                Resume Analyzer
              </h2>

              <div className="flex gap-4 items-center mb-8">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setResumeFile(e.target.files[0])
                  }
                />

                <button
                  onClick={analyzeResume}
                  className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl"
                >
                  Analyze Resume
                </button>

                <button
                  onClick={() => {
                    setResumeFile(null);
                    setResumeAnalysis("");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl"
                >
                  Clear
                </button>
              </div>

              {resumeLoading && (
                <div className="bg-gray-800 p-4 rounded-xl mb-6">
                  Analyzing Resume...
                </div>
              )}

              {resumeAnalysis && (
                <div className="bg-black border border-gray-800 rounded-2xl p-6">
                  <ReactMarkdown>
                    {resumeAnalysis}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;