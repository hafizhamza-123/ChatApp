import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AuthLayout from "../components/auth/AuthLayout";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const finalOtp = otp.join("");

    try {
      const res = await API.post("/users/verify-otp", {
        email,
        otp: finalOtp,
      });

      setMessage({
        type: "success",
        text: res.data.message || "OTP verified!",
      });
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "OTP verification failed.",
      });
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email first." });
      return;
    }

    setResendLoading(true);
    setMessage(null);

    try {
      const res = await API.post("/users/resend-otp", { email });
      setMessage({
        type: "success",
        text: res.data.message || "OTP resent successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to resend OTP.",
      });
    }

    setResendLoading(false);
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle="Enter the one-time passcode sent to your email address."
      footer={
        <>
          Did not receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>
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
        <input
          type="email"
          placeholder="Email"
          className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex justify-between gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-xl font-semibold rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm hover:shadow-md transition"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-md hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </AuthLayout>
  );
}
