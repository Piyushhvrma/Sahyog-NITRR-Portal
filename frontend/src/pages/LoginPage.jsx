import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

import sahyogLogo from "../assets/sahyog-logo.png";
import authPreview from "../assets/auth-portal-preview.png";

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

  const [status, setStatus] = useState({
    type: null,
    message: "",
  });

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const clearStatus = () => {
    setStatus({
      type: null,
      message: "",
    });
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
        message:
          data.message ||
          "OTP sent to your registered email.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message || "Failed to send OTP.",
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
        message:
          data.message ||
          "Password reset successful. Please login.",
      });

      setForgotMode(false);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
      setPassword("");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Failed to reset password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (
    credentialResponse
  ) => {
    try {
      setIsLoading(true);
      clearStatus();

      const data = await googleLogin(
        credentialResponse.credential
      );

      login(data.user);

      setStatus({
        type: "success",
        message:
          "Google login successful. Redirecting...",
      });

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Google Login Failed.",
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
      <section className="auth-card-v2">
        <div className="auth-brand-row">
          <img
            src={sahyogLogo}
            alt="SAHYOG"
            className="auth-logo-img"
          />

          <div>
            <span>SAHYOG Student Portal</span>
            <strong>NIT Raipur</strong>
          </div>
        </div>

        <div className="auth-preview-box">
          <img
            src={authPreview}
            alt="SAHYOG student portal preview"
          />
        </div>

        <h1>
          {forgotMode
            ? "Reset Password"
            : "Welcome Back"}
        </h1>

        <p className="auth-intro-text">
          {forgotMode
            ? "Enter your registered email and verify the OTP to securely reset your password."
            : "Sign in to access academic resources, previous-year questions, student support, blood assistance and important campus updates."}
        </p>

        {isLoading && (
          <div className="auth-loading-v2">
            Please wait...
          </div>
        )}

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
                      message:
                        "Google Login Failed.",
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

            <form
              className="auth-form-v2"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="submit"
                className="auth-submit-v2"
                disabled={isLoading}
              >
                {isLoading
                  ? "Signing In..."
                  : "Sign In"}
              </button>
            </form>

            <button
              type="button"
              className="auth-text-btn"
              onClick={switchToForgotMode}
            >
              Forgot Password?
            </button>
          </>
        )}

        {forgotMode && (
          <>
            {!otpSent ? (
              <form
                className="auth-form-v2"
                onSubmit={handleForgotPassword}
              >
                <input
                  type="email"
                  placeholder="Registered Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <button
                  type="submit"
                  className="auth-submit-v2"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Sending OTP..."
                    : "Send OTP"}
                </button>
              </form>
            ) : (
              <form
                className="auth-form-v2"
                onSubmit={handleResetPassword}
              >
                <input
                  type="email"
                  placeholder="Registered Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="submit"
                  className="auth-submit-v2"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
              </form>
            )}

            <button
              type="button"
              className="auth-text-btn"
              onClick={switchToLoginMode}
            >
              Back to Login
            </button>
          </>
        )}

        {status.message && (
          <div
            className={`auth-status-v2 ${status.type}`}
          >
            {status.message}
          </div>
        )}

        {!forgotMode && (
          <p className="auth-switch-v2">
            New to SAHYOG?
            <Link to="/signup">
              {" "}
              Create Account
            </Link>
          </p>
        )}
      </section>
    </div>
  );
};

export default LoginPage;