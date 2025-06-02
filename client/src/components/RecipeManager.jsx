import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import AddRecipe from './AddRecipe';
import RecipeLibrary from './RecipeLibrary';
import '../styles/AddRecipe.css';

const RecipeManager = () => {
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('create');

  const addRecipe = (newRecipe) => {
    const recipeWithId = { ...newRecipe, id: Date.now() };
    setRecipes(prev => [...prev, recipeWithId]);
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">
          <ChefHat color="#ea580c" style={{ marginRight: '8px' }}/>
          Recipe Manager
        </h1>
        <p className="subtitle">Create recipes manually or import from documents</p>
      </div>

      <div className="tab-nav">
        <button
          onClick={() => setActiveTab('create')}
          className={`tab-button ${activeTab === 'create' ? 'tab-button-active' : 'tab-button-inactive'}`}
        >
          Create Recipe
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`tab-button ${activeTab === 'library' ? 'tab-button-active' : 'tab-button-inactive'}`}
        >
          Recipe Library ({recipes.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <AddRecipe onRecipeSaved={addRecipe} />
      )}

      {activeTab === 'library' && (
        <RecipeLibrary recipes={recipes} />
      )}
    </div>
  );
};

export default RecipeManager;