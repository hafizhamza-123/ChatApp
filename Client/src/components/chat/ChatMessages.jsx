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
      {messages.map((msg, index) => {
        const isMine = msg.senderId === user.id;

        return (
          <div
            key={index}
            className={`px-3 py-2.5 rounded-2xl shadow-sm border ${
              isMine
                ? "ml-auto bg-indigo-600 text-white rounded-br-sm border-indigo-600 max-w-[87%] sm:max-w-[72%]"
                : "mr-auto bg-white text-slate-800 rounded-bl-sm border-slate-200 max-w-[87%] sm:max-w-[72%]"
            }`}
          >
            {msg.fileType ? (
              <div className="space-y-1.5">
                {msg.fileType === "image" ? (
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={msg.fileUrl || msg.text}
                      alt="shared"
                      className="w-full h-auto max-h-72 object-cover"
                    />
                  </div>
                ) : isVideoFile(msg.fileName) ? (
                  <div className="overflow-hidden rounded-lg bg-black flex items-center justify-center">
                    <video controls className="w-full max-h-72" src={msg.fileUrl || msg.text} />
                  </div>
                ) : isAudioFile(msg.fileName) ? (
                  <div className={`${isMine ? "bg-indigo-500" : "bg-slate-100"} p-3 rounded-lg`}>
                    <audio controls className="w-full h-8" src={msg.fileUrl || msg.text} />
                    <div className={`text-xs mt-2 font-medium truncate ${isMine ? "text-indigo-100" : "text-slate-600"}`}>
                      {"\uD83C\uDFB5"} {msg.fileName || "Audio"}
                    </div>
                  </div>
                ) : isDocumentFile(msg.fileName) ? (
                  <a
                    href={msg.fileUrl || msg.text}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg no-underline transition ${
                      isMine ? "bg-indigo-500 hover:bg-indigo-700" : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    <span className="text-2xl">{getFileIcon(msg.fileName)}</span>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold truncate ${isMine ? "text-white" : "text-slate-800"}`}>
                        {msg.fileName}
                      </div>
                      <div className={`text-xs ${isMine ? "text-indigo-100" : "text-slate-500"}`}>
                        Document
                      </div>
                    </div>
                    <span className={`ml-auto ${isMine ? "text-white" : "text-slate-600"}`}>{"\u2193"}</span>
                  </a>
                ) : (
                  <a
                    href={msg.fileUrl || msg.text}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-lg no-underline transition ${
                      isMine ? "bg-indigo-500 hover:bg-indigo-700" : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    <span className="text-xl">{"\uD83D\uDCCE"}</span>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${isMine ? "text-white" : "text-slate-800"}`}>
                        {msg.fileName || "File"}
                      </div>
                    </div>
                    <span className={`ml-auto ${isMine ? "text-white" : "text-slate-600"}`}>{"\u2193"}</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="px-1.5 text-[13px] sm:text-sm leading-relaxed break-words">{msg.text || msg.content}</div>
            )}

            <div className={`text-[10px] mt-1.5 px-1.5 ${isMine ? "text-indigo-100" : "text-slate-500"}`}>
              {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </>
  );
}
