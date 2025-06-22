import React from 'react';
import { ChefHat } from 'lucide-react';
import AddRecipe from './AddRecipe';
import '../styles/AddRecipe.css';

const RecipeManager = () => {
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">
          <ChefHat color="black" size={40}  />
          Recipe Manager
        </h1>
        <p className="subtitle">Create recipes manually or import from documents</p>
      </div>
      
      <AddRecipe />
    </div>
  );
};

export default RecipeManager;