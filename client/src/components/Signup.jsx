import React, { useState } from "react";
import "../styles/Signup.css";
import { postRequest } from "../js_files/Requests";
import { useNavigate } from "react-router-dom";
import { useErrorMessage } from "./useErrorMessage";

function Signup({ setUserType }) {
    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: ""
    });

    const [errorCode, setErrorCode] = useState(undefined);
    const [validationError, setValidationError] = useState(""); 
    const errorMessage = useErrorMessage(errorCode);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        const re =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return re.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(form.email)) {
            setValidationError("Please enter a valid email address.");
            return;
        }
        if (!validatePassword(form.password)) {
            setValidationError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
            return;
        }

        setValidationError(""); 
        const requestResult = await postRequest("auth/register", form);

        if (requestResult.succeeded) {
            setUserType(requestResult.data.userType);
            localStorage.setItem("currentUser", JSON.stringify(requestResult.data));
            setErrorCode(undefined);
            navigate("/");
        } else {
            setErrorCode(requestResult.status);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <h2>Create Account</h2>
            {validationError && (
                <div style={{ color: "red", marginBottom: "1rem" }}>
                    ⚠️ {validationError}
                </div>
            )}
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
