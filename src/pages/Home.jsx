import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import teachingImg from "../assets/teaching.png";

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

function Home() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedSubject) {
      params.set("subject", selectedSubject);
    }

    if (selectedLevel) {
      params.set("level", selectedLevel);
    }

    navigate(`/find-tutors?${params.toString()}`);
  };

  return (
    <>
    <section className="home-hero">
      <img src={teachingImg} alt="Teaching" className="home-hero-image" />
      <div className="home-overlay"></div>

      <div className="home-content">
        <span className="home-badge">Find the right tutor faster</span>
        <h1>Find the perfect tutor for your learning journey</h1>
        <p>
          Connect with qualified tutors by subject and level, and start learning
          with confidence.
        </p>

        <div className="search-card">
          <h2>Search for a tutor</h2>

          <div className="search-form">
            <div className="form-group">
              <label htmlFor="subject" className="home-label">Subject</label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level" className="home-label">Level</label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Select a level</option>
                <option value="Elementary School">Elementary School</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="University">University</option>
                <option value="Adult Learners">Adult Learners</option>
              </select>
            </div>

            <button className="search-button" onClick={handleSearch}>
              Search Tutors
            </button>
          </div>
        </div>
      </div>
    </section>
    <section id="how-it-works" className="home-how">
      <span className="home-section-label">Simple steps. Better learning.</span>
      <h2>How TutorMatch works</h2>
      <div className="home-steps">
        <article><span>01</span><h3>Find your tutor</h3><p>Browse tutors by subject and teaching level. Compare profiles, rates and reviews.</p></article>
        <article><span>02</span><h3>Start a conversation</h3><p>Create a student account and send a request with your learning goals and availability.</p></article>
        <article><span>03</span><h3>Plan your lessons</h3><p>Once your request is accepted, coordinate sessions and keep track of your lessons in your dashboard.</p></article>
      </div>
      <Link className="home-how-link" to="/find-tutors">Explore tutors →</Link>
    </section>
    </>
  );
}

export default Home;
