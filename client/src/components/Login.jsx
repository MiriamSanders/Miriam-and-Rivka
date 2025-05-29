import React, { useState } from "react";
import "../styles/Signup.css"; // Reusing the same CSS as Signup
import { postRequest } from "../Requests"; 

function Login() {
    const [form, setForm] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestResult = await postRequest("auth/login", form);
        if (requestResult.succeeded) {
            alert("login successfull!");
            // Optionally redirect to login or home page
        } else {
            alert("Error loging into the account account: " + requestResult.error);
        }
        console.log(form);
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <h2>Login</h2>
            <div>
                <label>User Name</label>
                <input
                    type="text"
                    name="username"
                    value={form.username}
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
        </form>
    );
}

export default Login;

