import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import '../styles/RecipeReader.css'; // Import your CSS styles

const RecipeReader = ({ recipeData }) => {
  const [isReading, setIsReading] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // Extract recipe data
  const {
    Title = '',
    ChefName = '',
    PrepTimeMinutes = '',
    Difficulty = '',
    Category = '',
    Description = '',
    Instructions = ''
  } = recipeData?.recipe || {};
  
  const ingredients = recipeData?.ingredients || [];
  const tags = recipeData?.Tags || [];

  // Create complete recipe text
  const createRecipeText = () => {
    let text = '';
    
    if (Title) text += `Recipe: ${Title}. `;
    if (Description) text += `${Description}. `;
    if (ChefName) text += `Recipe by ${ChefName}. `;
    if (PrepTimeMinutes) text += `Preparation time: ${PrepTimeMinutes} minutes. `;
    if (Difficulty) text += `Difficulty level: ${Difficulty}. `;
    if (Category) text += `Category: ${Category}. `;
    
    // Format ingredients from the structured ingredient objects
    if (ingredients.length > 0) {
      const formattedIngredients = ingredients
        .filter(Boolean)
        .map(item => `${item.Quantity} ${item.Name}`);
      text += `Ingredients: ${formattedIngredients.join(', ')}. `;
    }
    
    if (Instructions) text += `Instructions: ${Instructions}. `;
    
    if (tags.length > 0) text += `Tags: ${tags.join(', ')}.`;
    
    return text;
  };

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (isReading) {
      // Stop reading
      synthRef.current.cancel();
      setIsReading(false);
    } else {
      // Start reading
      const text = createRecipeText();
      if (!text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsReading(false);
      };

      utterance.onerror = () => {
        setIsReading(false);
      };

      synthRef.current.speak(utterance);
      setIsReading(true);
    }
  };

  if (!recipeData) {
    return null;
  }

  return (
    <div className="recipe-reader">
      <button 
        onClick={handleReadAloud}
        className={`read-aloud-btn ${isReading ? 'reading' : ''}`}
        title={isReading ? 'Stop reading' : 'Read recipe aloud'}
      >
        {isReading ? (
          <>
            <Square size={16} />
            Stop Reading
          </>
        ) : (
          <>
            <Volume2 size={16} color='black' />
            Read Aloud
          </>
        )}
      </button>
    </div>
  );
};

export default RecipeReader;