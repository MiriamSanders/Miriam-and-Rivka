import React, { useState,useEffect } from "react";
import "../styles/RatingCard.css"; // Assuming you have a CSS file for styling
import { postRequest } from "../Requests";
import { useErrorMessage } from "./useErrorMessage";
const RatingCard = ({ recipeId }) => {
    const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`http://localhost:3001/ratings/${recipeId}`);
        const data = await response.json(); // Debugging line to check the fetched data
        setRating(data.averageRating|| 0); // Set initial rating or default to 0
      } catch (err) {
        console.error("Error loading recipe:", err);
      }
    };
    fetchRating();
  }, []);

  const handleClick = (newRating) => {
    const currentUser= JSON.parse(localStorage.getItem("currentUser"));
    const postData= { userId:currentUser.id ,recipeId:recipeId, rating: newRating }// Assuming userId is stored in localStorage
    console.log("Post Data:", postData); // Debugging line to check the data being sent
    postRequest(`ratings`,postData )
    setRating(newRating);
    setShowModal(false);
  };

  return (
    <div className="rating-container">
      <div className="stars-display">
        {Array.from({ length: 5 }, (_, i) => {
          const full = i + 1 <= Math.floor(rating);
          const half = rating > i && rating < i + 1;
          return (
            <span key={i} className={`star ${full ? "full" : half ? "half" : ""}`}>★</span>
          );
        })}
        <span className="rate-link" onClick={() => setShowModal(true)}>Rate this recipe</span>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rate the Recipe</h3>
            <div className="stars-select">
              {Array.from({ length: 5 }, (_, i) => {
                const current = i + 1;
                return (
                  <span
                    key={i}
                    className={`star selectable ${hoverRating >= current || rating >= current ? "full" : ""}`}
                    onMouseEnter={() => setHoverRating(current)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleClick(current)}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            <button className="submit-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingCard;
