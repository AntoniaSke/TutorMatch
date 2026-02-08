import { Link } from 'react-router-dom';
import React, { useState } from "react";
import logo from '../assets/logo.png'
import './Navbar.css'
function Navbar() {

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/"><img src={logo} alt="Logo" /></Link>
            </div>
            <ul className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/about">Find Tutors</Link>
                <Link to="/contact">How it works</Link>
                <Link to="/login">Log in</Link>
                <li className="dropdown">
                    <span className="dropdown-trigger">Sign up</span>

                    <ul className="dropdown-menu">
                        <li><Link to="/signup/student">As Student</Link></li>
                        <li><Link to="/signup/tutor">As Tutor</Link></li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;