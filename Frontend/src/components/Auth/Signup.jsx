import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendSignupOtp, verifySignupOtp, register } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function Signup({ switchToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const normalizeEmail = () => email.trim().toLowerCase();

  const handleSendOtp = async () => {
    const normalizedEmail = normalizeEmail();

    if (!normalizedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await sendSignupOtp({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setMessage("OTP sent to your email. Please enter it to continue.");
      setStep(2);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send OTP.";
      setMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail = normalizeEmail();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail || !normalizedOtp) {
      setMessage("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      await verifySignupOtp({ email: normalizedEmail, otp: normalizedOtp });
      setMessage("Email verified successfully. Now complete your profile.");
      setStep(3);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to verify OTP.";
      setMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !firstName || !lastName || !password || !confirmPassword) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const data = await register({
        email: normalizedEmail,
        firstName,
        lastName,
        password,
      });
      if (!data?.token || !data?.user) {
        throw new Error("Unexpected signup response from server");
      }
      login(data);
      navigate("/");
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create account.";
      setMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (step === 1) {
      handleSendOtp();
      return;
    }

    if (step === 2) {
      handleVerifyOtp();
      return;
    }

    handleCreateAccount();
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-semibold text-center mb-6">
        Signup
      </h2>

      <p className="mb-4 text-center text-sm text-gray-600">
        {step === 1 && "Step 1 of 3: Verify your email"}
        {step === 2 && "Step 2 of 3: Enter OTP"}
        {step === 3 && "Step 3 of 3: Complete your account"}
      </p>

      {message && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {message}
        </div>
      )}

      <>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={step !== 1}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />

        {step === 2 && (
          <>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mb-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setMessage("You can update the email and request a new OTP.");
                }}
                className="text-blue-500 hover:underline"
              >
                Change email
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                className="text-blue-500 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#836f39] text-white py-2 rounded-lg hover:bg-[#493a0f] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && step === 1 && "Sending OTP..."}
          {loading && step === 2 && "Verifying OTP..."}
          {loading && step === 3 && "Creating account..."}
          {!loading && step === 1 && "Send OTP"}
          {!loading && step === 2 && "Verify OTP"}
          {!loading && step === 3 && "Create Account"}
        </button>
      </>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Google Signup */}
      <button className="w-full border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100">
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          className="w-5 h-5"
        />
        Signup with Google
      </button>

      {/* Switch */}
      <p className="text-center text-sm mt-5">
        Already have an account?{" "}
        <span
          onClick={switchToLogin}
          className="text-blue-500 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </form>
  );
}
