import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

import sahyogLogo from "../assets/sahyog-logo.png";
import authPreview from "../assets/auth-portal-preview.png";

import {
  registerUser,
  googleLogin,
} from "../api";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [status, setStatus] = useState({
    type: null,
    message: "",
  });

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      setStatus({
        type: null,
        message: "",
      });

      const data = await registerUser({
        name,
        email,
        password,
      });

      login(data.user);

      setStatus({
        type: "success",
        message:
          "Account created successfully. Redirecting...",
      });

      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 500);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message || "Signup failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (
    credentialResponse
  ) => {
    try {
      setIsLoading(true);

      setStatus({
        type: null,
        message: "",
      });

      const data = await googleLogin(
        credentialResponse.credential
      );

      login(data.user);

      setStatus({
        type: "success",
        message:
          "Google signup successful. Redirecting...",
      });

      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 800);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Google Signup Failed.",
      });
    } finally {
      setIsLoading(false);
    }
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

        <h1>Create Account</h1>

        <p className="auth-intro-text">
          Create your student account to access
          academic resources, previous-year
          questions, campus updates, blood
          assistance and SAHYOG support services.
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
              <span>Setting up...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() =>
                setStatus({
                  type: "error",
                  message:
                    "Google Signup Failed.",
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
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

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
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {status.message && (
          <div
            className={`auth-status-v2 ${status.type}`}
          >
            {status.message}
          </div>
        )}

        <p className="auth-switch-v2">
          Already have an account?
          <Link to="/login">
            {" "}
            Sign In
          </Link>
        </p>
      </section>
    </div>
  );
};

export default SignupPage;