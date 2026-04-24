import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import API from "../api/axios";
import AuthLayout from "../components/auth/AuthLayout";

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
    <AuthLayout
      title="Reset Password"
      subtitle="Set a new password for your account to continue securely."
      footer={
        <>
          Back to{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline cursor-pointer">
            Login
          </Link>
        </>
      }
    >
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
    </AuthLayout>
  );
}
