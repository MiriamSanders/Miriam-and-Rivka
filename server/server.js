const express = require('express');
const app = express();
const PORT = 3001;
const cors=require('cors')

const AuthMiddlewere = require('./middleware/AuthMiddlewere');

app.use(cors({
  origin: 'http://localhost:5174',  
  credentials: true
}));

const recipesRouter = require('./routes/recipesRoutes');


app.use(express.json());
app.use(AuthMiddlewere);
app.use('/',recipesRouter);
app.listen(PORT, () => {
  console.log('http://localhost:3001');
});