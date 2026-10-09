
import './App.css'
import Navbar from './components/Navbar.jsx'
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile } from "./services/userService";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Home from './pages/Home.jsx';
import { RegisterStudent, RegisterTutor } from './pages/Register.jsx';
import { Toaster } from "react-hot-toast";
import Login from './pages/Login.jsx';
import { TutorDashboard, StudentDashboard } from './pages/dashboard/Dashboard.jsx';
import FindTutors from './pages/FindTutors.jsx';
function ProtectedDashboard({ role, children }) {
  const [account, setAccount] = useState({ loading: true, role: null });
  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const current = ++revision;
      if (!user) {
        if (active) setAccount({ loading: false, role: null });
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        if (active && current === revision) setAccount({ loading: false, role: profile.exists() ? profile.data().role : null });
      } catch {
        if (active && current === revision) setAccount({ loading: false, role: null });
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);
  if (account.loading) return <main className="route-message" role="status">Loading your dashboard…</main>;
  if (!["student", "tutor"].includes(account.role)) return <Navigate to="/login" replace />;
  if (account.role !== role) return <Navigate to={account.role === "tutor" ? "/tutor-dashboard" : "/student-dashboard"} replace />;
  return children;
}

function App() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const titles = { "/": "Find your next tutor", "/find-tutors": "Find tutors", "/login": "Log in", "/signup/student": "Student sign up", "/signup/tutor": "Tutor sign up", "/tutor-dashboard": "Tutor dashboard", "/student-dashboard": "Student dashboard", "/how-it-works": "How it works" };
    document.title = `TutorMatch | ${titles[pathname] || "Page not found"}`;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);


  return (
    <>
    <Toaster
  position="top-right"
  containerStyle={{ top: 100 }}
  toastOptions={{
    style: {
      background: "#ffffff",
      color: "#1f2937",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "14px 16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    },
    success: {
      iconTheme: {
        primary: "#004aad",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#dc2626",
        secondary: "#fff",
      },

        duration: 5000,
    },

  }}
/>
     <Navbar />
    <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signup/student" element={<RegisterStudent />} />
        <Route path="/signup/tutor" element={<RegisterTutor />} />
        <Route path="/login" element={<Login />} />

          <Route path="/tutor-dashboard" element={<ProtectedDashboard role="tutor"><TutorDashboard /></ProtectedDashboard>} />
          <Route path="/student-dashboard" element={<ProtectedDashboard role="student"><StudentDashboard /></ProtectedDashboard>} />
          <Route path="/find-tutors" element={<FindTutors />} />
        <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
        <Route path="*" element={<main className="route-message"><h1>Page not found</h1><p>Let’s get you back to learning.</p><Link to="/">Back to home</Link></main>} />
    </Routes>

    </>
  )
}

export default App
