import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Dashboard.css";
import { ProfileTutor, ProfileStudent } from "./Profile";
import toast from "react-hot-toast";

import TutorRequestsPanel from "./tutor/TutorRequestsPanel";
import StudentRequestsPanel from "./student/StudentRequestsPanel";
import StudentTutorsPanel from "./student/StudentTutorsPanel";
import TutorSessionsPanel from "./tutor/TutorSessionsPanel";
import StudentSessionsPanel from "./student/StudentSessionsPanel";
import TutorStudentsPanel from "./tutor/TutorStudentsPanel";
import TutorOverviewPanel from "./tutor/TutorOverviewPanel";
import StudentOverviewPanel from "./student/StudentOverviewPanel";
import TutorReviewsPanel from "./tutor/TutorReviewsPanel";

import {
  subscribeToTutorSessions,
  subscribeToStudentSessions,
  updateSessionStatus,
} from "../../services/sessionService";

import { subscribeToTutorReviews } from "../../services/reviewService";

function TutorDashboard() {
  const [tutorName, setTutorName] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [requests, setRequests] = useState([]);
  const [currentTutorId, setCurrentTutorId] = useState("");
  const [reviews, setReviews] = useState([]);
  const tabs = ["Overview", "Requests", "Students", "Sessions", "Profile", "Messages", "Reviews"];
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    let unsubscribeRequests = null;
    let unsubscribeSessions = null;
    let unsubscribeReviews = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        setCurrentTutorId(user.uid);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setTutorName(userData.name || "");
        }

        const requestsQuery = query(
          collection(db, "requests"),
          where("tutorId", "==", user.uid),
          //orderBy("createdAt", "desc")
        );

        unsubscribeRequests = onSnapshot(
          requestsQuery,
          (snapshot) => {
            const requestList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRequests(requestList);
          },
          (error) => {
            console.error("Error fetching tutor requests:", error);
          }
        );
        unsubscribeSessions = subscribeToTutorSessions(
          user.uid,
          (sessionList) => {
            setSessions(sessionList);
          },
          (error) => {
            console.error("Error fetching tutor sessions:", error);
          }
        );
        unsubscribeReviews = subscribeToTutorReviews(
          user.uid,
          (reviewList) => {
            setReviews(reviewList);
          },
          (error) => {
            console.error("Error fetching tutor reviews:", error);
          }
        );
      } catch (error) {
        console.error("Error fetching tutor data:", error);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRequests) unsubscribeRequests();
      if (unsubscribeSessions) unsubscribeSessions();
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, []);

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      const requestRef = doc(db, "requests", requestId);
      await updateDoc(requestRef, { status: newStatus });
      toast.success(`Request ${newStatus}.`);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request.");
    }
  };

  const pendingRequestsCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const handleCancelSession = async (sessionId) => {
    try {
      await updateSessionStatus(sessionId, "cancelled");
      toast.success("Session cancelled.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel session.");
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await updateSessionStatus(sessionId, "completed");
      toast.success("Session marked as completed.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update session.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome back, {tutorName || "Tutor"}!</h1>
      <p>Get a clear view of your tutoring activity, upcoming sessions, and student requests.</p>

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
          <TutorOverviewPanel
            requests={requests}
            sessions={sessions}
            reviews={reviews}
          />
        )}

        {activeTab === "Requests" && (
          <TutorRequestsPanel
            requests={requests}
            onUpdateRequestStatus={handleUpdateRequestStatus}
          />
        )}
        {activeTab === "Students" && (
          <TutorStudentsPanel requests={requests} />
        )}
        {activeTab === "Sessions" && (
          <TutorSessionsPanel
            sessions={sessions}
            onCancelSession={handleCancelSession}
            onCompleteSession={handleCompleteSession}
          />
        )}

        {activeTab === "Profile" && <ProfileTutor />}

        {activeTab === "Messages" && (
          <div className="messages-section">
            <h2>Messages</h2>
            <p>Here you will view your messages.</p>
          </div>
        )}

        {activeTab === "Reviews" && (
          <TutorReviewsPanel reviews={reviews} />
        )}
      </div>
    </div>
  );
}

function StudentDashboard() {
  const [studentName, setStudentName] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [requests, setRequests] = useState([]);

  const tabs = ["Overview", "Requests", "My Tutors", "Sessions", "Profile", "Messages"];
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    let unsubscribeRequests = null;
    let unsubscribeSessions = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setStudentName(userData.name || "");
        }

        const requestsQuery = query(
          collection(db, "requests"),
          where("studentId", "==", user.uid),
          //orderBy("createdAt", "desc")
        );

        unsubscribeRequests = onSnapshot(
          requestsQuery,
          (snapshot) => {
            const requestList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRequests(requestList);
          },
          (error) => {
            console.error("Error fetching student requests:", error);
          }
        );
        unsubscribeSessions = subscribeToStudentSessions(
          user.uid,
          (sessionList) => {
            setSessions(sessionList);
          },
          (error) => {
            console.error("Error fetching student sessions:", error);
          }
        );
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRequests) unsubscribeRequests();
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }, []);

  const pendingRequestsCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const acceptedTutorsCount = requests.filter(
    (request) => request.status === "accepted"
  ).length;


  const handleAcceptSession = async (sessionId) => {
    try {
      await updateSessionStatus(sessionId, "confirmed");
      toast.success("Session accepted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept session");
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await updateSessionStatus(sessionId, "cancelled");
      toast.success("Session cancelled.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel session.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome back, {studentName || "Student"}!</h1>
      <p>Manage your lessons, connect with tutors, and stay on top of your learning.</p>

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


      {activeTab === "Overview" && (
        <StudentOverviewPanel
          requests={requests}
          sessions={sessions}
        />
      )}

      {activeTab === "Requests" && (
        <StudentRequestsPanel requests={requests} />
      )}

      {activeTab === "My Tutors" && (
        <StudentTutorsPanel requests={requests} sessions={sessions} />
      )}

      {activeTab === "Sessions" && (
        <StudentSessionsPanel
          sessions={sessions}
          onAcceptSession={handleAcceptSession}
          onCancelSession={handleCancelSession}
        />
      )}

      {activeTab === "Profile" && <ProfileStudent />}

      {activeTab === "Messages" && (
        <div className="messages-section">
          <h2>Messages</h2>
          <p>Here you will view your messages.</p>
        </div>
      )}

    </div>

  );

}

export { TutorDashboard, StudentDashboard };