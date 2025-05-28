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
  // 1. Users
  `CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(50) UNIQUE NOT NULL,
    UserType ENUM('Regular', 'Chef') NOT NULL,
    Email VARCHAR(50) NOT NULL
  )`,

  // 2. Roles
  `CREATE TABLE IF NOT EXISTS Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    RoleName VARCHAR(50) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 3. Chefs
  `CREATE TABLE IF NOT EXISTS Chefs (
    ChefID INT PRIMARY KEY,
    ImageURL VARCHAR(255),
    Education VARCHAR(100),
    ExperienceYears INT,
    Style VARCHAR(100),
    FOREIGN KEY (ChefID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 4. Passwords
  `CREATE TABLE IF NOT EXISTS Passwords (
    UserID INT PRIMARY KEY,
    PasswordHash VARCHAR(255) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 5. Recipes
  `CREATE TABLE IF NOT EXISTS Recipes (
    RecipeID INT AUTO_INCREMENT PRIMARY KEY,
    ChefID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    ImageURL VARCHAR(255),
    Instructions TEXT,
    PrepTimeMinutes INT,
    Difficulty ENUM('Easy', 'Medium', 'Hard'),
    Category ENUM('Meat', 'Dairy', 'Parve'),
    DishType VARCHAR(50),
    FOREIGN KEY (ChefID) REFERENCES Chefs(ChefID) ON DELETE CASCADE
  )`,

  // 6. Ingredients
  `CREATE TABLE IF NOT EXISTS Ingredients (
    IngredientID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    CaloriesPer100g FLOAT,
    ProteinPer100g FLOAT,
    CarbsPer100g FLOAT,
    FatPer100g FLOAT,
    FiberPer100g FLOAT
  )`,

  // 7. RecipeIngredients
  `CREATE TABLE IF NOT EXISTS RecipeIngredients (
    RecipeID INT NOT NULL,
    IngredientID INT NOT NULL,
    Quantity VARCHAR(50) NOT NULL,
    OrderIndex INT,
    PRIMARY KEY (RecipeID, IngredientID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
  )`,

  // 8. Comments
  `CREATE TABLE IF NOT EXISTS Comments (
    CommentID INT AUTO_INCREMENT PRIMARY KEY,
    RecipeID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 9. Articles
  `CREATE TABLE IF NOT EXISTS Articles (
    ArticleID INT AUTO_INCREMENT PRIMARY KEY,
    AuthorID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AuthorID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 10. ArticleComments
  `CREATE TABLE IF NOT EXISTS ArticleComments (
    CommentID INT AUTO_INCREMENT PRIMARY KEY,
    ArticleID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ArticleID) REFERENCES Articles(ArticleID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 11. Tags
  `CREATE TABLE IF NOT EXISTS Tags (
    TagID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) UNIQUE NOT NULL
  )`,

  // 12. Preferences (linking users to tag-based preferences)
  `CREATE TABLE IF NOT EXISTS Preferences (
    PreferenceID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    TagID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE
  )`,

  // 13. SavedRecipes
  `CREATE TABLE IF NOT EXISTS SavedRecipes (
    UserID INT NOT NULL,
    RecipeID INT NOT NULL,
    SavedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, RecipeID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
  )`,

  // 14. RecipeRatings (individual ratings per user)
  `CREATE TABLE IF NOT EXISTS RecipeRatings (
    UserID INT NOT NULL,
    RecipeID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, RecipeID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
  )`,

  // 15. DailyMenus
  `CREATE TABLE IF NOT EXISTS DailyMenus (
    MenuID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    MenuDate DATE NOT NULL UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
  )`,

  // 16. MenuRecipes
  `CREATE TABLE IF NOT EXISTS MenuRecipes (
    MenuID INT NOT NULL,
    RecipeID INT NOT NULL,
    PRIMARY KEY (MenuID, RecipeID),
    FOREIGN KEY (MenuID) REFERENCES DailyMenus(MenuID) ON DELETE CASCADE,
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
  )`,

  // 17. RecipeTags
  `CREATE TABLE IF NOT EXISTS RecipeTags (
    RecipeID INT NOT NULL,
    TagID INT NOT NULL,
    PRIMARY KEY (RecipeID, TagID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE
  )`
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
};

createTables();
