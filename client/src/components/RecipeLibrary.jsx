import React from 'react';
import { Clock, Tag } from 'lucide-react';

const RecipeLibrary = ({ recipes }) => {
  return (
    <div>
      <h3 className="section-title">Saved Recipes</h3>
      {recipes.length === 0 ? (
        <p className="no-recipes">No recipes saved yet. Create your first recipe!</p>
      ) : (
        <div className="recipes-grid">
          {recipes.map((savedRecipe) => (
            <div key={savedRecipe.id} className="chef-recipe-card">
              {savedRecipe.image && (
                <img 
                  src={savedRecipe.image} 
                  alt={savedRecipe.name} 
                  className="chef-recipe-image" 
                  onError={(e) => {
                    e.target.style.display='none'; 
                    e.target.src='';
                  }} 
                />
              )}
              <h4 className="recipe-title">{savedRecipe.name}</h4>
              <p className="recipe-description">{savedRecipe.description}</p>
              <div className="recipe-meta">
                {savedRecipe.difficulty && (
                  <span className="badge badge-difficulty">{savedRecipe.difficulty}</span>
                )}
                {savedRecipe.prepTime && (
                  <span className="badge badge-time">
                    <Clock size={12} className="inline-icon" /> {savedRecipe.prepTime}
                  </span>
                )}
              </div>
              <div className="recipe-tags">
                {savedRecipe.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="recipe-tag">
                    <Tag size={10} className="inline-icon" /> {tag}
                  </span>
                ))}
              </div>
              {savedRecipe.instructions && (
                <div className="recipe-instructions" style={{whiteSpace: 'pre-line'}}>
                  {savedRecipe.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeLibrary;