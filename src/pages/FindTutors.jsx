import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./FindTutors.css";
import { useSearchParams } from "react-router-dom";

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

   useEffect(() => {
  const fetchTutors = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "tutor")
      );

      const querySnapshot = await getDocs(q);

      const tutorsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTutors(tutorsList);

      let results = tutorsList;

      if (initialSubject) {
        results = results.filter(
          (tutor) =>
            Array.isArray(tutor.subjects) &&
            tutor.subjects.includes(initialSubject)
        );
      }

      if (initialLevel) {
        results = results.filter(
          (tutor) => tutor.teachingLevel === initialLevel
        );
      }

      setFilteredTutors(results);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    }
  };

  fetchTutors();
}, [initialSubject, initialLevel]);

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
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTutor(null);
        setIsModalOpen(false);
    };
    return (
        <div className="find-tutors-container">
            <h1>Find the perfect tutor for your learning journey</h1>
            <p>Connect with qualified tutors by subject and level, and start learning with confidence.</p>

            <div className="find-card">
                <h2>Search for a tutor</h2>
                <div className="find-search-form">
                    <div className="form-group">
                        <label>Subjects</label>

                        <div className="custom-multiselect">
                            <button
                                type="button"
                                className="multiselect-button"
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
                                                checked={selectedSubjects.includes(subject) || subject === selectedSubjects}
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

                    <button className="search-button" onClick={handleSearch}>Search Tutors</button>
                </div>
            </div>
            <div className="tutor-container">
                <h3>Featured Tutors</h3>
                <p>Here you will see a list of tutors based on your search.</p>

                <div className="tutors-grid">
                    {filteredTutors.length > 0 ? (
                        filteredTutors.map((tutor) => (
                            <div key={tutor.id} className="tutor-card">
                                <img
                                    src={tutor.photoURL || "/default-profile.png"}
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
                                <p>⭐ {tutor.rating || "New"}</p>
                                <button
                                    className="view-profile-button"
                                    onClick={() => handleViewProfile(tutor)}
                                >
                                    View Profile
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-tutors-found">No tutors found for the selected filters.</p>
                    )}
                </div>
                {isModalOpen && selectedTutor && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="tutor-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close-modal" onClick={handleCloseModal}>
                                ×
                            </button>

                            <div className="modal-header">
                                <img
                                    src={selectedTutor.photoURL || "/default-profile.png"}
                                    alt={selectedTutor.name}
                                    className="modal-thumbnail"
                                />

                                <div className="modal-header-info">
                                    <h2>{selectedTutor.name}</h2>

                                    <div className="modal-info-grid">
                                        <div className="modal-info-item">
                                            <span className="info-label">Subjects: </span>
                                            <span className="info-value">
                                                {Array.isArray(selectedTutor.subjects) && selectedTutor.subjects.length > 0
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
                                            <span className="info-value">⭐ {selectedTutor.rating || "New"}</span>
                                        </div>

                                        <div className="modal-info-item">
                                            <span className="info-label">Rate: </span>
                                            <span className="info-value">€{selectedTutor.hourlyRate || "-"}/hr</span>
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
                                {selectedTutor.reviews && selectedTutor.reviews.length > 0 ? (
                                    <ul className="reviews-list">
                                        {selectedTutor.reviews.map((review, index) => (
                                            <li key={index} className="review-item">
                                                <p className="reviewer-name">{review.reviewerName}</p>
                                                <p className="review-rating">⭐ {review.rating}</p>
                                                <p className="review-comment">{review.comment}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No reviews yet.</p>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button className="request-button">Send Request</button>


                            </div>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
}