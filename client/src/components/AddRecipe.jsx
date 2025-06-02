import React, { useState } from 'react';
import { parseRecipeDocument, readRecipeFile } from '../RecipeParser';
import { Upload, Plus, Minus, Clock, Star, Tag } from 'lucide-react';

const AddRecipe = ({ onRecipeSaved }) => {
  const [recipe, setRecipe] = useState({
    name: '', chef: '', description: '', image: '', prepTime: '',
    difficulty: 'Easy', category: '', dishType: '',
    ingredients: [''], instructions: '', tags: ['']
  });

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const categories = ['Meat', 'Vegetarian', 'Vegan', 'Seafood', 'Dessert', 'Appetizer'];
  const dishTypes = ['Main Course', 'Side Dish', 'Appetizer', 'Dessert', 'Snack', 'Beverage'];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    try {
      const text = await readRecipeFile(file);
      const parsedRecipe = parseRecipeDocument(text);
      setRecipe(parsedRecipe);
    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      event.target.value = null;
    }
  };

  const handleInputChange = (field, value) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setRecipe(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setRecipe(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    if (recipe[field].length > 1) {
      setRecipe(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const saveRecipe = () => {
    if (!recipe.name.trim()) {
      alert('Please enter a recipe name');
      return;
    }
    const cleanRecipe = {
      ...recipe,
      ingredients: recipe.ingredients.filter(item => item.trim()),
      tags: recipe.tags.filter(item => item.trim())
    };
    onRecipeSaved(cleanRecipe);
    setRecipe({
      name: '', chef: '', description: '', image: '', prepTime: '',
      difficulty: 'Easy', category: '', dishType: '',
      ingredients: [''], instructions: '', tags: ['']
    });
    alert('Recipe saved successfully!');
  };

  const ArrayInput = ({ field, label, placeholder }) => (
    <div className="array-section">
      <label className="label">{label}:</label>
      {recipe[field].map((item, index) => (
        <div key={index} className="array-input-group">
          <input
            type="text" value={item}
            onChange={(e) => handleArrayChange(field, index, e.target.value)}
            placeholder={placeholder} className="input"
          />
          <button
            onClick={() => removeArrayItem(field, index)}
            disabled={recipe[field].length === 1}
            className="button remove-button"
          ><Minus size={16} color='black' /></button>
          {index === recipe[field].length - 1 && (
            <button onClick={() => addArrayItem(field)} className="button add-button">
              <Plus size={16} color='black'  />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="upload-area">
        <div className="upload-content">
          <Upload size={48} color="#9ca3af" />
          <div>
            <label htmlFor="file-upload" className="upload-text" style={{cursor: 'pointer'}}>
              Upload a recipe document
            </label>
            <div className="upload-subtext">
              Supports .docx, .txt files
            </div>
            <input
              id="file-upload" type="file" style={{ display: 'none' }}
              accept=".docx,.txt"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-group">
            <label className="label">Recipe Name:</label>
            <input 
              type="text" 
              value={recipe.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              placeholder="Enter recipe name" 
              className="input" 
            />
          </div>
          <div className="form-group">
            <label className="label">Chef:</label>
            <input 
              type="text" 
              value={recipe.chef} 
              onChange={(e) => handleInputChange('chef', e.target.value)} 
              placeholder="Chef name" 
              className="input" 
            />
          </div>
          <div className="form-group">
            <label className="label">Description:</label>
            <textarea 
              value={recipe.description} 
              onChange={(e) => handleInputChange('description', e.target.value)} 
              placeholder="Brief description of the dish" 
              className="textarea" 
            />
          </div>
          <div className="form-group">
            <label className="label">Image URL:</label>
            <input 
              type="url" 
              value={recipe.image} 
              onChange={(e) => handleInputChange('image', e.target.value)} 
              placeholder="https://example.com/image.jpg" 
              className="input" 
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Recipe Details</h3>
          <div className="form-group">
            <label className="label">
              <Clock size={16} className="inline-icon" /> Prep Time:
            </label>
            <input 
              type="text" 
              value={recipe.prepTime} 
              onChange={(e) => handleInputChange('prepTime', e.target.value)} 
              placeholder="e.g., 30 minutes" 
              className="input" 
            />
          </div>
          <div className="form-group">
            <label className="label">
              <Star size={16} className="inline-icon" /> Difficulty:
            </label>
            <select 
              value={recipe.difficulty} 
              onChange={(e) => handleInputChange('difficulty', e.target.value)} 
              className="select"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Category:</label>
            <select 
              value={recipe.category} 
              onChange={(e) => handleInputChange('category', e.target.value)} 
              className="select"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Dish Type:</label>
            <select 
              value={recipe.dishType} 
              onChange={(e) => handleInputChange('dishType', e.target.value)} 
              className="select"
            >
              <option value="">Select dish type</option>
              {dishTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ArrayInput field="ingredients" label="Ingredients" placeholder="e.g., 2 salmon fillets" />
      
      <div className="form-section">
        <h3 className="section-title">Instructions</h3>
        <div className="form-group">
          <label className="label">Instructions:</label>
          <textarea 
            value={recipe.instructions} 
            onChange={(e) => handleInputChange('instructions', e.target.value)} 
            placeholder="Write step-by-step instructions here..." 
            className="textarea instructions-textarea" 
          />
        </div>
      </div>

      <ArrayInput field="tags" label="Tags" placeholder="e.g., Japanese, Dinner, Fish" />

      <div className="save-button-container">
        <button onClick={saveRecipe} className="save-button">Save Recipe</button>
      </div>
    </div>
  );
};

export default AddRecipe;
