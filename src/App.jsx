
import './App.css'
import Navbar from './components/Navbar.jsx'
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import { RegisterStudent, RegisterTutor } from './pages/Register.jsx';
import { Toaster } from "react-hot-toast";
import Login from './pages/Login.jsx';
import { TutorDashboard, StudentDashboard } from './pages/Dashboard.jsx';
import FindTutors from './pages/FindTutors.jsx';
function App() {
 

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
         
          <Route path="/tutor-dashboard" element={<TutorDashboard />} /> 
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/find-tutors" element={<FindTutors />} />
    </Routes>
   
    </>
  )
}

export default App
