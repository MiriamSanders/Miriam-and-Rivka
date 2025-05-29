import React, { useState, useEffect } from 'react';
import { getRequest } from '../Requests';
import '../styles/Recipes.css';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const getRecipes = async () => {
    const requestResult = await getRequest(`recipes?limit=${limit}&offset=${page}`);
    if (requestResult.succeeded) {
      const newRecipes = requestResult.data;
      if (newRecipes.length < limit) {
        setHasMore(false);
      }
      setRecipes((prev) => [...prev, ...newRecipes]); 
    } else {
      console.log(requestResult.error);
    }
  };

  useEffect(() => {
    getRecipes();
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="recipes-container">
      <h1>Recipes</h1>

      <div className="recipes-list">
        {recipes.length === 0 ? (
          <p className="no-recipes">No recipes found available</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.RecipeID} className="recipe-card">
              <div className="recipe-image" style={{ backgroundImage: `url(${recipe.ImageURL})` }}>
                <div className="recipe-overlay">
                  <h2>{recipe.Title}</h2>
                  <p>{recipe.Description}</p>
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
