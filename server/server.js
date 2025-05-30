const express = require('express');
const app = express();
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

app.use(express.json());
app.use(AuthMiddlewere);
app.use('/auth', registrationRouter);
app.use('/',recipesRouter);
app.use('/',articlesRouter);
app.listen(PORT, () => {
  console.log('http://localhost:3001');
});