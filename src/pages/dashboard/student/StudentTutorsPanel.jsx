import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import defaultAvatar from "../../../assets/profile-avatar.png";
import TutorProfileModal from "../../../components/TutorProfileModal";
import LeaveReviewModal from "../../../components/LeaveReviewModal";
import {
  createReview,
  getExistingReviewForTutor,
  subscribeToTutorReviews,
  calculateAverageRating,
} from "../../../services/reviewService";
import toast from "react-hot-toast";
import "./StudentTutorsPanel.css";

export default function StudentTutorsPanel({ requests, sessions }) {
  const [tutorProfiles, setTutorProfiles] = useState({});
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  const [selectedReviewTarget, setSelectedReviewTarget] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTutorReviews, setSelectedTutorReviews] = useState([]);
  const [reviewedTutorIds, setReviewedTutorIds] = useState([]);
  const acceptedRequests = useMemo(() => {
    const accepted = requests.filter(
      (request) => request.status === "accepted",
    );

    const map = new Map();

    accepted.forEach((request) => {
      if (!map.has(request.tutorId)) {
        map.set(request.tutorId, {
          ...request,
          subjects: [request.subject],
        });
      } else {
        const existing = map.get(request.tutorId);

        if (!existing.subjects.includes(request.subject)) {
          existing.subjects.push(request.subject);
        }

        map.set(request.tutorId, existing);
      }
    });

    return Array.from(map.values());
  }, [requests]);

  useEffect(() => {
    const fetchReviewedTutors = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser || acceptedRequests.length === 0) {
        setReviewedTutorIds([]);
        return;
      }

      const reviewedIds = [];

      await Promise.all(
        acceptedRequests.map(async (request) => {
          const snapshot = await getExistingReviewForTutor({
            tutorId: request.tutorId,
            studentId: currentUser.uid,
          });

          if (!snapshot.empty) {
            reviewedIds.push(request.tutorId);
          }
        })
      );

      setReviewedTutorIds(reviewedIds);
    };

    fetchReviewedTutors();
  }, [acceptedRequests]);

  useEffect(() => {
    let unsubscribeReviews = null;

    if (selectedTutor?.id) {
      unsubscribeReviews = subscribeToTutorReviews(
        selectedTutor.id,
        (reviews) => {
          setSelectedTutorReviews(reviews);
        },
        (error) => {
          console.error("Error fetching tutor reviews:", error);
        },
      );
    } else {
      setSelectedTutorReviews([]);
    }

    return () => {
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, [selectedTutor]);

  const getCompletedSessionForTutor = (tutorId) => {
    return sessions.find(
      (session) =>
        session.tutorId === tutorId && session.status === "completed",
    );
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !selectedReviewTarget) {
        toast.error("Unable to submit review.");
        return;
      }

      const existingReviewSnapshot = await getExistingReviewForTutor({
        tutorId: selectedReviewTarget.tutorId,
        studentId: currentUser.uid,
      });

      if (!existingReviewSnapshot.empty) {
        toast.error("You have already reviewed this completed session.");
        return;
      }

      await createReview({
        tutorId: selectedReviewTarget.tutorId,
        tutorName: selectedReviewTarget.tutorName,
        studentId: currentUser.uid,
        studentName: selectedReviewTarget.studentName,
        sessionId: selectedReviewTarget.sessionId,
        rating,
        comment,
      });

      toast.success("Review submitted successfully!");
      setIsReviewModalOpen(false);
      setSelectedReviewTarget(null);
      setReviewedTutorIds((prev) => [...prev, selectedReviewTarget.tutorId]);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="student-tutors-panel">
      <div className="student-tutors-header">
        <h2>My Tutors</h2>
        <p>These are the tutors who have accepted your requests.</p>
      </div>

      {acceptedRequests.length === 0 ? (
        <p>No active tutors yet.</p>
      ) : (
        <div className="student-tutors-grid">
          {acceptedRequests.map((request) => {
            const tutorProfile = tutorProfiles[request.tutorId] || {};

            const tutorPhoto =
              request.tutorPhotoURL || tutorProfile.photoURL || defaultAvatar;

            const tutorTeachingLevel =
              request.tutorTeachingLevel ||
              tutorProfile.teachingLevel ||
              "Not specified";

            const tutorAvailability =
              request.tutorAvailability ||
              tutorProfile.availability ||
              "Not specified";

            const tutorHourlyRate =
              request.tutorHourlyRate || tutorProfile.hourlyRate || "-";

            const completedSession = getCompletedSessionForTutor(
              request.tutorId,
            );
            const hasReviewedTutor = reviewedTutorIds.includes(request.tutorId);
            const canLeaveReview = completedSession && !hasReviewedTutor;
            return (
              <div key={request.tutorId} className="student-tutor-card">
                <div className="student-tutor-avatar-wrap">
                  <img
                    src={tutorPhoto}
                    alt={request.tutorName}
                    className="student-tutor-avatar"
                  />
                </div>

                <div className="student-tutor-body">
                  <h3>{request.tutorName}</h3>

                  <p>
                    <strong>Subjects:</strong>{" "}
                    {Array.isArray(request.subjects) &&
                      request.subjects.length > 0
                      ? request.subjects.join(", ")
                      : request.subject}
                  </p>

                  <p>
                    <strong>Level:</strong> {tutorTeachingLevel}
                  </p>

                  <p>
                    <strong>Availability:</strong> {tutorAvailability}
                  </p>

                  <p>
                    <strong>Rate:</strong> €{tutorHourlyRate}/hr
                  </p>

                  <button
                    className="view-tutor-profile-button"
                    onClick={() => {
                      setSelectedTutor({
                        id: request.tutorId,
                        name: request.tutorName,
                        photoURL: tutorPhoto,
                        bio: tutorProfile.bio || "",
                        subjects:
                          tutorProfile.subjects || request.subjects || [],
                        teachingLevel: tutorTeachingLevel,
                        availability: tutorAvailability,
                        hourlyRate: tutorHourlyRate,
                      });
                      setIsTutorModalOpen(true);
                    }}
                  >
                    View Profile
                  </button>

                  {canLeaveReview && (
                    <button
                      className="leave-review-button"
                      onClick={() => {
                        setSelectedReviewTarget({
                          tutorId: request.tutorId,
                          tutorName: request.tutorName,
                          studentName:
                            auth.currentUser?.displayName || "Student",
                          sessionId: completedSession.id,
                        });
                        setIsReviewModalOpen(true);
                      }}
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TutorProfileModal
        isOpen={isTutorModalOpen}
        onClose={() => {
          setIsTutorModalOpen(false);
          setSelectedTutor(null);
          setSelectedTutorReviews([]);
        }}
        tutor={{
          ...selectedTutor,
          rating: calculateAverageRating(selectedTutorReviews),
        }}
        reviews={selectedTutorReviews}
      />

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedReviewTarget(null);
        }}
        tutorName={selectedReviewTarget?.tutorName || ""}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}
