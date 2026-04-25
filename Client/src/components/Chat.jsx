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
  const isMobileChatView = Boolean(state.activeChat);

  return (
    <div className="h-[100dvh] bg-slate-100 text-gray-800 overflow-hidden">
      <div className="h-full w-full md:p-3">
        <div className="h-full w-full bg-white md:rounded-2xl md:shadow-[0_20px_50px_rgba(30,41,59,0.12)] md:border md:border-slate-200 overflow-hidden flex">
          <div className={`${isMobileChatView ? "hidden md:flex" : "flex"} w-full md:w-auto md:shrink-0`}>
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
          </div>

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

          <div className={`${isMobileChatView ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col bg-white`}>
            <ChatHeader
              activeChat={state.activeChat}
              typingUser={state.typingUser}
              getChatName={selectors.getChatNameForUser}
              getOtherMember={selectors.getOtherMemberForUser}
              logout={logout}
              connected={connected}
              onBack={() => actions.setActiveChat(null)}
            />

            <main
              className={`flex-1 overflow-y-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-5 space-y-3 sm:space-y-4 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] relative ${
                state.activeChat ? "" : "flex items-center justify-center"
              }`}
            >
              <div className="absolute -top-20 -left-20 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-300 rounded-full blur-3xl opacity-25" />
              <div className="absolute bottom-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-violet-300 rounded-full blur-3xl opacity-20" />

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
      </div>
    </div>
  );
}
