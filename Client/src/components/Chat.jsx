import ProfileModal from "./ProfileModal";
import ChatSidebar from "./chat/ChatSidebar";
import GroupModal from "./chat/GroupModal";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import EmptyChatState from "./chat/EmptyChatState";
import MessageInput from "./chat/MessageInput";
import { getLastMessage } from "./chat/utils/chatHelpers";
import { getFileIcon, isAudioFile, isDocumentFile, isVideoFile } from "./chat/utils/fileHelpers";
import useChatController from "../hooks/chat/useChatController";

export default function Chat({ socket, user, connected }) {
  const { state, refs, actions, selectors, logout } = useChatController({ socket, user, connected });

  return (
    <div className="h-screen flex bg-linear-to-br from-slate-100 via-white to-slate-200 text-gray-800 overflow-hidden">
      <ChatSidebar
        currentUser={state.currentUser}
        search={state.search}
        setSearch={actions.setSearch}
        setShowGroupModal={actions.setShowGroupModal}
        setShowProfileModal={actions.setShowProfileModal}
        filteredChats={state.filteredChats}
        filteredAvailableUsers={state.filteredAvailableUsers}
        startingDirectChatUserId={state.startingDirectChatUserId}
        activeChat={state.activeChat}
        hoveredChatId={state.hoveredChatId}
        menuOpenChatId={state.menuOpenChatId}
        setHoveredChatId={actions.setHoveredChatId}
        setMenuOpenChatId={actions.setMenuOpenChatId}
        openChat={actions.openChat}
        deleteChat={actions.deleteChat}
        startDirectChat={actions.startDirectChat}
        getOtherMember={selectors.getOtherMemberForUser}
        getChatName={selectors.getChatNameForUser}
        getLastMessage={getLastMessage}
      />

      <GroupModal
        showGroupModal={state.showGroupModal}
        groupName={state.groupName}
        setGroupName={actions.setGroupName}
        allUsers={state.allUsers}
        selectedUsers={state.selectedUsers}
        setSelectedUsers={actions.setSelectedUsers}
        setShowGroupModal={actions.setShowGroupModal}
        setGroupNameAndUsers={actions.setGroupNameAndUsers}
        createGroup={actions.createGroup}
      />

      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader
          activeChat={state.activeChat}
          typingUser={state.typingUser}
          getChatName={selectors.getChatNameForUser}
          getOtherMember={selectors.getOtherMemberForUser}
          logout={logout}
        />

        <main
          className={`flex-1 overflow-y-auto px-10 py-6 space-y-4
  bg-linear-to-br from-indigo-50 via-white to-purple-50 relative ${
    state.activeChat ? "" : "flex items-center justify-center"
  }`}
        >
          <div className="absolute -top-20 -left-20 w-72 h-72
  bg-indigo-400 rounded-full blur-3xl opacity-20" />

          <div className="absolute bottom-0 right-0 w-72 h-72
  bg-purple-400 rounded-full blur-3xl opacity-20" />

          {state.activeChat ? (
            <ChatMessages
              activeChat={state.activeChat}
              messages={state.messages}
              user={user}
              bottomRef={refs.bottomRef}
              isVideoFile={isVideoFile}
              isAudioFile={isAudioFile}
              isDocumentFile={isDocumentFile}
              getFileIcon={getFileIcon}
            />
          ) : (
            <EmptyChatState username={user?.username} />
          )}
        </main>

        <MessageInput
          activeChat={state.activeChat}
          filePreview={state.filePreview}
          removeFilePreview={actions.removeFilePreview}
          sendMessage={actions.sendMessage}
          fileInputRef={refs.fileInputRef}
          handleFileSelect={actions.handleFileSelect}
          uploadingFile={state.uploadingFile}
          text={state.text}
          handleTypingInput={actions.handleTypingInput}
          selectedFile={state.selectedFile}
        />
      </div>

      <ProfileModal
        isOpen={state.showProfileModal}
        onClose={() => actions.setShowProfileModal(false)}
        user={state.currentUser}
        onProfileUpdate={actions.handleProfileUpdate}
      />
    </div>
  );
}
