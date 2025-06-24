
import React, { useState } from 'react';
import { parseRecipeDocument, readRecipeFile } from '../js_files/RecipeParser';
import { Upload, Plus, Minus, Clock, Star, Image } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { postRequest } from "../js_files/Requests";
import RecipeFormatGuide from './RecipeFormatGuide';
import '../styles/AddRecipe.css'

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
        >
          <Minus size={16} color="black" />
        </button>
        {index === recipe[field].length - 1 && (
          <button onClick={() => addArrayItem(field)} className="button add-button">
            <Plus size={16} color="black" />
          </button>
        )}
      </div>
    ))}
  </div>
);

const AddRecipe = () => {
  const [recipe, setRecipe] = useState({
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

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const categories = ['Meat', 'Dairy', 'Parve'];
  const dishTypes = ['main', 'side', 'dessert'];

  // ---------- File & Image helpers ---------- //
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    try {
      const text = await readRecipeFile(file);
      const parsedRecipe = parseRecipeDocument(text);
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
      toast.error(error)
      console.error(error);
    } finally {
      event.target.value = null;
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.warning('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate size (max 5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.warning('Image file is too large. Please select a file under 5 MB.');
      return;
    }

    setSelectedImage(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };


  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await fetch('http://localhost:3001/upload-image', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Image upload failed');
      const { url } = await res.json();
      return url;
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };


  const handleInputChange = (field, value) => {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const addArrayItem = (field) => {
    setRecipe((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    if (recipe[field].length > 1) {
      setRecipe((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const saveRecipe = async () => {
    if (!recipe.title.trim()) {
      toast.warning('Please enter a recipe title');
      return;
    }

    if (!recipe.category) {
      toast.warning('Please select a category');
      return;
    }

    if (!selectedImage && !recipe.imageURL.trim()) {
      toast.warning('Please upload an image or enter an image URL');
      return;
    }

    if (!recipe.description.trim()) {
      toast.warning('Please enter a description');
      return;
    }


    let imagePath = recipe.imageURL;
    if (selectedImage) {
      imagePath = await uploadImageToServer(selectedImage);
      if (!imagePath) return; // Upload failed
    }

    const cleanRecipe = {
      chefId: JSON.parse(localStorage.getItem('currentUser')).id,
      title: recipe.title,
      description: recipe.description,
      imageURL: imagePath,
      instructions: recipe.instructions,
      prepTimeMinutes: recipe.prepTimeMinutes ? parseInt(recipe.prepTimeMinutes, 10) : null,
      difficulty: recipe.difficulty,
      category: recipe.category,
      dishType: recipe.dishType,
      ingredients: recipe.ingredients.filter((i) => i.trim()),
      tags: recipe.tags.filter((t) => t.trim())
    };

    try {
      await postRequest('recipes', cleanRecipe);
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
      setSelectedImage(null);
      setImagePreview(null);
      toast.success('Recipe saved successfully!');
    } catch (err) {
      console.error('Error saving recipe:', err);
      toast.error('Failed to save recipe. Please try again.');
    }
  };


  return (
    <div>
      {/* Upload Docx / Txt */}
      <div className="upload-area">
        <div className="upload-content">
          <Upload size={48} color="#9ca3af" />
          <div>
            <label htmlFor="file-upload" className="upload-text" style={{ cursor: 'pointer' }}>
              Upload a recipe document
            </label>
            <div className="upload-subtext">Supports .docx, .txt files</div>
            <input id="file-upload" type="file" style={{ display: 'none' }} accept=".docx,.txt" onChange={handleFileUpload} />
          </div>
        </div>
      </div>

      <RecipeFormatGuide />

      {/* Basic Info & Details */}
      <div className="form-grid">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-group">
            <label className="label">Recipe Title:</label>
            <input type="text" value={recipe.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Enter recipe title" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Description:</label>
            <textarea value={recipe.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Brief description of the dish" className="textarea" />
          </div>
          <div className="form-group">
            <label className="label">
              <Image size={16} className="inline-icon" /> Recipe Image:
            </label>
            <div className="image-upload-section">
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <label htmlFor="image-upload" className="image-upload-button" style={{ cursor: 'pointer' }}>
                {selectedImage ? 'Change Image' : 'Upload Image'}
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Recipe preview" style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />
                </div>
              )}
              <div className="upload-subtext" style={{ marginTop: '5px' }}>
                Supports JPEG, PNG, GIF, WebP (max 5MB)
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Recipe Details</h3>
          <div className="form-group">
            <label className="label">
              <Clock size={16} className="inline-icon" /> Prep Time (Minutes):
            </label>
            <input type="number" value={recipe.prepTimeMinutes} onChange={(e) => handleInputChange('prepTimeMinutes', e.target.value)} placeholder="e.g., 30" className="input" />
          </div>
          <div className="form-group">
            <label className="label">
              <Star size={16} className="inline-icon" /> Difficulty:
            </label>
            <select value={recipe.difficulty} onChange={(e) => handleInputChange('difficulty', e.target.value)} className="select">
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Category:</label>
            <select value={recipe.category} onChange={(e) => handleInputChange('category', e.target.value)} className="select">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Dish Type:</label>
            <select value={recipe.dishType} onChange={(e) => handleInputChange('dishType', e.target.value)} className="select">
              <option value="">Select dish type</option>
              {dishTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <ArrayInput field="ingredients" label="Ingredients" placeholder="e.g., 2 salmon fillets" recipe={recipe} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />

      {/* Instructions */}
      <div className="form-section">
        <h3 className="section-title">Instructions</h3>
        <div className="form-group">
          <label className="label">Instructions:</label>
          <textarea value={recipe.instructions} onChange={(e) => handleInputChange('instructions', e.target.value)} placeholder="Write step-by-step instructions here..." className="textarea instructions-textarea" />
        </div>
      </div>

      {/* Tags */}
      <ArrayInput field="tags" label="Tags" placeholder="e.g., Japanese, Dinner, Fish" recipe={recipe} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />

      {/* Save */}
      <div className="save-button-container">
        <button onClick={saveRecipe} className="save-button" disabled={uploadingImage}>
          {uploadingImage ? 'Uploading Image...' : 'Save Recipe'}
        </button>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

    </div>
  );
};

export default AddRecipe;
