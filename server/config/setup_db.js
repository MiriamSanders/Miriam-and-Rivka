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
//add role table
        // 1. Users
        `CREATE TABLE IF NOT EXISTS Users (
      UserID INT AUTO_INCREMENT PRIMARY KEY,
      UserName VARCHAR(50) UNIQUE NOT NULL,
      UserType ENUM('Regular', 'Chef') NOT NULL,
      email VARCHAR(50) NOT NULL
    )`,

        // 2. Chefs
        `CREATE TABLE IF NOT EXISTS Chefs (
      ChefID INT PRIMARY KEY,
      ImageURL VARCHAR(255),
      Education VARCHAR(100),
      ExperienceYears INT,
      Style VARCHAR(100),
      FOREIGN KEY (ChefID) REFERENCES Users(UserID)
    )`,

        // 3. Passwords
        `CREATE TABLE IF NOT EXISTS Passwords (
      UserID INT PRIMARY KEY,
      PasswordHash VARCHAR(255) NOT NULL,
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )`,

        // 4. Recipes
        `CREATE TABLE IF NOT EXISTS Recipes (
      RecipeID INT AUTO_INCREMENT PRIMARY KEY,
      ChefID INT NOT NULL,
      Title VARCHAR(100),
      Description TEXT,
      ImageURL VARCHAR(255),
      Instructions TEXT,
      PrepTimeMinutes INT,
      Difficulty ENUM('Easy', 'Medium', 'Hard'),
      Category ENUM('Meat', 'Dairy', 'Parve'),
      DishType VARCHAR(50),
      FOREIGN KEY (ChefID) REFERENCES Chefs(ChefID)
    )`,

        // 5. Ingredients
        //add more 
        `CREATE TABLE IF NOT EXISTS Ingredients (
      IngredientID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL
    
    )`,

        // 6. RecipeIngredients
        //add an order field
        `CREATE TABLE IF NOT EXISTS RecipeIngredients (
      RecipeID INT,
      IngredientID INT,
      Quantity VARCHAR(50),
      PRIMARY KEY (RecipeID, IngredientID),
      FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID),
      FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID)
    )`,

        // 7. Comments
        `CREATE TABLE IF NOT EXISTS Comments (
      CommentID INT AUTO_INCREMENT PRIMARY KEY,
      RecipeID INT NOT NULL,
      UserID INT NOT NULL,
      CommentText TEXT,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )`,

        // 8. Articles
        `CREATE TABLE IF NOT EXISTS Articles (
      ArticleID INT AUTO_INCREMENT PRIMARY KEY,
      AuthorID INT NOT NULL,
      Title VARCHAR(255) NOT NULL,
      Content TEXT NOT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (AuthorID) REFERENCES Users(UserID)
    )`,

        // 9. ArticleComments
        `CREATE TABLE IF NOT EXISTS ArticleComments (
      CommentID INT AUTO_INCREMENT PRIMARY KEY,
      ArticleID INT NOT NULL,
      UserID INT NOT NULL,
      CommentText TEXT NOT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ArticleID) REFERENCES Articles(ArticleID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )`,

        // 10. Preferences
        //prefrence tag
        `CREATE TABLE IF NOT EXISTS Preferences (
      PreferenceID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      PreferenceText VARCHAR(100) NOT NULL,
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )`,

        // 11. SavedRecipes
        `CREATE TABLE IF NOT EXISTS SavedRecipes (
      UserID INT NOT NULL,
      RecipeID INT NOT NULL,
      SavedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (UserID, RecipeID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID),
      FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID)
    )`,

        // 12. RecipeRatings
        //save raters?
        `CREATE TABLE IF NOT EXISTS RecipeRatings (
      RecipeID INT PRIMARY KEY,
      RatersCount INT DEFAULT 0,
      AverageRating FLOAT DEFAULT 0,
      FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID)
    )`,

        // 13. DailyMenus
        //add userID
        `CREATE TABLE IF NOT EXISTS DailyMenus (
      MenuID INT AUTO_INCREMENT PRIMARY KEY,
      MenuDate DATE NOT NULL UNIQUE
    )`,

        // 14. MenuRecipes
        `CREATE TABLE IF NOT EXISTS MenuRecipes (
      MenuID INT NOT NULL,
      RecipeID INT NOT NULL,
      PRIMARY KEY (MenuID, RecipeID),
      FOREIGN KEY (MenuID) REFERENCES DailyMenus(MenuID),
      FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID)
    )`,
        //15. types of tags - mexican, vegen etc
        `CREATE TABLE IF NOT EXISTS Tags (
  TagID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(50) UNIQUE NOT NULL)`,
        //16.tags per recipe
        `CREATE TABLE IF NOT EXISTS RecipeTags (
  RecipeID INT NOT NULL,
  TagID INT NOT NULL,
  PRIMARY KEY (RecipeID, TagID),
  FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID),
  FOREIGN KEY (TagID) REFERENCES Tags(TagID))`
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
