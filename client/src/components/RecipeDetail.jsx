import React from "react";
import RecipeDiscussion from "./RecipeDiscussion";

const RecipePage = ({ recipe }) => {
  return (
    <div className="recipe-container">
      <h1 className="recipe-title">{recipe.title}</h1>
      <img
        src={recipe.image}
        alt={recipe.title}
        className="recipe-image"
      />
      <p className="recipe-description">{recipe.description}</p>
      <h2 className="section-title">Ingredients</h2>
      <ul className="ingredients-list">
        {recipe.ingredients.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h2 className="section-title">Instructions</h2>
      <ol className="instructions-list">
        {recipe.instructions.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      <RecipeDiscussion recipeId={recipe.id} />
    </div>
  );
};

export default RecipePage;
