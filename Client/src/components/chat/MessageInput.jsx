import { FiPaperclip, FiX, FiSend, FiLoader } from "react-icons/fi";

export default function MessageInput({
  activeChat,
  filePreview,
  removeFilePreview,
  sendMessage,
  fileInputRef,
  handleFileSelect,
  uploadingFile,
  text,
  handleTypingInput,
  selectedFile,
}) {
  if (!activeChat) return null;

  return (
    <div className="px-3 sm:px-6 md:px-8 py-3 sm:py-4 bg-white border-t border-gray-200">
      {filePreview && (
        <div className="mb-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {filePreview.type === "image" ? (
              <>
                <img
                  src={filePreview.src}
                  alt="preview"
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{filePreview.name}</div>
                  <div className="text-xs text-gray-500">Image</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-200 rounded flex items-center justify-center text-lg">
                  {"\uD83D\uDCC4"}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{filePreview.name}</div>
                  <div className="text-xs text-gray-500">{filePreview.size} KB</div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={removeFilePreview}
            className="p-2 hover:bg-indigo-100 rounded-lg cursor-pointer"
          >
            <FiX size={18} className="text-indigo-600" />
          </button>
        </div>
      )}

      <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3 items-end">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile}
          className="p-2.5 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer disabled:opacity-50"
        >
          <FiPaperclip size={18} />
        </button>

        <input
          value={text}
          onChange={handleTypingInput}
          placeholder="Type a message..."
          className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-sm sm:text-base"
        />

        <button
          type="submit"
          disabled={uploadingFile || (!text.trim() && !selectedFile)}
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-indigo-600 text-white shadow hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploadingFile ? (
            <>
              <FiLoader className="animate-spin" size={18} />
              <span className="hidden sm:inline">Uploading...</span>
            </>
          ) : (
            <>
              <FiSend size={18} />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
