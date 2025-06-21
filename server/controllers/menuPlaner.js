// mealPlanController.js
const nodemailer = require('nodemailer');
const { genericPost } = require('../services/genericService');
const dbPromise = require('../services/dbConnection');
const { getRecipeDetailsFromDb, getBackupRecipesFromDb, getIngredientsForMenusFromDb } = require('../services/mealPlanService');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: 'plateandplan@gmail.com',
        pass: 'qaerwevjnfrdcdja' // Your Gmail App Password (no spaces)
    }
});
function calculateTagSimilarity(r1, r2) {
    if (!r1.tags || !r2.tags) return 0;
    const a = new Set(r1.tags.split(',').map(t => t.trim().toLowerCase()));
    const b = new Set(r2.tags.split(',').map(t => t.trim().toLowerCase()));
    const inter = [...a].filter(t => b.has(t)).length;
    const union = new Set([...a, ...b]).size;
    return union ? inter / union : 0;
}

function isKosherCombination(side, main, dessert) {
    const categories = [side.category, main.category, dessert.category];
    return !(categories.includes('Meat') && categories.includes('Dairy'));
}

function calculateMealScore(side, main, dessert) {
    const getRating = (r) => (r.userRating > 0 ? r.userRating : r.avgRating);
    let score = (getRating(side) + getRating(main) + getRating(dessert)) * 10 || 0;

    score += (calculateTagSimilarity(side, main) +
        calculateTagSimilarity(main, dessert) +
        calculateTagSimilarity(side, dessert)) * 50;

    if (side.userRating > 3) score += 20;
    if (main.userRating > 3) score += 30;
    if (dessert.userRating > 3) score += 20;

    return score;
}

function getWeekdayDates() {
    const dates = [];
    const currentDate = new Date();
    let daysAdded = 0;
    let dayOffset = 0;

    while (daysAdded < 5) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + dayOffset);

        const dayOfWeek = date.getDay();

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

function findBestPairings(sides, mains, desserts) {
    console.log(`Finding best pairings from ${sides.length} sides, ${mains.length} mains, ${desserts.length} desserts.`);
    const combos = [];
    for (let s = 0; s < sides.length; s++) {
        for (let m = 0; m < mains.length; m++) {
            for (let d = 0; d < desserts.length; d++) {
                const side = sides[s];
                const main = mains[m];
                const dessert = desserts[d];
                if (!isKosherCombination(side, main, dessert)) {
                    continue;
                }
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
        }
    }

    combos.sort((a, b) => b.score - a.score);
    console.log(`Total kosher combinations: ${combos.length}`);

    const selected = [];
    const usedSideIndices = new Set();
    const usedMainIndices = new Set();
    const usedDessertIndices = new Set();

    for (const combo of combos) {
        if (selected.length === 5) break;
        if (usedSideIndices.has(combo.sideIdx) || usedMainIndices.has(combo.mainIdx) || usedDessertIndices.has(combo.dessertIdx)) {
            continue;
        }

        selected.push({
            day: selected.length + 1,
            side: combo.side,
            main: combo.main,
            dessert: combo.dessert,
            score: combo.score,
            isKosher: true
        });

        usedSideIndices.add(combo.sideIdx);
        usedMainIndices.add(combo.mainIdx);
        usedDessertIndices.add(combo.dessertIdx);
    }

    console.log(`Selected ${selected.length} best pairings.`);
    return { selectedMeals: selected, totalPossibleCombinations: combos.length };
}

async function fillMissingMeals(selectedMeals, allSides, allMains, allDesserts, userId) {
    console.log(`Filling missing meals to reach 5 total...`);
    const meals = [...selectedMeals];
    const replacements = [];

    const allUsedRecipeIds = new Set();
    selectedMeals.forEach(meal => {
        allUsedRecipeIds.add(meal.side.recipeId);
        allUsedRecipeIds.add(meal.main.recipeId);
        allUsedRecipeIds.add(meal.dessert.recipeId);
    });

    const chooseBackup = async (preferredCat, dishType) => {
        console.log(`Searching for backup: category="${preferredCat}", dishType="${dishType}" (excluding ${allUsedRecipeIds.size} used IDs).`);
        const backups = await getBackupRecipesFromDb(preferredCat, dishType, userId, Array.from(allUsedRecipeIds));
        if (backups.length > 0) {
            console.log(`Found ${backups.length} backup options.`);
            return backups[0];
        }
        console.log(`No backups found for category="${preferredCat}", dishType="${dishType}".`);
        return null;
    };

    while (meals.length < 5) {
        const day = meals.length + 1;
        console.log(`\n--- Attempting to fill meal for Day ${day} ---`);

        let side = allSides.find(r => !allUsedRecipeIds.has(r.recipeId));
        let main = allMains.find(r => !allUsedRecipeIds.has(r.recipeId));
        let dessert = allDesserts.find(r => !allUsedRecipeIds.has(r.recipeId));

        console.log(`Initial selection for Day ${day}: Side: ${side?.title || 'N/A'}, Main: ${main?.title || 'N/A'}, Dessert: ${dessert?.title || 'N/A'}`);

        if (side && main && dessert && !isKosherCombination(side, main, dessert)) {
            console.log(`Non-kosher combination detected for Day ${day}, attempting to fix...`);
            const categories = [side.category, main.category, dessert.category];
            const hasMeat = categories.includes('Meat');
            const hasDairy = categories.includes('Dairy');

            if (hasMeat && hasDairy) {
                if (dessert.category === 'Dairy') {
                    const newDessert = await chooseBackup('Parve', 'dessert');
                    if (newDessert) {
                        dessert = newDessert;
                        replacements.push({ day, course: 'dessert', reason: 'kosher compliance (dairy with meat) - replaced with parve' });
                        console.log(`Replaced dessert with ${newDessert.title} (Parve).`);
                    }
                } else if (side.category === 'Dairy') {
                    const newSide = await chooseBackup('Parve', 'side');
                    if (newSide) {
                        side = newSide;
                        replacements.push({ day, course: 'side', reason: 'kosher compliance (dairy with meat) - replaced with parve' });
                        console.log(`Replaced side with ${newSide.title} (Parve).`);
                    }
                } else if (main.category === 'Dairy') {
                    const newMain = await chooseBackup('Parve', 'main');
                    if (newMain) {
                        main = newMain;
                        replacements.push({ day, course: 'main', reason: 'kosher compliance (dairy with meat) - replaced with parve' });
                        console.log(`Replaced main with ${newMain.title} (Parve).`);
                    }
                }
            }
        }

        if (!side) {
            console.log(`Side missing for Day ${day}, searching backup...`);
            const preferredCat = allSides.length > 0 ? allSides[0].category : 'Parve';
            const newSide = await chooseBackup(preferredCat, 'side');
            if (newSide) {
                side = newSide;
                replacements.push({ day, course: 'side', reason: 'insufficient original recipes' });
                console.log(`Filled side with backup: ${newSide.title}.`);
            }
        }
        if (!main) {
            console.log(`Main missing for Day ${day}, searching backup...`);
            const preferredCat = allMains.length > 0 ? allMains[0].category : 'Parve';
            const newMain = await chooseBackup(preferredCat, 'main');
            if (newMain) {
                main = newMain;
                replacements.push({ day, course: 'main', reason: 'insufficient original recipes' });
                console.log(`Filled main with backup: ${newMain.title}.`);
            }
        }
        if (!dessert) {
            console.log(`Dessert missing for Day ${day}, searching backup...`);
            const preferredCat = allDesserts.length > 0 ? allDesserts[0].category : 'Parve';
            const newDessert = await chooseBackup(preferredCat, 'dessert');
            if (newDessert) {
                dessert = newDessert;
                replacements.push({ day, course: 'dessert', reason: 'insufficient original recipes' });
                console.log(`Filled dessert with backup: ${newDessert.title}.`);
            }
        }

        if (!side || !main || !dessert || !isKosherCombination(side, main, dessert)) {
            console.warn(`Unable to complete kosher meal for Day ${day}. Components: Side: ${side?.title || 'MISSING'}, Main: ${main?.title || 'MISSING'}, Dessert: ${dessert?.title || 'MISSING'}.`);
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
        console.log(`Meal ${day} finalized: ${side.title} + ${main.title} + ${dessert.title} (Score: ${meal.score.toFixed(1)}, Kosher: ${meal.isKosher}).`);
        meals.push(meal);

        allUsedRecipeIds.add(side.recipeId);
        allUsedRecipeIds.add(main.recipeId);
        allUsedRecipeIds.add(dessert.recipeId);
    }

    console.log(`\nFinal result: ${meals.length} meals created with ${replacements.length} replacements.`);
    return { meals, replacements };
}

async function createWeeklyMealPlan(sideIds, mainIds, dessertIds, userId) {
    console.log(`Initiating weekly meal plan creation for user ${userId}...`);

    if (!sideIds.length && !mainIds.length && !dessertIds.length) {
        throw new Error('At least one recipe ID must be provided to create a meal plan.');
    }

    const allRecipeIds = [...new Set([...sideIds, ...mainIds, ...dessertIds])];
    const recipeRows = await getRecipeDetailsFromDb(allRecipeIds, userId);
    const byId = new Map(recipeRows.map(r => [r.recipeId, r]));

    const sides = sideIds.map(id => byId.get(String(id))).filter(Boolean);
    const mains = mainIds.map(id => byId.get(String(id))).filter(Boolean);
    const desserts = dessertIds.map(id => byId.get(String(id))).filter(Boolean);

    const { selectedMeals, totalPossibleCombinations } = findBestPairings(sides, mains, desserts);
    const { meals, replacements } = await fillMissingMeals(selectedMeals, sides, mains, desserts, userId);
    const dates = getWeekdayDates();

    const simplifiedPlan = meals.map(m => ({
        day: m.day,
        date: dates[m.day - 1]?.formatted || `Day ${m.day}`,
        side: { recipeId: m.side.recipeId, title: m.side.title },
        main: { recipeId: m.main.recipeId, title: m.main.title },
        dessert: { recipeId: m.dessert.recipeId, title: m.dessert.title }
    }));

    console.log(`Meal plan successfully created: ${meals.length} meals, ${replacements.length} replacements.`);
    console.log(simplifiedPlan);
    
    await addToDb(simplifiedPlan, userId);
    return {
        success: true,
        weeklyPlan: simplifiedPlan,
        statistics: {
            totalMeals: meals.length,
            kosherMeals: meals.filter(m => m.isKosher).length,
            totalReplacements: replacements.length,
            averageScore: meals.reduce((sum, m) => sum + m.score, 0) / meals.length,
            totalPossibleCombinations: totalPossibleCombinations
        },
        replacements
    };
}

async function addToDb(weeklyMenu, userId) {
    console.log(`Persisting weekly menu for user ${userId} to database...`);
    const menus = [];
    for (const m of weeklyMenu) {
        const menuDay = await genericPost("dailymenus", { userId: userId, menuDate: m.date }, "menuId");
        const side = await genericPost('menurecipes', { menuId: menuDay.menuId, recipeId: m.side.recipeId }, 'menuId');
        const main = await genericPost('menurecipes', { menuId: menuDay.menuId, recipeId: m.main.recipeId }, 'menuId');
        const dessert = await genericPost('menurecipes', { menuId: menuDay.menuId, recipeId: m.dessert.recipeId }, 'menuId');
        menus.push(menuDay.menuId);
        console.log(`Daily menu entry created for date ${m.date}: ${JSON.stringify(menuDay)}`);
    }
    generateAndEmailShoppingList(menus, getWeekdayDates(), userId);
    console.log('Weekly menu persistence complete.');
}

const ingredientCanonicalMap = {
    'large eggs': 'Eggs',
    'egg whites': 'Eggs',
    'diced tomatoes': 'Tomatoes',
    'cherry tomatoes': 'Tomatoes',
    'canned tomatoes': 'Tomatoes',
    'fresh basil': 'Basil',
    'dried basil': 'Basil',
    'garlic cloves': 'Garlic',
    'garlic powder': 'Garlic',
    'onion powder': 'Onion',
    'red onion': 'Onion',
    'yellow onion': 'Onion',
    'brown sugar': 'Sugar',
    'white sugar': 'Sugar',
    'granulated sugar': 'Sugar',
    'all-purpose flour': 'Flour',
    'whole wheat flour': 'Flour',
    'kosher salt': 'Salt',
    'sea salt': 'Salt',
    'black pepper': 'Pepper',
    'ground black pepper': 'Pepper',
    'milk': 'Dairy Milk',
    'almond milk': 'Plant-Based Milk',
    'soy milk': 'Plant-Based Milk',
    'chicken breast': 'Chicken',
    'chicken thighs': 'Chicken',
    'ground beef': 'Beef',
    'steak': 'Beef',
    'parmesan cheese': 'Cheese',
    'cheddar cheese': 'Cheese',
    'mozzarella cheese': 'Cheese',
    'olive oil': 'Cooking Oil',
    'vegetable oil': 'Cooking Oil',
    'canola oil': 'Cooking Oil',
    'butter': 'Butter',
    'unsalted butter': 'Butter',
    'salted butter': 'Butter',
    'heavy cream': 'Cream',
    'whipping cream': 'Cream',
    'sour cream': 'Cream',
    'yogurt': 'Yogurt',
    'greek yogurt': 'Yogurt',
    'potatoes': 'Potatoes',
    'sweet potatoes': 'Potatoes',
    'carrots': 'Carrots',
    'baby carrots': 'Carrots',
    'broccoli florets': 'Broccoli',
    'fresh spinach': 'Spinach',
    'frozen spinach': 'Spinach',
    'lemon juice': 'Lemon',
    'lemons': 'Lemon',
    'lime juice': 'Lime',
    'limes': 'Lime',
    'white rice': 'Rice',
    'brown rice': 'Rice',
    'pasta': 'Pasta',
    'spaghetti': 'Pasta',
    'penne': 'Pasta'
};


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


async function generateAndEmailShoppingList(menuIds, dates, userId) {
    console.log(`Generating shopping list for menu IDs: [${menuIds.join(', ')}] for user ${userId}.`);

    try {
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

        const rawShoppingListItems = await getIngredientsForMenusFromDb(menuIds);

        const canonicalShoppingList = new Set(); // Use a Set to store unique canonical names

        rawShoppingListItems.forEach(item => {
            const canonicalName = getCanonicalIngredientName(item.ingredientName);
            canonicalShoppingList.add(canonicalName);
        });

        const shoppingListToDisplay = Array.from(canonicalShoppingList).sort(); // Convert Set to Array and sort alphabetically

        if (shoppingListToDisplay.length === 0) {
            console.log("No ingredients found for the selected menus. Skipping email.");
            return { success: true, message: "No ingredients found, no email sent." };
        }

        let emailBodyItems = '';
        shoppingListToDisplay.forEach(item => {
            emailBodyItems += `<li>${item}</li>`; // No quantity

        });
        function parseDateToISOString(dateString, hour = 9, durationInMinutes = 60) {
            const date = new Date(dateString + " " + hour + ":00:00");
            const start = new Date(date);
            const end = new Date(date.getTime() + durationInMinutes * 60000);
            const formatDate = d =>
                d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            return { start: formatDate(start), end: formatDate(end) };
        }
        const calendarLinksHtml = dates.map(({ date, formatted }) => {
            const { start, end } = parseDateToISOString(formatted);
            const title = encodeURIComponent("Meal Planning Reminder");
            const details = encodeURIComponent("Don't forget to check your meal plan and prep ingredients!");
            const location = encodeURIComponent("Your Kitchen");
            const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${date}/${date}`;
            return `<li><a href="${link}" target="_blank">add ${formatted}'s menu to your calander</a></li>`;
        }).join('');



        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px ; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f7f7f7; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
                    <h1 style="color: #333; margin: 0;">Your Weekly Shopping List 🛒</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="color: #555; line-height: 1.6;">Hello there!</p>
                    <p style="color: #555; line-height: 1.6;">Here's a comprehensive list of ingredients you'll need for your upcoming delicious meals:</p>
                    <ul style="list-style-type: disc; padding-left: 20px; margin: 20px 0;">
                        ${emailBodyItems}
                    </ul>
                    <p style="color: #555; line-height: 1.6;">Don't forget to grab everything you need for a smooth cooking week!</p>
                    <div style="text-align: center; margin-top: 30px;">
    <p style="color: #555;">Add reminders to your Google Calendar:</p>
    <ul style="list-style-type: none; padding: 0;">
        ${calendarLinksHtml}
    </ul>
</div>
                                  </div>
                <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">
                    <p style="margin: 0;">Happy cooking from the Plan & Plate Team!</p>
                </div>
            </div>
        `;
        await transporter.sendMail({
            from: 'plateandplan@gmail.com',
            to: userEmail,
            subject: `Grocery List - Enjoy Planning An Amazing Menu!`,
            html: htmlContent
        });

        if (emailResult.success) {
            console.log(`Shopping list email sent successfully to ${userEmail}.`);
            return { success: true, message: "Shopping list email sent successfully.", messageId: emailResult.messageId };
        } else {
            console.error(`Failed to send shopping list email to ${userEmail}: ${emailResult.error}`);
            return { success: false, message: "Failed to send shopping list email.", error: emailResult.error };
        }

    } catch (error) {
        console.error("Error generating or emailing shopping list:", error);
        return { success: false, message: "An unexpected error occurred.", error: error.message };
    }
}
module.exports = {
    createWeeklyMealPlan,
    pairMealsForWeek: createWeeklyMealPlan,
    addToDb
};
