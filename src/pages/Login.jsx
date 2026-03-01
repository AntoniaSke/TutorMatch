import { Link } from "react-router-dom";
import React, { useState } from "react";
import './Login.css';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../ErrorMessage";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;


            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();

                console.log("User data:", userData);

                // 3️⃣ Redirect ανάλογα με role
                if (userData.role === "student") {
                    navigate("/student-dashboard");
                } else if (userData.role === "tutor") {
                    navigate("/tutor-dashboard");
                }
            }

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div>
          
            <form className="login-form" onSubmit={handleLoginSubmit}>
                  <h1>Login</h1>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />

                <button type="submit">Login</button>
                <h2>Don't have an account?</h2>
            <Link to="/signup/student">Sign up as a Student</Link>
          
            <Link to="/signup/tutor">Sign up as a Tutor</Link>
            </form>
            
        </div>
    )
}
