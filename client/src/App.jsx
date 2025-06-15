import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage'
import Login from './components/Login'
import Signup from './components/Signup'
import Recipes from './components/Recipes'
import RecipePage from './components/RecipePage'
import Articles from './components/Articles'
import ArticlePage from './components/ArticlePage'
import MenuManager from './components/MenuManager'
import ChefArea from './components/ChefArea'
import RecipeManager from './components/RecipeManager';
import ArticleManager from './components/ArticleManager';
import './styles/App.css'

function App() {
  const [userType, setUserType] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser')) || null;
    return user ? user.userType : "guest";
  });

  const [createMenu, setCreateMenu] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser')) || null;
    setUserType(user ? user.userType : "guest");
  }, []); // This will run on component mount


  return (
    <>
      <Navigation userType={userType} />

      <Routes>

        <Route path="/" element={<HomePage userType={userType}/>} />

        <Route path="login" element={<Login setUserType={setUserType} />} />
        <Route path="signup" element={<Signup setUserType={setUserType} />} />

        {/* Recipes */}
        <Route path="recipes" element={<Recipes createMenu={createMenu} />} />
        <Route path="recipes/:id" element={<RecipePage />} />


        {/* Articles */}
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticlePage />} />

        {/* Personal Area */}
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