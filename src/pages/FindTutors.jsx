import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
    collection,
    getDocs,
    query,
    where,
    getDoc,
    doc,
} from "firebase/firestore";
import "./FindTutors.css";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    createRequest,
    getExistingPendingRequest,
} from "../services/requestService";
import {
    subscribeToTutorReviews,
    calculateAverageRating,
} from "../services/reviewService";
import defaultAvatar from "../assets/profile-avatar.png";

export default function FindTutors() {
    const subjects = [
        "Math",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "History",
        "Computer Science",
        "Programming",
        "Statistics",
        "Economics",
        "Accounting",
        "Business Studies",
        "Geography",
        "Philosophy",
    ];

    const levels = [
        "Elementary School",
        "Middle School",
        "High School",
        "University",
        "Adult Learners",
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filteredTutors, setFilteredTutors] = useState([]);

    const [searchParams] = useSearchParams();

    const initialSubject = searchParams.get("subject") || "";
    const initialLevel = searchParams.get("level") || "";

    const [selectedSubjects, setSelectedSubjects] = useState(
        initialSubject ? [initialSubject] : []
    );
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(initialLevel);

    const [requestSubject, setRequestSubject] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const [selectedTutorReviews, setSelectedTutorReviews] = useState([]);
    const [tutorRatings, setTutorRatings] = useState({});
    useEffect(() => {
        let active = true;
        const fetchTutors = async () => {
            setIsLoading(true);
            setLoadError("");
            try {
                await auth.authStateReady();
                const q = query(collection(db, "users"), where("role", "==", "tutor"));
                const snapshot = await getDocs(q);
                const tutorsList = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))
                    .filter((tutor) => tutor.id !== auth.currentUser?.uid);
                if (!active) return;
                setTutors(tutorsList);
                setSelectedSubjects(initialSubject ? [initialSubject] : []);
                setSelectedLevel(initialLevel);
                setFilteredTutors(tutorsList.filter((tutor) =>
                    (!initialSubject || tutor.subjects?.includes(initialSubject)) &&
                    (!initialLevel || tutor.teachingLevel === initialLevel)
                ));
                setIsLoading(false);
                // A failed rating lookup must not hide otherwise available tutors.
                const ratings = await Promise.allSettled(tutorsList.map(async (tutor) => {
                    const reviews = await getDocs(query(collection(db, "reviews"), where("tutorId", "==", tutor.id)));
                    return [tutor.id, calculateAverageRating(reviews.docs.map((item) => item.data()))];
                }));
                if (active) setTutorRatings(Object.fromEntries(ratings.filter((item) => item.status === "fulfilled").map((item) => item.value)));
            } catch (error) {
                console.error("Error fetching tutors:", error);
                if (active) setLoadError("We couldn’t load tutors. Please refresh and try again.");
            } finally {
                if (active) setIsLoading(false);
            }
        };
        fetchTutors();
        return () => { active = false; };
    }, [initialSubject, initialLevel]);

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
                }
            );
        }

        return () => {
            if (unsubscribeReviews) unsubscribeReviews();
        };
    }, [selectedTutor]);

    const handleSubjectToggle = (subject) => {
        setSelectedSubjects((prev) =>
            prev.includes(subject)
                ? prev.filter((item) => item !== subject)
                : [...prev, subject]
        );
    };

    const handleSearch = () => {
        const results = tutors.filter((tutor) => {
            const subjectMatch =
                selectedSubjects.length === 0 ||
                (Array.isArray(tutor.subjects) &&
                    selectedSubjects.some((subject) => tutor.subjects.includes(subject)));

            const levelMatch =
                !selectedLevel || tutor.teachingLevel === selectedLevel;

            return subjectMatch && levelMatch;
        });

        setFilteredTutors(results);
    };

    const handleViewProfile = (tutor) => {
        setSelectedTutor(tutor);
        setSelectedTutorReviews([]);
        setRequestSubject(
            Array.isArray(tutor.subjects) && tutor.subjects.length > 0
                ? tutor.subjects[0]
                : ""
        );
        setRequestMessage("");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTutor(null);
        setIsModalOpen(false);
        setRequestSubject("");
        setRequestMessage("");
    };

    const handleSendRequest = async () => {
        if (isSendingRequest) return;
        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                toast.error("You need to log in first.");
                return;
            }

            if (!selectedTutor) {
                toast.error("No tutor selected.");
                return;
            }

            if (!requestSubject.trim()) {
                toast.error("Please select a subject.");
                return;
            }

            if (!requestMessage.trim()) {
                toast.error("Please write a short message.");
                return;
            }

            setIsSendingRequest(true);

            const studentRef = doc(db, "users", currentUser.uid);
            const studentSnap = await getDoc(studentRef);

            if (!studentSnap.exists()) {
                toast.error("Student profile not found.");
                return;
            }

            const studentData = studentSnap.data();
            if (studentData.role !== "student") {
                toast.error("Only student accounts can send lesson requests.");
                return;
            }

            const existingRequestsSnapshot = await getExistingPendingRequest({
                studentId: currentUser.uid,
                tutorId: selectedTutor.id,
                subject: requestSubject,
            });

            if (!existingRequestsSnapshot.empty) {
                toast.error("You already have a pending request for this tutor.");
                return;
            }

            await createRequest({
                studentId: currentUser.uid,
                studentName: studentData.name || "Student",
                studentPhotoURL: studentData.photoURL || "",
                studentEducationLevel: studentData.educationLevel || "",
                studentAvailability: studentData.availability || "",
                studentLearningGoals: studentData.learningGoals || [],
                tutorId: selectedTutor.id,
                tutorName: selectedTutor.name || "Tutor",
                tutorPhotoURL: selectedTutor.photoURL || "",
                tutorTeachingLevel: selectedTutor.teachingLevel || "",
                tutorAvailability: selectedTutor.availability || "",
                tutorHourlyRate: selectedTutor.hourlyRate || "",
                tutorSubjects: selectedTutor.subjects || [],
                subject: requestSubject,
                message: requestMessage.trim(),
            });

            toast.success("Request sent successfully!");
            handleCloseModal();
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error("Failed to send request.");
        } finally {
            setIsSendingRequest(false);
        }
    };
    return (
        <div className="find-tutors-container">
            <h1>Find the perfect tutor for your learning journey</h1>
            <p>
                Connect with qualified tutors by subject and level, and start learning
                with confidence.
            </p>

            <div className="find-card">
                <h2>Search for a tutor</h2>

                <div className="find-search-form">
                    <div className="form-group">
                        <label>Subjects</label>

                        <div className="custom-multiselect">
                            <button
                                type="button"
                                className="multiselect-button"
                                aria-label="Select subjects"
                                aria-expanded={isSubjectOpen}
                                onKeyDown={(event) => { if (event.key === "Escape") setIsSubjectOpen(false); }}
                                onClick={() => setIsSubjectOpen((prev) => !prev)}
                            >
                                {selectedSubjects.length > 0
                                    ? selectedSubjects.join(", ")
                                    : "Select subjects"}
                            </button>

                            {isSubjectOpen && (
                                <div className="multiselect-dropdown">
                                    {subjects.map((subject) => (
                                        <label key={subject} className="multiselect-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedSubjects.includes(subject)}
                                                onChange={() => handleSubjectToggle(subject)}
                                            />
                                            <span>{subject}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="level">Level</label>

                        <div className="select-wrapper">
                            <select
                                id="level"
                                className="find-level-select"
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                            >
                                <option value="">Select a level</option>
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>

                            <span className="select-arrow">⌄</span>
                        </div>
                    </div>

                    <button className="search-button" onClick={() => { handleSearch(); setIsSubjectOpen(false); }} disabled={isLoading}>
                        Search Tutors
                    </button>
                </div>
            </div>

            <div className="tutor-container">
                <h3>Find your tutor</h3>
                <p>Here you will see a list of tutors based on your search.</p>

                <div className="tutors-grid">
                    {isLoading ? <p className="no-tutors-found" role="status">Loading tutors…</p> : loadError ? <p className="no-tutors-found" role="alert">{loadError}</p> : filteredTutors.length > 0 ? (
                        filteredTutors.map((tutor) => (
                            <div key={tutor.id} className="tutor-card">
                                <img
                                    src={tutor.photoURL || defaultAvatar}
                                    onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = defaultAvatar; }}
                                    loading="lazy"
                                    alt={tutor.name}
                                    className="thumbnail"
                                />
                                <h4>{tutor.name}</h4>
                                <p>{tutor.teachingLevel}</p>
                                <p>
                                    {Array.isArray(tutor.subjects) && tutor.subjects.length > 0
                                        ? tutor.subjects.join(", ")
                                        : "No subjects"}
                                </p>
                                <p>{tutor.availability || "No availability"}</p>
                                <p>€{tutor.hourlyRate || "-"}/hr</p>
                                <p>
                                    ⭐ {tutorRatings[tutor.id] ? tutorRatings[tutor.id] : "New"}
                                </p>

                                <button
                                    className="view-profile-button"
                                    onClick={() => handleViewProfile(tutor)}
                                >
                                    View Profile
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-tutors-found">
                            No tutors found for the selected filters.
                        </p>
                    )}
                </div>

                {isModalOpen && selectedTutor && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="tutor-modal" role="dialog" aria-modal="true" aria-label="Tutor profile" onClick={(e) => e.stopPropagation()}>
                            <button aria-label="Close tutor profile" className="close-modal" onClick={handleCloseModal}>
                                ×
                            </button>

                            <div className="modal-header">
                                <img
                                    src={selectedTutor.photoURL || defaultAvatar}
                                    alt={selectedTutor.name}
                                    className="modal-thumbnail"
                                />

                                <div className="modal-header-info">
                                    <h2>{selectedTutor.name}</h2>

                                    <div className="modal-info-grid">
                                        <div className="modal-info-item">
                                            <span className="info-label">Subjects: </span>
                                            <span className="info-value">
                                                {Array.isArray(selectedTutor.subjects) &&
                                                    selectedTutor.subjects.length > 0
                                                    ? selectedTutor.subjects.join(", ")
                                                    : "No subjects"}
                                            </span>
                                        </div>

                                        <div className="modal-info-item">
                                            <span className="info-label">Level: </span>
                                            <span className="info-value">
                                                {selectedTutor.teachingLevel || "Not specified"}
                                            </span>
                                        </div>

                                        <div className="modal-info-item">
                                            <span className="info-label">About: </span>
                                            <span className="info-value">
                                                {selectedTutor.bio || "No bio available"}
                                            </span>
                                        </div>

                                        <div className="modal-info-item">
                                            <span className="info-label">Rating: </span>
                                            <span className="info-value">
                                                ⭐ {calculateAverageRating(selectedTutorReviews) || "New"}
                                            </span>
                                        </div>

                                        <div className="modal-info-item">
                                            <span className="info-label">Rate: </span>
                                            <span className="info-value">
                                                €{selectedTutor.hourlyRate || "-"}/hr
                                            </span>
                                        </div>

                                        <div className="modal-info-item">
                                            <span className="info-label">Availability: </span>
                                            <span className="info-value">
                                                {selectedTutor.availability || "Not specified"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3>Reviews</h3>
                                {selectedTutorReviews.length > 0 ? (
                                    <ul className="reviews-list">
                                        {selectedTutorReviews.map((review) => (
                                            <li key={review.id} className="review-item">
                                                <p className="reviewer-name">{review.studentName}</p>
                                                <p className="review-rating">⭐ {review.rating}</p>
                                                <p className="review-comment">{review.comment}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No reviews yet.</p>
                                )}
                            </div>

                            <div className="modal-section">
                                <h3>Send a Request</h3>

                                <div className="form-group">
                                    <label>Subject</label>
                                    <select
                                        value={requestSubject}
                                        onChange={(e) => setRequestSubject(e.target.value)}
                                        className="find-level-select"
                                    >
                                        <option value="">Select subject</option>
                                        {Array.isArray(selectedTutor.subjects) &&
                                            selectedTutor.subjects.map((subject) => (
                                                <option key={subject} value={subject}>
                                                    {subject}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                        placeholder="Hi, I’m interested in lessons and would like to learn more about your availability."
                                        rows="4"
                                        className="request-textarea"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="request-button"
                                    onClick={handleSendRequest}
                                    disabled={isSendingRequest}
                                >
                                    {isSendingRequest ? "Sending..." : "Send Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
