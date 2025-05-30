import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import RecipesLayout from './components/RecipesLayout'
import Recipes from './components/Recipes'
import RecipePage from './components/RecipePage'
import ArticlesLayout from './components/ArticlesLayout'
import Articles from './components/Articles'
import ArticlePage from './components/ArticlePage'
import PersonalAreaLayout from './components/PersonalAreaLayout'
import PersonalArea from './components/PersonalArea'
import Menus from './components/Menus'
import MenuDetail from './components/MenuDetail'
import ChefAreaLayout from './components/ChefAreaLayout'
import ChefArea from './components/ChefArea'
import AddRecipe from './components/AddRecipe'
import AddArticle from './components/AddArticle'
import './styles/App.css'

function App() {
  const [userType, setUserType] = useState("guest"); // Default user type
  return (
    <>
      <Navigation userType={userType} />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="login" element={<Login setUserType={setUserType} />} />
        <Route path="signup" element={<Signup setUserType={setUserType} />} />

        {/* Recipes */}
        <Route path="recipes" element={<Recipes />} />
        <Route path="recipes/:id" element={<RecipePage />} />


        {/* Articles */}
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticlePage />} />

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
    </>
  );
}
export default App