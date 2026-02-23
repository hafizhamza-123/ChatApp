import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import API from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await API.post(`/users/reset-password/${token}`, {
        password,
      });

      setMessage({
        type: "success",
        text: res.data.message || "Password reset successful!",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Reset failed",
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-violet-50 font-inter px-4">
      
      <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-10 w-full max-w-md border border-gray-200">
        
        <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">
          Reset Password
        </h2>

        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your new password below.
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-4 text-gray-400" />
            <input
              type="password"
              placeholder="New password"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-4 text-gray-400" />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-md hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Back to{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
