
import React from 'react';
import './Home.css';
import teachingImg from '../assets/teaching.png';
function Home() {
  return (
    <>
      <div className="home-container">
        <div className="home-img">
          <img src={teachingImg} alt="Teaching" />
        </div>
        <h1>Welcome to TutorMatch</h1>
        <p>Your platform for connecting students with qualified tutors.</p>
        <div className="search-container">
          <div className="search-text">
            <p>What are you looking for?</p>
          </div>
          <div className="search-dropdown">
            <div className="search-dropdown-group subject">
              <p>Select a subject:</p>
              <select>
                <option value="">Select a subject</option>
                <option value="math">Math</option>
                <option value="science">Science</option>
                <option value="language">Language</option>
                <option value="history">History</option>
              </select>
            </div>
            <br></br>
            <br></br>
            <div className="search-dropdown-group level">
              <p>Select a level:</p>
              <select>
                <option value="">Select a level</option>
                <option value="elementary">Elementary</option>
                <option value="highschool">High School</option>
                <option value="college">College</option>
              </select>
            </div>
          </div>
          <button className="search-button">Search</button>
        </div>
      </div>
    </>
  );
}

export default Home;