export default function ChatMessages({
  activeChat,
  messages,
  user,
  bottomRef,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  getFileIcon,
}) {
  if (!activeChat) return null;

  return (
    <>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`px-3 py-2 rounded-2xl shadow ${
            msg.senderId === user.id
              ? "ml-auto bg-indigo-600 text-white rounded-br-none max-w-xs"
              : "mr-auto bg-white border border-gray-200 rounded-bl-none max-w-xs"
          }`}
        >
          {msg.fileType ? (
            <div className="space-y-1">
              {msg.fileType === "image" ? (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={msg.fileUrl || msg.text}
                    alt="shared"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
              ) : isVideoFile(msg.fileName) ? (
                <div className="overflow-hidden rounded-lg bg-black flex items-center justify-center">
                  <video
                    controls
                    className="w-full max-h-64"
                    src={msg.fileUrl || msg.text}
                  />
                </div>
              ) : isAudioFile(msg.fileName) ? (
                <div className="bg-linear-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                  <audio
                    controls
                    className="w-full h-8"
                    src={msg.fileUrl || msg.text}
                  />
                  <div className="text-xs mt-2 font-medium truncate">
                    {"\uD83C\uDFB5"} {msg.fileName || "Audio"}
                  </div>
                </div>
              ) : isDocumentFile(msg.fileName) ? (
                <a
                  href={msg.fileUrl || msg.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-lg no-underline transition ${
                    msg.senderId === user.id
                      ? "bg-indigo-500 hover:bg-indigo-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-2xl">{getFileIcon(msg.fileName)}</span>
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-semibold truncate ${
                        msg.senderId === user.id ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {msg.fileName}
                    </div>
                    <div
                      className={`text-xs ${
                        msg.senderId === user.id ? "text-indigo-100" : "text-gray-500"
                      }`}
                    >
                      Document
                    </div>
                  </div>
                  <span
                    className={`ml-auto ${
                      msg.senderId === user.id ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {"\u2193"}
                  </span>
                </a>
              ) : (
                <a
                  href={msg.fileUrl || msg.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-3 rounded-lg no-underline transition ${
                    msg.senderId === user.id
                      ? "bg-indigo-500 hover:bg-indigo-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl">{"\uD83D\uDCCE"}</span>
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        msg.senderId === user.id ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {msg.fileName || "File"}
                    </div>
                  </div>
                  <span
                    className={`ml-auto ${
                      msg.senderId === user.id ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {"\u2193"}
                  </span>
                </a>
              )}
            </div>
          ) : (
            <div className="px-2 py-1 text-sm">{msg.text || msg.content}</div>
          )}

          <div
            className={`text-[10px] mt-1 px-2 ${
              msg.senderId === user.id ? "text-indigo-100" : "text-gray-500"
            }`}
          >
            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </>
  );
}
