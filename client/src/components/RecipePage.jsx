import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/RecipePage.css"; 

const RecipePage = () => {
  const { id } = useParams();
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:3001/recipes/${id}`);
        const data = await response.json();
        setRecipeData(data);
      } catch (err) {
        console.error("Error loading recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="center-text">Loading...</div>;
  if (!recipeData) return <div className="center-text">Recipe not found.</div>;
 const { Title, Subtitle, ChefName, PrepTimeMinutes, Difficulty, Category, Description, Instructions, ImageURL,ingredientsList } = recipeData.recipe || {};
  const ingredients = recipeData.ingredients || [];
  const tags = recipeData.Tags || [];
console.log("Recipe Data:", recipeData); // Debugging line to check the fetched data
  return (
    <div className="recipe-container">
      <h1 className="recipe-title">{Title}</h1>
      <h2 className="recipe-subtitle">{Subtitle}</h2>
      <p className="recipe-subtext">By: {ChefName}</p>
      <p className="recipe-subtext">
        Prep Time: {PrepTimeMinutes} min · Difficulty: {Difficulty} · Category: {Category}
      </p>

      {ImageURL ? (
        <img src={ImageURL} alt={Title} className="recipe-image-style" />
      ) : (
        <div className="image-placeholder">
          <div className="shapes">
            <div className="shape square" />
            <div className="shape circle" />
            <div className="shape triangle" />
          </div>
        </div>
      )}

      <div className="recipe-content">
        <section>
          <h2 className="section-title">Description</h2>
          <p>{Description}</p>
        </section>

           <section>
          <h2 className="section-title">Ingredients</h2>
          <ul className="ingredients-list">
            {Array.isArray(ingredients) ? (
              ingredients.map((item, idx) => (
                <li key={idx}>
                  {item.Quantity} {item.Name}
                </li>
              ))
            ) : (
              ingredientsList.map((item, idx) => (
                <li key={idx}>{item.trim()}</li>
              ))
            )}
          </ul>
        </section>
          <section>
          <h2 className="section-title">Instructions</h2>
          <p className="instructions">{Instructions}</p>
        </section>

        <section>
          <h2 className="section-title">Tags</h2>
          <div className="tags-container">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag">#{tag}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecipePage;
