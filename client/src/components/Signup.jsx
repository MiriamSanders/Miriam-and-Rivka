import React, { useState } from "react";
import "../styles/Signup.css"; // Assuming you have a CSS file for styling
import { postRequest } from "../Requests";

function Signup() {
    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit =async (e) => {
        e.preventDefault();
      const requestResult =  await postRequest("auth/register", form);
        if (requestResult.succeeded) {
            alert("Account created successfully!");
            // Optionally redirect to login or home page
        } else {
            alert("Error creating account: " + requestResult.error);
        }
        console.log(form);
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <h2>Create Account</h2>
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
