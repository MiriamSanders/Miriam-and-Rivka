import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useErrorMessage } from "./useErrorMessage";
import "../styles/RecipePage.css"; 
import { getRequest } from "../Requests";

function ChefPage(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [chefData, setChefData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);

  useEffect(() => {
    const fetchRecipe = async () => {
      const requestResult = await getRequest(`chefs/${id}`);
      if (requestResult.succeeded) {
        setChefData(requestResult.data[0]);
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="center-text">Loading...</div>;
  if (!chefData) return <div className="center-text">Chef not found.</div>;

  const { userName, imageURL, education, experienceYears, style } = chefData || {};
  console.log("Chef Data:", chefData);

  return (
    <div className="chef-container">
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
      <h1 className="chef-name">{userName}</h1>
      <h2 className="chef-education">{education}</h2>
      <p className="chef-experienceYears">{experienceYears}</p>
      <p className="chef-style">{style}</p>

      {imageURL ? (
        <img src={imageURL} alt={userName} className="chef-image-style" />
      ) : (
        <div className="image-placeholder">
          <div className="shapes">
            <div className="shape square" />
            <div className="shape circle" />
            <div className="shape triangle" />
          </div>
        </div>
      )}

      {/* כפתורי ניווט */}
      <div className="chef-buttons">
        <button onClick={() => navigate(`/chefs/${id}/recipes`)}>View Recipes</button>
        <button onClick={() => navigate(`/chefs/${id}/articles`)}>View Articles</button>
      </div>
    </div>
  );
};

export default ChefPage;
