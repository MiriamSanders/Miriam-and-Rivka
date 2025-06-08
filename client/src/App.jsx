import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
import MenuManager from './components/MenuManager'
import ChefAreaLayout from './components/ChefAreaLayout'
import ChefArea from './components/ChefArea'
import AddRecipe from './components/AddRecipe'
import RecipeManager from './components/RecipeManager';
import RecipeLibrary from './components/RecipeLibrary';
import AddArticle from './components/AddArticle';
import ArticleManager from './components/ArticleManager';
import './styles/App.css'

function App() {
  const [userType, setUserType] = useState(() => {
    const user = JSON.parse(localStorage.getItem('CurrentUser')) || null;
    return user ? user.userType : "guest";
  });

  const [createMenu, setCreateMenu] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('CurrentUser')) || null;
    setUserType(user ? user.userType : "guest");
  }, []); // This will run on component mount

  // Optional: Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem('CurrentUser')) || null;
      setUserType(user ? user.userType : "guest");
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return (
    <>
      <Navigation userType={userType} />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="login" element={<Login setUserType={setUserType} />} />
        <Route path="signup" element={<Signup setUserType={setUserType} />} />

        {/* Recipes */}
        <Route path="recipes" element={<Recipes createMenu={createMenu} />} />
        <Route path="recipes/:id" element={<RecipePage />} />


        {/* Articles */}
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticlePage />} />

        {/* Personal Area */}

        <Route path="personal-area" element={<PersonalArea />} />
        <Route path="personal-area/menus" element={<MenuManager setCreateMenu={setCreateMenu} />} />
        {/* <Route path="menus/:id" element={<MenuDetail />} /> */}

        {/* Chef Area */}
        <Route path="/chef-area" element={<ChefArea />} />
        <Route path="/chef-area/recipe-manager" element={<RecipeManager />} />
        <Route path="/chef-area/article-manager" element={<ArticleManager />} />


      </Routes>
    </>
  );
}
export default App