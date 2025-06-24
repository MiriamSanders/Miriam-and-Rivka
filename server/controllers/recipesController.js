const e = require('express');
const recipeService = require('../services/recipesService');
const tagService=require('../services/tagService');
const ingredientService=require('../services/ingredientService');
exports.getAllRecipes = async (options) => {
  try {
    const limit = parseInt(options.limit) || 10;
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    const hasFilters = options.category || options.chefName || options.title || options.dishType || options.userId || options.tags.length > 0 || options.anyTags.length > 0;
    const recipes = await recipeService.getRecipesAdvanced(options);

    console.log('Recipes fetched:', recipes);
    return recipes;
  } catch (error) {
    throw new Error('Something went wrong while fetching recipes:', error);
  }
};

exports.getRecipeById = async (recipeId) => {
  if (isNaN(recipeId)) {
    throw new Error('Invalid recipe ID');
  }
  try {
    console.log('Fetching recipe with ID:', recipeId)
    const recipe = await recipeService.getRecipeById(recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    return recipe;
  } catch (error) {
    throw new Error('Something went wrong while fetching recipe');
  }
};

//לפרק לפונקיציות קטנות יותר
exports.createRecipe = async (newRecipe) => {
  const {
    chefId,
    title,
    description,
    imageURL,
    instructions,
    prepTimeMinutes,
    difficulty,
    category,
    dishType,
    ingredients,
    tags
  } = newRecipe;
  console.log(newRecipe);

  // Validate required fields
  if (!chefId || !title || !imageURL || !category || !description) {
    console.log("error");

    throw new Error('chefId, title, imageURL, category, and description are required');
  }

  try {
    let difficultyId = await recipeService.getDifficultyByName(difficulty);
    if (!difficultyId) {
      difficultyId = await recipeService.createDifficulty(difficulty);
    }
    // First, create the recipe
    const recipeData = {
      chefId,
      title,
      description,
      imageURL,
      instructions,
      difficulty: difficultyId[0].difficultyId,
      prepTimeMinutes: prepTimeMinutes || null,
      category,
      dishType
    };
    console.log(recipeData);

    const newRecipe = await recipeService.postRecipe(recipeData);
    const recipeId = newRecipe.recipeId;
    console.log(newRecipe);

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
                const searchResult = await ingredientService.getIngredientByName(ingredientName);
                // Assuming GenericGet returns an array
                existingIngredient = searchResult[0];
                console.log(existingIngredient);

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
                existingIngredient = await ingredientService.postIngredient(newIngredientData);
                console.log(existingIngredient);
              }
              // Link the ingredient to the recipe
              const recipeIngredientData = {
                recipeId: recipeId,
                ingredientId: existingIngredient.ingredientID,
                quantity: quantity,
                orderIndex: i + 1
              };

              await ingredientService.postRecipeIngredients(recipeIngredientData);
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

          existingTag = await tagService.getTagByName(tagName);
          if (existingTag) {
            existingTag = existingTag[0];
          }
          if (!existingTag) {
            // Tag doesn't exist, create it
            existingTag = await tagService.postTag({ name: tagName });
          }
          console.log(existingTag);

          // Then link the recipe to the tag
          const recipeTagData = {
            recipeId: recipeId,
            tagId: existingTag.tagId
          };

          await tagService.postRecipeTags(recipeTagData);
        }
      }
    }

    return {
      success: true,
      message: 'Recipe created successfully',
      recipe: newRecipe
    };

  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong while creating the recipe');
  }
};

exports.getBestRatedRecipes = async () => {
  try {
    const bestRatedRecipes = await recipeService.getBestRatedRecipes();
    return bestRatedRecipes
  } catch (error) {
    throw new Error('Something went wrong while fetching best rated recipes');
  }

}
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

exports.deleteRecipe = async (recipeId) => {
  try {
    const result = await recipeService.deleteRecipe(recipeId);
    return result;
  } catch (error) {
    throw new Error('Something went wrong while deleting recipe');
  }
}

exports.putRecipe = async (recipeId, recipeData) => {
  const {
    title,
    description,
    imageURL,
    instructions,
    prepTimeMinutes,
    difficulty,
    category,
    dishType,
    ingredients,
    tags
  } = recipeData;

  // Validate required fields
  if (!title || !imageURL || !category || !description) {
    throw new Error('title, imageURL, category, and description are required');
  }

  try {
    let difficultyId = await recipeService.getDifficultyByName(difficulty);
    if (!difficultyId) {
      difficultyId = await recipeService.createDifficulty(difficulty);
    }
    // First, create the recipe
    const recipeData = {
      title,
      description,
      imageURL,
      instructions,
      difficulty: difficultyId[0].difficultyId,
      prepTimeMinutes: prepTimeMinutes || null,
      category,
      dishType,
    };
    console.log(recipeData);

    const newRecipe = await recipeService.updateRecipeById(recipeId, recipeData);
    console.log(newRecipe);

    // Handle ingredients if provided
    await syncRecipeIngredients(recipeId, ingredients);

    // Handle tags if provided
    await syncRecipeTags(recipeId, tags);

    return {
      success: true,
      message: 'Recipe created successfully',
      recipe: newRecipe
    };

  } catch (error) {
    throw new Error('Something went wrong while updating the recipe');

  }
};

async function syncRecipeIngredients(recipeId, ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return;
  }
  const parsedIngredients = [];
  for (let i = 0; i < ingredients.length; i++) {
    const ingredientText = ingredients[i].trim();
    if (!ingredientText) continue;

    const { quantity, ingredientName } = parseIngredientText(ingredientText);
    if (!ingredientName) continue;

    let existingIngredient;

    try {
      const searchResult = await ingredientService.getIngredientByName(ingredientName);
      existingIngredient = searchResult?.[0];
    } catch (e) {
      console.error(`Error fetching ingredient "${ingredientName}":`, e);
      continue;
    }

    if (!existingIngredient) {
      const newIngredientData = {
        Name: ingredientName,
        CaloriesPer100g: null,
        ProteinPer100g: null,
        CarbsPer100g: null,
        FatPer100g: null,
        FiberPer100g: null
      };
      existingIngredient = await ingredientService.postIngredient(newIngredientData);
    }

    parsedIngredients.push({
      ingredientId: existingIngredient.ingredientID,
      quantity,
      orderIndex: i + 1
    });
  }
  const existingIngredients = await recipeService.getRecipeIngredients(recipeId);
  const existingMap = new Map();
  existingIngredients.forEach(ing => {
    existingMap.set(ing.ingredientId, {
      quantity: ing.quantity,
      orderIndex: ing.orderIndex
    });
  });
  const incomingIds = new Set();
  for (const ingredient of parsedIngredients) {
    const existing = existingMap.get(ingredient.ingredientId);
    incomingIds.add(ingredient.ingredientId);

    if (existing) {
      if (
        existing.quantity !== ingredient.quantity ||
        existing.orderIndex !== ingredient.orderIndex
      ) {
        await recipeService.updateRecipeIngredient(recipeId, ingredient);
      }
    } else {
      await recipeService.insertRecipeIngredient(recipeId, {
        recipeId,
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        orderIndex: ingredient.orderIndex
      });
    }
  }
  for (const existingId of existingMap.keys()) {
    if (!incomingIds.has(existingId)) {
      await recipeService.deleteRecipeIngredient(recipeId, existingId);
    }
  }
}

async function syncRecipeTags(recipeId, tags) {
  if (!tags || !Array.isArray(tags)) return;
  let existingTagIds = new Set();
  const existingTagsRows = await tagService.getRecipeTags(recipeId);
  if (existingTagsRows && existingTagsRows.length > 0) {
    existingTagIds = new Set(existingTagsRows.map(row => row.tagId));
  }
  const newTagIds = new Set();
  for (let tagName of tags) {
    tagName = tagName.trim();
    if (!tagName) continue;
    let tag = (await tagService.getTagByName(tagName))?.[0];
    if (!tag) {
      tag = await tagService.postTag({ name: tagName });   }
    newTagIds.add(tag.tagId);
    if (!existingTagIds.has(tag.tagId)) {
      await tagService.postRecipeTags({
        recipeId: recipeId,
        tagId: tag.tagId
      });
    }
  }
  for (const oldTagId of existingTagIds) {
    if (!newTagIds.has(oldTagId)) {
      await recipeService.deleteRecipeTag(recipeId, oldTagId);
    }
  }
}


