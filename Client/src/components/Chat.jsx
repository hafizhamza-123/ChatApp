import { useEffect, useRef, useState } from "react";
import { FiSend, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Chat({ socket, user, connected }) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState("");

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const activeUser = users.find(
    (u) => activeChat?.room?.includes(u.id)
  );

  /* ================= JOIN CHAT ================= */
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("join_chat", {
      username: user.username,
      userId: user.id,
    });
  }, [socket, user]);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users/all");
        setUsers(res.data.data);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };
    fetchUsers();
  }, []);

  /* ================= ONLINE STATUS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (data) => {
      const active = data.activeUsers || [];
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          isOnline: active.some((a) => a.userId === u.id),
        }))
      );
    };

    socket.on("user_joined", handleUserUpdate);
    socket.on("user_left", handleUserUpdate);

    return () => {
      socket.off("user_joined", handleUserUpdate);
      socket.off("user_left", handleUserUpdate);
    };
  }, [socket]);

  /* ================= RECEIVE MESSAGE ================= */
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (message.room === activeChat?.room) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [socket, activeChat]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= START CHAT ================= */
  const startChat = async (targetUserId) => {
    try {
      const res = await API.post("/chats/direct", {
        userId: targetUserId,
      });

      const chat = res.data.data;
      const room = `private:${[user.id, targetUserId]
        .sort()
        .join(":")}`;

      const updatedChat = { ...chat, room };
      setActiveChat(updatedChat);

      socket.emit("join_room", room);

      const messagesRes = await API.get(
        `/messages/${chat.id}`
      );
      setMessages(messagesRes.data.data);
    } catch (err) {
      console.error("Start chat error:", err);
    }
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    try {
      const res = await API.post(
        `/messages/create/${activeChat.id}`,
        { content: text }
      );

      const savedMessage = res.data.data;

      socket.emit("send_message", {
        senderId: user.id,
        text: savedMessage.content,
        room: activeChat.room,
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await API.post("/users/logout");
    } catch (err) {
      console.warn("Logout API failed");
    }

    if (socket) socket.disconnect();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-linear-to-br from-indigo-50 via-white to-violet-50 text-gray-800 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-sm flex flex-col h-full">
        
        <div className="p-6 border-b border-gray-100">
          <div className="text-xl font-bold text-indigo-600">
            ChatApp
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Logged in as{" "}
            <span className="font-medium">
              {user.username}
            </span>
          </div>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className="w-full mt-5 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {users
            .filter((u) =>
              u.username
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((u) => (
              <div
                key={u.id}
                onClick={() => startChat(u.id)}
                className="px-6 py-4 cursor-pointer transition hover:bg-indigo-50 border-b border-gray-100 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {u.username}
                  </div>
                  <div
                    className={`text-xs ${
                      u.isOnline
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {u.isOnline
                      ? "Online"
                      : "Offline"}
                  </div>
                </div>

                {u.isOnline && (
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                )}
              </div>
            ))}
        </div>
      </aside>

      {/* ================= CHAT AREA ================= */}
      <div className="flex-1 flex flex-col h-full">
        
        {/* HEADER (Sticky) */}
        <header className="px-8 py-5 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {activeUser
                ? activeUser.username
                : "Select a user"}
            </div>
            {activeUser && (
              <div
                className={`text-xs mt-1 ${
                  activeUser.isOnline
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {activeUser.isOnline
                  ? "Online"
                  : "Offline"}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 transition shadow-md cursor-pointer"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </header>

        {/* MESSAGES (Only Scrollable Area) */}
        <main className="flex-1 overflow-y-auto px-10 py-8 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-lg px-5 py-3 rounded-2xl text-sm shadow-md ${
                msg.senderId === user.id
                  ? "ml-auto bg-linear-to-r from-indigo-600 to-violet-600 text-white"
                  : "mr-auto bg-white border border-gray-200"
              }`}
            >
              <div>
                {msg.text || msg.content}
              </div>
              <div className="text-[11px] mt-2 opacity-70 text-right">
                {new Date(
                  msg.createdAt ||
                    msg.timestamp
                ).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </main>

        {/* INPUT (Sticky Bottom) */}
        {activeChat && (
          <form
            onSubmit={sendMessage}
            className="px-8 py-6 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex gap-4 sticky bottom-0"
          >
            <input
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              placeholder="Type a message..."
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:opacity-90 transition cursor-pointer"
            >
              <FiSend size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
