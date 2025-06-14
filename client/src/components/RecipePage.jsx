import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RatingCard from "./RatingCard";
import RecipeReader from "./RecipeReader";
import RecipeDiscussion from "./RecipeDiscussion";
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
 const { title, subtitle, chefName, prepTimeMinutes, difficulty, category, description, instructions, imageURL,ingredientsList } = recipeData.recipe || {};
  const ingredients = recipeData.ingredients || [];
  const tags = recipeData.tags || [];
console.log("Recipe Data:", recipeData); // Debugging line to check the fetched data
  return (
    <div className="recipe-container">
      <h1 className="recipe-title">{title}</h1>
      <h2 className="recipe-subtitle">{subtitle}</h2>
      <p className="recipe-subtext">By: {chefName}</p>
      <p className="recipe-subtext">
        Prep Time: {prepTimeMinutes} min · Difficulty: {difficulty} · Category: {category}
      </p>
<RecipeReader recipeData={recipeData} />
      {imageURL ? (
        <img src={imageURL} alt={title} className="recipe-image-style" />
      ) : (
        <div className="image-placeholder">
          <div className="shapes">
            <div className="shape square" />
            <div className="shape circle" />
            <div className="shape triangle" />
          </div>
        </div>
      )}
      <RatingCard recipeId={id} />
      <div className="recipe-content">
        <section>
          <h2 className="section-title">Description</h2>
          <p>{description}</p>
        </section>

           <section>
          <h2 className="section-title">Ingredients</h2>
          <ul className="ingredients-list">
            {Array.isArray(ingredients) ? (
              ingredients.map((item, index) => (
                <li key={index}>
                  {item.quantity} {item.name}
                </li>
              ))
            ) : (
              ingredientsList.map((item, index) => (
                <li key={index}>{item.trim()}</li>
              ))
            )}
          </ul>
        </section>
          <section>
          <h2 className="section-title">Instructions</h2>
          <p className="instructions">{instructions}</p>
        </section>

        <section>
          <h2 className="section-title">Tags</h2>
          <div className="tags-container">
            {tags.map((tag,index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        </section>
      </div>
      <RecipeDiscussion recipeId={id}/>
    </div>
  );
};

export default RecipePage;
