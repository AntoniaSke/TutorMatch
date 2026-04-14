import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import teachingImg from "../assets/teaching.png";

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
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select a subject</option>
                <option value="Math">Math</option>
                <option value="Physics">Physics</option>
                <option value="English">English</option>
                <option value="History">History</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
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
              </select>
            </div>

            <button className="search-button" onClick={handleSearch}>
              Search Tutors
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;