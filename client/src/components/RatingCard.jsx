import React, { useState } from "react";
import "../styles/RatingCard.css"; // Assuming you have a CSS file for styling

const RatingCard = ({ initialRating = 3.5 }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleClick = (newRating) => {
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
