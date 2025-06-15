import React, { useState, useEffect } from 'react';
import { getRequest } from '../Requests';
import SearchFilterBar from './SearchBar';
import { useErrorMessage } from "./useErrorMessage";
import '../styles/Recipes.css';
import { useNavigate } from 'react-router-dom';

function Recipes({ createMenu }) {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
      const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const navigate = useNavigate();
  const limit = 10;

  const getRecipes = async () => {
    
      const requestResult = await getRequest(`recipes?limit=${limit}&page=${page}`);
      if (requestResult.succeeded) {
        const newRecipes = requestResult.data;
        if (newRecipes.length < limit) {
          setHasMore(false);
        }
        setRecipes((prev) => [...prev, ...newRecipes]);
            setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
  };
  const openRecipePage = (e) => {
    const recipeId = e.currentTarget.getAttribute('name');
    navigate(`/recipes/${recipeId}`);
  }
  useEffect(() => {
    getRecipes();
    console.log(recipes);

  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="recipes-container">
      <h1>Recipes</h1>
       {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
      <SearchFilterBar />
      <div className="recipes-list">
        {recipes.length === 0 ? (
          <p className="no-recipes">No recipes found available</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.recipeId} name={recipe.recipeId} className="recipe-card" onClick={openRecipePage}>
              <div className="recipe-image" style={{ backgroundImage: `url(${recipe.imageURL})` }}>
                {createMenu && (
                  <button className="add-to-menu-button" onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the recipe click
                  }}>
                    Add to Menu
                  </button>
                )}
                <div className="recipe-overlay">
                  <h2>{recipe.title}</h2>
                  <p>{recipe.description}</p>
                  <div>
                    Tags:
                    {recipe.tags?.split(',').map((tag, index) => (
                      <span key={index} style={{ marginRight: '6px', padding: '2px 6px', backgroundColor: 'black', borderRadius: '4px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && recipes.length > 0 && (
        <button onClick={loadMore} className="load-more-button">
          load more
        </button>
      )}
    </div>
  );
}

export default Recipes;
