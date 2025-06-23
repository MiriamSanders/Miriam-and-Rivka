import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
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
import ChefPage from './components/ChefPage'
import  ChefCommentsDashboard from './components/ChefCommentsDashboard'
import Chefs from './components/Chefs'
import RecipeManager from './components/RecipeManager';
import ArticleManager from './components/ArticleManager';
import './styles/App.css'

function App() {
  const [userType, setUserType] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser')) || null;
    return user ? user.userType : "guest";
  });

  const [createMenu, setCreateMenu] = useState(false);
  const [menu, setMenu] = useState({
    sideIds: [],
    mainIds: [],
    dessertIds: []
  });
   const [menus, setMenus] = useState([
    ]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser')) || null;
    setUserType(user ? user.userType : "guest");
  }, []); // This will run on component mount


  return (
    <>
      <Navigation userType={userType} setUserType={setUserType} />

      <Routes>

        <Route path="/" element={<HomePage userType={userType} />} />

        <Route path="login" element={<Login setUserType={setUserType} />} />
        <Route path="signup" element={<Signup setUserType={setUserType} />} />

        {/* Recipes */}
        <Route path="recipes" element={<Recipes createMenu={createMenu} addToMenu={setMenu} menu={menu} setMenus={setMenus}/>} />
        <Route path="chefs/:id/recipes`" element={<Recipes />} />
        <Route path="recipes/:id" element={<RecipePage />} />

        {/* Chefs */}
        <Route path="chefs" element={<Chefs />} />
        <Route path="chefs/:id" element={<ChefPage />} />

        {/* Articles */}
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticlePage />} />
        <Route path="chefs/:id/articles`" element={<Articles />} />
        {/* Personal Area */}

        {userType != "guest" && <Route path="personal-area/menus" element={<MenuManager createMenu={createMenu} setCreateMenu={setCreateMenu} menu={menu} menus={menus} setMenus={setMenus}/>} />}
        {/* <Route path="menus/:id" element={<MenuDetail />} /> */}

        {/* Chef Area */}

        {(userType === "admin" || userType === "chef") && (
          <>
            <Route path="/chef-area" element={<ChefCommentsDashboard/>} />
            <Route path="/chef-area/recipe-manager" element={<RecipeManager />} />
            <Route path="/chef-area/article-manager" element={<ArticleManager />} />
          </>
        )}
      <Route path="*" element={<Navigate to="/" replace />} />


      </Routes>
    </>
  );
}
export default App