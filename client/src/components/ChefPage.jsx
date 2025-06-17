import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CookingPot, Newspaper } from "lucide-react";
import { useErrorMessage } from "./useErrorMessage";
import "../styles/ChefPage.css";
import { getRequest } from "../Requests";

function ChefPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chefData, setChefData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);

  useEffect(() => {
    const fetchChef = async () => {
      try {
        const requestResult = await getRequest(`chefs/${id}`);
        if (requestResult.succeeded) {
          setChefData(requestResult.data[0]);
          setErrorCode(undefined);
        } else {
          setErrorCode(requestResult.status);
        }
      } catch (error) {
        console.error("Error fetching chef data:", error);
        setErrorCode(500);
      }
      setLoading(false);
    };

    fetchChef();
  }, [id]);

  if (loading) {
    return (
      <div className="chef-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chef information...</p>
        </div>
      </div>
    );
  }

  if (!chefData) {
    return (
      <div className="chef-page">
        <div className="error-container">
          <div className="error-icon">👨‍🍳</div>
          <h2>Chef Not Found</h2>
          <p>The chef you're looking for doesn't exist or has been removed.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/chefs')}
          >
            Browse All Chefs
          </button>
        </div>
      </div>
    );
  }

  const { userName, imageURL, education, experienceYears, style } = chefData;

  return (
    <div className="chef-page">
      {errorMessage && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {errorMessage}
        </div>
      )}

      <div className="chef-container">
        {/* Chef Header */}
        <div className="chef-header">
          <div className="chef-image-container">
            {imageURL ? (
              <img 
                src={imageURL} 
                alt={`${userName}'s profile`}
                className="chef-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="chef-image-placeholder" style={{ display: imageURL ? 'none' : 'flex' }}>
              <div className="placeholder-icon">👨‍🍳</div>
            </div>
          </div>
          
          <div className="chef-info">
            <h1 className="chef-name">{userName || 'Unknown Chef'}</h1>
            <div className="chef-details">
              {education && (
                <div className="detail-item">
                  <span className="detail-label">Education</span>
                  <span className="detail-value">{education}</span>
                </div>
              )}
              {experienceYears && (
                <div className="detail-item">
                  <span className="detail-label">Experience</span>
                  <span className="detail-value">{experienceYears} years</span>
                </div>
              )}
              {style && (
                <div className="detail-item">
                  <span className="detail-label">Culinary Style</span>
                  <span className="detail-value">{style}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="chef-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/recipes?chefName=${userName}`)}
          >
            <span className="btn-icon"><CookingPot/></span>
            View Recipes
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/chefs/${id}/articles`)}
          >
            <span className="btn-icon"><Newspaper/></span>
            View Articles
          </button>
        </div>

        {/* Back Button */}
        <div className="back-navigation">
          <button 
            className="btn btn-ghost"
            onClick={() => navigate('/chefs')}
          >
            ← Back to All Chefs
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChefPage;