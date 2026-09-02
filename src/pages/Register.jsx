import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Zap,
  Mail,
  Lock,
  User,
  Loader2,
} from "lucide-react";

import { auth } from "../firebase/firebase";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account already exists with this email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Please choose a stronger password.");
          break;

        default:
          setError("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-container">

        {/* LEFT SIDE */}
        <div className="register-info">

          <div className="register-brand">

            <div className="register-brand-icon">
              <Zap size={25} fill="currentColor" />
            </div>

            <div>
              <h1>EBuddy</h1>
              <span>Smart EB Manager</span>
            </div>

          </div>

          <div className="register-info-content">

            <h2>
              Start managing your
              <span> electricity </span>
              smarter.
            </h2>

            <p>
              Create your EBuddy account and keep all your
              electricity meters, readings and bill information
              organized in one place.
            </p>

          </div>

          <div className="register-features">

            <div className="register-feature">
              <span>🏠</span>
              <p>Manage multiple properties</p>
            </div>

            <div className="register-feature">
              <span>⚡</span>
              <p>Track meter readings</p>
            </div>

            <div className="register-feature">
              <span>📊</span>
              <p>Understand your usage</p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="register-form-section">

          {/* Mobile Brand */}
          <div className="register-mobile-brand">

            <div className="register-brand-icon">
              <Zap size={24} fill="currentColor" />
            </div>

            <div>
              <h1>EBuddy</h1>
              <span>Smart EB Manager</span>
            </div>

          </div>

          <div className="register-header">

            <h2>Create your account</h2>

            <p>
              Start managing your EB meters today.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="register-message">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* NAME */}
            <div className="register-input-group">

              <label>Full Name</label>

              <div className="register-input-wrapper">

                <User size={19} />

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="register-input-group">

              <label>Email Address</label>

              <div className="register-input-wrapper">

                <Mail size={19} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="register-input-group">

              <label>Password</label>

              <div className="register-input-wrapper">

                <Lock size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
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

            {/* CONFIRM PASSWORD */}
            <div className="register-input-group">

              <label>Confirm Password</label>

              <div className="register-input-wrapper">

                <Lock size={19} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="register-spinner"
                  />
                  Creating account...
                </>
              ) : (
                <>
                  <Zap size={19} />
                  Create EBuddy Account
                </>
              )}

            </button>

          </form>

          {/* LOGIN */}
          <div className="login-existing">

            <p>
              Already have an account?{" "}

              <Link to="/login">
                Login
              </Link>
            </p>

          </div>

          <div className="register-footer">
            © {new Date().getFullYear()} EBuddy
          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;