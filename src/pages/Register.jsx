import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
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
    const [isParentGuardian, setIsParentGuardian] = useState(false);

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
            if(user.role === "student") {
                 toast.success("Student account created!");
            setTimeout(() => {
                navigate("/student-dashboard");
            }, 1200);

            }else{
                    toast.success("Tutor account created!");
            setTimeout(() => {
                navigate("/tutor-dashboard");
            }, 1200);
        }
           
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <section className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <span className="register-badge">Student account</span>
                    <h1>Create your student account</h1>
                    <p>Join TutorMatch and start finding the right tutor for your goals.</p>
                </div>

                <form className="register-form" onSubmit={handleSignup}>
                    <div className="input-group">
                        <label htmlFor="student-name">Full name</label>
                        <input
                            id="student-name"
                            type="text"
                            value={name}
                            placeholder="Enter your full name"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="student-email">Email</label>
                        <input
                            id="student-email"
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="student-password">Password</label>
                            <input
                                id="student-password"
                                type="password"
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="student-confirm-password">Confirm password</label>
                            <input
                                id="student-confirm-password"
                                type="password"
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="grade-level">Grade level</label>
                        <select
                            id="grade-level"
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            required
                        >
                            <option value="">Select grade level</option>
                            <option value="elementary">Elementary</option>
                            <option value="highschool">High School</option>
                            <option value="college">College</option>
                        </select>
                    </div>

                  

                    <button type="submit" className="register-button">
                        Create Student Account
                    </button>
                </form>

                <div className="register-footer">
                    <p>Already have an account?</p>
                    <Link to="/login" className="register-footer-link">
                        Log in
                    </Link>
                </div>
            </div>
        </section>
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
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                
                role: "tutor",
                createdAt: serverTimestamp(),
            });

            toast.success("Tutor account created!");
            setTimeout(() => {
                navigate("/student-dashboard");
            }, 1200);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <section className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <span className="register-badge">Tutor account</span>
                    <h1>Create your tutor account</h1>
                    <p>Set up your profile and start connecting with students.</p>
                </div>

                <form className="register-form" onSubmit={handleSignup}>
                    <div className="input-group">
                        <label htmlFor="tutor-name">Full name</label>
                        <input
                            id="tutor-name"
                            type="text"
                            value={name}
                            placeholder="Enter your full name"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="tutor-email">Email</label>
                        <input
                            id="tutor-email"
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="tutor-password">Password</label>
                            <input
                                id="tutor-password"
                                type="password"
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="tutor-confirm-password">Confirm password</label>
                            <input
                                id="tutor-confirm-password"
                                type="password"
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    </div>

                   

                    <button type="submit" className="register-button">
                        Create Tutor Account
                    </button>
                </form>

                <div className="register-footer">
                    <p>Already have an account?</p>
                    <Link to="/login" className="register-footer-link">
                        Log in
                    </Link>
                </div>
            </div>
        </section>
    );
}

export { RegisterStudent, RegisterTutor };