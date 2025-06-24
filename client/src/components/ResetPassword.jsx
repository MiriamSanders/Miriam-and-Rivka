import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postRequest } from "../js_files/Requests";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await postRequest(`auth/reset-password/${token}`, { password });
    if (result.succeeded) {
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 100);
    } else {
      setMessage(result.message || "Error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Reset Your Password</h2>
      <label>New Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
      <p>{message}</p>
    </form>
  );
}
