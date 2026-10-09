import React, { useState } from "react";
import "./ScheduleSessionModal.css";
import toast from "react-hot-toast";

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  request,
  onCreateSession,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (new Date(`${date}T${time}`).getTime() <= Date.now()) {
      toast.error("Please choose a future date and time.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await onCreateSession({ date, time, notes });
      if (created === false) return;
      setDate(""); setTime(""); setNotes("");
    } catch {
      toast.error("Could not create the session. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setDate("");
    setTime("");
    setNotes("");
    onClose();
  };

  return (
    <div className="schedule-modal-overlay" onClick={handleClose}>
      <div
        className="schedule-modal" role="dialog" aria-modal="true" aria-label="Schedule session"
        onClick={(e) => e.stopPropagation()}
      >
        <button aria-label="Close scheduling" className="schedule-modal-close" disabled={isSubmitting} onClick={handleClose}>
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
              min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
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

          <button type="submit" className="schedule-submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
