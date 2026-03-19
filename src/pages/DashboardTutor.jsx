import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./DashboardTutor.css";
import Profile from "./Profile";
export default function TutorDashboard() {
  const [tutorName, setTutorName] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
const tabs = ["Overview", "Requests", "Sessions", "Profile", "Messages","Reviews"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setTutorName(userData.name || "");
        }
      } catch (error) {
        console.error("Error fetching tutor data:", error);
      }
    });

    return () => unsubscribe();
  }, []);
return (
  <div className="dashboard-container">
    <h1>Welcome back, {tutorName || "Tutor"}!</h1>
    <p>Here’s an overview of your tutoring activity and upcoming sessions.</p>

    <div className="dashboard-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`dashboard-tab ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
          
        >
          {tab}
        </button>
      ))}
    </div>

    <div className="dashboard-content">
      {activeTab === "Overview" && (
  <div className="overview-section">
    <h2>Overview</h2>

    <div className="overview-cards">
      <div className="overview-card">
        <h3>Active Students</h3>
        <p>12</p>
      </div>

      <div className="overview-card">
        <h3>Upcoming Sessions</h3>
        <p>4</p>
      </div>

      <div className="overview-card">
        <h3>Pending Requests</h3>
        <p>3</p>
      </div>

      <div className="overview-card">
        <h3>Average Rating</h3>
        <p>4.8</p>
      </div>
    </div>

    <div className="next-session">
      <h3>Next Session</h3>
      <p>Math with Anna K. — Today at 18:00</p>
    </div>

    <div className="recent-requests">
      <h3>New Student Requests</h3>
      <p>Nikos T. — High School Math</p>
      <p>Maria P. — Science Help</p>
    </div>
  </div>
)}

      {activeTab === "Requests" && (
        <div className="requests-section">
          <h2>Requests</h2>
          <p>Here you will manage student requests.</p>
        </div>
      )}

      {activeTab === "Sessions" && (
        <div className="sessions-section">
          <h2>Sessions</h2>
          <p>Here you will see your upcoming and past sessions.</p>
        </div>
      )}

      {activeTab === "Profile" && (
        
        <Profile />
      )}

      {activeTab === "Messages" && (
        <div className="messages-section">
          <h2>Messages</h2>
          <p>Here you will view your messages.</p>
        </div>
      )}

      {activeTab === "Reviews" && (
        <div className="reviews-section">
          <h2>Reviews</h2>
          <p>Here you will see your reviews and rating.</p>
        </div>
      )}
    </div>
  </div>
);
}