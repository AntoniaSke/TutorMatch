
import './App.css'
import Navbar from './components/Navbar.jsx'
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import { RegisterStudent, RegisterTutor } from './pages/Register.jsx';
import { Toaster } from "react-hot-toast";
function App() {
 

  return (
    <>
     <Navbar />
    <Routes>
       
        <Route path="/" element={<Home />} />
        <Route path="/signup/student" element={<RegisterStudent />} />
        <Route path="/signup/tutor" element={<RegisterTutor />} />
    </Routes>
    <Toaster position="top-right" />
    </>
  )
}

export default App
