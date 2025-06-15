import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, Heart, ChefHat, Menu } from 'lucide-react';
import { getRequest } from '../Requests.js';
import Footer from './Footer';
import '../styles/HomePage.css';

const HomePage = ({ userType }) => {
  // State for popular recipes - replace with your API data
  const navigate = useNavigate();
  const [popularRecipes, setPopularRecipes] = useState([
  ]);

  // State for featured chefs - replace with your API data
  const [featuredChefs, setFeaturedChefs] = useState([

  ]);

  // Replace these useEffect hooks with your actual API calls
  useEffect(() => {
    const fetchPopularRecipes = async () => {
      const response = await getRequest('recipes/best-rated');
      if (response.succeeded) {
        setPopularRecipes(response.data);
      } else {
        console.error('Error fetching popular recipes:', response.error);
      }
    }
    const fetchFeaturedChefs = async () => {
      const response = await getRequest('chefs');
      if (response.succeeded) {
        setFeaturedChefs(response.data);
      } else {
        console.error('Error fetching featured chefs:', response.error);
      }
    }
    fetchPopularRecipes();
    fetchFeaturedChefs();
  }, []);

  // Example API call functions (uncomment and modify for your endpoints)
  /*
  const fetchPopularRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/popular');
      const data = await response.json();
      setPopularRecipes(data);
    } catch (error) {
      console.error('Error fetching popular recipes:', error);
    }
  };

  const fetchFeaturedChefs = async () => {
    try {
      const response = await fetch('/api/chefs/featured');
      const data = await response.json();
      setFeaturedChefs(data);
    } catch (error) {
      console.error('Error fetching featured chefs:', error);
    }
  };
  */

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Amazing Recipes
            </h1>
            <p className="hero-subtitle">
              From our talented chefs to your kitchen
            </p>
            <div className="hero-stats">
              <div className="hero-stat-card">
                <div className="hero-stat-number">1,200+</div>
                <div className="hero-stat-label">Recipes</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-number">50+</div>
                <div className="hero-stat-label">Chefs</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-number">25K+</div>
                <div className="hero-stat-label">Happy Cooks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Popular Recipes
            </h2>
            <p className="section-subtitle">
              Trending dishes that everyone loves
            </p>
          </div>

          <div className="recipe-grid">
            {popularRecipes.map((recipe) => (
              <div key={recipe.recipeId} className="home-recipe-card" style={{ backgroundImage: `url(${recipe.imageURL})` }} onClick={() => { navigate(`/recipes/${recipe.recipeId}`) }}>
                <div className="recipe-image-container">
                  {/* <img
                    src={recipe.imageURL}
                    alt={recipe.title}
                    className="recipe-image"
                  /> */}
                </div>

                <div className="recipe-content">
                  <h3 className="recipe-title">
                    {recipe.title}
                  </h3>
                  <div className="recipe-meta">
                    <span className="recipe-meta-item">{recipe.description}</span></div>

                  <div className="recipe-chef">
                    <p className="recipe-chef-text">
                      by <span className="recipe-chef-name">{recipe.chefName}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-center" onClick={() => navigate('/recipes')}>
            View All Recipes
          </button>
        </div>
      </section>

      {/* Menu Creation Section - Only show for regular users */}
      {userType != "guest" && (
        <section className="section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">
                Create Your Perfect Menu
              </h2>
              <p className="section-subtitle">
                Plan your meals with our easy-to-use menu builder
              </p>
            </div>

            <div className="menu-creation-card">
              <div className="menu-creation-content">
                <Menu className="menu-creation-icon" size={48} color='black' />
                <h3 className="menu-creation-title">
                  Build Custom Menus
                </h3>
                <p className="menu-creation-description">
                  Combine your favorite recipes into personalized menus for any occasion. 
                  Perfect for meal planning, dinner parties, or weekly meal prep.
                </p>
                <ul className="menu-creation-features">
                  <li>Select from thousands of recipes</li>
                  <li>Organize by meal type or occasion</li>
                  <li>Generate shopping lists automatically</li>
                  <li>Share menus with friends and family</li>
                </ul>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-center" 
              onClick={() => navigate('/personal-area/menus')}
            >
              Create New Menu
            </button>
          </div>
        </section>
      )}

      {/* Featured Chefs Section */}
      <section className="section section-dark">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-chef-title section-title-white">
              Our Featured Chefs
            </h2>
            <p className="section-subtitle section-subtitle-light">
              Meet the culinary masters behind our amazing recipes
            </p>
          </div>

          <div className="chef-grid">
            {featuredChefs.map((chef) => (
              <div key={chef.id} className="chef-card">
                <div className="chef-avatar-container">
                  <img
                    src={chef.imageURL}
                    alt={chef.userName}
                    className="chef-avatar"
                  />
                </div>

                <h3 className="chef-name">
                  {chef.userName}
                </h3>
              </div>
            ))}
          </div>

          {/* <button className="btn btn-outline-white btn-center">
            View All Chefs
          </button> */}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section cta-section">
        {userType === "guest" && <div className="cta-container">
          <h2 className="cta-title">
            Ready to Start Cooking?
          </h2>
          <p className="cta-subtitle">
            Join thousands of home cooks discovering new flavors every day
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/recipes')}>
              Browse Recipes
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/signup')}>
              Become a member
            </button>
          </div>
        </div>}
        {userType === "regular" && <div className="cta-container">
          <Footer></Footer>
        </div>}
      </section>
    </div>
  );
};

export default HomePage;