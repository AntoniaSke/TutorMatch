import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import "./Login.css";
import toast from "react-hot-toast";
import { loginWithEmail, sendResetPasswordEmail } from "../services/authService";
import { getUserProfile } from "../services/userService";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

 const handleForgotPassword = async (email) => {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    toast.error("Please enter your email to reset password.");
    return;
  }

  try {
    await sendResetPasswordEmail(cleanEmail);
    toast.success("Password reset email sent.");
  } catch (error) {
    console.error(error);
    toast.error("Failed to send password reset email.");
  }
};

 const handleLoginSubmit = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await loginWithEmail({ email, password });
    const user = userCredential.user;

    const userDoc = await getUserProfile(user.uid);

    if (!userDoc.exists()) {
        toast.error("User profile not found.");
        return;
    }

    const userData = userDoc.data();

    if (userData.role === "student") {
      navigate("/student-dashboard");
    } else if (userData.role === "tutor") {
      navigate("/tutor-dashboard");
    } else {
      toast.error("Invalid user role.");
    }
  } catch (error) {
    console.error("Login error:", error);

    if (error.code === "auth/invalid-credential") {
      toast.error("Invalid email or password.");
    } else {
      toast.error(error.message);
    }
  }
};

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-badge">Welcome back</span>
          <h1>Log in to TutorMatch</h1>
          <p>Access your account and continue your learning journey.</p>
        </div>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => handleForgotPassword(email)}
              >
                Forgot Password?
              </button>
            </div>

            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Log in
          </button>
        </form>

        <div className="login-footer">
          <h2>Don’t have an account?</h2>
          <div className="signup-links">
            <Link to="/signup/student" className="signup-link secondary">
              Sign up as Student
            </Link>
            <Link to="/signup/tutor" className="signup-link primary">
              Sign up as Tutor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}