
import './App.css'
import Navbar from './components/Navbar.jsx'
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import { RegisterStudent, RegisterTutor } from './pages/Register.jsx';
import { Toaster } from "react-hot-toast";
import Login from './pages/Login.jsx';
function App() {
 

  return (
    <>
     <Toaster position="top-right" />
     <Navbar />
    <Routes>
       
        <Route path="/" element={<Home />} />
        <Route path="/signup/student" element={<RegisterStudent />} />
        <Route path="/signup/tutor" element={<RegisterTutor />} />
        <Route path="/login" element={<Login />} />
         {/* <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} /> */}
    </Routes>
   
    </>
  )
}

export default App
