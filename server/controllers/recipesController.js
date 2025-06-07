const e = require('express');
const GenericDA = require('../services/GenericDA');
const RecipeDA = require('../services/recipeDA');
exports.getAllRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    console.log(limit, page);
    const offset = page * limit-limit;
    const recipes = await GenericDA.GenericGetAll('recipes', limit, offset, ["RecipeID", "ChefID", "Title", "ImageURL", "Category", "Description"]);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};

exports.getRecipeById = async (req, res) => {
  const recipeId = parseInt(req.params.id);
  if (isNaN(recipeId)) {
    return res.status(400).json({ error: 'Invalid recipe ID' });
  }

  try {
    console.log('Fetching recipe with ID:', recipeId)
    const recipe = await RecipeDA.getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};

exports.createRecipe = async (req, res) => {
  const {
    ChefID,
    Title,
    Description,
    ImageURL,
    Instructions,
    PrepTimeMinutes,
    Difficulty,
    Category,
    DishType,
    ingredients,
    tags
  } = req.body;

  // Validate required fields
  if (!ChefID || !Title || !ImageURL || !Category || !Description) {
    return res.status(400).json({ error: 'ChefID, Title, ImageURL, Category, and Description are required' });
  }

  try {
    // First, create the recipe
    const recipeData = {
      ChefID,
      Title,
      Description,
      ImageURL,
      Instructions,
      PrepTimeMinutes: PrepTimeMinutes || null,
      Difficulty: Difficulty || 'Easy',
      Category,
      DishType
    };

    const newRecipe = await GenericDA.GenericPost('Recipes', recipeData, 'RecipeID');
    const recipeId = newRecipe.RecipeID;

    // Handle ingredients if provided
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        const ingredientText = ingredients[i].trim();
        if (ingredientText) {
          // Parse ingredient text to extract quantity and ingredient name
          const { quantity, ingredientName } = parseIngredientText(ingredientText);

          if (ingredientName) {
            try {
              // Check if ingredient exists in the database
              let existingIngredient;
              try {
                // Try to find existing ingredient by name (case-insensitive)
                const searchResult = await GenericDA.GenericGet('Ingredients', "Name", ingredientName);
                 // Assuming GenericGet returns an array
                existingIngredient = searchResult[0];
              } catch (error) {
                // Ingredient doesn't exist, create it
                const newIngredientData = {
                  Name: ingredientName,
                  CaloriesPer100g: null,
                  ProteinPer100g: null,
                  CarbsPer100g: null,
                  FatPer100g: null,
                  FiberPer100g: null
                };
                existingIngredient = await GenericDA.GenericPost('Ingredients', newIngredientData, 'IngredientID');
                console.log(newIngredientData);
              }
              // Link the ingredient to the recipe
              const recipeIngredientData = {
                RecipeID: recipeId,
                IngredientID: existingIngredient.IngredientID,
                Quantity: quantity,
                OrderIndex: i + 1
              };

              await GenericDA.GenericPost('RecipeIngredients', recipeIngredientData, 'RecipeID');
            } catch (error) {
              console.error(`Error processing ingredient "${ingredientText}":`, error);
              // Continue with other ingredients even if one fails
            }
          }
        }
      }
    }

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        const tagName = tag.trim();
        if (tagName) {
          // First, find or create the tag
          let existingTag;
         
            existingTag = await GenericDA.GenericGet('Tags', "Name", tagName);
          if(!existingTag){
            // Tag doesn't exist, create it
            existingTag = await GenericDA.GenericPost('Tags', { Name: tagName }, 'TagID');
          }
         // console.log(`Linking recipe ${recipeId} to tag ${existingTag.TagID} (${tagName})`);
          //existingTag = existingTag[0]; // Assuming GenericGet returns an array
          console.log(existingTag);
          
          // Then link the recipe to the tag
          const recipeTagData = {
            RecipeID: recipeId,
            TagID: existingTag.TagID
          };

          await GenericDA.GenericPost('RecipeTags', recipeTagData, 'RecipeID');
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe: newRecipe
    });

  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Something went wrong while creating the recipe' });
  }
};
// Helper function to parse ingredient text and extract quantity and ingredient name
function parseIngredientText(ingredientText) {
  // Common patterns for ingredient parsing
  const patterns = [
    // Pattern: "2 cups flour" or "1 cup sugar"
    /^(\d+(?:\.\d+)?\s*(?:cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pcs?|pieces?))\s+(.+)$/i,
    // Pattern: "1/2 cup milk" or "3/4 tsp salt"
    /^(\d+\/\d+\s*(?:cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pcs?|pieces?))\s+(.+)$/i,
    // Pattern: "2-3 apples" or "1-2 onions"
    /^(\d+-\d+)\s+(.+)$/i,
    // Pattern: "a pinch of salt" or "a handful of nuts"
    /^(a\s+(?:pinch|handful|dash|splash|drizzle)\s+of)\s+(.+)$/i,
    // Pattern: just numbers at the start "2 salmon fillets"
    /^(\d+(?:\.\d+)?)\s+(.+)$/i,
    // Pattern: fraction at start "1/2 onion"
    /^(\d+\/\d+)\s+(.+)$/i
  ];

  for (const pattern of patterns) {
    const match = ingredientText.match(pattern);
    if (match) {
      return {
        quantity: match[1].trim(),
        ingredientName: match[2].trim()
      };
    }
  }

  // If no pattern matches, treat the whole text as ingredient name with empty quantity
  return {
    quantity: '',
    ingredientName: ingredientText
  };
}