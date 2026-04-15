import React, { useMemo, useState } from "react";
import defaultAvatar from "../../../assets/profile-avatar.png";
import "../SessionsPanel.css";

export default function StudentSessionsPanel({
  sessions,
  onAcceptSession,
  onCancelSession,
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return sessions;
    return sessions.filter((session) => session.status === statusFilter);
  }, [sessions, statusFilter]);

  return (
    <div className="sessions-panel">
      <div className="sessions-panel-header">
        <div>
          <h2>Sessions</h2>
          <p>View your upcoming learning sessions.</p>
        </div>

        <div className="sessions-filter">
          <label htmlFor="student-session-filter">Filter by status</label>
          <select
            id="student-session-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="empty-sessions">
          <p>No sessions found for this filter.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {filteredSessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-card-top">
                <img
                  src={session.tutorPhotoURL || defaultAvatar}
                  alt={session.tutorName}
                  className="session-avatar"
                />

                <div className="session-main-info">
                  <h3>{session.tutorName}</h3>
                  <p className={`session-status status-${session.status}`}>
                    {session.status}
                  </p>
                </div>
              </div>

              <div className="session-details">
                <p><strong>Subject:</strong> {session.subject}</p>
                <p><strong>Date:</strong> {session.date}</p>
                <p><strong>Time:</strong> {session.time}</p>
                {session.notes && (
                  <p><strong>Notes:</strong> {session.notes}</p>
                )}
              </div>

              <div className="session-actions">
                {session.status === "pending" && (
                  <button
                    className="accept-session-button"
                    onClick={() => onAcceptSession(session.id)}
                  >
                    Accept Session
                  </button>
                )}

                {(session.status === "pending" || session.status === "confirmed") && (
                  <button
                    className="cancel-session-button"
                    onClick={() => onCancelSession(session.id)}
                  >
                    Cancel Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}