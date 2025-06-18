

const mysql = require('mysql2/promise');
const dbPromise = require('../services/dbConnection');
const { genericPost } = require('../services/genericService');
function addToDb(weeklyMenu,id)
{
  //add to databaase
  //orginizee this codeeeeeeeeeee!!!!!!!!!!1
weeklyMenu.forEach(async m=>{
  let menuDay=await genericPost("dailymenus",{userId:id,date:m.date});


})
}
// -----------------------------------------------------------------------------
// 1. Data‑fetch helpers
// -----------------------------------------------------------------------------
function getWeekdayDates() {
  const dates = [];
  const currentDate = new Date();
  let daysAdded = 0;
  let dayOffset = 0;

  while (daysAdded < 5) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + dayOffset);
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    
    // Skip Friday (5) and Saturday (6) nights
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      dates.push({
        date: date,
        formatted: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        }),
        dayNumber: daysAdded + 1
      });
      daysAdded++;
    }
    dayOffset++;
  }

  return dates;
}
async function getRecipeDetails(recipeIds = [], userId) {
  const db = await dbPromise;
  if (!recipeIds.length) return [];

  const placeholders = recipeIds.map(() => '?').join(',');
  const sql = `
    SELECT  r.recipeId,
            r.title,
            r.category,
            r.dishType,
            COALESCE(AVG(rr.rating),0)           AS avgRating,
            COALESCE(MAX(ur.rating),0)           AS userRating,
            GROUP_CONCAT(DISTINCT t.name)        AS tags
    FROM      recipes r
      LEFT JOIN recipeRatings rr ON r.recipeId = rr.recipeId
      LEFT JOIN recipeRatings ur ON r.recipeId = ur.recipeId AND ur.userId = ?
      LEFT JOIN recipetags rt   ON r.recipeId = rt.recipeId
      LEFT JOIN tags      t    ON rt.tagId    = t.tagId
    WHERE r.recipeId IN (${placeholders})
    GROUP BY r.recipeId, r.title, r.category, r.dishType`;

  const [rows] = await db.execute(sql, [userId, ...recipeIds]);
  console.log(`Fetched ${rows.length} recipe details`);
  console.table(rows, ['recipeId', 'title', 'category', 'dishType']);
  return rows.map(r => ({ ...r, recipeId: String(r.recipeId) }));
}

// FIXED: More flexible backup recipe fetching
async function getBackupRecipes(preferredCategory, dishType, userId, excludeIds = []) {
  const db = await dbPromise;
  const excludeSQL = excludeIds.length
    ? `AND r.recipeId NOT IN (${excludeIds.map(() => '?').join(',')})`
    : '';

  // First try: Preferred category + dishType with good ratings
  let sql = `
    SELECT  r.recipeId, r.title, r.category, r.dishType,
            COALESCE(AVG(rr.rating),0) AS avgRating,
            COALESCE(MAX(ur.rating),0) AS userRating,
            GROUP_CONCAT(DISTINCT t.name) AS tags
    FROM      recipes r
      LEFT JOIN recipeRatings rr ON r.recipeId = rr.recipeId
      LEFT JOIN recipeRatings ur ON r.recipeId = ur.recipeId AND ur.userId = ?
      LEFT JOIN recipetags rt   ON r.recipeId = rt.recipeId
      LEFT JOIN tags      t    ON rt.tagId    = t.tagId
    WHERE (r.category = ? OR r.category = 'Parve')
      ${dishType ? 'AND r.dishType = ?' : ''}
      ${excludeSQL}
    GROUP BY r.recipeId, r.title, r.category, r.dishType
    
    ORDER BY CASE 
      WHEN MAX(ur.rating) > 0 THEN MAX(ur.rating) 
      WHEN AVG(rr.rating) > 0 THEN AVG(rr.rating)
      ELSE 2.5 
    END DESC
    LIMIT 10`;
//HAVING (MAX(ur.rating) > 3 OR (MAX(ur.rating) = 0 AND AVG(rr.rating) > 3) OR (MAX(ur.rating) = 0 AND AVG(rr.rating) = 0)) - line 360
  let params = [userId, preferredCategory];
  if (dishType) params.push(dishType);
  if (excludeIds.length) params.push(...excludeIds);
  const format = mysql.format(sql, params);
  console.log(`Executing SQL: ${format}`);
  let [rows] = await db.execute(mysql.format(sql, params));
  console.log(`First attempt: Found ${rows.length} backups for category="${preferredCategory}", dishType="${dishType}"`);

  return rows.map(r => ({ ...r, recipeId: String(r.recipeId) }));
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
  let score = (rating(side) + rating(main) + rating(dessert)) * 10|| 0;

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
  console.log(`Finding best pairings from ${sides.length} sides, ${mains.length} mains, ${desserts.length} desserts`);
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
  console.log(`Total kosher combinations: ${combos.length}`);

  const selected = [];
  const usedS = new Set();
  const usedM = new Set();
  const usedD = new Set();

  for (const c of combos) {
    console.log(c);
    
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

  console.log(`Selected ${selected.length} best pairings`);
  return { selectedMeals: selected, remainingCombos: combos.length };
}

// -----------------------------------------------------------------------------
// 4. Gap‑filling with smarter backups
// -----------------------------------------------------------------------------

async function createWeeklyMealPlan(sideIds, mainIds, dessertIds, userId) {
  console.log(`Creating meal plan for user ${userId}...`);

  if (!sideIds.length && !mainIds.length && !dessertIds.length) {
    throw new Error('Provide at least one recipe ID');
  }

  const recipeRows = await getRecipeDetails([...sideIds, ...mainIds, ...dessertIds], userId);
  const byId = new Map(recipeRows.map(r => [r.recipeId, r]));

  const sides    = sideIds.map(id => byId.get(String(id))).filter(Boolean);
  const mains    = mainIds.map(id => byId.get(String(id))).filter(Boolean);
  const desserts = dessertIds.map(id => byId.get(String(id))).filter(Boolean);

  const { selectedMeals, remainingCombos } = findBestPairings(sides, mains, desserts);
  const { meals, replacements } = await fillMissingMeals(selectedMeals, sides, mains, desserts, userId);
  const dates = getWeekdayDates();
  const simplifiedPlan = meals.map(m => ({
    day: m.day,
    date: dates[m.day - 1].formatted|| `Day ${m.day}`,
    side: { recipeId: m.side.recipeId, title: m.side.title },
    main: { recipeId: m.main.recipeId, title: m.main.title },
    dessert: { recipeId: m.dessert.recipeId, title: m.dessert.title }
  }));

  console.log(`Meal plan created: ${meals.length} meals, ${replacements.length} replacements`);

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

// FIXED: Better backup selection logic

async function fillMissingMeals(selectedMeals, allSides, allMains, allDesserts, userId) {
    console.log(`Filling missing meals to reach 5 total...`);
    const meals = [...selectedMeals];
    const replacements = [];

    // Initialize a Set for all used IDs across ALL meals, including backups
    const allUsedRecipeIds = new Set();

    // Add initial selected meals' recipe IDs to the set
    selectedMeals.forEach(meal => {
        allUsedRecipeIds.add(meal.side.recipeId);
        allUsedRecipeIds.add(meal.main.recipeId);
        allUsedRecipeIds.add(meal.dessert.recipeId);
    });

    // Improved backup selection - try multiple strategies
    const chooseBackup = async (preferredCat, dishType) => {
        console.log(`Fetching backup recipes for category="${preferredCat}", dishType="${dishType}"`);
        // Pass all current used recipe IDs to exclude them from backups
        const backups = await getBackupRecipes(preferredCat, dishType, userId, Array.from(allUsedRecipeIds));

        if (backups.length > 0) {
            console.log(`Found ${backups.length} backup options`);
            return backups[0];
        }

        console.log(`No backups found for category="${preferredCat}", dishType="${dishType}"`);
        return null;
    };

    while (meals.length < 5) {
        const day = meals.length + 1;
        console.log(`\n--- Filling meal for day ${day} ---`);

        // These still check against original lists, which is fine for initial selection
        let side = allSides.find(r => !allUsedRecipeIds.has(r.recipeId));
        let main = allMains.find(r => !allUsedRecipeIds.has(r.recipeId));
        let dessert = allDesserts.find(r => !allUsedRecipeIds.has(r.recipeId));

        console.log(`Available from original (not yet used): side=${!!side}, main=${!!main}, dessert=${!!dessert}`);

        // Check kosher compliance and fix if needed
        if (side && main && dessert && !isKosherCombination(side, main, dessert)) {
            console.log(`Non-kosher combination detected, fixing...`);
            const categories = [side.category, main.category, dessert.category];
            const hasMeat = categories.includes('Meat');
            const hasDairy = categories.includes('Dairy');

            if (hasMeat && hasDairy) {
                if (dessert.category === 'Dairy') {
                    console.log(`Replacing dairy dessert with parve...`);
                    const newDessert = await chooseBackup('Parve', 'dessert');
                    if (newDessert) {
                        dessert = newDessert;
                        replacements.push({ day, course: 'dessert', reason: 'kosher compliance - replaced dairy with parve' });
                    }
                } else if (side.category === 'Dairy') {
                    console.log(`Replacing dairy side with parve...`);
                    const newSide = await chooseBackup('Parve', 'side');
                    if (newSide) {
                        side = newSide;
                        replacements.push({ day, course: 'side', reason: 'kosher compliance - replaced dairy with parve' });
                    }
                } else if (main.category === 'Dairy') {
                    console.log(`Replacing dairy main with parve...`);
                    const newMain = await chooseBackup('Parve', 'main');
                    if (newMain) {
                        main = newMain;
                        replacements.push({ day, course: 'main', reason: 'kosher compliance - replaced dairy with parve' });
                    }
                }
            }
        }

        // Fill missing recipes with backups
        if (!side) {
            console.log(`No side available, searching for backup...`);
            const preferredCat = allSides.length > 0 ? allSides[0].category : 'Parve';
            const newSide = await chooseBackup(preferredCat, 'side');
            if (newSide) {
                side = newSide;
                replacements.push({ day, course: 'side', reason: 'insufficient original recipes' });
            }
        }

        if (!main) {
            console.log(`No main available, searching for backup...`);
            const preferredCat = allMains.length > 0 ? allMains[0].category : 'Parve';
            const newMain = await chooseBackup(preferredCat, 'main');
            if (newMain) {
                main = newMain;
                replacements.push({ day, course: 'main', reason: 'insufficient original recipes' });
            }
        }

        if (!dessert) {
            console.log(`No dessert available, searching for backup...`);
            const preferredCat = allDesserts.length > 0 ? allDesserts[0].category : 'Parve';
            const newDessert = await chooseBackup(preferredCat, 'dessert');
            if (newDessert) {
                dessert = newDessert;
                replacements.push({ day, course: 'dessert', reason: 'insufficient original recipes' });
            }
        }

        // Final check - if we still can't find all components
        if (!side || !main || !dessert) {
            console.warn(`Unable to complete meal for day ${day}:`);
            console.warn(`    Side: ${side ? side.title : 'MISSING'}`);
            console.warn(`    Main: ${main ? main.title : 'MISSING'}`);
            console.warn(`    Dessert: ${dessert ? dessert.title : 'MISSING'}`);
            break;
        }

        const meal = {
            day,
            side,
            main,
            dessert,
            score: calculateMealScore(side, main, dessert),
            isKosher: isKosherCombination(side, main, dessert)
        };

        console.log(`Meal ${day} created: ${side.title} + ${main.title} + ${dessert.title} (Score: ${meal.score.toFixed(1)}, Kosher: ${meal.isKosher})`);
        meals.push(meal);

        // Crucially, add the newly selected recipes (whether original or backup) to the exclusion set
        allUsedRecipeIds.add(side.recipeId);
        allUsedRecipeIds.add(main.recipeId);
        allUsedRecipeIds.add(dessert.recipeId);
    }

    console.log(`\nFinal result: ${meals.length} meals created with ${replacements.length} replacements`);
    return { meals, replacements };
}
// -----------------------------------------------------------------------------
// 6. Convenience wrapper for quick CLI/testing use
// -----------------------------------------------------------------------------

async function pairMealsForWeek(sideIds, mainIds, dessertIds, userId) {
  return await createWeeklyMealPlan(sideIds, mainIds, dessertIds, userId);
}

module.exports = {
  createWeeklyMealPlan,
  pairMealsForWeek
};