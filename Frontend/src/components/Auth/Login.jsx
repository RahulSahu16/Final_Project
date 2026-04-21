import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login as loginApi } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function Login({ switchToSignup }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginApi({ email: normalizedEmail, password });
      if (!data?.token || !data?.user) {
        throw new Error("Unexpected login response from server");
      }
      login(data);
      navigate("/");
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed.";
      setMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-center mb-6">
        Login
      </h2>

      {message && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {message}
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div className="mb-2 relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Eye Icon */}
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      {/* Forgot Password */}
      <div className="text-right mb-4">
        <span className="text-sm text-blue-500 cursor-pointer hover:underline">
          Forgot password?
        </span>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#836f39] text-white py-2 rounded-lg hover:bg-[#493a0f] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Google Login */}
      <button className="w-full border py-2 rounded-lg flex items-center justify-center gap-2 transition">
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="google"
          className="w-5 h-5 "
        />
        Login with Google
      </button>

      {/* Switch to Signup */}
      <p className="text-center text-sm mt-5">
        Don’t have an account?{" "}
        <span
          onClick={switchToSignup}
          className="text-blue-500 cursor-pointer hover:underline"
        >
          Signup
        </span>
      </p>
    </form>
  );
}