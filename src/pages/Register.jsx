import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import toast from "react-hot-toast";
import { getErrorMessage } from "../ErrorMessage";
import { registerWithEmail } from "../services/authService";
import { createUserProfile } from "../services/userService";

function RegisterStudent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
  e.preventDefault();

  const cleanEmail = email.trim();

  if (password !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  try {
    const userCredential = await registerWithEmail({
      email: cleanEmail,
      password,
    });

    const user = userCredential.user;

    await createUserProfile({
      uid: user.uid,
      name,
      email: cleanEmail,
      role: "student",
      extraData: {
        gradeLevel,
      },
    });

    toast.success("Student account created!");

    setTimeout(() => {
      navigate("/student-dashboard");
    }, 1200);
  } catch (error) {
    console.error("Register student error:", error);
    toast.error(getErrorMessage(error));
  }
};

  return (
    <section className="register-page">
      <div className="register-card">
        <div className="register-header">
          <span className="register-badge">Student account</span>
          <h1>Create your student account</h1>
          <p>Join TutorMatch and start finding the right tutor for your goals.</p>
        </div>

        <form className="register-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="student-name">Full name</label>
            <input
              id="student-name"
              type="text"
              value={name}
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="student-email">Email</label>
            <input
              id="student-email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="student-password">Password</label>
              <input
                id="student-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="student-confirm-password">Confirm password</label>
              <input
                id="student-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="grade-level">Grade level</label>
            <select
              id="grade-level"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              required
            >
             
              <option value="">Select grade level</option>
              <option value="elementary">Elementary</option>
              <option value="middle-school">Middle School</option>
              <option value="highschool">High School</option>
              <option value="university">University</option>
              <option value="adult-learners">Adult Learners</option>
            </select>
          </div>

          <button type="submit" className="register-button">
            Create Student Account
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="register-footer-link">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

function RegisterTutor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
  e.preventDefault();

  const cleanEmail = email.trim();

  if (password !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  try {
    const userCredential = await registerWithEmail({
      email: cleanEmail,
      password,
    });

    const user = userCredential.user;

    await createUserProfile({
      uid: user.uid,
      name,
      email: cleanEmail,
      role: "tutor",
    });

    toast.success("Tutor account created!");

    setTimeout(() => {
      navigate("/tutor-dashboard");
    }, 1200);
  } catch (error) {
    console.error("Register tutor error:", error);
    toast.error(getErrorMessage(error));
  }
};

  return (
    <section className="register-page">
      <div className="register-card">
        <div className="register-header">
          <span className="register-badge">Tutor account</span>
          <h1>Create your tutor account</h1>
          <p>Set up your profile and start connecting with students.</p>
        </div>

        <form className="register-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="tutor-name">Full name</label>
            <input
              id="tutor-name"
              type="text"
              value={name}
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="tutor-email">Email</label>
            <input
              id="tutor-email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="tutor-password">Password</label>
              <input
                id="tutor-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="tutor-confirm-password">Confirm password</label>
              <input
                id="tutor-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="register-button">
            Create Tutor Account
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="register-footer-link">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

export { RegisterStudent, RegisterTutor };