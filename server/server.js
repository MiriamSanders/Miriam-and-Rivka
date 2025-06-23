const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 3001;
const cors=require('cors');

const AuthMiddlewere = require('./middleware/AuthMiddlewere');
const registrationRouter = require('./routes/registrationRoutes');
app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true
}));

const recipesRouter = require('./routes/recipesRoutes');
const articlesRouter = require('./routes/articlesRoutes');
const ratingRouter = require('./routes/ratingRoutes');
const recipeCommentsRouter = require('./routes/recipeCommentsRoutes');
const articleCommentsRouter = require('./routes/articleCommentsRoutes');
const chefRouter = require('./routes/chefRoutes');
const tagRouter = require('./routes/tagRoutes');
const menuRouter = require('./routes/menuRoutes');
const imageRouter= require('./routes/imageRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(AuthMiddlewere);
app.use('/auth', registrationRouter);
app.use('/recipes',recipesRouter);
app.use('/articles',articlesRouter);
app.use('/ratings',ratingRouter);
app.use('/recipecomments', recipeCommentsRouter);
app.use('/articlecomments', articleCommentsRouter);
app.use('/', chefRouter);
app.use('/tags', tagRouter);
app.use('/meal-plan', menuRouter);
app.use('/upload-image',imageRouter);
app.listen(PORT, () => {
  console.log('http://localhost:3001');
});