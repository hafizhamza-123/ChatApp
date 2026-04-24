import { FiChevronLeft, FiLogOut } from "react-icons/fi";

export default function ChatHeader({
  activeChat,
  typingUser,
  getChatName,
  getOtherMember,
  logout,
  onBack,
}) {
  return (
    <header className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
      <div className="min-w-0 flex items-center gap-2 sm:gap-3">
        {activeChat && onBack ? (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Back to chats"
          >
            <FiChevronLeft size={20} />
          </button>
        ) : null}

        {activeChat ? (
          <>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold truncate">
                {getChatName(activeChat)}
              </div>

              {activeChat.isGroup ? (
                <div className="text-xs text-indigo-500 truncate">
                  {typingUser ? `${typingUser} is typing...` : "Group chat"}
                </div>
              ) : (
                <div
                  className={`text-xs mt-1 ${
                    typingUser
                      ? "text-indigo-500"
                      : getOtherMember(activeChat)?.isOnline
                        ? "text-green-500"
                        : "text-gray-400"
                  }`}
                >
                  {typingUser
                    ? "Typing..."
                    : getOtherMember(activeChat)?.isOnline
                      ? "Online"
                      : "Offline"}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-indigo-600 font-bold text-sm sm:text-base">
            Select a chat
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm shadow hover:opacity-90 cursor-pointer"
      >
        <FiLogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
