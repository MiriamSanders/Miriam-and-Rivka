import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import '../styles/RecipeFormatGuide.css';

export default function RecipeFormatGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatExample = `Recipe Name: [Your Recipe Title]

Description: [Brief description of the dish]

Image: [Optional image URL]

Prep Time: [Number in minutes]

Difficulty: [Easy/Medium/Hard]

Category: [Meat/Dairy/Parve/etc.]

Dish Type: [appetizer/main/dessert/etc.]

Ingredients:

-   [Amount] [ingredient name]
-   [Amount] [ingredient name]
-   [Amount] [ingredient name]

Instructions:

1.  [Step 1 instruction]
2.  [Step 2 instruction]
3.  [Step 3 instruction]

Tags:

-   [Tag 1]
-   [Tag 2]
-   [Tag 3]`;

  const fieldDescriptions = [
    { field: "Recipe Name", description: "The title of your recipe, should be descriptive and appetizing" },
    { field: "Description", description: "A brief summary of what the dish is like, texture, flavor profile, etc." },
    { field: "Image", description: "Optional URL to an image of the finished dish" },
    { field: "Prep Time", description: "Total preparation time in minutes (just the number)" },
    { field: "Difficulty", description: "Choose from: Easy, Medium, or Hard" },
    { field: "Category", description: "Kosher classification: Meat, Dairy, Parve" },
    { field: "Dish Type", description: "Type of dish: appetizer, main, dessert, side, etc." },
    { field: "Ingredients", description: "List each ingredient with amount, use bullet points" },
    { field: "Instructions", description: "Step-by-step instructions" },
    { field: "Tags", description: "Relevant tags like dietary restrictions, cuisine type, cooking method, etc. (use bullet points)" }
  ];

  return (
    <div className="recipe-format-container">
      <div className="button-container">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="format-guide-button"
        >
          <div className="icon-container">
            <FileText size={24} />
          </div>
          <div className="text-container">
            <h2 className="button-title">Recipe File Format Guide</h2>
            <p className="button-description">Click to see the expected format for recipe uploads</p>
          </div>
          <div className="chevron-container">
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="expanded-content">
          <div className="info-box">
            <Info className="info-icon" size={20} />
            <div>
              <h3 className="info-title">Important Notes:</h3>
              <ul className="info-list">
                <li>Keep the exact structure and spacing as shown</li>
                <li>Use bullet points (-) for ingredients and numbered lists for instructions</li>
                <li>All text should be in a .docx or .txt file format</li>
                <li>No special formatting needed - plain text is fine</li>
              </ul>
            </div>
          </div>

          <div className="content-grid">
            <div className="format-section">
              <h3 className="section-title">Expected File Format:</h3>
              <div className="format-example">
                <pre className="format-text">{formatExample}</pre>
              </div>
            </div>

            <div className="descriptions-section">
              <h3 className="section-title">Field Descriptions:</h3>
              <div className="field-descriptions">
                {fieldDescriptions.map((item, index) => (
                  <div key={index} className="field-item">
                    <h4 className="field-name">{item.field}</h4>
                    <p className="field-description">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tips-box">
            <h3 className="tips-title">Quick Tips:</h3>
            <div className="tips-grid">
              <ul className="tips-column">
                <li>Save as .docx or .txt file</li>
                <li>Keep formatting consistent</li>
                <li>Use descriptive ingredient amounts</li>
              </ul>
              <ul className="tips-column">
                <li>Write clear, actionable instructions</li>
                <li>Add relevant tags for discoverability</li>
                <li>Test your recipe before uploading!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}