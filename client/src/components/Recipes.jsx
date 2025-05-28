import React, { useState, useEffect } from 'react';
import { getRequest } from '../Requests'; // חשוב לוודא שיש לך את הפונקציה getRequest במקום אחר

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true);

  const getRecipes = async (pageNumber) => {
    const pageSize = 10;
    const requestResult = await getRequest(url);
    if (requestResult.succeeded) {
      const newRecipes = requestResult.data;
      if (newRecipes.length < pageSize) {
        setHasMore(false); // אין יותר מתכונים לטעון
      }
      setRecipes((prev) => [...prev, ...newRecipes]); // מוסיפים מתכונים לרשימה הקיימת
    } else {
      console.log(requestResult.error);
    }
  };

  useEffect(() => {
    getRecipes(page);
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="recipes-container">
      <h1>Recipes</h1>
      <div className="recipes-list">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} />
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={loadMore} className="load-more-button">
          load more
        </button>
      )}
    </div>
  );
}

export default Recipes;
