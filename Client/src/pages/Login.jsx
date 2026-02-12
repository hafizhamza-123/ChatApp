import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await login(email, password);

    if (res.success) {
      setMessage({
        type: "success",
        text: "Login successful! Redirecting...",
      });

      setTimeout(() => {
        navigate("/chat", { replace: true });
      }, 1200);
    } else {
      setMessage({
        type: "error",
        text: res.message || "Invalid credentials",
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-violet-50 font-inter">
      <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-10 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          Login
        </h2>

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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Register
          </Link>
        </p>

        <p className="mt-2 text-sm text-center text-gray-500">
          <Link
            to="/forgot-password"
            className="hover:text-indigo-600 hover:underline cursor-pointer"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
