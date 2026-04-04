import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
// import "./Auth.css";

import "./pages/Auth.css";

export default function Login() {
  const nav = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/app");
    } catch (e2) {
      setErr(e2?.message || "Login failed");
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
      setErr(e2?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h2>Login</h2>

        {err && <div className="authErr">{err}</div>}

        <button className="authBtn googleBtn" onClick={onGoogle} disabled={loading} type="button">
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        <form onSubmit={onLogin}>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="authBtn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="authLinkText">
          Don&apos;t have account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
}
