export const getOtherMember = (chat, currentUserId) => {
  if (!chat || chat.isGroup) return null;
  return chat.members.find((m) => m.user.id !== currentUserId)?.user;
};

export const getChatName = (chat, currentUserId) => {
  if (!chat) return "";
  if (chat.isGroup) return chat.name;
  return getOtherMember(chat, currentUserId)?.username || "Chat";
};

export const getLastMessage = (chat) => {
  if (!chat.messages || chat.messages.length === 0) {
    return "No messages yet";
  }

  return chat.messages[0].content || chat.messages[0].text;
};
