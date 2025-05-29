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

  const { recipe, ingredients, tags } = recipeData;

  return (
    <div className="recipe-container">
      <h1 className="recipe-title">{recipe.Title}</h1>
      <p className="recipe-subtext">By: {recipe.ChefName}</p>
      <p className="recipe-subtext">
        Prep Time: {recipe.PrepTimeMinutes} min · Difficulty: {recipe.Difficulty} · Category: {recipe.Category}
      </p>

      {recipe.ImageURL && (
        <img src={recipe.ImageURL} alt={recipe.Title} className="recipe-image" />
      )}

      <section>
        <h2 className="section-title">Description</h2>
        <p>{recipe.Description}</p>
      </section>

      <section>
        <h2 className="section-title">Instructions</h2>
        <p className="instructions">{recipe.Instructions}</p>
      </section>

      <section>
        <h2 className="section-title">Ingredients</h2>
        <ul className="ingredients-list">
          {ingredients.map((item, idx) => (
            <li key={idx}>
              {item.Quantity} {item.Name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="section-title">Tags</h2>
        <div className="tags-container">
          {tags.map((tag, idx) => (
            <span key={idx} className="tag-badge">#{tag}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecipePage;
