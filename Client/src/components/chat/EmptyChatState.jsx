import { FiMessageCircle, FiUsers, FiFile } from "react-icons/fi";

export default function EmptyChatState({ username }) {
  return (
    <div className="relative w-full max-w-2xl text-center">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>

      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Welcome to ChatApp
        </h1>
      </div>

      <div className="animate-slide-up mb-8" style={{ animationDelay: "0.2s" }}>
        <p className="text-lg md:text-xl text-gray-600 mb-2">
          Hey <span className="font-semibold text-indigo-600">{username}!</span> {"\uD83D\uDC4B"}
        </p>
        <p className="text-gray-500">Start a conversation to connect with others</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer">
          <div className="text-3xl mb-3 flex justify-center"><FiMessageCircle className="text-indigo-500" /></div>
          <h3 className="font-semibold text-gray-800 mb-2">Instant Messaging</h3>
          <p className="text-sm text-gray-600">Send messages in real-time</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer">
          <div className="text-3xl mb-3 flex justify-center"><FiUsers className="text-indigo-500" /></div>
          <h3 className="font-semibold text-gray-800 mb-2">Group Chats</h3>
          <p className="text-sm text-gray-600">Chat with multiple friends</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer">
          <div className="text-3xl mb-3 flex justify-center"><FiFile className="text-indigo-500" /></div>
          <h3 className="font-semibold text-gray-800 mb-2">File Sharing</h3>
          <p className="text-sm text-gray-600">Share media and documents</p>
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <p className="text-gray-600 mb-1">Select a chat from the sidebar</p>
        <p className="text-sm text-gray-500">or create a new group to get started</p>
      </div>
    </div>
  );
}
