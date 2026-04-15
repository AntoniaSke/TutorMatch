import React, { useMemo, useState } from "react";
import defaultAvatar from "../../../assets/profile-avatar.png";
import "../SessionsPanel.css";

export default function TutorSessionsPanel({
  sessions,
  onCancelSession,
  onCompleteSession,
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
                    <p>View your scheduled tutoring sessions.</p>
                </div>

                <div className="sessions-filter">
                    <label htmlFor="tutor-session-filter">Filter by status</label>
                    <select
                        id="tutor-session-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
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
                                    src={session.studentPhotoURL || defaultAvatar}
                                    alt={session.studentName}
                                    className="session-avatar"
                                />

                                <div className="session-main-info">
                                    <h3>{session.studentName}</h3>
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

                            {(session.status === "pending" || session.status === "confirmed") && (
                                <div className="session-actions">
                                    {session.status === "confirmed" && (
                                        <button
                                            className="complete-session-button"
                                            onClick={() => onCompleteSession(session.id)}
                                        >
                                            Mark as Completed
                                        </button>
                                    )}

                                    <button
                                        className="cancel-session-button"
                                        onClick={() => onCancelSession(session.id)}
                                    >
                                        Cancel Session
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}