import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import defaultAvatar from "../../../assets/profile-avatar.png";
import ScheduleSessionModal from "../ScheduleSessionModal";
import { createSession } from "../../../services/sessionService";
import toast from "react-hot-toast";
import "./TutorStudentsPanel.css";

export default function TutorStudentsPanel({ requests }) {
  const [selectedStudentRequest, setSelectedStudentRequest] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [studentProfiles, setStudentProfiles] = useState({});

  const uniqueStudents = useMemo(() => {
    const acceptedRequests = requests.filter(
      (request) => request.status === "accepted"
    );

    const map = new Map();

    acceptedRequests.forEach((request) => {
      if (!map.has(request.studentId)) {
        map.set(request.studentId, {
          ...request,
          subjects: [request.subject],
        });
      } else {
        const existing = map.get(request.studentId);

        if (!existing.subjects.includes(request.subject)) {
          existing.subjects.push(request.subject);
        }

        map.set(request.studentId, existing);
      }
    });

    return Array.from(map.values());
  }, [requests]);

  useEffect(() => {
    const fetchStudentProfiles = async () => {
      try {
        const profiles = {};

        await Promise.all(
          uniqueStudents.map(async (student) => {
            if (!student.studentId) return;

            const studentSnap = await getDoc(doc(db, "users", student.studentId));

            if (studentSnap.exists()) {
              profiles[student.studentId] = studentSnap.data();
            }
          })
        );

        setStudentProfiles(profiles);
      } catch (error) {
        console.error("Error fetching student profiles:", error);
      }
    };

    if (uniqueStudents.length > 0) {
      fetchStudentProfiles();
    } else {
      setStudentProfiles({});
    }
  }, [uniqueStudents]);

  const handleCreateSession = async ({ date, time, notes }) => {
    try {
      if (!selectedStudentRequest) return;

      const liveStudentProfile =
        studentProfiles[selectedStudentRequest.studentId] || {};

      await createSession({
        requestId: selectedStudentRequest.id,
        studentId: selectedStudentRequest.studentId,
        studentName: selectedStudentRequest.studentName,
        studentPhotoURL:
          selectedStudentRequest.studentPhotoURL ||
          liveStudentProfile.photoURL ||
          "",
        tutorId: selectedStudentRequest.tutorId,
        tutorName: selectedStudentRequest.tutorName,
        tutorPhotoURL: selectedStudentRequest.tutorPhotoURL || "",
        subject: selectedStudentRequest.subject,
        date,
        time,
        notes,
      });

      toast.success("Session created successfully!");
      setIsScheduleModalOpen(false);
      setSelectedStudentRequest(null);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session.");
    }
  };

  return (
    <div className="tutor-students-panel">
      <div className="tutor-students-header">
        <div>
          <h2>Students</h2>
          <p>View your active students and schedule sessions quickly.</p>
        </div>
      </div>

      {uniqueStudents.length === 0 ? (
        <div className="empty-students">
          <p>No active students yet.</p>
        </div>
      ) : (
        <div className="tutor-students-grid">
          {uniqueStudents.map((student) => {
            const profile = studentProfiles[student.studentId] || {};

            const photo =
              student.studentPhotoURL || profile.photoURL || defaultAvatar;

            const educationLevel =
              student.studentEducationLevel ||
              profile.educationLevel ||
              profile.gradeLevel ||
              "Not specified";

            const availability =
              student.studentAvailability ||
              profile.availability ||
              "Not specified";

            const learningGoals =
              student.studentLearningGoals ||
              profile.learningGoals ||
              [];

            return (
              <div key={student.studentId} className="tutor-student-card">
                <div className="tutor-student-top">
                  <img
                    src={photo}
                    alt={student.studentName}
                    className="tutor-student-avatar"
                  />

                  <div className="tutor-student-info">
                    <h3>{student.studentName}</h3>

                    <p>
                      <strong>Subjects:</strong>{" "}
                      {Array.isArray(student.subjects) && student.subjects.length > 0
                        ? student.subjects.join(", ")
                        : student.subject || "Not specified"}
                    </p>

                    <p>
                      <strong>Education Level:</strong> {educationLevel}
                    </p>

                    <p>
                      <strong>Availability:</strong> {availability}
                    </p>

                    {Array.isArray(learningGoals) && learningGoals.length > 0 && (
                      <p>
                        <strong>Learning Goals:</strong>{" "}
                        {learningGoals.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="tutor-student-actions">
                  <button
                    className="schedule-student-button"
                    onClick={() => {
                      setSelectedStudentRequest(student);
                      setIsScheduleModalOpen(true);
                    }}
                  >
                    Schedule Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedStudentRequest(null);
        }}
        request={selectedStudentRequest}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}