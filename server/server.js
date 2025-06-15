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
const commentsRouter = require('./routes/commentsRoutes');
const chefRouter = require('./routes/chefRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(AuthMiddlewere);
app.use('/auth', registrationRouter);
app.use('/',recipesRouter);
app.use('/',articlesRouter);
app.use('/',ratingRouter);
app.use('/', commentsRouter);
app.use('/', chefRouter);
app.listen(PORT, () => {
  console.log('http://localhost:3001');
});