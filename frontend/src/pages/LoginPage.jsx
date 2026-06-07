import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api.js";
import { AuthContext } from "../context/AuthContext.jsx";

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
        navigate("/");
      } else {
        setError(data.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Failed to connect to the server. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-info">
          <span className="login-badge">SAHYOG Portal</span>

          <h1>
            Welcome Back,
            <br />
            NITRRian.
          </h1>

          <p>
            Access academic resources, mentorship support,
            student welfare services, blood assistance,
            and community initiatives through a single platform.
          </p>

          <div className="signup-features">
  <div className="feature-item">
    📚 Notes, PYQs & Resources
  </div>

  <div className="feature-item">
    🤝 Mentorship & Student Support
  </div>

  <div className="feature-item">
    🩸 Blood Assistance & Community Help
  </div>
</div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Login</h2>
            <p>Login to access notes, mentorship resources,
               student support services and portal features.</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-login-form">
            <div className="login-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? "Logging In..." : "Login to Portal"}
            </button>
          </form>

          <p className="login-footer-text">
            New to SAHYOG? <Link to="/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;