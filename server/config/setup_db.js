const mysql = require('mysql2/promise');
require('dotenv').config();

const createTables = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

const queries = [
  // 1. Roles (referenced by users)
   `CREATE TABLE IF NOT EXISTS roles (
    roleId INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(50) NOT NULL
  )`,

  // 2. Difficulty (referenced by recipes)
  `CREATE TABLE IF NOT EXISTS difficulty (
  difficultyId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)
  )`,

  // 3. Users (references roles)
  `CREATE TABLE IF NOT EXISTS users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(50) UNIQUE NOT NULL,
    userType INT NOT NULL,
    email VARCHAR(50) NOT NULL,
      FOREIGN KEY (userType) REFERENCES roles(roleId)
  )`,

 // 4. Chefs (references users)
  `CREATE TABLE IF NOT EXISTS chefs (
    chefId INT PRIMARY KEY,
    imageURL VARCHAR(255),
    education VARCHAR(100),
    experienceYears INT,
    style VARCHAR(100),
    FOREIGN KEY (chefId) REFERENCES users(userId) ON DELETE CASCADE
  )`,

  // 5. Passwords (references users)
  `CREATE TABLE IF NOT EXISTS passwords (
    userId INT PRIMARY KEY,
    passwordHash VARCHAR(255) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
  )`,

  // 6. Ingredients (no dependencies)
  `CREATE TABLE IF NOT EXISTS ingredients (
    ingredientID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    caloriesPer100g FLOAT,
    proteinPer100g FLOAT,
    carbsPer100g FLOAT,
    fatPer100g FLOAT,
    fiberPer100g FLOAT
  )`,

  // 7. Recipes (references chefs and difficulty)
  `CREATE TABLE IF NOT EXISTS recipes (
    recipeId INT AUTO_INCREMENT PRIMARY KEY,
    chefId INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    imageURL VARCHAR(255),
    instructions TEXT,
    prepTimeMinutes INT,
    difficulty INT,
    category ENUM('Meat', 'Dairy', 'Parve'),
    dishType VARCHAR(50),
    FOREIGN KEY (chefId) REFERENCES chefs(chefId) ON DELETE CASCADE,
    FOREIGN KEY (difficulty) REFERENCES difficulty(difficultyId)
  )`,

  // 8. RecipeIngredients (references recipes and ingredients)
  `CREATE TABLE IF NOT EXISTS RecipeIngredients (
    recipeId INT NOT NULL,
    ingredientId INT NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    orderIndex INT,
    PRIMARY KEY (recipeId, ingredientId),
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE,
    FOREIGN KEY (ingredientId) REFERENCES ingredients(ingredientId) ON DELETE CASCADE
  )`,

  // 9. Comments (references recipes and users)
  `CREATE TABLE IF NOT EXISTS comments (
    commentId INT AUTO_INCREMENT PRIMARY KEY,
    recipeId INT NOT NULL,
    userId INT NOT NULL,
    commentText TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
  )`,

  // 10. Articles (references users)
  `CREATE TABLE IF NOT EXISTS articles (
    articleId INT AUTO_INCREMENT PRIMARY KEY,
    authorId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES users(userId) ON DELETE CASCADE
  )`,

  // 11. ArticleComments (references articles and users)
  `CREATE TABLE IF NOT EXISTS articleComments (
    commentId INT AUTO_INCREMENT PRIMARY KEY,
    articleId INT NOT NULL,
    userId INT NOT NULL,
    commentText TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (articleId) REFERENCES articles(articleId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
  )`,

  // 12. Tags (no dependencies)
  `CREATE TABLE IF NOT EXISTS tags (
    tagId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
  )`,

  // 13. Preferences (references users and tags)
  `CREATE TABLE IF NOT EXISTS preferences (
    preferenceId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    tagId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(tagId) ON DELETE CASCADE
  )`,

  // 14. SavedRecipes (references users and recipes)
  `CREATE TABLE IF NOT EXISTS savedrecipes (
    userId INT NOT NULL,
    recipeId INT NOT NULL,
    savedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, recipeId),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
  )`,

  // 15. RecipeRatings (references users and recipes)
  `CREATE TABLE IF NOT EXISTS recipeRatings (
    userId INT NOT NULL,
    recipeId INT NOT NULL,
    rating INT CHECK (Rating BETWEEN 1 AND 5),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, recipeId),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
  )`,

  // 16. DailyMenus (references users)
  `CREATE TABLE IF NOT EXISTS dailymenus (
    menuId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    menuDate DATE NOT NULL UNIQUE,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
  )`,

  // 17. MenuRecipes (references dailymenus and recipes)
  `CREATE TABLE IF NOT EXISTS menurecipes (
    menuId INT NOT NULL,
    recipeId INT NOT NULL,
    PRIMARY KEY (menuId, recipeId),
    FOREIGN KEY (menuId) REFERENCES dailymenus(menuId) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
  )`,

  // 18. RecipeTags (references recipes and tags)
  `CREATE TABLE IF NOT EXISTS recipetags (
    recipeId INT NOT NULL,
    tagId INT NOT NULL,
    PRIMARY KEY (recipeId, tagId),
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(tagId) ON DELETE CASCADE
  )`,
  `CREATE TABLE pending_chef_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guid VARCHAR(36) UNIQUE NOT NULL,
  chef_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  education TEXT,
  experience_years INT,
  style VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
];


    try {
        for (let i = 0; i < queries.length; i++) {
            await connection.execute(queries[i]);
            console.log(`Query #${i + 1} executed successfully`);
        }
    } catch (err) {
        console.error(" Error running queries:", err.message);
    } finally {
        await connection.end();
        console.log("Connection closed.");
    }


}
createTables();