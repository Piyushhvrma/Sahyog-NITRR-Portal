import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import sahyogLogo from "../assets/sahyog-logo.png";

import {
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const clearStatus = () => {
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      clearStatus();

      const data = await loginUser({
        email,
        password,
      });

      login(data.user);

      setStatus({
        type: "success",
        message: "Login successful. Redirecting...",
      });

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Login failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      clearStatus();

      const data = await forgotPassword(email);

      setOtpSent(true);
      setStatus({
        type: "success",
        message: data.message || "OTP sent to your email.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to send OTP.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      clearStatus();

      const data = await resetPassword({
        email,
        otp,
        newPassword,
      });

      setStatus({
        type: "success",
        message: data.message || "Password reset successful. Please login.",
      });

      setForgotMode(false);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
      setPassword("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to reset password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      clearStatus();

      const data = await googleLogin(credentialResponse.credential);

      login(data.user);

      setStatus({
        type: "success",
        message: "Google login successful. Redirecting...",
      });

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Google Login Failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToForgotMode = () => {
    setForgotMode(true);
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    clearStatus();
  };

  const switchToLoginMode = () => {
    setForgotMode(false);
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    clearStatus();
  };

  return (
    <div className="auth-page-v2">
      <div className="auth-card-v2">
        <div className="auth-logo-v2">
          <img src={sahyogLogo} alt="SAHYOG" className="auth-logo-img" />
        </div>

        <h1>{forgotMode ? "Reset Password" : "Welcome Back"}</h1>

        <p>
          {forgotMode
            ? "Enter your registered email and reset your SAHYOG account password using OTP verification."
            : "Access your SAHYOG dashboard for PYQs, notes, club events, blood support, announcements, and student help services — all in one trusted NIT Raipur portal."}
        </p>

        {isLoading && <div className="auth-loading-v2">Please wait...</div>}

        {!forgotMode && (
          <>
            <div className="auth-google-box">
              {isLoading ? (
                <div className="google-loading">
                  <div className="loader"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() =>
                    setStatus({
                      type: "error",
                      message: "Google Login Failed.",
                    })
                  }
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

            <p
              style={{
                textAlign: "right",
                marginTop: "10px",
                marginBottom: "15px",
              }}
            >
              <button
                type="button"
                onClick={switchToForgotMode}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </p>
          </>
        )}

        {forgotMode && (
          <>
            {!otpSent ? (
              <form className="auth-form-v2" onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="Registered Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="auth-submit-v2"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form className="auth-form-v2" onSubmit={handleResetPassword}>
                <input
                  type="email"
                  placeholder="Registered Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="auth-submit-v2"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            <p className="auth-switch-v2">
              <button
                type="button"
                onClick={switchToLoginMode}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6ee7ff",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "inherit",
                }}
              >
                Back to Login
              </button>
            </p>
          </>
        )}

        {status.message && (
          <div
            className="auth-error-v2"
            style={{
              color: status.type === "success" ? "#22c55e" : "#fecaca",
            }}
          >
            {status.message}
          </div>
        )}

        {!forgotMode && (
          <p className="auth-switch-v2">
            Don't have an account?
            <Link to="/signup"> Sign Up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;