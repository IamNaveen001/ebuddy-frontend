import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Zap,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";

import { auth } from "../firebase/firebase";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // EMAIL / PASSWORD LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/wrong-password":
          setError("Incorrect password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          setError(
            "Too many attempts. Please try again later."
          );
          break;

        default:
          setError(
            "Something went wrong. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-in was cancelled.");
          break;

        case "auth/popup-blocked":
          setError(
            "Google popup was blocked. Please allow popups."
          );
          break;

        case "auth/account-exists-with-different-credential":
          setError(
            "An account already exists with this email using another login method."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            "Unable to sign in with Google. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Enter your email first to reset your password."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      setSuccess(
        "Password reset link has been sent to your email."
      );
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        default:
          setError(
            "Unable to send reset email. Please try again."
          );
      }
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="login-info">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-icon">
              <Zap
                size={25}
                fill="currentColor"
              />
            </div>

            <div>
              <h1>EBuddy</h1>

              <span>
                Smart EB Manager
              </span>
            </div>

          </div>

          {/* CONTENT */}

          <div className="info-content">

            <h2>
              Manage your
              <span> EB meters </span>
              smarter.
            </h2>

            <p>
              Track electricity readings, monitor your
              consumption, estimate your bill and manage
              multiple EB meters from one place.
            </p>

          </div>

          {/* FEATURES */}

          <div className="features">

            <div className="feature">
              <span>⚡</span>

              <p>
                Multiple EB meter management
              </p>
            </div>

            <div className="feature">
              <span>📊</span>

              <p>
                Smart usage tracking
              </p>
            </div>

            <div className="feature">
              <span>💰</span>

              <p>
                Estimated bill calculation
              </p>
            </div>

          </div>

        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="login-form-section">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="brand-icon">
              <Zap
                size={24}
                fill="currentColor"
              />
            </div>

            <div>
              <h1>EBuddy</h1>

              <span>
                Smart EB Manager
              </span>
            </div>

          </div>

          {/* HEADER */}

          <div className="form-header">

            <h2>
              Welcome back 👋
            </h2>

            <p>
              Login to manage your EB meters.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="message success">
              {success}
            </div>
          )}

          {/* =================================
              EMAIL LOGIN FORM
          ================================= */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="input-group">

              <label>
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail size={19} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <div className="password-label">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>

              </div>

              <div className="input-wrapper">

                <Lock size={19} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="spinner"
                  />

                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={19} />

                  Login to EBuddy
                </>
              )}

            </button>

          </form>

          {/* =================================
              DIVIDER
          ================================= */}

          <div className="login-divider">

            <span>
              OR
            </span>

          </div>

          {/* =================================
              GOOGLE LOGIN
          ================================= */}

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >

            {/* Google Icon */}

            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <path
                fill="#4285F4"
                d="M21.35 12.2c0-.72-.06-1.43-.18-2.1H12v3.98h5.22a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.93-4.2 2.93-7.27Z"
              />

              <path
                fill="#34A853"
                d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z"
              />

              <path
                fill="#FBBC05"
                d="M6.53 13.84A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.84V7.63H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.37l3.24-2.53Z"
              />

              <path
                fill="#EA4335"
                d="M12 6.13c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.13 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.38l3.24 2.53c.77-2.31 2.93-4.03 5.47-4.03Z"
              />

            </svg>

            Continue with Google

          </button>

          {/* =================================
              REGISTER
          ================================= */}

          <div className="register-link">

            <p>
              Don't have an account?{" "}

              <Link to="/register">
                Create account
              </Link>
            </p>

          </div>

          {/* FOOTER */}

          <div className="login-footer">

            © {new Date().getFullYear()} EBuddy

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;