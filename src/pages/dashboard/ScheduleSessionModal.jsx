import React, { useState } from "react";
import "./ScheduleSessionModal.css";

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  request,
  onCreateSession,
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateSession({ date, time, notes });
    setDate("");
    setTime("");
    setNotes("");
  };

  const handleClose = () => {
    setDate("");
    setTime("");
    setNotes("");
    onClose();
  };

  return (
    <div className="schedule-modal-overlay" onClick={handleClose}>
      <div
        className="schedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="schedule-modal-close" onClick={handleClose}>
          ×
        </button>

        <h2>Schedule Session</h2>
        <p>
          Create a session for <strong>{request.studentName}</strong> in{" "}
          <strong>{request.subject}</strong>.
        </p>

        <form className="schedule-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="session-date">Date</label>
            <input
              id="session-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="session-time">Time</label>
            <input
              id="session-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="session-notes">Notes</label>
            <textarea
              id="session-notes"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a short note for the session..."
            />
          </div>

          <button type="submit" className="schedule-submit-button">
            Create Session
          </button>
        </form>
      </div>
    </div>
  );
}