import { useEffect, useRef, useState } from "react";
import { FiSend, FiLogOut, FiPaperclip, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Chat({ socket, user, connected }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("join_chat", {
      username: user.username,
      userId: user.id,
    });
  }, [socket, user]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get("/chats");
        setChats(res.data.data);
      } catch (err) {
        console.error("Fetch chats error:", err);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!showGroupModal) return;

    const fetchUsers = async () => {
      try {
        const res = await API.get("/users/all");
        setAllUsers(res.data.data.filter(u => u.id !== user.id));
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };
    fetchUsers();
  }, [showGroupModal, user.id]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (message.room === activeChat?.room) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [socket, activeChat]);
 
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId, username, isTyping }) => {
      if (!activeChat) return;
      if (userId === user.id) return;

      if (isTyping) {
        setTypingUser(username);
      } else {
        setTypingUser(null);
      }
    };

    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket, activeChat, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = async (chat) => {
    try {
      const room = `chat:${chat.id}`;
      const updatedChat = { ...chat, room };

      setActiveChat(updatedChat);
      setTypingUser(null);

      socket.emit("join_room", room);

      const res = await API.get(`/chats/${chat.id}`);
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error("Open chat error:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || !activeChat) return;

    try {
      // If file is selected, upload it
      if (selectedFile) {
        setUploadingFile(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await API.post(
          `/messages/upload/${activeChat.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const savedMessage = res.data.data;

        socket.emit("send_message", {
          senderId: user.id,
          text: savedMessage.fileName,
          fileUrl: savedMessage.fileUrl,
          fileType: savedMessage.fileType,
          fileName: savedMessage.fileName,
          timestamp: savedMessage.createdAt,
          room: activeChat.room,
        });

        setSelectedFile(null);
        setFilePreview(null);
        setUploadingFile(false);
      } else {
        // Text message
        const res = await API.post(
          `/messages/create/${activeChat.id}`,
          { content: text }
        );

        const savedMessage = res.data.data;

        socket.emit("send_message", {
          senderId: user.id,
          text: savedMessage.content,
          timestamp: savedMessage.createdAt,
          room: activeChat.room,
        });
      }

      // stop typing
      socket.emit("typing", {
        room: activeChat.room,
        isTyping: false,
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
      setUploadingFile(false);
    }
  };

  // emit typing when user types
  const handleTypingInput = (e) => {
    setText(e.target.value);

    if (!activeChat) return;

    socket.emit("typing", {
      room: activeChat.room,
      isTyping: true,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview({
          type: "image",
          src: event.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview({
        type: "file",
        name: file.name,
        size: (file.size / 1024).toFixed(2),
      });
    }
  };

  const removeFilePreview = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Group name and at least one member required");
      return;
    }

    try {
      const res = await API.post("/chats/group", {
        name: groupName,
        userIds: selectedUsers,
      });

      const newChat = res.data.data;

      setChats(prev => [...prev, newChat]);

      setShowGroupModal(false);
      setGroupName("");
      setSelectedUsers([]);

      openChat(newChat);
    } catch (err) {
      console.error("Create group error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/users/logout");
    } catch { }

    if (socket) socket.disconnect();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getOtherMember = (chat) => {
    if (!chat || chat.isGroup) return null;
    return chat.members.find(m => m.user.id !== user.id)?.user;
  };

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.isGroup) return chat.name;
    return getOtherMember(chat)?.username || "Chat";
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0)
      return "No messages yet";
    return chat.messages[0].content || chat.messages[0].text;
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop().toLowerCase();
  };

  const isVideoFile = (fileName) => {
    const videoExts = ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"];
    return videoExts.includes(getFileExtension(fileName));
  };

  const isAudioFile = (fileName) => {
    const audioExts = ["mp3", "wav", "m4a", "aac", "flac", "ogg", "wma"];
    return audioExts.includes(getFileExtension(fileName));
  };

  const isDocumentFile = (fileName) => {
    const docExts = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];
    return docExts.includes(getFileExtension(fileName));
  };

  const getFileIcon = (fileName) => {
    const ext = getFileExtension(fileName);
    if (["doc", "docx"].includes(ext)) return "📄";
    if (ext === "pdf") return "🔴";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["ppt", "pptx"].includes(ext)) return "🎬";
    if (["zip", "rar", "7z"].includes(ext)) return "📦";
    return "📎";
  };

  const filteredChats = chats.filter(chat =>
    getChatName(chat)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-linear-to-br from-slate-100 via-white to-slate-200 text-gray-800 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-xl">
        <div className="p-6 border-b bg-white">
          <div className="text-2xl font-bold text-indigo-600">ChatApp</div>

          <div className="text-xs text-gray-500 mt-1">
            Logged in as <span className="font-semibold">{user.username}</span>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full mt-4 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <button
            onClick={() => setShowGroupModal(true)}
            className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:opacity-90 transition shadow cursor-pointer"
          >
            + Create Group
          </button>
        </div>
        {/* GROUP MODAL */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-105 rounded-2xl shadow-2xl p-6">

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Create New Group
              </h2>

              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 mb-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                {allUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => {
                        if (selectedUsers.includes(u.id)) {
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== u.id)
                          );
                        } else {
                          setSelectedUsers([...selectedUsers, u.id]);
                        }
                      }}
                      className="accent-indigo-600"
                    />
                    <span>{u.username}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowGroupModal(false);
                    setGroupName("");
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={createGroup}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm shadow hover:opacity-90 cursor-pointer"
                >
                  Create Group
                </button>
              </div>

            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const otherUser = getOtherMember(chat);
            const isOnline = otherUser?.isOnline;

            return (
              <div
                key={chat.id}
                onClick={() => openChat(chat)}
                className={`px-5 py-4 cursor-pointer border-b border-gray-100 transition-all
                  ${activeChat?.id === chat.id
                    ? "bg-indigo-50"
                    : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                        {getChatName(chat).charAt(0).toUpperCase()}
                      </div>

                      {!chat.isGroup && (
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                          ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-sm">
                        {getChatName(chat)}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-40 mt-1">
                        {getLastMessage(chat)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white">

        <header className="px-8 py-4 border-b flex justify-between items-center bg-white shadow-sm">
          <div>
            {activeChat ? (
              <>
                <div className="text-lg font-semibold">
                  {getChatName(activeChat)}
                </div>

                {activeChat.isGroup ? (
                  <div className="text-xs text-indigo-500">
                    {typingUser ? `${typingUser} is typing...` : "Group chat"}
                  </div>
                ) : (
                  <div className={`text-xs mt-1 ${typingUser
                      ? "text-indigo-500"
                      : getOtherMember(activeChat)?.isOnline
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}>
                    {typingUser
                      ? "Typing..."
                      : getOtherMember(activeChat)?.isOnline
                        ? "Online"
                        : "Offline"}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400">Select a chat</div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm shadow hover:opacity-90 cursor-pointer"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-10 py-6 space-y-4 
  bg-linear-to-br from-indigo-50 via-white to-purple-50 relative">

          <div className="absolute -top-20 -left-20 w-72 h-72 
  bg-indigo-400 rounded-full blur-3xl opacity-20" />

          <div className="absolute bottom-0 right-0 w-72 h-72 
  bg-purple-400 rounded-full blur-3xl opacity-20" />

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`px-3 py-2 rounded-2xl shadow ${
                msg.senderId === user.id
                  ? "ml-auto bg-indigo-600 text-white rounded-br-none max-w-xs"
                  : "mr-auto bg-white border border-gray-200 rounded-bl-none max-w-xs"
              }`}
            >
              {msg.fileType ? (
                <div className="space-y-1">
                  {msg.fileType === "image" ? (
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={msg.fileUrl || msg.text}
                        alt="shared"
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    </div>
                  ) : isVideoFile(msg.fileName) ? (
                    <div className="overflow-hidden rounded-lg bg-black flex items-center justify-center">
                      <video
                        controls
                        className="w-full max-h-64"
                        src={msg.fileUrl || msg.text}
                      />
                    </div>
                  ) : isAudioFile(msg.fileName) ? (
                    <div className="bg-linear-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                      <audio
                        controls
                        className="w-full h-8"
                        src={msg.fileUrl || msg.text}
                      />
                      <div className="text-xs mt-2 font-medium truncate">
                        🎵 {msg.fileName || "Audio"}
                      </div>
                    </div>
                  ) : isDocumentFile(msg.fileName) ? (
                    <a
                      href={msg.fileUrl || msg.text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-lg no-underline transition ${
                        msg.senderId === user.id
                          ? "bg-indigo-500 hover:bg-indigo-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-2xl">{getFileIcon(msg.fileName)}</span>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold truncate ${
                          msg.senderId === user.id ? "text-white" : "text-gray-800"
                        }`}>
                          {msg.fileName}
                        </div>
                        <div className={`text-xs ${
                          msg.senderId === user.id ? "text-indigo-100" : "text-gray-500"
                        }`}>
                          Document
                        </div>
                      </div>
                      <span className={`ml-auto ${msg.senderId === user.id ? "text-white" : "text-gray-600"}`}>
                        ↓
                      </span>
                    </a>
                  ) : (
                    <a
                      href={msg.fileUrl || msg.text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-3 rounded-lg no-underline transition ${
                        msg.senderId === user.id
                          ? "bg-indigo-500 hover:bg-indigo-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-xl">📎</span>
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          msg.senderId === user.id ? "text-white" : "text-gray-800"
                        }`}>
                          {msg.fileName || "File"}
                        </div>
                      </div>
                      <span className={`ml-auto ${msg.senderId === user.id ? "text-white" : "text-gray-600"}`}>
                        ↓
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="px-2 py-1 text-sm">{msg.text || msg.content}</div>
              )}

              <div className={`text-[10px] mt-1 px-2 ${msg.senderId === user.id ? "text-indigo-100" : "text-gray-500"}`}>
                {new Date(
                  msg.createdAt || msg.timestamp
                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </main>

        {activeChat && (
          <div className="px-8 py-4 bg-white border-t">
            {/* File Preview */}
            {filePreview && (
              <div className="mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {filePreview.type === "image" ? (
                    <>
                      <img
                        src={filePreview.src}
                        alt="preview"
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">
                          {filePreview.name}
                        </div>
                        <div className="text-xs text-gray-500">Image</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-indigo-200 rounded flex items-center justify-center text-lg">
                        📄
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">
                          {filePreview.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {filePreview.size} KB
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={removeFilePreview}
                  className="p-2 hover:bg-indigo-100 rounded-lg cursor-pointer"
                >
                  <FiX size={18} className="text-indigo-600" />
                </button>
              </div>
            )}

            {/* Input Section */}
            <form
              onSubmit={sendMessage}
              className="flex gap-3 items-end"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer disabled:opacity-50"
              >
                <FiPaperclip size={20} />
              </button>

              <input
                value={text}
                onChange={handleTypingInput}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
              />

              <button
                type="submit"
                disabled={uploadingFile || (!text.trim() && !selectedFile)}
                className="px-6 py-3 rounded-full bg-indigo-600 text-white shadow hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingFile ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <FiSend size={18} />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
