import { FiTrash2, FiMoreVertical, FiPlus, FiLoader, FiSearch } from "react-icons/fi";

const formatLastTime = (chat) => {
  const last = chat?.messages?.[0];
  const raw = last?.createdAt || last?.timestamp;
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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
    <aside className="w-full md:w-[22rem] bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="flex justify-between items-center gap-3">
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-tight">ChatApp</div>
            <div className="text-xs text-slate-500 mt-1 truncate">
              Signed in as <span className="font-semibold text-slate-700">{currentUser.username}</span>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="shrink-0 relative group"
            aria-label="Open profile"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover border-2 border-indigo-600 hover:border-indigo-700 transition"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-indigo-600 hover:border-indigo-700 transition">
                {currentUser?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </button>
        </div>

        <div className="mt-4 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <button
          onClick={() => setShowGroupModal(true)}
          className="w-full mt-3 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow cursor-pointer"
        >
          + New Group
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No chats found</div>
        ) : null}

        {filteredChats.map((chat) => {
          const otherUser = getOtherMember(chat);
          const isOnline = otherUser?.isOnline;
          const isActive = activeChat?.id === chat.id;

          return (
            <div
              key={chat.id}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => {
                setHoveredChatId(null);
                setMenuOpenChatId(null);
              }}
              className={`px-3 sm:px-4 py-2.5 border-b border-slate-100 transition-all relative ${
                isActive ? "bg-indigo-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer"
                  onClick={() => openChat(chat)}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                      {getChatName(chat).charAt(0).toUpperCase()}
                    </div>

                    {!chat.isGroup && (
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-slate-400"}`} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-slate-800 truncate">{getChatName(chat)}</div>
                      <div className="text-[11px] text-slate-400 ml-auto shrink-0">{formatLastTime(chat)}</div>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {getLastMessage(chat)}
                    </div>
                  </div>
                </button>

                <div className="relative shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenChatId(menuOpenChatId === chat.id ? null : chat.id);
                    }}
                    className={`p-2 rounded-full hover:bg-slate-200 transition cursor-pointer ${
                      hoveredChatId === chat.id || menuOpenChatId === chat.id ? "visible" : "md:invisible visible"
                    }`}
                  >
                    <FiMoreVertical size={15} />
                  </button>

                  {menuOpenChatId === chat.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                          setMenuOpenChatId(null);
                        }}
                        className="group flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                      >
                        <FiTrash2 size={16} className="transition-transform duration-200 group-hover:scale-110" />
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
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Start Direct Chat
            </div>
            <div className="space-y-2">
              {filteredAvailableUsers.map((availableUser) => (
                <button
                  key={availableUser.id}
                  onClick={() => startDirectChat(availableUser)}
                  disabled={startingDirectChatUserId === availableUser.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                      {availableUser.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-700 truncate">{availableUser.username}</span>
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
