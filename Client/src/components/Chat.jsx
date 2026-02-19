import { useEffect, useRef, useState } from "react";
import { FiSend, FiLogOut, FiPaperclip, FiX, FiFile, FiMessageCircle, FiUsers, FiLoader, FiMoreVertical, FiTrash2, FiUser} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ProfileModal from "./ProfileModal";

export default function Chat({ socket, user, connected }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [menuOpenChatId, setMenuOpenChatId] = useState(null);

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

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await API.get("/users/profile");
        if (res.data.success) {
          setCurrentUser(res.data.data);
        }
      } catch (err) {
        console.error("Fetch user profile error:", err);
      }
    };
    fetchUserProfile();
  }, []);

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

  const handleProfileUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
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

  // Delete chat handler (calls backend)
  const deleteChat = async (chatId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
      if (!confirmDelete) return;

      await API.delete(`/chats/${chatId}`);

      setChats((prev) => prev.filter((c) => c.id !== chatId));

      if (activeChat?.id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Delete chat error:", err);
      alert(err.response?.data?.message || "Failed to delete chat");
    }
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
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-2xl font-bold text-indigo-600">ChatApp</div>
              <div className="text-xs text-gray-500 mt-1">
                Logged in as <span className="font-semibold">{currentUser.username}</span>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="shrink-0 relative group"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 hover:border-indigo-700 transition cursor-pointer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-indigo-600 hover:border-indigo-700 transition">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              
            </button>
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
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => { setHoveredChatId(null); setMenuOpenChatId(null); }}
                className={`px-5 py-4 border-b border-gray-100 transition-all relative ${activeChat?.id === chat.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => openChat(chat)}>
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                        {getChatName(chat).charAt(0).toUpperCase()}
                      </div>

                      {!chat.isGroup && (
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
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

                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpenChatId(menuOpenChatId === chat.id ? null : chat.id); }}
                      className={`p-2 rounded-full hover:bg-gray-100 transition cursor-pointer ${hoveredChatId === chat.id || menuOpenChatId === chat.id ? 'visible' : 'invisible'}`}
                    >
                      <FiMoreVertical size={16} />
                    </button>

                    {menuOpenChatId === chat.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                            setMenuOpenChatId(null);
                          }}
                          className="
    group
    flex items-center gap-2
    w-full text-left
    px-3 py-2 rounded-lg
    text-sm font-medium
    text-red-600
    hover:bg-red-50
    transition-all duration-200
    active:scale-[0.98] cursor-pointer
  "
                        >
                          <FiTrash2
                            size={16}
                            className="transition-transform duration-200 group-hover:scale-110"
                          />
                          Delete Chat
                        </button>

                      </div>
                    )}
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
              <div className="text-indigo-600 font-bold">Select a chat</div>
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

        <main className={`flex-1 overflow-y-auto px-10 py-6 space-y-4 
  bg-linear-to-br from-indigo-50 via-white to-purple-50 relative ${activeChat ? "" : "flex items-center justify-center"
          }`}>

          <div className="absolute -top-20 -left-20 w-72 h-72 
  bg-indigo-400 rounded-full blur-3xl opacity-20" />

          <div className="absolute bottom-0 right-0 w-72 h-72 
  bg-purple-400 rounded-full blur-3xl opacity-20" />

          {activeChat ? (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-2xl shadow ${msg.senderId === user.id
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
                          className={`flex items-center gap-3 p-3 rounded-lg no-underline transition ${msg.senderId === user.id
                              ? "bg-indigo-500 hover:bg-indigo-700"
                              : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                          <span className="text-2xl">{getFileIcon(msg.fileName)}</span>
                          <div className="min-w-0">
                            <div className={`text-sm font-semibold truncate ${msg.senderId === user.id ? "text-white" : "text-gray-800"
                              }`}>
                              {msg.fileName}
                            </div>
                            <div className={`text-xs ${msg.senderId === user.id ? "text-indigo-100" : "text-gray-500"
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
                          className={`flex items-center gap-2 p-3 rounded-lg no-underline transition ${msg.senderId === user.id
                              ? "bg-indigo-500 hover:bg-indigo-700"
                              : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                          <span className="text-xl">📎</span>
                          <div className="min-w-0">
                            <div className={`text-sm font-medium truncate ${msg.senderId === user.id ? "text-white" : "text-gray-800"
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
            </>
          ) : (
            <div className="relative w-full max-w-2xl text-center">
              {/* Animated Icons */}
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                }
                @keyframes bounce-in {
                  0% { opacity: 0; transform: scale(0.5); }
                  100% { opacity: 1; transform: scale(1); }
                }
                @keyframes slide-up {
                  0% { opacity: 0; transform: translateY(30px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
                .animate-bounce-in {
                  animation: bounce-in 0.6s ease-out;
                }
                .animate-slide-up {
                  animation: slide-up 0.8s ease-out;
                }
              `}</style>

              {/* Main Icon */}

              {/* Welcome Text */}
              <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Welcome to ChatApp
                </h1>
              </div>

              <div className="animate-slide-up mb-8" style={{ animationDelay: "0.2s" }}>
                <p className="text-lg md:text-xl text-gray-600 mb-2">
                  Hey <span className="font-semibold text-indigo-600">{user?.username}!</span> 👋
                </p>
                <p className="text-gray-500">
                  Start a conversation to connect with others
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer">
                  <div className="text-3xl mb-3 flex justify-center"><FiMessageCircle className="text-indigo-500" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">Instant Messaging</h3>
                  <p className="text-sm text-gray-600">Send messages in real-time</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer">
                  <div className="text-3xl mb-3 flex justify-center"><FiUsers className="text-indigo-500" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">Group Chats</h3>
                  <p className="text-sm text-gray-600">Chat with multiple friends</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer">
                  <div className="text-3xl mb-3 flex justify-center"><FiFile className="text-indigo-500" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">File Sharing</h3>
                  <p className="text-sm text-gray-600">Share media and documents</p>
                </div>
              </div>

              {/* CTA */}
              <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <p className="text-gray-600 mb-1">Select a chat from the sidebar</p>
                <p className="text-sm text-gray-500">or create a new group to get started</p>
              </div>
            </div>
          )}
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
                    <FiLoader className="animate-spin" size={18} />
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
