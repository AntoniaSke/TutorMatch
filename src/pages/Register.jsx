import React, { useState } from "react";
import './Register.css';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";
import { getErrorMessage } from "../ErrorMessage";


function RegisterStudent() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                gradeLevel,
                role: "student",
                createdAt: serverTimestamp(),
            });

            toast.success("Student created!");

        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="register-container">
            <h1>Student Signup Page</h1>

            <form className="register-form" onSubmit={handleSignup}>
                <label htmlFor="name">Name:</label>
                <input type="text" value={name} placeholder="Enter your full name" onChange={(e) => setName(e.target.value)} required />

                <label htmlFor="email">Email:</label>
                <input type="email" value={email} placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />

                <label htmlFor="confirm-password">Confirm Password:</label>
                <input type="password" id="confirm-password" name="confirm-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />

                <label htmlFor="grade-level">Select a grade level:</label>
                <select id="grade-level" name="grade-level" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} required>
                    <option value="" disabled>Select grade level</option>
                    <option value="elementary">Elementary</option>
                    <option value="highschool">High School</option>
                    <option value="college">College</option>
                </select>
                <br></br>
                <label className="checkbox-row" htmlFor="terms">
                    <input type="checkbox" id="terms" name="terms" />
                    <span>I’m a parent/guardian creating this account</span>
                </label>

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

function RegisterTutor() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [subjects, setSubjects] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                subjects,
                role: "tutor",
                createdAt: serverTimestamp(),
            });

            toast.success("Tutor created!");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };


    return (
        <div className="register-container">
            <h1>Tutor Signup Page</h1>

            <form className="register-form" onSubmit={handleSignup}>
                <label htmlFor="name">Name:</label>
                <input type="text" value={name} placeholder="Enter your full name" onChange={(e) => setName(e.target.value)} required />

                <label htmlFor="email">Email:</label>
                <input type="email" value={email} placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />

                <label htmlFor="confirm-password">Confirm Password:</label>
                <input type="password" id="confirm-password" name="confirm-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />

                <label htmlFor="subjects">Subjects you can tutor:</label>
                <select id="subjects" name="subjects" value={subjects} onChange={(e) => setSubjects(e.target.value)} required>
                    <option value="" disabled>Select subject</option>

                    <option value="math">Math</option>
                    <option value="science">Science</option>
                    <option value="language">Language</option>
                    <option value="history">History</option>
                </select>


                <br></br>


                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
export { RegisterStudent, RegisterTutor };