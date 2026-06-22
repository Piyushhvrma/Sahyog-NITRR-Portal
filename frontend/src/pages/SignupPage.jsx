import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import sahyogLogo from "../assets/sahyog-logo.png";

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

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);

        return;
      }

      setError(data.message || "Signup Failed");
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
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
          navigate("/", { replace: true });
        }, 800);

        return;
      }

      setError(data.message || "Google Signup Failed");
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Google Signup Failed");
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

        <h1>Create Account</h1>

        <p>
  Create your SAHYOG account to explore academic resources,
  receive important updates, connect with support services, and
  stay involved with student wellbeing initiatives.
</p>

        {isLoading && (
          <div className="auth-loading-v2">
            Creating your account, please wait...
          </div>
        )}

        <div className="auth-google-box">
          {isLoading ? (
            <div className="google-loading">
              <div className="loader"></div>
              <span>Setting up your account...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => setError("Google Signup Failed")}
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
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {error && <div className="auth-error-v2">{error}</div>}

        <p className="auth-switch-v2">
          Already have an account?
          <Link to="/login"> Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;