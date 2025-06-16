/* kosherMealPlanner.js – functional style (no classes)
   ---------------------------------------------------------
   All logic is encapsulated in plain async/utility functions.
   The caller supplies an existing mysql2/promise connection or
   pool (e.g. `const db = await dbPromise`).
   --------------------------------------------------------- */

// -----------------------------------------------------------------------------
// 1. Data‑fetch helpers
// -----------------------------------------------------------------------------

/**
 * Fetch details (ratings, userRating, tags) for a list of recipeIds.
 */
async function getRecipeDetails(db, recipeIds = [], userId) {
  if (!recipeIds.length) return [];

  const placeholders = recipeIds.map(() => '?').join(',');
  const sql = `
    SELECT  r.recipeId,
            r.title,
            r.category,
            r.dishType,
            COALESCE(AVG(rr.rating),0)           AS avgRating,
            COALESCE(ur.rating,0)                AS userRating,
            GROUP_CONCAT(t.name)                 AS tags
    FROM      recipes r
      LEFT JOIN recipeRatings rr ON r.recipeId = rr.recipeId
      LEFT JOIN recipeRatings ur ON r.recipeId = ur.recipeId AND ur.userId = ?
      LEFT JOIN recipetags rt   ON r.recipeId = rt.recipeId
      LEFT JOIN tags      t    ON rt.tagId    = t.tagId
    WHERE r.recipeId IN (${placeholders})
    GROUP BY r.recipeId`;

  const [rows] = await db.execute(sql, [userId, ...recipeIds]);
  return rows;
}

/**
 * Fetch up to 5 highly rated backup recipes in a given category (or fallback).
 */
async function getBackupRecipes(db, preferredCategory, dishType, userId, excludeIds = []) {
  const excludeSQL = excludeIds.length
    ? `AND r.recipeId NOT IN (${excludeIds.map(() => '?').join(',')})`
    : '';

  const sql = `
    SELECT  r.recipeId, r.title, r.category, r.dishType,
            COALESCE(AVG(rr.rating),0) AS avgRating,
            COALESCE(ur.rating,0)      AS userRating,
            GROUP_CONCAT(t.name)       AS tags
    FROM      recipes r
      LEFT JOIN recipeRatings rr ON r.recipeId = rr.recipeId
      LEFT JOIN recipeRatings ur ON r.recipeId = ur.recipeId AND ur.userId = ?
      LEFT JOIN recipetags rt   ON r.recipeId = rt.recipeId
      LEFT JOIN tags      t    ON rt.tagId    = t.tagId
    WHERE (r.category = ? OR r.category = 'Parve')
      ${dishType ? 'AND r.dishType LIKE ?' : ''}
      ${excludeSQL}
    GROUP BY r.recipeId
    HAVING (userRating > 3 OR (userRating = 0 AND avgRating > 3))
    ORDER BY CASE WHEN userRating > 0 THEN userRating ELSE avgRating END DESC
    LIMIT 5`;

  const params = [userId, preferredCategory];
  if (dishType) params.push(`%${dishType}%`);
  if (excludeIds.length) params.push(...excludeIds);

  const [rows] = await db.execute(sql, params);
  return rows;
}

// -----------------------------------------------------------------------------
// 2. Pure utility helpers (no DB needed)
// -----------------------------------------------------------------------------

function calculateTagSimilarity(r1, r2) {
  if (!r1.tags || !r2.tags) return 0;
  const a = new Set(r1.tags.split(',').map(t => t.trim().toLowerCase()));
  const b = new Set(r2.tags.split(',').map(t => t.trim().toLowerCase()));
  const inter = [...a].filter(t => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

function isKosherCombination(side, main, dessert) {
  const cats = [side.category, main.category, dessert.category];
  return !(cats.includes('Meat') && cats.includes('Dairy'));
}

function calculateMealScore(side, main, dessert) {
  const rating = (r) => (r.userRating > 0 ? r.userRating : r.avgRating);
  let score = (rating(side) + rating(main) + rating(dessert)) * 10;

  score += (calculateTagSimilarity(side, main) +
            calculateTagSimilarity(main, dessert) +
            calculateTagSimilarity(side, dessert)) * 50;

  if (side.userRating > 3) score += 20;
  if (main.userRating > 3) score += 30;
  if (dessert.userRating > 3) score += 20;

  return score;
}

// -----------------------------------------------------------------------------
// 3. Pairing engine
// -----------------------------------------------------------------------------

function findBestPairings(sides, mains, desserts) {
  const combos = [];
  for (let s = 0; s < sides.length; s++)
    for (let m = 0; m < mains.length; m++)
      for (let d = 0; d < desserts.length; d++) {
        const side = sides[s];
        const main = mains[m];
        const dessert = desserts[d];
        if (!isKosherCombination(side, main, dessert)) continue;
        combos.push({
          sideIdx: s,
          mainIdx: m,
          dessertIdx: d,
          side,
          main,
          dessert,
          score: calculateMealScore(side, main, dessert)
        });
      }

  combos.sort((a, b) => b.score - a.score);

  const selected = [];
  const usedS = new Set();
  const usedM = new Set();
  const usedD = new Set();

  for (const c of combos) {
    if (selected.length === 5) break;
    if (usedS.has(c.sideIdx) || usedM.has(c.mainIdx) || usedD.has(c.dessertIdx)) continue;
    selected.push({
      day: selected.length + 1,
      side: c.side,
      main: c.main,
      dessert: c.dessert,
      score: c.score,
      isKosher: true
    });
    usedS.add(c.sideIdx);
    usedM.add(c.mainIdx);
    usedD.add(c.dessertIdx);
  }

  return { selectedMeals: selected, remainingCombos: combos.length };
}

// -----------------------------------------------------------------------------
// 4. Gap‑filling with smarter backups
// -----------------------------------------------------------------------------

// Change this function to handle flexible inputs
async function createWeeklyMealPlan(db, sideIds, mainIds, dessertIds, userId) {
  // REMOVE this strict validation:
  // if (sideIds.length !== 5 || mainIds.length !== 5 || dessertIds.length !== 5) {
  //   throw new Error('Provide exactly 5 sideIds, 5 mainIds, and 5 dessertIds');
  // }

  // ADD this flexible validation instead:
  if (!sideIds.length && !mainIds.length && !dessertIds.length) {
    throw new Error('Provide at least one recipe ID');
  }

  const recipeRows = await getRecipeDetails(db, [...sideIds, ...mainIds, ...dessertIds], userId);
  const byId = new Map(recipeRows.map(r => [r.recipeId, r]));

  const sides = sideIds.map(id => byId.get(id)).filter(Boolean);
  const mains = mainIds.map(id => byId.get(id)).filter(Boolean);
  const desserts = dessertIds.map(id => byId.get(id)).filter(Boolean);

  const { selectedMeals, remainingCombos } = findBestPairings(sides, mains, desserts);
  const { meals, replacements } = await fillMissingMeals(db, selectedMeals, sides, mains, desserts, userId);

  const simplifiedPlan = meals.map(m => ({
    day: m.day,
    side: { recipeId: m.side.recipeId, title: m.side.title },
    main: { recipeId: m.main.recipeId, title: m.main.title },
    dessert: { recipeId: m.dessert.recipeId, title: m.dessert.title }
  }));

  return {
    success: true,
    weeklyPlan: simplifiedPlan,
    statistics: {
      totalMeals: meals.length,
      kosherMeals: meals.filter(m => m.isKosher).length,
      totalReplacements: replacements.length,
      averageScore: meals.reduce((sum, m) => sum + m.score, 0) / meals.length,
      totalPossibleCombinations: remainingCombos
    },
    replacements
  };
}

// Minor improvement to backup selection for better category matching
async function fillMissingMeals(db, selectedMeals, allSides, allMains, allDesserts, userId) {
  const meals = [...selectedMeals];
  const replacements = [];

  const allOrigIds = [
    ...allSides.map(r => r.recipeId),
    ...allMains.map(r => r.recipeId),
    ...allDesserts.map(r => r.recipeId)
  ];

  const chooseBackup = async (preferredCat, dishType) => {
    const backups = await getBackupRecipes(db, preferredCat, dishType, userId, allOrigIds);
    return backups[0] || null;
  };

  while (meals.length < 5) {
    const day = meals.length + 1;

    const usedSideIds = new Set(meals.map(m => m.side.recipeId));
    const usedMainIds = new Set(meals.map(m => m.main.recipeId));
    const usedDessertIds = new Set(meals.map(m => m.dessert.recipeId));

    let side = allSides.find(r => !usedSideIds.has(r.recipeId));
    let main = allMains.find(r => !usedMainIds.has(r.recipeId));
    let dessert = allDesserts.find(r => !usedDessertIds.has(r.recipeId));

    // Check if current combination is kosher before proceeding
    if (side && main && dessert && !isKosherCombination(side, main, dessert)) {
      // Try to fix by replacing the most problematic recipe with a backup
      const categories = [side.category, main.category, dessert.category];
      const hasMeat = categories.includes('Meat');
      const hasDairy = categories.includes('Dairy');
      
      if (hasMeat && hasDairy) {
        // Replace the dairy item with a Parve backup (usually dessert, but check)
        if (dessert.category === 'Dairy') {
          dessert = await chooseBackup('Parve', 'dessert');
          replacements.push({ day, course: 'dessert', reason: 'kosher compliance - replaced dairy with parve' });
        } else if (side.category === 'Dairy') {
          side = await chooseBackup('Parve', 'side');
          replacements.push({ day, course: 'side', reason: 'kosher compliance - replaced dairy with parve' });
        } else if (main.category === 'Dairy') {
          main = await chooseBackup('Parve', 'main');
          replacements.push({ day, course: 'main', reason: 'kosher compliance - replaced dairy with parve' });
        }
      }
    }

    // Fill in missing recipes with backups
    if (!side) {
      const preferredCat = allSides.length > 0 ? allSides[0].category : 'Parve';
      side = await chooseBackup(preferredCat, 'side');
      if (side) {
        replacements.push({ day, course: 'side', reason: 'insufficient original recipes' });
      }
    }
    if (!main) {
      const preferredCat = allMains.length > 0 ? allMains[0].category : 'Parve';
      main = await chooseBackup(preferredCat, 'main');
      if (main) {
        replacements.push({ day, course: 'main', reason: 'insufficient original recipes' });
      }
    }
    if (!dessert) {
      const preferredCat = allDesserts.length > 0 ? allDesserts[0].category : 'Parve';
      dessert = await chooseBackup(preferredCat, 'dessert');
      if (dessert) {
        replacements.push({ day, course: 'dessert', reason: 'insufficient original recipes' });
      }
    }

    // Handle case where we still can't find recipes
    if (!side || !main || !dessert) {
      console.warn(`Could not complete meal for day ${day} - insufficient recipes available`);
      break;
    }

    meals.push({
      day,
      side,
      main,
      dessert,
      score: calculateMealScore(side, main, dessert),
      isKosher: isKosherCombination(side, main, dessert)
    });
  }

  return { meals, replacements };
}
// -----------------------------------------------------------------------------
// 6. Convenience wrapper for quick CLI/testing use
// -----------------------------------------------------------------------------

async function pairMealsForWeek(db, sideIds, mainIds, dessertIds, userId) {
  const result = await createWeeklyMealPlan(db, sideIds, mainIds, dessertIds, userId);
  return result;
}

module.exports = {
  createWeeklyMealPlan,
  pairMealsForWeek
};
