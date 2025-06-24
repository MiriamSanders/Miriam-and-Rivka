import React, { useState } from "react";
import { postRequest } from "../js_files/Requests";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/Footer.css";

export default function Footer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    imageURL: '',
    education: '',
    experienceYears: '',
    style: '',
    additionalInfo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.education || !formData.experienceYears || !formData.style) {
      toast.warning('Please fill in all required fields');
      return;
    }

    // Validate experience years is a number
    if (isNaN(formData.experienceYears) || formData.experienceYears < 0) {
      toast.warning('Please enter a valid number of experience years');
      return;
    }

    try {
      const submitData = { chefId: JSON.parse(localStorage.getItem("currentUser")).id, ...formData };
      await postRequest('chef-application', submitData);
      // Here you would make your API call to submit the chef application
      console.log('Chef application submitted:', formData);

      // Reset form after successful submission
      setFormData({
        imageURL: '',
        education: '',
        experienceYears: '',
        style: '',
        additionalInfo: ''
      });

      toast.success('Your chef application has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting chef application:', error);
      toast.error('There was an error submitting your application. Please try again.');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-header">
          <h2 className="footer-title">Request to join as a chef</h2>
          <p className="footer-subtitle">
            Share your culinary expertise with our community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="footer-form">


          <div className="form-row">
            <input
              type="url"
              name="imageURL"
              placeholder="Profile Image URL (optional)"
              className="footer-input"
              value={formData.imageURL}
              onChange={handleChange}
            />
            <input
              type="number"
              name="experienceYears"
              placeholder="Years of Experience *"
              className="footer-input"
              min="0"
              value={formData.experienceYears}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="education"
              placeholder="Culinary Education/Background *"
              className="footer-input"
              value={formData.education}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="style"
              placeholder="Cooking Style/Specialty *"
              className="footer-input"
              value={formData.style}
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            name="additionalInfo"
            placeholder="Tell us more about yourself, your cooking philosophy, or anything else you'd like to share..."
            className="footer-textarea"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows="4"
          />

          <button type="submit" className="footer-button">
            Submit Application
          </button>
        </form>

        <div className="footer-note">
          <p className="footer-note-text">
            * Required fields. We'll review your application and get back to you within 3-5 business days.
          </p>
        </div>

        <p className="footer-copyright">&copy; 2025 All rights reserved.</p>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

      </div>
    </footer>
  );
}