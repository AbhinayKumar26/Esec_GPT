import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

    const handleSendOTP = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
        const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
            email,
        }),
        });

        setSuccess(res.message);

        navigate("/verify-otp", {
          state: {
            email,
          },
        });

    } catch (err) {
        setError(err.message || "Failed to send OTP");
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="authPage">
      <div className="authCard">
        <h2>Forgot Password</h2>

        {error && <div className="authErr">{error}</div>}

        {success && (
        <div className="authSuccess">
            {success}
        </div>
        )}

        <form onSubmit={handleSendOTP}>
          <input
            className="authInput"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="authBtn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="authLinkText">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}