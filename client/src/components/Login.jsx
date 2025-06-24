import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import "../styles/Signup.css"; // Reusing the same CSS as Signup
import { postRequest } from "../js_files/Requests";
import { useErrorMessage } from "./useErrorMessage";
function Login({ setUserType }) {
    const [errorCode, setErrorCode] = useState(undefined);
    const errorMessage = useErrorMessage(errorCode);
    const [form, setForm] = useState({
        userName: "",
        password: ""
    });
    const navigate = useNavigate();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestResult = await postRequest("auth/login", form);

        if (requestResult.succeeded) {
            setUserType(requestResult.data.userType);// Assuming the user type is "user" after login
            localStorage.setItem("currentUser", JSON.stringify(requestResult.data))
            navigate("/");
            // Optionally redirect to login or home page
        } else {
            setErrorCode(requestResult.status);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <h2>Login</h2>
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
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Login</button>
            <div style={{ marginTop: "1rem" }}>
                <Link to="/forgot-password">Forgot your password?</Link>
            </div>
        </form>
    );
}

export default Login;

