import { useState } from "react";
import { postRequest } from "../js_files/Requests";

function ForgotPassword() {
    const [userName, setUserName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await postRequest("auth/forgot-password", { userName });
        if (result.succeeded) {
            setMessage("Reset email sent. Check your inbox.");
        } else {
            setMessage(result.message || "Error occurred.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <h2>Forgot Password</h2>
            <label>User Name</label>
            <input
                type="text"
                name="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
            />
            <button type="submit">Send Reset Link</button>
            <p>{message}</p>
        </form>
    );
}

export default ForgotPassword;
