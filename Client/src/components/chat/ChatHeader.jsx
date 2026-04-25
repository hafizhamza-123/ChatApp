import { FiChevronLeft, FiLogOut, FiWifi, FiWifiOff } from "react-icons/fi";

export default function ChatHeader({
  activeChat,
  typingUser,
  getChatName,
  getOtherMember,
  logout,
  connected,
  onBack,
}) {
  const chatName = activeChat ? getChatName(activeChat) : "Select a chat";
  const otherMember = activeChat ? getOtherMember(activeChat) : null;

  const presenceText = activeChat
    ? activeChat.isGroup
      ? typingUser
        ? `${typingUser} is typing...`
        : "Group chat"
      : typingUser
        ? "Typing..."
        : otherMember?.isOnline
          ? "Online"
          : "Offline"
    : connected
      ? "Connected"
      : "Reconnecting";

  const presenceColor = activeChat
    ? typingUser
      ? "text-indigo-500"
      : activeChat.isGroup
        ? "text-slate-500"
        : otherMember?.isOnline
          ? "text-emerald-500"
          : "text-slate-400"
    : connected
      ? "text-emerald-500"
      : "text-amber-500";

  return (
    <header className="px-3 sm:px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-white/95 backdrop-blur-md">
      <div className="min-w-0 flex items-center gap-2 sm:gap-3">
        {activeChat && onBack ? (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            aria-label="Back to chats"
          >
            <FiChevronLeft size={20} />
          </button>
        ) : null}

        <div className="min-w-0">
          <div className="text-sm sm:text-base font-semibold text-slate-800 truncate">{chatName}</div>
          <div className={`text-xs mt-0.5 ${presenceColor} flex items-center gap-1 truncate`}>
            {connected ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {presenceText}
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm shadow hover:opacity-90 cursor-pointer"
      >
        <FiLogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
