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
            // Format as YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const regularDate = `${year}-${month}-${day}`;

            dates.push({
                date: date,
                regularDate: regularDate, // YYYY-MM-DD format
                formatted: date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                }), // Keep formatted for display purposes only
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
        date: dates[m.day - 1]?.regularDate || `Day ${m.day}`, // Use regularDate (YYYY-MM-DD) instead of formatted
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
        // Use the regular date format (YYYY-MM-DD) for database insertion
        const menuDay = await genericPost("dailymenus", { userId: userId, menuDate: m.date }, "menuId");
        const side = await genericPost('menurecipes', { menuId: menuDay.menuId, recipeId: m.side.recipeId }, 'menuId');
        const main = await genericPost('menurecipes', { menuId: menuDay.menuId, recipeId: m.main.recipeId }, 'menuId');
        const dessert = await genericPost('menurecipes', { menuId: menuDay.menuId, recipeId: m.dessert.recipeId }, 'menuId');
        menus.push(menuDay.menuId);
        console.log(`Daily menu entry created for date ${m.date}: ${JSON.stringify(menuDay)}`);
    }
    generateAndEmailShoppingList(menus, getWeekdayDates(), userId, weeklyMenu);
    console.log('Weekly menu persistence complete.');
}

const ingredientCanonicalMap = {
    // Eggs - all egg products grouped together
    'large eggs': 'Eggs',
    'medium eggs': 'Eggs',
    'small eggs': 'Eggs',
    'egg whites': 'Eggs',
    'egg yolks': 'Eggs',
    'whole eggs': 'Eggs',

    // Tomatoes - different forms of tomatoes
    'diced tomatoes': 'Tomatoes',
    'cherry tomatoes': 'Cherry Tomatoes',
    'grape tomatoes': 'Cherry Tomatoes',
    'canned tomatoes': 'Canned Tomatoes',
    'crushed tomatoes': 'Canned Tomatoes',
    'tomato paste': 'Tomato Paste',
    'tomato sauce': 'Tomato Sauce',
    'fresh tomatoes': 'Fresh Tomatoes',

    // Herbs - fresh vs dried are different
    'fresh basil': 'Fresh Basil',
    'dried basil': 'Dried Basil',
    'fresh parsley': 'Fresh Parsley',
    'dried parsley': 'Dried Parsley',
    'fresh oregano': 'Fresh Oregano',
    'dried oregano': 'Dried Oregano',
    'fresh thyme': 'Fresh Thyme',
    'dried thyme': 'Dried Thyme',

    // Garlic - different forms
    'garlic cloves': 'Fresh Garlic',
    'fresh garlic': 'Fresh Garlic',
    'minced garlic': 'Fresh Garlic',
    'garlic powder': 'Garlic Powder',
    'garlic salt': 'Garlic Salt',

    // Onions - keep different types separate as they have different flavors
    'yellow onion': 'Yellow Onion',
    'white onion': 'White Onion',
    'red onion': 'Red Onion',
    'sweet onion': 'Sweet Onion',
    'green onions': 'Green Onions',
    'scallions': 'Green Onions',
    'onion powder': 'Onion Powder',

    // Sugar - all sugars grouped
    'brown sugar': 'Sugar',
    'white sugar': 'Sugar',
    'granulated sugar': 'Sugar',
    'powdered sugar': 'Sugar',
    'confectioners sugar': 'Sugar',
    'cane sugar': 'Sugar',

    // Flour - different types serve different purposes
    'all-purpose flour': 'All-Purpose Flour',
    'whole wheat flour': 'Whole Wheat Flour',
    'bread flour': 'Bread Flour',
    'cake flour': 'Cake Flour',
    'self-rising flour': 'Self-Rising Flour',

    // Salt - all salts grouped
    'kosher salt': 'Salt',
    'sea salt': 'Salt',
    'table salt': 'Salt',
    'fine salt': 'Salt',

    // Pepper - different types
    'black pepper': 'Black Pepper',
    'ground black pepper': 'Black Pepper',
    'white pepper': 'White Pepper',
    'cracked black pepper': 'Black Pepper',

    // Milk - dairy vs non-dairy are very different
    'whole milk': 'Dairy Milk',
    '2% milk': 'Dairy Milk',
    'skim milk': 'Dairy Milk',
    'low-fat milk': 'Dairy Milk',
    'almond milk': 'Almond Milk',
    'soy milk': 'Soy Milk',
    'oat milk': 'Oat Milk',
    'coconut milk': 'Coconut Milk',

    // Chicken - different cuts
    'chicken breast': 'Chicken Breast',
    'chicken thighs': 'Chicken Thighs',
    'chicken wings': 'Chicken Wings',
    'whole chicken': 'Whole Chicken',
    'chicken drumsticks': 'Chicken Drumsticks',

    // Beef - different cuts
    'ground beef': 'Ground Beef',
    'steak': 'Steak',
    'beef chuck': 'Beef Chuck',
    'beef brisket': 'Beef Brisket',
    'ribeye': 'Steak',
    'sirloin': 'Steak',

    // Cheese - different types have different uses
    'parmesan cheese': 'Parmesan Cheese',
    'cheddar cheese': 'Cheddar Cheese',
    'mozzarella cheese': 'Mozzarella Cheese',
    'swiss cheese': 'Swiss Cheese',
    'cream cheese': 'Cream Cheese',
    'feta cheese': 'Feta Cheese',
    'goat cheese': 'Goat Cheese',

    // Oils - different types
    'olive oil': 'Olive Oil',
    'extra virgin olive oil': 'Olive Oil',
    'vegetable oil': 'Vegetable Oil',
    'canola oil': 'Canola Oil',
    'coconut oil': 'Coconut Oil',
    'sesame oil': 'Sesame Oil',

    // Butter - all butter types
    'butter': 'Butter',
    'unsalted butter': 'Butter',
    'salted butter': 'Butter',

    // Cream - different types serve different purposes
    'heavy cream': 'Heavy Cream',
    'heavy whipping cream': 'Heavy Cream',
    'whipping cream': 'Whipping Cream',
    'half and half': 'Half and Half',
    'sour cream': 'Sour Cream',

    // Yogurt - different types
    'plain yogurt': 'Plain Yogurt',
    'greek yogurt': 'Greek Yogurt',
    'vanilla yogurt': 'Flavored Yogurt',
    'strawberry yogurt': 'Flavored Yogurt',

    // Potatoes - different types
    'russet potatoes': 'Russet Potatoes',
    'red potatoes': 'Red Potatoes',
    'yukon potatoes': 'Yukon Potatoes',
    'sweet potatoes': 'Sweet Potatoes',
    'baby potatoes': 'Baby Potatoes',

    // Carrots - different forms
    'carrots': 'Carrots',
    'baby carrots': 'Baby Carrots',
    'carrot sticks': 'Baby Carrots',

    // Vegetables - keep specific
    'broccoli florets': 'Broccoli',
    'broccoli': 'Broccoli',
    'fresh spinach': 'Fresh Spinach',
    'frozen spinach': 'Frozen Spinach',
    'baby spinach': 'Fresh Spinach',

    // Citrus - different forms
    'lemon juice': 'Lemon Juice',
    'fresh lemon juice': 'Lemon Juice',
    'lemons': 'Fresh Lemons',
    'lemon zest': 'Lemon Zest',
    'lime juice': 'Lime Juice',
    'fresh lime juice': 'Lime Juice',
    'limes': 'Fresh Limes',
    'lime zest': 'Lime Zest',

    // Rice - different types
    'white rice': 'White Rice',
    'brown rice': 'Brown Rice',
    'jasmine rice': 'Jasmine Rice',
    'basmati rice': 'Basmati Rice',
    'wild rice': 'Wild Rice',

    // Pasta - keep different shapes separate as they're used differently
    'spaghetti': 'Spaghetti',
    'penne': 'Penne',
    'fusilli': 'Fusilli',
    'rigatoni': 'Rigatoni',
    'linguine': 'Linguine',
    'fettuccine': 'Fettuccine',
    'angel hair': 'Angel Hair Pasta',
    'bow tie pasta': 'Bow Tie Pasta',
    'macaroni': 'Macaroni'
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

async function generateAndEmailShoppingList(menuIds, dates, userId, weeklyMenu) {
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

        // Updated parseDateToISOString function to work with regular dates
        function parseDateToISOString(regularDate, hour = 9, durationInMinutes = 60) {
            // regularDate is in YYYY-MM-DD format
            const date = new Date(regularDate + "T" + String(hour).padStart(2, '0') + ":00:00");
            const start = new Date(date);
            const end = new Date(date.getTime() + durationInMinutes * 60000);

            const formatDate = d =>
                d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            return { start: formatDate(start), end: formatDate(end) };
        }

        const calendarLinksHtml = dates
            .filter((_, index) => weeklyMenu[index])  // Only keep dates where dayMenu exists
            .map(({ regularDate, formatted }, index) => {
                const dayMenu = weeklyMenu[index];
                const recipeLinks = `
            Side: ${dayMenu.side.title}: http://localhost:5173/recipes/${dayMenu.side.recipeId}
            Main: ${dayMenu.main.title}: http://localhost:5173/recipes/${dayMenu.main.recipeId}
            Dessert: ${dayMenu.dessert.title}: http://localhost:5173/recipes/${dayMenu.dessert.recipeId}
        `;

                const { start, end } = parseDateToISOString(regularDate);
                const title = encodeURIComponent("Meal Planning Reminder");
                const details = encodeURIComponent(`Today's Menu:\n${recipeLinks}\n\nDon't forget to check your meal plan and prep ingredients!`);
                const location = encodeURIComponent("Your Kitchen");
                const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
                return `<li><a href="${link}" target="_blank">Add ${formatted}'s menu to your calendar</a></li>`;
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

        const emailResult = await transporter.sendMail({
            from: 'plateandplan@gmail.com',
            to: userEmail,
            subject: `Grocery List - Enjoy Planning An Amazing Menu!`,
            html: htmlContent
        });

        console.log(`Shopping list email sent successfully to ${userEmail}.`);
        return { success: true, message: "Shopping list email sent successfully.", messageId: emailResult.messageId };

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