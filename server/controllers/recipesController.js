const e = require('express');
const genericService = require('../services/genericService');
const recipeService = require('../services/recipesService');
exports.getAllRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    console.log(limit, page);
    const offset = page * limit - limit;
     if (Object.keys(req.query).length === 0) {
    const recipes = await recipeService.getAllRecipes(limit, offset)
    return res.json(recipes);}
    const options = {
      limit: limit,
      offset: offset,
      category: req.query.category,
      chefName: req.query.chefName,
      title: req.query.title,
      userId: req.query.userId,
      tags: req.query.tags ? req.query.tags.split(',') : [],
      anyTags: req.query.anyTags ? req.query.anyTags.split(',') : [],
      sortBy: req.query.sortBy || 'recipeId',
      sortOrder: req.query.sortOrder || 'DESC'
    };
    const recipes = await recipeService.getRecipesAdvanced(options);
    console.log('Recipes fetched:', recipes);
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
    const recipe = await recipeService.getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};

//לפרק לפונקיציות קטנות יותר
exports.createRecipe = async (req, res) => {
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
  } = req.body;
 console.log(req.body);
 
  // Validate required fields
  if (!chefId || !title || !imageURL || !category || !description) {
    console.log("error");
    
    return res.status(400).json({ error: 'chefId, title, imageURL, category, and description are required' });
  }

  try {
    let difficultyId=await genericService.genericGet("difficulty","name",difficulty);
    if(!difficultyId)
    {
     difficultyId=await genericService.genericPost("difficulty",{name:difficulty},"difficultyId")
    }
    // First, create the recipe
    const recipeData = {
      chefId,
      title,
      description,
      imageURL,
      instructions,
      difficulty:difficultyId[0].difficultyId,
      prepTimeMinutes: prepTimeMinutes || null,
      category,
      dishType
    };
    console.log(recipeData);
    
    const newRecipe = await genericService.genericPost('recipes', recipeData, 'recipeId');
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
                const searchResult = await genericService.genericGet('ingredients', "name", ingredientName);
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
                existingIngredient = await genericService.genericPost('ingredients', newIngredientData, 'ingredientId');
                console.log(existingIngredient);
              }
              // Link the ingredient to the recipe
              const recipeIngredientData = {
                recipeId: recipeId,
                ingredientId: existingIngredient.ingredientID,
                quantity: quantity,
                orderIndex: i + 1
              };

              await genericService.genericPost('recipeIngredients', recipeIngredientData, 'recipeId');
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

          existingTag = await genericService.genericGet('tags', "name", tagName);
          existingTag=existingTag[0];
          if (!existingTag) {
            // Tag doesn't exist, create it
            existingTag = await genericService.genericPost('tags', { name: tagName }, 'tagId');
          }
          // console.log(`Linking recipe ${recipeId} to tag ${existingTag.TagID} (${tagName})`);
          //existingTag = existingTag[0]; // Assuming GenericGet returns an array
          console.log(existingTag);

          // Then link the recipe to the tag
          const recipeTagData = {
            recipeId: recipeId,
            tagId: existingTag.tagId
          };

          await genericService.genericPost('recipeTags', recipeTagData, 'recipeId');
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
exports.getbestRatedRecipes=async(req,res) =>{
  try {
    const bestRatedRecipes = await recipeService.getBestRatedRecipes();
    res.json(bestRatedRecipes);
  } catch (error) {
    console.error('Error fetching best rated recipes:', error);
    res.status(500).json({ error: 'Something went wrong while fetching best rated recipes' });
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
exports.deleteRecipe=async(req,res)=>{
   try {
     const recipeId = parseInt(req.params.id);
      const result= await recipeService.deleteRecipe(recipeId);
       res.json(result);
    } catch (error) {
      console.error('Error delet recipe:', error);
      res.status(500).json({ error: 'somthing went wrong' });
    }
}
exports.putRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.id);
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
  } = req.body;
 console.log(req.body);
 
  // Validate required fields
  if (!title || !imageURL || !category || !description) {
    console.log("error");
    
    return res.status(400).json({ error: 'title, imageURL, category, and description are required' });
  }

  try {
    let difficultyId=await genericService.genericGet("difficulty","name",difficulty);
    if(!difficultyId)
    {
     difficultyId=await recipeService.createDifficulty(difficulty);
    }
    // First, create the recipe
    const recipeData = {
      title,
      description,
      imageURL,
      instructions,
      difficulty:difficultyId[0].difficultyId,
      prepTimeMinutes: prepTimeMinutes || null,
      category,
      dishType,
    };
    console.log(recipeData);
    
    const newRecipe = await recipeService.updateRecipeById(recipeId, recipeData);
    console.log(newRecipe);
    
    // Handle ingredients if provided
   await syncRecipeIngredients(recipeId,ingredients);

    // Handle tags if provided
   await syncRecipeTags(recipeId, tags);

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
async function syncRecipeIngredients(recipeId, ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return;
  }

  // שלב 1: המרה לרשימת מרכיבים מעובדים עם quantity ו-name
  const parsedIngredients = [];

  for (let i = 0; i < ingredients.length; i++) {
    const ingredientText = ingredients[i].trim();
    if (!ingredientText) continue;

    const { quantity, ingredientName } = parseIngredientText(ingredientText);
    if (!ingredientName) continue;

    let existingIngredient;

    try {
      // בדיקת קיום המרכיב במסד לפי שם (case-insensitive)
      const searchResult = await genericService.genericGet('ingredients', "name", ingredientName);
      existingIngredient = searchResult?.[0];
    } catch (e) {
      // התעלמות – ניצור אם לא נמצא
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
      existingIngredient = await genericService.genericPost('ingredients', newIngredientData, 'ingredientId');
    }

    parsedIngredients.push({
      ingredientId: existingIngredient.ingredientID,
      quantity,
      orderIndex: i + 1
    });
  }

  // שלב 2: קבלת רשימת מרכיבים קיימים שמקושרים למתכון
  const existingIngredients = await recipeService.getRecipeIngredients(recipeId);
  const existingMap = new Map();
  existingIngredients.forEach(ing => {
    existingMap.set(ing.ingredientId, {
      quantity: ing.quantity,
      orderIndex: ing.orderIndex
    });
  });

  // שלב 3: השוואה והכנסה/עדכון
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

  // שלב 4: מחיקת מרכיבים שהוסרו
  for (const existingId of existingMap.keys()) {
    if (!incomingIds.has(existingId)) {
      await recipeService.deleteRecipeIngredient(recipeId, existingId);
    }
  }
}


async function syncRecipeTags(recipeId, tags) {
    console.log("tag",tags);
  if (!tags || !Array.isArray(tags)) return;

  // שליפת תגיות קיימות למתכון
  const existingTagsRows = await genericService.genericGet('recipeTags', 'recipeId', recipeId);
  const existingTagIds = new Set(existingTagsRows.map(row => row.tagId));

  // שמירה של כל התגיות החדשות שנקבל
  const newTagIds = new Set();

  for (let tagName of tags) {
    tagName = tagName.trim();
    if (!tagName) continue;

    let tag = (await genericService.genericGet('tags', 'name', tagName))?.[0];

    if (!tag) {
      tag = await genericService.genericPost('tags', { name: tagName }, 'tagId');
    }

    newTagIds.add(tag.tagId);

    // אם התגית לא מקושרת – צור קישור
    if (!existingTagIds.has(tag.tagId)) {
      await genericService.genericPost('recipeTags', {
        recipeId: recipeId,
        tagId: tag.tagId
      }, 'recipeId');
    }
  }

  // מחיקת תגיות שכבר לא קיימות
  for (const oldTagId of existingTagIds) {
    if (!newTagIds.has(oldTagId)) {
      await recipeService.deleteRecipeTag(recipeId,oldTagId);
    }
  }
}


