import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import defaultAvatar from "../../../assets/profile-avatar.png";
import "./StudentRequestsPanel.css";

export default function StudentRequestsPanel({ requests }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [tutorProfiles, setTutorProfiles] = useState({});

  useEffect(() => {
    const fetchTutorProfiles = async () => {
      try {
        const uniqueTutorIds = [
          ...new Set(requests.map((request) => request.tutorId).filter(Boolean)),
        ];

        const profiles = {};

        await Promise.all(
          uniqueTutorIds.map(async (tutorId) => {
            const tutorSnap = await getDoc(doc(db, "users", tutorId));
            if (tutorSnap.exists()) {
              profiles[tutorId] = tutorSnap.data();
            }
          })
        );

        setTutorProfiles(profiles);
      } catch (error) {
        console.error("Error fetching tutor profiles:", error);
      }
    };

    if (requests.length > 0) {
      fetchTutorProfiles();
    }
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  return (
    <div className="student-requests-panel">
      <div className="student-requests-header">
        <div>
          <h2>My Requests</h2>
          <p>Track the status of your tutor requests.</p>
        </div>

        <div className="student-requests-filter">
          <label htmlFor="studentRequestStatus">Filter by status</label>
          <select
            id="studentRequestStatus"
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
        <div className="empty-student-requests">
          <p>No requests found for this filter.</p>
        </div>
      ) : (
        <div className="student-requests-grid">
          {filteredRequests.map((request) => {
            const tutorProfile = tutorProfiles[request.tutorId] || {};

            const tutorPhoto =
              request.tutorPhotoURL || tutorProfile.photoURL || defaultAvatar;

            const tutorTeachingLevel =
              request.tutorTeachingLevel || tutorProfile.teachingLevel || "";

            const tutorAvailability =
              request.tutorAvailability || tutorProfile.availability || "";

            const tutorHourlyRate =
              request.tutorHourlyRate || tutorProfile.hourlyRate || "";

            const tutorSubjects =
              request.tutorSubjects || tutorProfile.subjects || [];

            return (
              <div key={request.id} className="student-request-card">
                <div className="student-request-top">
                  <img
                    src={tutorPhoto}
                    alt={request.tutorName}
                    className="student-request-avatar"
                  />

                  <div className="student-request-main-info">
                    <h3>{request.tutorName}</h3>
                    <p className={`student-request-status status-${request.status}`}>
                      {request.status}
                    </p>
                  </div>
                </div>

                <div className="student-request-details">
                  <p>
                    <strong>Requested Subject:</strong> {request.subject}
                  </p>

                  <p>
                    <strong>Your Message:</strong> {request.message}
                  </p>

                  {tutorTeachingLevel && (
                    <p>
                      <strong>Teaching Level:</strong> {tutorTeachingLevel}
                    </p>
                  )}

                  {tutorAvailability && (
                    <p>
                      <strong>Availability:</strong> {tutorAvailability}
                    </p>
                  )}

                  {tutorHourlyRate && (
                    <p>
                      <strong>Hourly Rate:</strong> €{tutorHourlyRate}/hr
                    </p>
                  )}

                  {Array.isArray(tutorSubjects) && tutorSubjects.length > 0 && (
                    <p>
                      <strong>Subjects:</strong> {tutorSubjects.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}