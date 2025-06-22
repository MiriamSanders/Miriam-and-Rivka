const mysql = require('mysql2/promise');
require('dotenv').config();

const insertSampleData = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 1. Insert Roles
        await connection.execute(`
            INSERT INTO roles (roleName) VALUES 
            ('regular'),
            ('chef'),
            ('admin')
        `);

        // 2. Insert Difficulty Levels
        await connection.execute(`
            INSERT INTO difficulty (name) VALUES 
            ('Easy'),
            ('Medium'),
            ('Hard'),
            ('Expert')
        `);

        // 3. Insert Users
        await connection.execute(`
            INSERT INTO users (userName, userType, email) VALUES 
            ('ChefGordon', 2, 'gordon@example.com'),
            ('ChefJulia', 2, 'julia@example.com'),
            ('ChefMarco', 2, 'marco@example.com'),
            ('ChefSarah', 2, 'sarah@example.com'),
            ('ChefMike', 2, 'mike@example.com'),
            ('FoodieAlex', 1, 'alex@example.com'),
            ('CookingMom', 1, 'mom@example.com'),
            ('TasteExplorer', 1, 'explorer@example.com'),
            ('HomeBaker', 1, 'baker@example.com'),
            ('AdminUser', 3, 'admin@example.com'),
            ('CriticJohn', 1, 'critic@example.com'),
            ('HealthyEater', 1, 'healthy@example.com'),
            ('VeggieLover', 1, 'veggie@example.com'),
            ('MeatMaster', 1, 'meat@example.com'),
            ('DessertQueen', 1, 'dessert@example.com')
        `);

        // 4. Insert Chef Details
        await connection.execute(`
            INSERT INTO chefs (chefId, imageURL, education, experienceYears, style) VALUES 
            (1, 'https://example.com/chef1.jpg', 'Culinary Institute of America', 15, 'Modern European'),
            (2, 'https://example.com/chef2.jpg', 'Le Cordon Bleu Paris', 20, 'French Classical'),
            (3, 'https://example.com/chef3.jpg', 'Italian Culinary Academy', 12, 'Authentic Italian'),
            (4, 'https://example.com/chef4.jpg', 'Johnson & Wales University', 8, 'Contemporary American'),
            (5, 'https://example.com/chef5.jpg', 'CIA Hyde Park', 10, 'Asian Fusion')
        `);

        // 5. Insert Passwords (hashed passwords - in real app, use bcrypt)
        await connection.execute(`
            INSERT INTO passwords (userId, passwordHash) VALUES 
            (1, '$2b$10$hashedpassword1'),
            (2, '$2b$10$hashedpassword2'),
            (3, '$2b$10$hashedpassword3'),
            (4, '$2b$10$hashedpassword4'),
            (5, '$2b$10$hashedpassword5'),
            (6, '$2b$10$hashedpassword6'),
            (7, '$2b$10$hashedpassword7'),
            (8, '$2b$10$hashedpassword8'),
            (9, '$2b$10$hashedpassword9'),
            (10, '$2b$10$hashedpassword10'),
            (11, '$2b$10$hashedpassword11'),
            (12, '$2b$10$hashedpassword12'),
            (13, '$2b$10$hashedpassword13'),
            (14, '$2b$10$hashedpassword14'),
            (15, '$2b$10$hashedpassword15')
        `);

        // 6. Insert Ingredients
        await connection.execute(`
            INSERT INTO ingredients (name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g) VALUES 
            ('Chicken Breast', 165, 31, 0, 3.6, 0),
            ('Salmon Fillet', 208, 25, 0, 12, 0),
            ('Ground Beef', 250, 26, 0, 15, 0),
            ('Eggs', 155, 13, 1.1, 11, 0),
            ('Pasta', 371, 13, 75, 1.5, 3.2),
            ('Rice', 365, 7.1, 77, 0.9, 1.3),
            ('Tomatoes', 18, 0.9, 3.9, 0.2, 1.2),
            ('Onions', 40, 1.1, 9.3, 0.1, 1.7),
            ('Garlic', 149, 6.4, 33, 0.5, 2.1),
            ('Olive Oil', 884, 0, 0, 100, 0),
            ('Butter', 717, 0.9, 0.1, 81, 0),
            ('Flour', 364, 10, 76, 1, 2.7),
            ('Sugar', 387, 0, 100, 0, 0),
            ('Salt', 0, 0, 0, 0, 0),
            ('Black Pepper', 251, 10, 64, 3.3, 26),
            ('Basil', 22, 3.2, 2.6, 0.6, 1.6),
            ('Parsley', 36, 3, 6.3, 0.8, 3.3),
            ('Lemon', 29, 1.1, 9, 0.3, 2.8),
            ('Mushrooms', 22, 3.1, 3.3, 0.3, 1),
            ('Bell Peppers', 31, 1, 7, 0.3, 2.5),
            ('Spinach', 23, 2.9, 3.6, 0.4, 2.2),
            ('Carrots', 41, 0.9, 10, 0.2, 2.8),
            ('Potatoes', 77, 2, 17, 0.1, 2.1),
            ('Cheese (Mozzarella)', 300, 22, 2.2, 22, 0),
            ('Heavy Cream', 345, 2.1, 2.8, 37, 0),
            ('Milk', 42, 3.4, 5, 1, 0),
            ('Yogurt', 59, 10, 3.6, 0.4, 0),
            ('Honey', 304, 0.3, 82, 0, 0.2),
            ('Vanilla Extract', 288, 0.1, 12.7, 0.1, 0),
            ('Chocolate', 546, 4.9, 61, 31, 7)
        `);

        // 7. Insert Recipes
        await connection.execute(`
            INSERT INTO recipes (chefId, title, description, imageURL, instructions, prepTimeMinutes, difficulty, category, dishType) VALUES 
            (1, 'Grilled Chicken with Herbs', 'Perfectly seasoned grilled chicken breast with fresh herbs', 'https://example.com/chicken.jpg', 'Season chicken with herbs, grill for 6-8 minutes per side until cooked through', 25, 1, 'Meat', 'Main Course'),
            (2, 'Classic French Onion Soup', 'Rich and flavorful soup with caramelized onions and cheese', 'https://example.com/onion-soup.jpg', 'Caramelize onions slowly, add broth, simmer, top with cheese and broil', 90, 2, 'Dairy', 'Soup'),
            (3, 'Homemade Pasta with Marinara', 'Fresh pasta with traditional Italian marinara sauce', 'https://example.com/pasta.jpg', 'Make pasta dough, roll and cut, prepare sauce, combine and serve', 75, 2, 'Parve', 'Main Course'),
            (4, 'Herb-Crusted Salmon', 'Fresh salmon with a crispy herb crust', 'https://example.com/salmon.jpg', 'Coat salmon with herb mixture, bake at 400°F for 12-15 minutes', 20, 1, 'Parve', 'Main Course'),
            (5, 'Asian Fusion Stir Fry', 'Colorful vegetable stir fry with Asian flavors', 'https://example.com/stirfry.jpg', 'Heat oil, stir fry vegetables, add sauce, serve over rice', 15, 1, 'Parve', 'Main Course'),
            (1, 'Beef Wellington', 'Classic beef wrapped in puff pastry', 'https://example.com/wellington.jpg', 'Sear beef, wrap with mushroom duxelles and pastry, bake until golden', 180, 4, 'Meat', 'Main Course'),
            (2, 'Chocolate Soufflé', 'Light and airy chocolate dessert', 'https://example.com/souffle.jpg', 'Prepare base, fold in egg whites, bake immediately', 45, 3, 'Dairy', 'Dessert'),
            (3, 'Risotto Milanese', 'Creamy Italian rice with saffron', 'https://example.com/risotto.jpg', 'Toast rice, add warm stock gradually while stirring, finish with cheese', 40, 2, 'Dairy', 'Main Course'),
            (4, 'Greek Salad', 'Fresh Mediterranean salad with feta', 'https://example.com/greek-salad.jpg', 'Chop vegetables, add olives and feta, dress with olive oil and lemon', 15, 1, 'Dairy', 'Salad'),
            (5, 'Pad Thai', 'Traditional Thai noodle dish', 'https://example.com/pad-thai.jpg', 'Soak noodles, stir fry with vegetables and sauce, garnish with peanuts', 30, 2, 'Parve', 'Noodles'),
            (1, 'Mushroom Risotto', 'Creamy risotto with mixed mushrooms', 'https://example.com/mushroom-risotto.jpg', 'Sauté mushrooms, make risotto base, combine and finish with herbs', 50, 2, 'Dairy', 'Main Course'),
            (2, 'Crème Brûlée', 'Classic French custard with caramelized sugar', 'https://example.com/creme-brulee.jpg', 'Make custard, chill, torch sugar topping before serving', 120, 3, 'Dairy', 'Dessert'),
            (3, 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 'https://example.com/pizza.jpg', 'Prepare dough, add toppings, bake in hot oven until crispy', 90, 2, 'Dairy', 'Pizza'),
            (4, 'Caesar Salad', 'Classic Caesar with homemade dressing', 'https://example.com/caesar.jpg', 'Prepare dressing, toss with romaine, top with croutons and parmesan', 20, 1, 'Dairy', 'Salad'),
            (5, 'Teriyaki Chicken', 'Japanese-style glazed chicken', 'https://example.com/teriyaki.jpg', 'Marinate chicken, grill while basting with teriyaki sauce', 35, 1, 'Meat', 'Main Course')
        `);

        // 8. Insert Recipe Ingredients
        await connection.execute(`
            INSERT INTO RecipeIngredients (recipeId, ingredientId, quantity, orderIndex) VALUES 
            -- Grilled Chicken with Herbs (Recipe 1)
            (1, 1, '2 lbs', 1), (1, 16, '2 tbsp', 2), (1, 17, '1 tbsp', 3), (1, 10, '3 tbsp', 4), (1, 14, '1 tsp', 5),
            -- French Onion Soup (Recipe 2)
            (2, 8, '6 large', 1), (2, 11, '4 tbsp', 2), (2, 24, '1 cup', 3), (2, 14, '1 tsp', 4),
            -- Pasta with Marinara (Recipe 3)
            (3, 5, '1 lb', 1), (3, 7, '4 large', 2), (3, 8, '1 medium', 3), (3, 9, '4 cloves', 4), (3, 16, '2 tbsp', 5),
            -- Herb-Crusted Salmon (Recipe 4)
            (4, 2, '2 lbs', 1), (4, 16, '2 tbsp', 2), (4, 17, '1 tbsp', 3), (4, 18, '1 lemon', 4), (4, 10, '2 tbsp', 5),
            -- Asian Fusion Stir Fry (Recipe 5)
            (5, 20, '2 cups', 1), (5, 22, '2 cups', 2), (5, 21, '2 cups', 3), (5, 19, '1 cup', 4), (5, 6, '2 cups', 5),
            -- Beef Wellington (Recipe 6)
            (6, 3, '2 lbs', 1), (6, 19, '1 lb', 2), (6, 12, '1 lb puff pastry', 3), (6, 4, '2 eggs', 4),
            -- Chocolate Soufflé (Recipe 7)
            (7, 30, '8 oz', 1), (7, 4, '6 eggs', 2), (7, 13, '1/2 cup', 3), (7, 25, '1 cup', 4),
            -- Risotto Milanese (Recipe 8)
            (8, 6, '2 cups arborio rice', 1), (8, 8, '1 large', 2), (8, 24, '1 cup', 3), (8, 11, '4 tbsp', 4),
            -- Greek Salad (Recipe 9)
            (9, 7, '4 large', 1), (9, 24, '1 cup feta', 2), (9, 8, '1 medium', 3), (9, 10, '1/4 cup', 4), (9, 18, '2 lemons', 5),
            -- Pad Thai (Recipe 10)
            (10, 5, '1 lb rice noodles', 1), (10, 20, '2 cups', 2), (10, 22, '1 cup', 3), (10, 4, '2 eggs', 4),
            -- Mushroom Risotto (Recipe 11)
            (11, 6, '2 cups arborio', 1), (11, 19, '2 cups mixed', 2), (11, 8, '1 large', 3), (11, 24, '1 cup parmesan', 4),
            -- Crème Brûlée (Recipe 12)
            (12, 25, '2 cups', 1), (12, 4, '6 egg yolks', 2), (12, 13, '1/2 cup', 3), (12, 29, '1 tsp', 4),
            -- Margherita Pizza (Recipe 13)
            (13, 12, '3 cups', 1), (13, 7, '1 cup sauce', 2), (13, 24, '2 cups', 3), (13, 16, '1/4 cup', 4),
            -- Caesar Salad (Recipe 14)
            (14, 21, '2 heads romaine', 1), (14, 24, '1 cup parmesan', 2), (14, 4, '2 eggs', 3), (14, 9, '4 cloves', 4),
            -- Teriyaki Chicken (Recipe 15)
            (15, 1, '2 lbs', 1), (15, 13, '1/4 cup', 2), (15, 28, '2 tbsp', 3), (15, 9, '3 cloves', 4)
        `);

        // 9. Insert Tags
        await connection.execute(`
            INSERT INTO tags (name) VALUES 
            ('Healthy'), ('Quick'), ('Vegetarian'), ('Vegan'), ('Gluten-Free'),
            ('Low-Carb'), ('High-Protein'), ('Comfort Food'), ('Spicy'), ('Sweet'),
            ('Italian'), ('French'), ('Asian'), ('Mediterranean'), ('American'),
            ('Breakfast'), ('Lunch'), ('Dinner'), ('Dessert'), ('Appetizer'),
            ('Soup'), ('Salad'), ('Pasta'), ('Pizza'), ('Seafood'),
            ('Chicken'), ('Beef'), ('Pork'), ('Vegetable'), ('Dairy-Free')
        `);

        // 10. Insert Recipe Tags
        await connection.execute(`
            INSERT INTO recipetags (recipeId, tagId) VALUES 
            (1, 1), (1, 7), (1, 26), (1, 18), -- Grilled Chicken
            (2, 8), (2, 12), (2, 21), (2, 18), -- French Onion Soup
            (3, 11), (3, 23), (3, 18), (3, 3), -- Pasta Marinara
            (4, 1), (4, 7), (4, 25), (4, 18), -- Herb-Crusted Salmon
            (5, 1), (5, 2), (5, 13), (5, 29), -- Asian Stir Fry
            (6, 8), (6, 27), (6, 18), (6, 12), -- Beef Wellington
            (7, 10), (7, 19), (7, 12), -- Chocolate Soufflé
            (8, 11), (8, 8), (8, 18), -- Risotto Milanese
            (9, 1), (9, 14), (9, 22), (9, 17), -- Greek Salad
            (10, 13), (10, 23), (10, 18), (10, 9), -- Pad Thai
            (11, 3), (11, 8), (11, 18), (11, 11), -- Mushroom Risotto
            (12, 10), (12, 19), (12, 12), -- Crème Brûlée
            (13, 11), (13, 24), (13, 18), (13, 8), -- Margherita Pizza
            (14, 1), (14, 22), (14, 17), (14, 2), -- Caesar Salad
            (15, 13), (15, 26), (15, 18), (15, 7) -- Teriyaki Chicken
        `);

        // 11. Insert Articles
        await connection.execute(`
            INSERT INTO articles (authorId, title, content) VALUES 
            (1, 'The Art of Grilling: Tips from a Professional Chef', 'Grilling is more than just cooking food over fire. It is an art form that requires understanding of heat, timing, and technique. In this comprehensive guide, I will share the secrets that professional chefs use to achieve perfectly grilled dishes every time.'),
            (2, 'French Cooking Techniques Every Home Cook Should Know', 'French cuisine has long been considered the foundation of fine cooking. The techniques developed in French kitchens have influenced cooking around the world. From proper knife skills to mother sauces, these fundamental techniques will elevate your home cooking.'),
            (3, 'The Secrets of Authentic Italian Pasta', 'As someone who learned pasta-making in the hills of Tuscany, I can tell you that authentic Italian pasta is about more than just flour and eggs. It is about understanding the relationship between pasta shape, sauce, and regional traditions.'),
            (4, 'Farm-to-Table: Why Fresh Ingredients Matter', 'The farm-to-table movement has revolutionized how we think about ingredients. Using fresh, locally-sourced ingredients not only supports local farmers but also creates dishes with superior flavor and nutritional value.'),
            (5, 'Asian Fusion: Balancing Traditional and Modern', 'Asian fusion cuisine walks a delicate line between honoring traditional flavors and embracing modern techniques. The key is understanding the core principles of Asian cooking while being creative with presentation and combinations.'),
            (1, 'Understanding Heat: The Foundation of Great Cooking', 'Heat is the most fundamental element in cooking, yet it is often misunderstood by home cooks. Learning to control and manipulate heat is the difference between good cooking and great cooking.'),
            (2, 'The Mother Sauces: Building Blocks of French Cuisine', 'Auguste Escoffier classified the five mother sauces that form the foundation of French cooking. Understanding these sauces and their derivatives will give you the tools to create countless dishes.'),
            (11, 'Restaurant Review: The Evolution of Modern Dining', 'The restaurant industry has undergone dramatic changes in recent years. From molecular gastronomy to sustainable dining, restaurants are pushing boundaries and redefining what it means to dine out.')
        `);

        // 12. Insert Comments on Recipes
        await connection.execute(`
            INSERT INTO recipecomments (recipeId, userId, parentCommentId, commentText) VALUES 
            (1, 6,null, 'This grilled chicken recipe is amazing! The herbs really make a difference.'),
            (1, 7,null, 'Made this last night for my family. Everyone loved it!'),
            (2, 8,null, 'The French onion soup was perfect for a cold winter evening.'),
            (2, 9,null, 'Took a while to caramelize the onions properly, but worth the wait!'),
            (3, 6,null, 'Love homemade pasta! This marinara sauce is so flavorful.'),
            (4, 12,null, 'Great healthy option. The herb crust adds amazing flavor to the salmon.'),
            (5, 13,null, 'Quick and easy weeknight dinner. My kids actually ate their vegetables!'),
            (6, 11,null, 'Challenging recipe but the results are restaurant-quality. Impressive!'),
            (7, 15,null, 'Best chocolate soufflé I have ever made. Light and decadent!'),
            (8, 6,null, 'Risotto requires patience but this recipe is foolproof.'),
            (9, 12,null, 'Perfect summer salad. Fresh and light.'),
            (10, 14,null, 'Authentic flavors! Reminds me of my trip to Thailand.'),
            (11, 7,null, 'Creamy and delicious. The mushroom flavor really shines through.'),
            (12, 8,null, 'Elegant dessert that is surprisingly achievable at home.'),
            (13, 9,null, 'Classic pizza done right. The dough recipe is fantastic.'),
            (14, 6,null, 'Best Caesar salad dressing I have ever tasted!'),
            (15, 13,null, 'Sweet and savory balance is perfect in this teriyaki chicken.')
        `);

        // 13. Insert Article Comments
        await connection.execute(`
            INSERT INTO articleComments (articleId, userId, commentText) VALUES 
            (1, 6, 'Great tips! I had no idea about the temperature zones on the grill.'),
            (1, 7, 'This article improved my grilling game significantly.'),
            (2, 8, 'French techniques seem intimidating but you explain them clearly.'),
            (3, 9, 'As an Italian-American, I appreciate the authenticity in this article.'),
            (4, 12, 'Farm-to-table has changed how I shop for ingredients.'),
            (5, 13, 'Love the balance between tradition and innovation in Asian fusion.'),
            (6, 14, 'Understanding heat control has been a game-changer for my cooking.'),
            (7, 15, 'The mother sauces are truly the foundation of so many dishes.'),
            (8, 11, 'Insightful review of current dining trends. Well written!')
        `);

        // 14. Insert User Preferences
        await connection.execute(`
            INSERT INTO preferences (userId, tagId) VALUES 
            (6, 1), (6, 2), (6, 7), -- FoodieAlex likes healthy, quick, high-protein
            (7, 8), (7, 3), (7, 16), -- CookingMom likes comfort food, vegetarian, breakfast
            (8, 1), (8, 14), (8, 25), -- TasteExplorer likes healthy, Mediterranean, seafood
            (9, 10), (9, 19), (9, 3), -- HomeBaker likes sweet, dessert, vegetarian
            (12, 1), (12, 6), (12, 5), -- HealthyEater likes healthy, low-carb, gluten-free
            (13, 3), (13, 4), (13, 29), -- VeggieLover likes vegetarian, vegan, vegetables
            (14, 26), (14, 27), (14, 7), -- MeatMaster likes chicken, beef, high-protein
            (15, 10), (15, 19), (15, 12) -- DessertQueen likes sweet, dessert, French
        `);

        // 15. Insert Saved Recipes
        await connection.execute(`
            INSERT INTO savedrecipes (userId, recipeId) VALUES 
            (6, 1), (6, 4), (6, 5), (6, 9), -- FoodieAlex saved healthy recipes
            (7, 1), (7, 3), (7, 11), (7, 13), -- CookingMom saved family-friendly recipes
            (8, 2), (8, 8), (8, 9), (8, 14), -- TasteExplorer saved diverse recipes
            (9, 7), (9, 12), (9, 13), -- HomeBaker saved desserts and comfort food
            (12, 1), (12, 4), (12, 9), (12, 14), -- HealthyEater saved healthy options
            (13, 3), (13, 5), (13, 9), (13, 11), -- VeggieLover saved vegetarian options
            (14, 1), (14, 6), (14, 15), -- MeatMaster saved meat dishes
            (15, 7), (15, 12) -- DessertQueen saved desserts
        `);

        // 16. Insert Recipe Ratings
        await connection.execute(`
            INSERT INTO recipeRatings (userId, recipeId, rating) VALUES 
            (6, 1, 5), (6, 4, 4), (6, 5, 5), (6, 9, 4),
            (7, 1, 5), (7, 3, 4), (7, 11, 5), (7, 13, 4),
            (8, 2, 5), (8, 8, 4), (8, 9, 5), (8, 14, 4),
            (9, 7, 5), (9, 12, 5), (9, 13, 4),
            (12, 1, 4), (12, 4, 5), (12, 9, 4), (12, 14, 5),
            (13, 3, 5), (13, 5, 4), (13, 9, 5), (13, 11, 4),
            (14, 1, 5), (14, 6, 5), (14, 15, 4),
            (15, 7, 5), (15, 12, 5),
            (11, 1, 4), (11, 2, 5), (11, 6, 5), (11, 7, 4), (11, 8, 5)
        `);


        console.log("All sample data inserted successfully!");

    } catch (err) {
        console.error("Error inserting sample data:", err.message);
    } finally {
        await connection.end();
        console.log("Connection closed.");
    }
};

insertSampleData();