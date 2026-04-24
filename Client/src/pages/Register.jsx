import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/auth/AuthLayout";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await register(email, username, password);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Registered successfully!" });

      setTimeout(() => {
        navigate("/verify-otp", { replace: true });
      }, 1200);
    } else {
      setMessage({ type: "error", text: res.message || "Registration failed." });
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title="Register"
      subtitle="Create your workspace identity and start messaging instantly."
      footer={
        <>
          Already have an account?{" "}
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
        <input
          type="email"
          placeholder="Email"
          className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="User Name"
          className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm hover:shadow-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-md hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
