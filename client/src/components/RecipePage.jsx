import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RatingCard from "./RatingCard";
import RecipeReader from "./RecipeReader";
import { useErrorMessage } from "./useErrorMessage";
import RecipeDiscussion from "./RecipeDiscussion";
import "../styles/RecipePage.css";
import { getRequest, putRequest } from "../Requests";
import { Edit, Printer } from "lucide-react";

const RecipePage = () => {
  const { id } = useParams();
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState(undefined);
  const [editMode, setEditMode] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState({});
  const [originalRecipe, setOriginalRecipe] = useState({});
  const errorMessage = useErrorMessage(errorCode);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    const fetchRecipe = async () => {
      const requestResult = await getRequest(`recipes/${id}`);
      if (requestResult.succeeded) {
        setRecipeData(requestResult.data);
        setEditedRecipe({
          ...requestResult.data.recipe,
          ingredientsList: requestResult.data.ingredients?.map(i => `${i.quantity} ${i.name}`),
          tags: requestResult.data.tags || []
        });
        setOriginalRecipe({
          ...requestResult.data.recipe,
          ingredientsList: requestResult.data.ingredients?.map(i => `${i.quantity} ${i.name}`),
          tags: requestResult.data.tags || []
        });
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
      setLoading(false);
    };
    fetchRecipe();
  }, [id]);
  function validateRecipeFields(recipe) {
    const {
      title,
      prepTimeMinutes,
      difficulty,
      category
    } = recipe;

    if (
      !title?.trim() ||
      !prepTimeMinutes ||
      !difficulty?.trim() ||
      !category?.trim() ||
      !instructions?.trim()
    ) {
      return false;
    }
    return true;
  }

  const handleEditToggle = () => setEditMode((prev) => !prev);

  const handleCancel = () => {
    setEditedRecipe(originalRecipe);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (validateRecipeFields(editedRecipe)) {
      const updatedData = {
        ...editedRecipe,
        ingredients: editedRecipe.ingredientsList || [],
        tags: editedRecipe.tags || []
      };
      const result = await putRequest(`recipes/${id}`, updatedData);
      if (result.succeeded) {
        setRecipeData((prev) => ({ ...prev, recipe: updatedData, tags: updatedData.tags }));
        setOriginalRecipe(updatedData);
        setEditMode(false);
        setErrorCode(undefined);
      } else {
        setErrorCode(result.status);
      }
    }
    else {
      alert("All fields must be filled in.")
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="center-text">Loading...</div>;
  if (!recipeData) return <div className="center-text">Recipe not found.</div>;

  const {
    title,
    chefName,
    prepTimeMinutes,
    difficulty,
    category,
    description,
    instructions,
    imageURL,
    ingredientsList,
    tags: tagList = []
  } = editMode ? editedRecipe : recipeData.recipe || {};

  const ingredients = recipeData.ingredients || [];
  const tags = editMode ? editedRecipe.tags || [] : recipeData.tags || [];
  const isEditable = currentUser?.userType === "admin" || currentUser?.id === recipeData.recipe.chefID;

  return (
    <div className="recipe-container">
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Fixed position print button */}
      <button onClick={handlePrint} className="print-button no-print">
        <Printer />
      </button>

      {/* Edit controls */}
      {isEditable && (
        <div className="recipe-actions no-print" style={{ marginBottom: '1rem' }}>
          {editMode ? (
            <>
              <button onClick={handleSave} className="edit-save-button">Save</button>
              <button onClick={handleCancel} style={{ marginLeft: '8px' }} className="edit-cancel-button">Cancel</button>
            </>
          ) : (
            <button onClick={handleEditToggle} className="edit-button"><Edit/></button>
          )}
        </div>
      )}{console.log(recipeData)}

      <div className="printable-content">
        <h1 className="recipe-title">
          {editMode ? (<>
            title:
            <input
              className="edit-title-input"
              value={title}
              onChange={(e) => setEditedRecipe({ ...editedRecipe, title: e.target.value })}
            /></>
          ) : (
            title
          )}
        </h1>

        <p className="recipe-subtext">By: {chefName}</p>
        <p className="recipe-subtext">
          {editMode ? (
            <>
              Prep Time:
              <input
                className="edit-meta-input"
                type="number"
                min={1}
                value={prepTimeMinutes}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, prepTimeMinutes: parseInt(e.target.value) || 0 })
                }
                style={{ width: "60px", margin: "0 5px" }}
              />
              min · Difficulty:
              <input
                type="text"
                className="edit-meta-input"
                value={difficulty}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, difficulty: e.target.value })
                }
                style={{ width: "100px", margin: "0 5px" }}
              />
              · Category:
              <input
                type="text"
                className="edit-meta-input"
                value={category}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, category: e.target.value })
                }
                style={{ width: "100px", margin: "0 5px" }}
              />
            </>
          ) : (
            <>
              Prep Time: {prepTimeMinutes} min · Difficulty: {difficulty} · Category: {category}
            </>
          )}
        </p>

        <div className="no-print">
          <RecipeReader recipeData={recipeData} />
        </div>

        {imageURL && (
          <img src={imageURL} alt={title} className="recipe-image-style print-image" />
        )}

        <div className="recipe-content">
          <section>
            <h2 className="section-title">Description</h2>
            {editMode ? (
              <textarea
              className="edit-description-textarea"
                value={description}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, description: e.target.value })}
                rows={4}
              />
            ) : (
              <p>{description}</p>
            )}
          </section>

          <section>
            <h2 className="section-title">Ingredients</h2>
            {editMode ? (
              <textarea
              className="edit-ingredients-textarea"
                value={ingredientsList?.join("\n") || ""}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, ingredientsList: e.target.value.split("\n") })
                }
                rows={5}
              />
            ) : (
              <ul className="ingredients-list">
                {Array.isArray(ingredients)
                  ? ingredients.map((item, index) => (
                    <li key={index}>
                      {item.quantity} {item.name}
                    </li>
                  ))
                  : ingredientsList.map((item, index) => (
                    <li key={index}>{item.trim()}</li>
                  ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="section-title">Instructions</h2>
            {editMode ? (
              <textarea
              className="edit-instructions-textarea"
                value={instructions}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, instructions: e.target.value })}
                rows={5}
              />
            ) : (
              <div className="instructions">
                {instructions?.split('\n').map((step, index) => (
                  <p key={index} className="instruction-step">
                    {step.trim() && `${index + 1}. ${step.trim()}`}
                  </p>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="section-title no-print">Tags</h2>
            {editMode ? (
              <textarea
              className="edit-tags-textarea "
                value={tags.join("\n")}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, tags: e.target.value.split("\n") })}
                rows={3}
              />
            ) : (
              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="no-print">
        <RatingCard recipeId={id} />
        <RecipeDiscussion recipeId={id} />
      </div>
    </div>
  );
};

export default RecipePage;