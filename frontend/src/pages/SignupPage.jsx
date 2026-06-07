import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api.js";
import { AuthContext } from "../context/AuthContext.jsx";

const SignupPage = () => {
  const [name, setName] = useState("");
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
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-shell">
        {/* LEFT PANEL */}

        <div className="signup-info">
          <span className="signup-badge">
            SAHYOG Portal
          </span>

          <h1>
            Join The
            <br />
            SAHYOG Community.
          </h1>

          <p>
            Create your account to access academic resources,
            mentorship support, student welfare services,
            blood assistance initiatives and club activities.
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

        {/* RIGHT PANEL */}

        <div className="signup-card">
          <div className="signup-card-header">
            <h2>Create Account</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="modern-signup-form"
          >
            <div className="signup-field">
              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="signup-field">
              <label>Email Address</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="signup-field">
              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="signup-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="signup-submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <p className="signup-footer-text">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;