import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import API from "../../api/axios";
import { getChatName, getOtherMember } from "../../components/chat/utils/chatHelpers";

export default function useChatController({ socket, user }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const [allUsers, setAllUsers] = useState([]);
  const [filteredAvailableUsers, setFilteredAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [startingDirectChatUserId, setStartingDirectChatUserId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [menuOpenChatId, setMenuOpenChatId] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const { logout } = useAuth();
  const emitSocket = useCallback((event, payload) => {
    if (!socket || !socket.connected) return false;
    socket.emit(event, payload);
    return true;
  }, [socket]);

  useEffect(() => {
    if (!socket || !user || !socket.connected) return;

    emitSocket("join_chat", {
      username: user.username,
      userId: user.id,
    });
  }, [socket, user, socket?.connected, emitSocket]);

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
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users/all");
        setAllUsers(res.data.data.filter((u) => u.id !== user.id));
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };

    fetchUsers();
  }, [user.id]);

  useEffect(() => {
    if (!showGroupModal) return;

    const fetchUsers = async () => {
      try {
        const res = await API.get("/users/all");
        setAllUsers(res.data.data.filter((u) => u.id !== user.id));
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
        setMessages((prev) => [...prev, message]);
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

      emitSocket("join_room", room);

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

        const res = await API.post(`/messages/upload/${activeChat.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const savedMessage = res.data.data;

        const emitted = emitSocket("send_message", {
          senderId: user.id,
          text: savedMessage.fileName,
          fileUrl: savedMessage.fileUrl,
          fileType: savedMessage.fileType,
          fileName: savedMessage.fileName,
          timestamp: savedMessage.createdAt,
          room: activeChat.room,
        });

        if (!emitted) {
          setMessages((prev) => [...prev, savedMessage]);
        }

        setSelectedFile(null);
        setFilePreview(null);
        setUploadingFile(false);
      } else {
        const res = await API.post(`/messages/create/${activeChat.id}`, { content: text });

        const savedMessage = res.data.data;

        const emitted = emitSocket("send_message", {
          senderId: user.id,
          text: savedMessage.content,
          timestamp: savedMessage.createdAt,
          room: activeChat.room,
        });

        if (!emitted) {
          setMessages((prev) => [...prev, savedMessage]);
        }
      }

      emitSocket("typing", {
        room: activeChat.room,
        isTyping: false,
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
      setUploadingFile(false);
    }
  };

  const handleTypingInput = (e) => {
    setText(e.target.value);

    if (!activeChat) return;

    emitSocket("typing", {
      room: activeChat.room,
      isTyping: true,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

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

      setChats((prev) => [...prev, newChat]);

      setShowGroupModal(false);
      setGroupName("");
      setSelectedUsers([]);

      openChat(newChat);
    } catch (err) {
      console.error("Create group error:", err);
    }
  };

  const handleProfileUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
  };

  const getOtherMemberForUser = (chat) => getOtherMember(chat, user.id);
  const getChatNameForUser = (chat) => getChatName(chat, user.id);

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

  const filteredChats = chats.filter((chat) =>
    getChatNameForUser(chat).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const directChatMemberIds = new Set(
      chats
        .filter((chat) => !chat.isGroup)
        .map((chat) => getOtherMember(chat, user.id)?.id)
        .filter(Boolean)
    );

    const filtered = allUsers
      .filter((u) => !directChatMemberIds.has(u.id))
      .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

    setFilteredAvailableUsers(filtered);
  }, [allUsers, chats, search, user.id]);

  const startDirectChat = async (selectedUser) => {
    try {
      setStartingDirectChatUserId(selectedUser.id);

      const res = await API.post("/chats/direct", { userId: selectedUser.id });
      const directChat = res.data.data;

      setChats((prev) => {
        if (prev.some((c) => c.id === directChat.id)) return prev;
        return [directChat, ...prev];
      });

      await openChat(directChat);
    } catch (err) {
      console.error("Start direct chat error:", err);
      alert(err.response?.data?.message || "Failed to start chat");
    } finally {
      setStartingDirectChatUserId(null);
    }
  };

  return {
    state: {
      activeChat,
      allUsers,
      currentUser,
      filePreview,
      filteredAvailableUsers,
      filteredChats,
      groupName,
      hoveredChatId,
      menuOpenChatId,
      messages,
      search,
      selectedFile,
      selectedUsers,
      showGroupModal,
      showProfileModal,
      startingDirectChatUserId,
      text,
      typingUser,
      uploadingFile,
    },
    refs: {
      bottomRef,
      fileInputRef,
    },
    actions: {
      createGroup,
      deleteChat,
      handleFileSelect,
      handleProfileUpdate,
      handleTypingInput,
      openChat,
      removeFilePreview,
      sendMessage,
      setGroupName,
      setHoveredChatId,
      setMenuOpenChatId,
      setSearch,
      setSelectedUsers,
      setActiveChat,
      setShowGroupModal,
      setShowProfileModal,
      startDirectChat,
      setGroupNameAndUsers: () => {
        setGroupName("");
        setSelectedUsers([]);
      },
    },
    selectors: {
      getChatNameForUser,
      getOtherMemberForUser,
    },
    logout,
  };
}
