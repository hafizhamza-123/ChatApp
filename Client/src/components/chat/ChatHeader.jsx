import { FiLogOut } from "react-icons/fi";

export default function ChatHeader({ activeChat, typingUser, getChatName, getOtherMember, logout }) {
  return (
    <header className="px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
      <div>
        {activeChat ? (
          <>
            <div className="text-lg font-semibold">{getChatName(activeChat)}</div>

            {activeChat.isGroup ? (
              <div className="text-xs text-indigo-500">
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
          </>
        ) : (
          <div className="text-indigo-600 font-bold">Select a chat</div>
        )}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm shadow hover:opacity-90 cursor-pointer"
      >
        <FiLogOut size={16} />
        Logout
      </button>
    </header>
  );
}
