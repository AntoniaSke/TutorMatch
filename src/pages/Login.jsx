import { Link } from "react-router-dom";
import React, { useState } from "react";
import "./Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.role === "student") {
            
          navigate("/student-dashboard");
        } else if (userData.role === "tutor") {
 console.log("Navigating to tutor dashboard");
            navigate("/tutor-dashboard");
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <input
              type="password"
              id="password"
              name="password"
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