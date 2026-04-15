import React, { useState } from "react";
import "./LeaveReviewModal.css";

export default function LeaveReviewModal({
  isOpen,
  onClose,
  tutorName,
  onSubmitReview,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmitReview({ rating, comment });
    setRating(5);
    setComment("");
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    onClose();
  };

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={handleClose}>
          ×
        </button>

        <h2>Leave a Review</h2>
        <p>
          Share your experience with <strong>{tutorName}</strong>.
        </p>

        <form className="review-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a short review..."
              required
            />
          </div>

          <button type="submit" className="submit-review-button">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}