import React from "react";
import defaultAvatar from "../assets/profile-avatar.png";
import "./TutorProfileModal.css";

export default function TutorProfileModal({
    isOpen,
    onClose,
    tutor,
    reviews = [],
    children,
}) {
    if (!isOpen || !tutor) return null;

    const {
        name,
        photoURL,
        bio,
        subjects,
        teachingLevel,
        availability,
        hourlyRate,
        rating,
    } = tutor;

    return (
        <div className="tutor-modal-overlay" onClick={onClose}>
            <div
                className="tutor-profile-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="tutor-modal-close" onClick={onClose}>
                    ×
                </button>

                <div className="tutor-modal-header">
                    <img
                        src={photoURL || defaultAvatar}
                        alt={name}
                        className="tutor-modal-avatar"
                    />

                    <div className="tutor-modal-header-info">
                        <h2>{name || "Tutor"}</h2>
                        <p className="tutor-modal-subtitle">
                            {teachingLevel || "Teaching level not specified"}
                        </p>
                    </div>
                </div>

                <div className="tutor-modal-body">
                    <div className="tutor-modal-section">
                        <h3>About</h3>
                        <p>{bio || "No bio available yet."}</p>
                    </div>

                    <div className="tutor-modal-grid">
                        <div className="tutor-modal-card">
                            <span className="modal-label">Subjects</span>
                            <span className="modal-value">
                                {Array.isArray(subjects) && subjects.length > 0
                                    ? subjects.join(", ")
                                    : "Not specified"}
                            </span>
                        </div>

                        <div className="tutor-modal-card">
                            <span className="modal-label">Availability</span>
                            <span className="modal-value">
                                {availability || "Not specified"}
                            </span>
                        </div>

                        <div className="tutor-modal-card">
                            <span className="modal-label">Hourly Rate</span>
                            <span className="modal-value">€{hourlyRate || "-"}/hr</span>
                        </div>

                        <div className="tutor-modal-card">
                            <span className="modal-label">Rating</span>
                            <span className="modal-value">
                                {rating ? `⭐ ${rating}` : "New tutor"}
                            </span>
                        </div>
                    </div>

                    <div className="tutor-modal-section">
                        <h3>Reviews</h3>

                        {reviews.length > 0 ? (
                            <ul className="reviews-list">
                                {reviews.map((review) => (
                                    <li key={review.id} className="review-item">
                                        <div className="review-top">
                                            <p className="reviewer-name">{review.studentName}</p>
                                            <span className="review-rating-badge">⭐ {review.rating}</span>
                                        </div>

                                        <p className="review-comment">{review.comment}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-reviews-text">No reviews yet.</p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}