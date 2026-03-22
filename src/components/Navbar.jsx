import { Link, NavLink, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "./Navbar.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSignupOpen, setIsMobileSignupOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);

        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRole(userData.role || null);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setLoggedIn(false);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
      setIsDropdownOpen(false);
      setIsMobileSignupOpen(false);
      toast.success("Signed out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out.");
    }
  };

  const dashboardPath =
    role === "student"
      ? "/student-dashboard"
      : role === "tutor"
      ? "/tutor-dashboard"
      : "/";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="TutorMatch logo" />
          </Link>

          <ul className="navbar-links">
            <li>
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/tutors" className="nav-link">
                Find Tutors
              </NavLink>
            </li>
            <li>
              <NavLink to="/how-it-works" className="nav-link">
                How it works
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="navbar-actions">
          {loggedIn ? (
            <>
              <Link to={dashboardPath} className="dashboard-link">
                Dashboard
              </Link>

              <button type="button" className="logout-btn" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Log in
              </Link>

              <div
                className="dropdown"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className="signup-btn"
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  Sign up <span className="arrow">▼</span>
                </button>

                {isDropdownOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/signup/student">As Student</Link>
                    </li>
                    <li>
                      <Link to="/signup/tutor">As Tutor</Link>
                    </li>
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <NavLink
            to="/"
            className="mobile-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/tutors"
            className="mobile-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Find Tutors
          </NavLink>

          <NavLink
            to="/how-it-works"
            className="mobile-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How it works
          </NavLink>

          {loggedIn ? (
            <>
              <NavLink
                to={dashboardPath}
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>

              <button
                type="button"
                className="mobile-signout-btn"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </NavLink>

              <button
                className="mobile-signup-toggle"
                type="button"
                onClick={() => setIsMobileSignupOpen((prev) => !prev)}
              >
                Sign up <span className="arrow">▼</span>
              </button>

              {isMobileSignupOpen && (
                <div className="mobile-signup-links">
                  <Link
                    to="/signup/student"
                    className="mobile-sublink"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsMobileSignupOpen(false);
                    }}
                  >
                    As Student
                  </Link>

                  <Link
                    to="/signup/tutor"
                    className="mobile-sublink"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsMobileSignupOpen(false);
                    }}
                  >
                    As Tutor
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;