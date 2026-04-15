import React, { useMemo } from "react";
import "../OverviewPanel.css";
import { calculateAverageRating } from "../../../services/reviewService";

export default function TutorOverviewPanel({ requests, sessions, reviews }) {
    const pendingRequestsCount = useMemo(() => {
        return requests.filter((request) => request.status === "pending").length;
    }, [requests]);

    const activeStudentsCount = useMemo(() => {
        return new Set(
            requests
                .filter((request) => request.status === "accepted")
                .map((request) => request.studentId)
        ).size;
    }, [requests]);

    const upcomingSessionsCount = useMemo(() => {
        return sessions.filter(
            (session) =>
                session.status === "pending" || session.status === "confirmed"
        ).length;
    }, [sessions]);

    const recentRequests = useMemo(() => {
        return [...requests].slice(0, 3);
    }, [requests]);

    const recentSessions = useMemo(() => {
        return [...sessions].slice(0, 3);
    }, [sessions]);

    const averageRating = useMemo(() => {
        return calculateAverageRating(reviews);
    }, [reviews]);

    return (
        <div className="overview-panel">
            <div className="overview-header">
                <h2>Overview</h2>
                <p>Here’s an overview of your tutoring activity and upcoming sessions.</p>
            </div>

            <div className="overview-cards-grid">
                <div className="overview-stat-card">
                    <span className="overview-stat-label">Active Students</span>
                    <span className="overview-stat-value">{activeStudentsCount}</span>
                </div>

                <div className="overview-stat-card">
                    <span className="overview-stat-label">Upcoming Sessions</span>
                    <span className="overview-stat-value">{upcomingSessionsCount}</span>
                </div>

                <div className="overview-stat-card">
                    <span className="overview-stat-label">Pending Requests</span>
                    <span className="overview-stat-value">{pendingRequestsCount}</span>
                </div>

                <div className="overview-stat-card">
                    <span className="overview-stat-label">Average Rating</span>
                    <span className="overview-stat-value">
                        {averageRating ? averageRating : "New"}
                    </span>
                </div>
            </div>

            <div className="overview-sections-grid">
                <div className="overview-info-card">
                    <h3>Latest Requests</h3>

                    {recentRequests.length > 0 ? (
                        <div className="overview-list">
                            {recentRequests.map((request) => (
                                <div key={request.id} className="overview-list-item">
                                    <div>
                                        <strong>{request.studentName}</strong>
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
                                        <strong>{session.studentName}</strong>
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