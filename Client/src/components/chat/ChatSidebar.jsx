import { FiTrash2, FiMoreVertical, FiPlus, FiLoader } from "react-icons/fi";

export default function ChatSidebar({
  currentUser,
  search,
  setSearch,
  setShowGroupModal,
  setShowProfileModal,
  filteredChats,
  filteredAvailableUsers,
  startingDirectChatUserId,
  activeChat,
  hoveredChatId,
  menuOpenChatId,
  setHoveredChatId,
  setMenuOpenChatId,
  openChat,
  deleteChat,
  startDirectChat,
  getOtherMember,
  getChatName,
  getLastMessage,
}) {
  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-xl h-full">
      <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 bg-white">
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
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
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

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.map((chat) => {
          const otherUser = getOtherMember(chat);
          const isOnline = otherUser?.isOnline;

          return (
            <div
              key={chat.id}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => {
                setHoveredChatId(null);
                setMenuOpenChatId(null);
              }}
              className={`px-4 sm:px-5 py-4 border-b border-gray-100 transition-all relative ${activeChat?.id === chat.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
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
                    <div className="font-semibold text-sm">{getChatName(chat)}</div>
                    <div className="text-xs text-gray-500 truncate max-w-36 sm:max-w-40 mt-1">
                      {getLastMessage(chat)}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenChatId(menuOpenChatId === chat.id ? null : chat.id);
                    }}
                    className={`p-2 rounded-full hover:bg-gray-100 transition cursor-pointer ${hoveredChatId === chat.id || menuOpenChatId === chat.id ? "visible" : "invisible"}`}
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

        {filteredAvailableUsers.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/70">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Start Direct Chat
            </div>
            <div className="space-y-2">
              {filteredAvailableUsers.map((availableUser) => (
                <button
                  key={availableUser.id}
                  onClick={() => startDirectChat(availableUser)}
                  disabled={startingDirectChatUserId === availableUser.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                      {availableUser.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 truncate">
                      {availableUser.username}
                    </span>
                  </div>
                  {startingDirectChatUserId === availableUser.id ? (
                    <FiLoader className="animate-spin text-indigo-600" size={14} />
                  ) : (
                    <FiPlus className="text-indigo-600" size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
