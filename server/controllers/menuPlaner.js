const {createAndSendShoppingListEmail}=require('./emailHandler')
const dbPromise = require('../services/dbConnection');
const {
  getRecipeDetailsFromDb,
  getBackupRecipesFromDb,
  getIngredientsForMenusFromDb,
  postDailyMenu,
  postMenuRecipe
} = require('../services/mealPlanService');
const ingredientCanonicalMap=require('./ingredientCanonicalMap.json');

const calculateTagSimilarity = (r1 = {}, r2 = {}) => {
  if (!r1.tags || !r2.tags) return 0;
  const a = new Set(r1.tags.split(',').map(t => t.trim().toLowerCase()));
  const b = new Set(r2.tags.split(',').map(t => t.trim().toLowerCase()));
  const inter = [...a].filter(t => b.has(t)).length;
  return inter / new Set([...a, ...b]).size || 0;
};

const isKosherCombination = (side = {}, main = {}, dessert = {}) => {
  const cats = [side.category, main.category, dessert.category];
  return !(cats.includes('Meat') && cats.includes('Dairy'));
};

const rating = r => (r?.userRating > 0 ? r.userRating : r?.avgRating || 0);
const calculateMealScore = (s, m, d) => {
  let score = (rating(s) + rating(m) + rating(d)) * 10;
  score += (calculateTagSimilarity(s, m) + calculateTagSimilarity(m, d) + calculateTagSimilarity(s, d)) * 50;
  if (s?.userRating > 3) score += 20;
  if (m?.userRating > 3) score += 30;
  if (d?.userRating > 3) score += 20;
  return score;
};

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Weekday generator (Sun‑Thu)                                               */
/* ──────────────────────────────────────────────────────────────────────────── */
function getWeekdayDates(count = 5) {
  const dates = [];
  const today = new Date();
  let offset = 0;
  while (dates.length < count) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    if (![5, 6].includes(d.getDay())) {
      dates.push({
        regularDate: d.toISOString().slice(0, 10),
        formatted: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      });
    }
    offset++;
  }
  return dates;
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  1️⃣  Choose top kosher triples from user recipes                           */
/* ──────────────────────────────────────────────────────────────────────────── */
function pickKosherTriples(sides, mains, desserts, limit = 5) {
  const triples = [];
  for (const s of sides)
    for (const m of mains)
      for (const d of desserts)
        if (isKosherCombination(s, m, d)) triples.push({ s, m, d, score: calculateMealScore(s, m, d) });
  triples.sort((a, b) => b.score - a.score);

  const usedIds = new Set();
  const chosen = [];
  for (const t of triples) {
    if (chosen.length >= limit) break;
    if ([t.s, t.m, t.d].some(r => usedIds.has(r.recipeId))) continue;
    [t.s, t.m, t.d].forEach(r => usedIds.add(r.recipeId));
    chosen.push(t);
  }
  return { chosen, usedIds };
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  2️⃣  Build up to five meals (back‑ups can be Meat/Dairy/Parve)            */
/* ──────────────────────────────────────────────────────────────────────────── */
async function buildUpToFiveMeals(chosen, leftovers, usedIds, userId, limit = 5) {
  const meals = [...chosen];

  // Grab and remove last element helper
  const pull = arr => (arr.length ? arr.pop() : null);

  // NEW ➜ Choose backup from Meat→Dairy→Parve order to add variety
  const backup = async type => {
    for (const cat of ['Meat', 'Dairy', 'Parve']) {
      const r = await getBackupRecipesFromDb(cat, type, userId, Array.from(usedIds));
      if (r?.[0]) return r[0];
    }
    return null;
  };

  while (meals.length < limit) {
    // Use leftovers first, otherwise grab a backup (any category available)
    let side = pull(leftovers.sides) || await backup('side');
    let main = pull(leftovers.mains) || await backup('main');
    let dessert = pull(leftovers.desserts) || await backup('dessert');

    // If we still couldn’t form a trio, exit loop
    if (!side || !main || !dessert) break;

    // Ensure kosher by replacing conflicting course(s) with a new backup
    const kosherFix = async () => {
      if (isKosherCombination(side, main, dessert)) return true;
      if (dessert.category === 'Dairy' && (side.category === 'Meat' || main.category === 'Meat')) dessert = await backup('dessert');
      if (side.category === 'Dairy' && main.category === 'Meat') side = await backup('side');
      if (main.category === 'Dairy' && side.category === 'Meat') main = await backup('main');
      return isKosherCombination(side, main, dessert);
    };
    if (!await kosherFix()) break;  // give up on this iteration if still treif

    meals.push({ s: side, m: main, d: dessert, score: calculateMealScore(side, main, dessert) });
    [side, main, dessert].forEach(r => usedIds.add(r.recipeId));
  }

  return meals;
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  3️⃣  Orchestrator                                                         */
/* ──────────────────────────────────────────────────────────────────────────── */
async function createWeeklyMealPlan(sideIds, mainIds, dessertIds, userId) {
  if (!sideIds.length && !mainIds.length && !dessertIds.length) throw new Error('Need at least one recipe ID');

  const allIds = [...new Set([...sideIds, ...mainIds, ...dessertIds])];
  const rows = await getRecipeDetailsFromDb(allIds, userId);
  const byId = new Map(rows.map(r => [String(r.recipeId), r]));

  const sides = sideIds.map(id => byId.get(String(id))).filter(Boolean);
  const mains = mainIds.map(id => byId.get(String(id))).filter(Boolean);
  const desserts = dessertIds.map(id => byId.get(String(id))).filter(Boolean);

  const { chosen, usedIds } = pickKosherTriples(sides, mains, desserts, 5);

  const leftovers = {
    sides: sides.filter(r => !usedIds.has(r.recipeId)),
    mains: mains.filter(r => !usedIds.has(r.recipeId)),
    desserts: desserts.filter(r => !usedIds.has(r.recipeId))
  };

  const meals = await buildUpToFiveMeals(chosen, leftovers, usedIds, userId, 5);
  meals.sort((a, b) => b.score - a.score);
  const finalMeals = meals.slice(0, 5);

  const dates = getWeekdayDates(finalMeals.length);
  const plan = finalMeals.map((m, idx) => ({
    day: idx + 1,
    date: dates[idx].regularDate,
    side: { recipeId: m.s.recipeId, title: m.s.title },
    main: { recipeId: m.m.recipeId, title: m.m.title },
    dessert: { recipeId: m.d.recipeId, title: m.d.title }
  }));

  await persistPlanToDb(plan, userId);
  return { success: true, weeklyPlan: plan };
}

async function persistPlanToDb(weeklyMenu, userId) {
  const menus = [];
  for (const m of weeklyMenu) {
    const menuId  = await  postDailyMenu( { userId, menuDate: m.date });
    await postMenuRecipe({ menuId, recipeId: m.side.recipeId });
    await postMenuRecipe({ menuId, recipeId: m.main.recipeId });
    await postMenuRecipe({ menuId, recipeId: m.dessert.recipeId });
    menus.push(menuId);
  }
  await generateAndEmailShoppingList(menus, getWeekdayDates(weeklyMenu.length), userId, weeklyMenu);
}

function getCanonicalIngredientName(ingredientName) {
    const lowerName = ingredientName.toLowerCase().trim();
    // Check for exact match in map first
    if (ingredientCanonicalMap[lowerName]) {
        return ingredientCanonicalMap[lowerName];
    }

    // If no exact match, check if the name contains a mapped keyword
    for (const key in ingredientCanonicalMap) {
        if (lowerName.includes(key)) {
            return ingredientCanonicalMap[key];
        }
    }

    return ingredientName; // Return original if no canonical mapping found
}

async function generateShoppingListData(menuIds, dates, userId, weeklyMenu) {
    console.log(`Generating shopping list for menu IDs: [${menuIds.join(', ')}] for user ${userId}.`);

    try {
        // Get user email
        let userEmail;
        try {
            const db = await dbPromise;
            const [userRows] = await db.execute('SELECT email FROM users WHERE userId = ?', [userId]);
            if (userRows.length > 0) {
                userEmail = userRows[0].email;
            } else {
                console.warn(`User with ID ${userId} not found. Cannot send email.`);
                return { success: false, message: `User with ID ${userId} not found.` };
            }
        } catch (dbError) {
            console.error("Error fetching user email:", dbError);
            return { success: false, message: "Failed to fetch user email." };
        }

        // Get and process ingredients
        const rawShoppingListItems = await getIngredientsForMenusFromDb(menuIds);
        
        const canonicalShoppingList = new Set();
        rawShoppingListItems.forEach(item => {
            const canonicalName = getCanonicalIngredientName(item.ingredientName);
            canonicalShoppingList.add(canonicalName);
        });

        const shoppingListToDisplay = Array.from(canonicalShoppingList).sort();

        if (shoppingListToDisplay.length === 0) {
            console.log("No ingredients found for the selected menus. Skipping email.");
            return { success: true, message: "No ingredients found, no email sent." };
        }

        // Return processed data for email generation
        return {
            success: true,
            data: {
                userEmail,
                shoppingListItems: shoppingListToDisplay,
                dates,
                weeklyMenu,
                userId
            }
        };

    } catch (error) {
        console.error("Error generating shopping list data:", error);
        return { success: false, message: "An unexpected error occurred.", error: error.message };
    }
}

// Updated main function that calls both parts
async function generateAndEmailShoppingList(menuIds, dates, userId, weeklyMenu) {
    try {
        // Step 1: Generate the shopping list data
        const dataResult = await generateShoppingListData(menuIds, dates, userId, weeklyMenu);
        
        if (!dataResult.success) {
            return dataResult; // Return error from data generation
        }

        if (dataResult.message === "No ingredients found, no email sent.") {
            return dataResult; // Return early if no ingredients
        }

        // Step 2: Create HTML and send email
        const emailResult = await createAndSendShoppingListEmail(dataResult.data);
        
        return emailResult;

    } catch (error) {
        console.error("Error in generateAndEmailShoppingList:", error);
        return { success: false, message: "An unexpected error occurred.", error: error.message };
    }
}
/* ──────────────────────────────────────────────────────────────────────────── */
/*  Exports                                                                   */
/* ──────────────────────────────────────────────────────────────────────────── */
module.exports = { createWeeklyMealPlan, pairMealsForWeek: createWeeklyMealPlan };