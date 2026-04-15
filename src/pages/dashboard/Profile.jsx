import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";

import { getUserProfile, updateUserProfile } from "../../services/userService";
import { onAuthStateChanged } from "firebase/auth";
import "./Profile.css";
import defaultAvatar from "../../assets/profile-avatar.png";
import toast from "react-hot-toast";

function ProfileTutor() {
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

  const teachingLevels = [
    "Elementary School",
    "Middle School",
    "High School",
    "University",
    "Adult Learners",
  ];

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [teachingLevel, setTeachingLevel] = useState("");
  const [availability, setAvailability] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userSnap = await getUserProfile(user.uid);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          setName(userData.name || "");
          setEmail(user.email || userData.email || "");
          setBio(userData.bio || "");
          setTeachingLevel(userData.teachingLevel || "");
          setAvailability(userData.availability || "");
          setHourlyRate(userData.hourlyRate || "");
          setSelectedSubjects(userData.subjects || []);
          setImage(userData.photoURL || null);
        } else {
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Could not load profile data.");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubjectChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((item) => item !== subject)
        : [...prev, subject]
    );
  };

  const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    console.log("Cloud name:", cloudName);
    console.log("Upload preset:", uploadPreset);

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    console.log("Cloudinary response:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed.");
    }

    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        toast.error("No authenticated user found.");
        return;
      }

      let imageUrl = image || null;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }



      await updateUserProfile(user.uid, {
        name,
        bio,
        teachingLevel,
        availability,
        hourlyRate,
        subjects: selectedSubjects,
        photoURL: imageUrl,
      });

      setImageFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Full profile update error:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-info">
          <h2>Your Profile</h2>
          <p>Manage your personal information and tutoring details.</p>
        </div>

        <div className="profile-photo">
          <img
            src={image || defaultAvatar}
            alt="Profile"
            className="thumbnail"
          />

          <label className="upload-overlay">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const allowedTypes = [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                ];

                if (!allowedTypes.includes(file.type)) {
                  toast.error("Please upload a JPG, PNG, or WEBP image.");
                  return;
                }

                setImage(URL.createObjectURL(file));
                setImageFile(file);
              }}
            />
            Change
          </label>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <fieldset className="profile-fieldset">
          <legend>Personal Information</legend>

          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              placeholder="Enter your email address"
            />
          </div>

          <div className="input-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about yourself and your teaching style."
              required
            />
          </div>
        </fieldset>

        <fieldset className="profile-fieldset">
          <legend>Subjects</legend>

          <div className="checkbox-grid">
            {subjects.map((subject) => (
              <label key={subject} className="checkbox-item">
                <input
                  type="checkbox"
                  value={subject}
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                />
                {subject}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="profile-fieldset">
          <legend>Tutoring Details</legend>

          <div className="input-group">
            <label htmlFor="teachingLevel">Teaching Level</label>
            <select
              id="teachingLevel"
              value={teachingLevel}
              onChange={(e) => setTeachingLevel(e.target.value)}
              required
            >
              <option value="">Select teaching level</option>
              {teachingLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              required
            >
              <option value="">Select availability</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="hourlyRate">Hourly Rate (€)</label>
            <input
              type="number"
              id="hourlyRate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g. 15"
              required
            />
          </div>
        </fieldset>

        <button type="submit" className="save-button" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
function ProfileStudent() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [availability, setAvailability] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLearningGoals, setSelectedLearningGoals] = useState([]);

  const [loading, setLoading] = useState(false);

  const Education = [
    "Elementary School",
    "Middle School",
    "High School",
    "University",
    "Adult Learners",];
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

  const learningGoals = [
    "Improve grades",
    "Exam Preparation",
    "Skill Development",
    "Learning New Subjects",
    "Confidence & Support",
    "Career Advancement",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userSnap = await getUserProfile(user.uid);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          setName(userData.name || "");
          setEmail(user.email || userData.email || "");
          setBio(userData.bio || "");
          setEducationLevel(userData.educationLevel || "");
          setAvailability(userData.availability || "");

          setSelectedSubjects(userData.subjects || []);
          setSelectedLearningGoals(userData.learningGoals || []);
          setImage(userData.photoURL || null);
        } else {
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Could not load profile data.");
      }
    });

    return () => unsubscribe();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    console.log("Cloud name:", cloudName);
    console.log("Upload preset:", uploadPreset);

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    console.log("Cloudinary response:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed.");
    }

    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        toast.error("No authenticated user found.");
        return;
      }

      let imageUrl = image || null;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }


      await updateUserProfile(user.uid, {
        name,
        bio,
        educationLevel,
        availability,
        subjects: selectedSubjects,
        learningGoals: selectedLearningGoals,
        photoURL: imageUrl,
      });

      setImageFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Full profile update error:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-info">
          <h2>Your Profile</h2>
          <p>Manage your personal information and learning preferences.</p>
        </div>

        <div className="profile-photo">
          <img
            src={image || defaultAvatar}
            alt="Profile"
            className="thumbnail"
          />

          <label className="upload-overlay">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const allowedTypes = [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                ];

                if (!allowedTypes.includes(file.type)) {
                  toast.error("Please upload a JPG, PNG, or WEBP image.");
                  return;
                }

                setImage(URL.createObjectURL(file));
                setImageFile(file);
              }}
            />
            Change
          </label>
        </div>

      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <fieldset className="profile-fieldset">
          <legend>Personal Information</legend>

          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />

          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              placeholder="Enter your email address"
            />
          </div>

          <div className="input-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell tutors about yourself and your learning goals."
              required
            />
          </div>


        </fieldset>
        <fieldset className="profile-fieldset">
          <legend>Learning Details</legend>
          <div className="input-group">
            <label htmlFor="educationLevel">Education Level</label>
            <select id="educationLevel" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} required>
              {Education.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="subjects">Subjects of Interest</label>

            <div className="checkbox-grid">
              {subjects.map((subject) => (
                <label key={subject} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={subject}
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => {
                      setSelectedSubjects((prev) =>
                        prev.includes(subject)
                          ? prev.filter((item) => item !== subject)
                          : [...prev, subject]
                      );
                    }}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset
          className="profile-fieldset"
        >
          <legend>Learning Preferences</legend>

          <div className="input-group">
            <label htmlFor="availability">Preferred Learning Times</label>
            <select id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)} required>
              <option value="">Select availability</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="learningGoals">Learning Goals</label>
            <div className="checkbox-grid">
              {learningGoals.map((goal) => (
                <label key={goal} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={goal}
                    checked={selectedLearningGoals.includes(goal)}
                    onChange={() => {
                      setSelectedLearningGoals((prev) =>
                        prev.includes(goal)
                          ? prev.filter((item) => item !== goal)
                          : [...prev, goal]
                      );
                    }}
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>

        </fieldset>

        <button type="submit" className="save-button" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>

  );

}

export { ProfileTutor, ProfileStudent };