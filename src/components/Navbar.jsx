import { Link, NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import './Navbar.css';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSignupOpen, setIsMobileSignupOpen] = useState(false);

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
          <NavLink to="/login" className="login-btn">
            Log in
          </NavLink>

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
        </div>
      )}
    </nav>
  );
}

export default Navbar;