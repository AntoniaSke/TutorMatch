import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import defaultAvatar from "../../../assets/profile-avatar.png";
import "./TutorRequestsPanel.css";
import ScheduleSessionModal from "../ScheduleSessionModal";
import { createSession } from "../../../services/sessionService";
import toast from "react-hot-toast";

export default function TutorRequestsPanel({
  requests,
  onUpdateRequestStatus,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentProfiles, setStudentProfiles] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  useEffect(() => {
    const fetchStudentProfiles = async () => {
      try {
        const uniqueStudentIds = [...new Set(requests.map((r) => r.studentId).filter(Boolean))];

        const profiles = {};

        await Promise.all(
          uniqueStudentIds.map(async (studentId) => {
            const snap = await getDoc(doc(db, "users", studentId));
            if (snap.exists()) {
              profiles[studentId] = snap.data();
            }
          })
        );

        setStudentProfiles(profiles);
      } catch (error) {
        console.error("Error fetching student profiles:", error);
      }
    };

    if (requests.length > 0) {
      fetchStudentProfiles();
    }
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const handleCreateSession = async ({ date, time, notes }) => {
    try {
      if (!selectedRequest) return;

     await createSession({
  requestId: selectedRequest.id,
  studentId: selectedRequest.studentId,
  studentName: selectedRequest.studentName,
  studentPhotoURL: selectedRequest.studentPhotoURL || "",

  tutorId: selectedRequest.tutorId,
  tutorName: selectedRequest.tutorName,
  tutorPhotoURL: selectedRequest.tutorPhotoURL || "",

  subject: selectedRequest.subject,
  date,
  time,
  notes,
});

      toast.success("Session created successfully!");
      setIsScheduleModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session.");
    }
  };

  return (
    <div className="requests-panel">
      <div className="requests-panel-header">
        <div>
          <h2>Requests</h2>
          <p>Manage incoming student requests.</p>
        </div>

        <div className="requests-filter">
          <label htmlFor="requestStatus">Filter by status</label>
          <select
            id="requestStatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-requests">
          <p>No requests found for this filter.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((request) => {
            const studentProfile = studentProfiles[request.studentId] || {};

            const photo =
              request.studentPhotoURL ||
              studentProfile.photoURL ||
              defaultAvatar;

            const educationLevel =
              request.studentEducationLevel ||
              studentProfile.educationLevel ||
              studentProfile.gradeLevel ||
              "";

            const availability =
              request.studentAvailability ||
              studentProfile.availability ||
              "";

            const learningGoals =
              request.studentLearningGoals ||
              studentProfile.learningGoals ||
              [];

            const subjects =
              studentProfile.subjects || [];

            return (
              <div key={request.id} className="request-card">
                <div className="request-card-top">
                  <img
                    src={photo}
                    alt={request.studentName}
                    className="request-student-avatar"
                  />

                  <div className="request-main-info">
                    <h3>{request.studentName}</h3>
                    <p className={`request-status status-${request.status}`}>
                      {request.status}
                    </p>
                  </div>
                </div>

                <div className="request-details">
                  <p>
                    <strong>Subject:</strong> {request.subject}
                  </p>

                  <p>
                    <strong>Message:</strong> {request.message}
                  </p>

                  {educationLevel && (
                    <p>
                      <strong>Education Level:</strong> {educationLevel}
                    </p>
                  )}

                  {availability && (
                    <p>
                      <strong>Availability:</strong> {availability}
                    </p>
                  )}

                  {subjects.length > 0 && (
                    <p>
                      <strong>Subjects of interest:</strong> {subjects.join(", ")}
                    </p>
                  )}

                  {Array.isArray(learningGoals) && learningGoals.length > 0 && (
                    <p>
                      <strong>Learning Goals:</strong> {learningGoals.join(", ")}
                    </p>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="request-actions">
                    <button
                      className="accept-button"
                      onClick={() =>
                        onUpdateRequestStatus(request.id, "accepted")
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="reject-button"
                      onClick={() =>
                        onUpdateRequestStatus(request.id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
                {request.status === "accepted" && (
                  <div className="request-actions">
                    <button
                      className="schedule-button"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      Schedule Session
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}