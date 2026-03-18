import React from 'react';
import './Home.css';
import teachingImg from '../assets/teaching.png';

function Home() {
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
              <select id="subject">
                <option value="">Select a subject</option>
                <option value="math">Math</option>
                <option value="science">Science</option>
                <option value="language">Language</option>
                <option value="history">History</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select id="level">
                <option value="">Select a level</option>
                <option value="elementary">Elementary</option>
                <option value="highschool">High School</option>
                <option value="college">College</option>
              </select>
            </div>

            <button className="search-button">Search Tutors</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;