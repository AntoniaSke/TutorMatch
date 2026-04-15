import React, { useMemo } from "react";
import { calculateAverageRating } from "../../../services/reviewService";
import "../ReviewsPanel.css";

export default function TutorReviewsPanel({ reviews }) {
  const averageRating = useMemo(() => {
    return calculateAverageRating(reviews);
  }, [reviews]);

  const totalReviews = reviews.length;

  return (
    <div className="reviews-panel">
      <div className="reviews-header">
        <h2>Reviews</h2>
        <p>See what students are saying about your tutoring sessions.</p>
      </div>

      <div className="reviews-summary-grid">
        <div className="reviews-summary-card">
          <span className="reviews-summary-label">Average Rating</span>
          <span className="reviews-summary-value">
            {averageRating ? `⭐ ${averageRating}` : "New"}
          </span>
        </div>

        <div className="reviews-summary-card">
          <span className="reviews-summary-label">Total Reviews</span>
          <span className="reviews-summary-value">{totalReviews}</span>
        </div>
      </div>

      <div className="reviews-list-card">
        <h3>Recent Reviews</h3>

        {reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="reviews-list-item">
                <div className="reviews-list-top">
                  <strong>{review.studentName}</strong>
                  <span className="review-rating-badge">⭐ {review.rating}</span>
                </div>

                <p className="review-comment-text">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}