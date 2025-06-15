import React, { useState } from "react";
import "../styles/Signup.css"; // Assuming you have a CSS file for styling
import { postRequest } from "../Requests";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useErrorMessage } from "./useErrorMessage";
function Signup({ setUserType }) {
    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: ""
    });
        const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);
    const navigate = useNavigate(); // Initialize useNavigate
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestResult = await postRequest("auth/register", form);
        if (requestResult.succeeded) {
            alert("Account created successfully!");
             setUserType(requestResult.data.userType);
             localStorage.setItem("currentUser", JSON.stringify(requestResult.data))
            // Assuming the user type is "user" after signup
            navigate("/"); // Redirect to login page after successful signup
            // Optionally redirect to login or home page
                setErrorCode(undefined);
        } else {
            setErrorCode(requestResult.status);
        }
        console.log(form);
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <h2>Create Account</h2>
             {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
            <div>
                <label>User Name</label>
                <input
                    type="text"
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Sign Up</button>
        </form>
    );
}

export default Signup;
