import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import sahyogLogo from "../assets/sahyog-logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);

        setTimeout(() => {
          navigate("/");
        }, 500);

        return;
      }

      setError(data.message || "Login failed.");
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);

        setTimeout(() => {
          navigate("/");
        }, 800);

        return;
      }

      setError(data.message || "Google Login Failed");
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Google Login Failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-v2">
      <div className="auth-card-v2">
        <div className="auth-logo-v2"><img
    src={sahyogLogo}
    alt="SAHYOG"
    className="auth-logo-img"
  /></div>

        <h1>Welcome Back</h1>

        <p>
  Access your SAHYOG dashboard for PYQs, notes, club events,
  blood support, announcements, and student help services — all
  in one trusted NIT Raipur portal.
</p>

        {isLoading && (
          <div className="auth-loading-v2">
            Signing you in, please wait...
          </div>
        )}

        <div className="auth-google-box">
          {isLoading ? (
            <div className="google-loading">
              <div className="loader"></div>
              <span>Authenticating...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google Login Failed")}
              theme="outline"
              size="large"
              shape="pill"
              width="320"
            />
          )}
        </div>

        <div className="auth-divider-v2">
          <span>OR</span>
        </div>

        <form className="auth-form-v2" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="auth-submit-v2"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {error && <div className="auth-error-v2">{error}</div>}

        <p className="auth-switch-v2">
          Don't have an account?
          <Link to="/signup"> Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;