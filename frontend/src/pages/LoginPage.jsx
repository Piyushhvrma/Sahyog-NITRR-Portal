import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
  login(data.token, data.user);

  setTimeout(() => {
    navigate("/");
  }, 500);

  return;
} else {
        setError(data.message || "Login failed.");
      }
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
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <span className="auth-badge">Sahyog Platform</span>

          <h1>
            Everything You Need
            <span> In One Place</span>
          </h1>

          <p>
            Learn smarter, connect faster and access everything
            you need for campus life — from academics to student support.
          </p>

          <div className="auth-features">
            <div className="feature-card">📚 Notes & Resources</div>
            <div className="feature-card">📝 PYQ Collection</div>
            <div className="feature-card">🎓 Student Support Desk</div>
            <div className="feature-card">🩸 Blood Assistance</div>
            <div className="feature-card">🎉 Events & Registration</div>
            <div className="feature-card">📊 Smart Dashboard</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Sign In</h2>
            <p>Continue to your account</p>
          </div>

  

{isLoading && (
  <p
    style={{
      color: "#93c5fd",
      textAlign: "center",
      marginBottom: "12px",
      fontWeight: "600",
    }}
  >
    Signing you in, please wait...
  </p>
)}

<div className="google-login-wrapper">

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

          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleSubmit}>
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
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {error && (
            <p style={{ color: "#ff6b6b", marginTop: "15px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <p className="auth-footer">
            Don't have an account?
            <Link to="/signup"> Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
    
  );
};

export default LoginPage;