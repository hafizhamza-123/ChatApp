import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import API from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await API.post("/users/forgot-password", { email });

      setMessage({
        type: "success",
        text: res.data.message || "Reset link sent successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.error ||
          "Failed to send reset link. Try again.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="login-bg relative flex justify-center items-center min-h-screen font-inter overflow-hidden px-4">
      <div className="login-orb login-orb-left" />
      <div className="login-orb login-orb-right" />

      <div className="bg-white/85 backdrop-blur-xl shadow-xl rounded-2xl p-8 sm:p-10 w-full max-w-md border border-indigo-100 relative z-10">
        <p className="text-xs tracking-[0.2em] uppercase text-indigo-500 text-center mb-2">
          ChatApp Secure Space
        </p>
        <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">
          Forgot Password
        </h2>

        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your email and we'll send you a reset link.
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
          <div className="relative">
            <FiMail className="absolute left-4 top-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-md hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
