import React, { useState } from 'react';
import { parseRecipeDocument, readRecipeFile } from '../RecipeParser';
import { Upload, Plus, Minus, Clock, Star, Tag } from 'lucide-react';
import { postRequest } from "../Requests";
// Move ArrayInput outside the component to prevent re-creation
const ArrayInput = ({ field, label, placeholder, recipe, handleArrayChange, addArrayItem, removeArrayItem }) => (
  <div className="array-section">
    <label className="label">{label}:</label>
    {recipe[field].map((item, index) => (
      <div key={index} className="array-input-group">
        <input
          type="text" 
          value={item}
          onChange={(e) => handleArrayChange(field, index, e.target.value)}
          placeholder={placeholder} 
          className="input"
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

const AddRecipe = () => {
  const [recipe, setRecipe] = useState({
    title: '', // Changed from 'name' // Changed from 'chef' - this should be a number/ID
    description: '', 
    imageURL: '', // Changed from 'image'
    prepTimeMinutes: '', // Changed from 'prepTime'
    difficulty: 'Easy', // Changed from 'difficulty'
    category: '', // Changed from 'category'
    dishType: '', // Changed from 'dishType'
    instructions: '', // Changed from 'instructions'
    ingredients: [''], // Keep for ingredients handling
    tags: [''] // Keep for tags handling
  });

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const categories = ['Meat', 'Dairy', 'Parve']; // Updated to match your ENUM values
  const dishTypes = ['Main Course', 'Side Dish', 'Appetizer', 'Dessert', 'Snack', 'Beverage'];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    try {
      const text = await readRecipeFile(file);
      const parsedRecipe = parseRecipeDocument(text);
      // Map parsed recipe to correct field names
      setRecipe({
        title: parsedRecipe.name || '',
        description: parsedRecipe.description || '',
        imageURL: parsedRecipe.image || '',
        prepTimeMinutes: parsedRecipe.prepTime || '',
        difficulty: parsedRecipe.difficulty || 'Easy',
        category: parsedRecipe.category || '',
        dishType: parsedRecipe.dishType || '',
        instructions: parsedRecipe.instructions || '',
        ingredients: parsedRecipe.ingredients || [''],
        tags: parsedRecipe.tags || ['']
      });
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
    if (!recipe.title.trim()) {
      alert('Please enter a recipe title');
      return;
    }
    if (!recipe.category) {
      alert('Please select a category');
      return;
    }
    if (!recipe.imageURL.trim()) {
      alert('Please enter an image URL');
      return;
    }
    if (!recipe.description.trim()) {
      alert('Please enter a description');
      return;
    }

    // Prepare the recipe data for the backend
    const cleanRecipe = {
      chefID: JSON.parse(localStorage.getItem("CurrentUser")).id, // Ensure it's a number
      title: recipe.title,
      description: recipe.description,
      imageURL: recipe.imageURL,
      instructions: recipe.instructions,
      prepTimeMinutes: recipe.prepTimeMinutes ? parseInt(recipe.prepTimeMinutes) : null,
      difficulty: recipe.difficulty,
      category: recipe.category,
      dishType: recipe.dishType,
      // Note: ingredients and tags will need separate handling since they're in different tables
      ingredients: recipe.ingredients.filter(item => item.trim()),
      tags: recipe.tags.filter(item => item.trim())
    };
    console.log('Clean Recipe Data:', cleanRecipe); // Debugging line to check the data being sent
    
   postRequest('recipes', cleanRecipe)
    // Send the recipe data to the backend

    
    // Reset form
    setRecipe({
      title: '',
      description: '',
      imageURL: '',
      prepTimeMinutes: '',
      difficulty: 'Easy',
      category: '',
      dishType: '',
      instructions: '',
      ingredients: [''],
      tags: ['']
    });
    alert('Recipe saved successfully!');
  };

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
            <label className="label">Recipe Title:</label>
            <input 
              type="text" 
              value={recipe.title} 
              onChange={(e) => handleInputChange('Title', e.target.value)} 
              placeholder="Enter recipe title" 
              className="input" 
            />
          </div>
          <div className="form-group">
            <label className="label">Description:</label>
            <textarea 
              value={recipe.description} 
              onChange={(e) => handleInputChange('Description', e.target.value)} 
              placeholder="Brief description of the dish" 
              className="textarea" 
            />
          </div>
          <div className="form-group">
            <label className="label">Image URL:</label>
            <input 
              type="url" 
              value={recipe.ImageURL} 
              onChange={(e) => handleInputChange('ImageURL', e.target.value)} 
              placeholder="https://example.com/image.jpg" 
              className="input" 
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Recipe Details</h3>
          <div className="form-group">
            <label className="label">
              <Clock size={16} className="inline-icon" /> Prep Time (Minutes):
            </label>
            <input 
              type="number" 
              value={recipe.prepTimeMinutes} 
              onChange={(e) => handleInputChange('PrepTimeMinutes', e.target.value)} 
              placeholder="e.g., 30" 
              className="input" 
            />
          </div>
          <div className="form-group">
            <label className="label">
              <Star size={16} className="inline-icon" /> Difficulty:
            </label>
            <select 
              value={recipe.difficulty} 
              onChange={(e) => handleInputChange('Difficulty', e.target.value)} 
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
              onChange={(e) => handleInputChange('Category', e.target.value)} 
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
              onChange={(e) => handleInputChange('DishType', e.target.value)} 
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

      <ArrayInput 
        field="ingredients" 
        label="Ingredients" 
        placeholder="e.g., 2 salmon fillets" 
        recipe={recipe}
        handleArrayChange={handleArrayChange}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
      
      <div className="form-section">
        <h3 className="section-title">Instructions</h3>
        <div className="form-group">
          <label className="label">Instructions:</label>
          <textarea 
            value={recipe.instructions} 
            onChange={(e) => handleInputChange('Instructions', e.target.value)} 
            placeholder="Write step-by-step instructions here..." 
            className="textarea instructions-textarea" 
          />
        </div>
      </div>

      <ArrayInput 
        field="tags" 
        label="Tags" 
        placeholder="e.g., Japanese, Dinner, Fish" 
        recipe={recipe}
        handleArrayChange={handleArrayChange}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />

      <div className="save-button-container">
        <button onClick={saveRecipe} className="save-button">Save Recipe</button>
      </div>
    </div>
  );
};

export default AddRecipe;