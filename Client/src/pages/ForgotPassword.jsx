import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import API from "../api/axios";
import AuthLayout from "../components/auth/AuthLayout";

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
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we will send you a secure reset link."
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline cursor-pointer">
            Back to Login
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
    </AuthLayout>
  );
}
