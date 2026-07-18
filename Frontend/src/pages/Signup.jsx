import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import "./Auth.css";

export default function Signup() {
  const nav = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signup(email, password);
      nav("/app");
    } catch (e2) {
      setErr(e2?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setErr("");
    setLoading(true);
    try {
      await loginWithGoogle();
      nav("/app");
    } catch (e2) {
      setErr(e2?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h2>Signup</h2>

        {err && <div className="authErr">{err}</div>}

        <button className="authBtn googleBtn" onClick={onGoogle} disabled={loading} type="button">
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        <form onSubmit={onSignup}>
          <input
            className="authInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="authInput"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button className="authBtn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="authLinkText">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
