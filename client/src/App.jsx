import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';

function App() {
  return (
    <>
    <Navigation userType="chef" />
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* Recipes */}
        <Route path="recipes" element={<RecipesLayout />}>
          <Route index element={<Recipes />} />
          <Route path=":id" element={<RecipeDetail />} />
        </Route>

        {/* Articles */}
        <Route path="articles" element={<ArticlesLayout />}>
          <Route index element={<Articles />} />
          <Route path=":id" element={<ArticleDetail />} />
        </Route>

        {/* Personal Area */}
        <Route path="personal-area" element={<PersonalAreaLayout />}>
          <Route index element={<PersonalArea />} />
          <Route path="menus" element={<Menus />} />
          <Route path="menus/:id" element={<MenuDetail />} />
        </Route>

        {/* Chef Area */}
        <Route path="chef-area" element={<ChefAreaLayout />}>
          <Route index element={<ChefArea />} />
          <Route path="add-recipe" element={<AddRecipe />} />
          <Route path="add-article" element={<AddArticle />} />
        </Route>

      </Routes>
    </Router>
    </>
  );
}