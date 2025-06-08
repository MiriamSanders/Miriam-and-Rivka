import React from "react";
import "../styles/Footer.css"; // Assuming you have a CSS file for styling

export default function Footer() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <h2 className="footer-title">Request to join as a chef</h2>
        <form onSubmit={handleSubmit} className="footer-form">
          <input
            type="text"
            placeholder="name"
            className="footer-input"
            required
          />
          <input
            type="email"
            placeholder="email"
            className="footer-input"
            required
          />
          <textarea
            placeholder="Anything you would like to add?"
            className="footer-textarea"
          />
          <button type="submit" className="footer-button">
            send
          </button>
        </form>
        <p className="footer-copyright">&copy; 2025 All rights reserved.</p>
      </div>
    </footer>
  );
}