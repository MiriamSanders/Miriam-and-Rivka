
import React, { useState,useEffect } from 'react';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRequest } from '../js_files/Requests';
import '../styles/MenuManager.css'; // Import your CSS styles


const MenuManager = ({ createMenu, setCreateMenu, menu ,menus,setMenus}) => {
  //example initial menus
 
  const navigate = useNavigate();

  const handleDeleteMenu = (id) => {
    setMenus(menus.filter(menu => menu.id !== id));
  };
 useEffect(() => {
  const fetchMenus = async () => {
    const result = await getRequest(`meal-plan/${JSON.parse(localStorage.getItem('currentUser')).id}`);
    
    if (result.succeeded) {
      const parsedMenus = result.data.map(menu => ({
        id: menu.menuId,
        date: new Date(menu.menuDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        items: menu.recipes.split('; ').map(recipe => {
          const [recipeId, title] = recipe.split(':');
          return {
            recipeId: parseInt(recipeId),
            title: title
          };
        })
      }));
      setMenus(parsedMenus); 
    } else {
      console.error('Error fetching menus:', result.status);
    }
  };
  
  fetchMenus();
}, []);
  return (
    <div className="menu-container">
      {/* Header */}
      <div className="menu-header">
        <div className="menu-header-content">
          <h1 className="menu-title">Weekly Menu</h1>
          <p className="menu-subtitle">Plan and organize your weekly meals with style</p>
        </div>
      </div>

      <div className="menu-main">

      {menus.length==0&& <div className="create-button-container">
          <button
            className="create-button"
            onClick={() => { navigate('/recipes'); setCreateMenu(true) }}
          >
            <Plus className="create-button-icon" />
            Create New Weekly Menu
          </button>
        </div>}

        {/* Menus List */}
        <div>
          <h2 className="section-title">
            <Calendar className="section-title-icon" />
            This Week's Menus
          </h2>

          {menus.length === 0 ? (
            <div className="empty-state">
              <Calendar className="empty-state-icon" />
              <p className="empty-state-title">No menus created yet</p>
              <p>Click the button above to create your first menu</p>
            </div>
          ) : (
            <div className="menus-grid">
              {menus.map((menu) => (
                <div key={menu.id} className="menu-card">
                  
                  <div className="menu-date">
                    <Clock className="menu-date-icon" />
                    <span>{menu.date}</span>
                  </div>

                  <div className="menu-items">
                    {menu.items.map((item, index) => (
                      <div key={index} className="menu-item" onClick={() => navigate(`/recipes/${item.recipeId}`)}>
                        {item.title}
                      </div>
                    ))}
                  </div>

                  <div className="menu-footer">
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManager;