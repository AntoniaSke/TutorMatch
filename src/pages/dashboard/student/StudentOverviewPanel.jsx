import React, { useMemo } from "react";
import "../OverviewPanel.css";

export default function StudentOverviewPanel({ requests, sessions }) {
  const pendingRequestsCount = useMemo(() => {
    return requests.filter((request) => request.status === "pending").length;
  }, [requests]);

  const activeTutorsCount = useMemo(() => {
    return new Set(
      requests
        .filter((request) => request.status === "accepted")
        .map((request) => request.tutorId)
    ).size;
  }, [requests]);

  const upcomingSessionsCount = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.status === "pending" || session.status === "confirmed"
    ).length;
  }, [sessions]);

  const completedLessonsCount = useMemo(() => {
    return sessions.filter((session) => session.status === "completed").length;
  }, [sessions]);

  const recentRequests = useMemo(() => {
    return [...requests].slice(0, 3);
  }, [requests]);

  const recentSessions = useMemo(() => {
    return [...sessions].slice(0, 3);
  }, [sessions]);

  return (
    <div className="overview-panel">
      <div className="overview-header">
        <h2>Overview</h2>
        <p>Here’s an overview of your lessons, tutors, and upcoming activity.</p>
      </div>

      <div className="overview-cards-grid">
        <div className="overview-stat-card">
          <span className="overview-stat-label">Upcoming Sessions</span>
          <span className="overview-stat-value">{upcomingSessionsCount}</span>
        </div>

        <div className="overview-stat-card">
          <span className="overview-stat-label">Active Tutors</span>
          <span className="overview-stat-value">{activeTutorsCount}</span>
        </div>

        <div className="overview-stat-card">
          <span className="overview-stat-label">Pending Requests</span>
          <span className="overview-stat-value">{pendingRequestsCount}</span>
        </div>

        <div className="overview-stat-card">
          <span className="overview-stat-label">Completed Lessons</span>
          <span className="overview-stat-value">{completedLessonsCount}</span>
        </div>
      </div>

      <div className="overview-sections-grid">
        <div className="overview-info-card">
          <h3>Recent Requests</h3>

          {recentRequests.length > 0 ? (
            <div className="overview-list">
              {recentRequests.map((request) => (
                <div key={request.id} className="overview-list-item">
                  <div>
                    <strong>{request.tutorName}</strong>
                    <p>{request.subject}</p>
                  </div>

                  <span className={`overview-badge status-${request.status}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="overview-empty">No requests yet.</p>
          )}
        </div>

        <div className="overview-info-card">
          <h3>Upcoming Sessions</h3>

          {recentSessions.length > 0 ? (
            <div className="overview-list">
              {recentSessions.map((session) => (
                <div key={session.id} className="overview-list-item">
                  <div>
                    <strong>{session.tutorName}</strong>
                    <p>
                      {session.subject} • {session.date} • {session.time}
                    </p>
                  </div>

                  <span className={`overview-badge status-${session.status}`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="overview-empty">No sessions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}