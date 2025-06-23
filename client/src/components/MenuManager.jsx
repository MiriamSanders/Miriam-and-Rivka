
import React, { useState } from 'react';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { postRequest } from '../Requests';
import '../styles/MenuManager.css'; // Import your CSS styles


const MenuManager = ({ createMenu, setCreateMenu, menu ,menus,setMenus}) => {
  //example initial menus
 
  const navigate = useNavigate();

  const handleDeleteMenu = (id) => {
    setMenus(menus.filter(menu => menu.id !== id));
  };

  async function createMenuFunction(menu) {
    const data = {
      userId: JSON.parse(localStorage.getItem('currentUser')).id,
      sideIds: Array.isArray(menu.sideIds) ? menu.sideIds.join(', ') : menu.sideIds,
      mainIds: Array.isArray(menu.mainIds) ? menu.mainIds.join(', ') : menu.mainIds,
      dessertIds: Array.isArray(menu.dessertIds) ? menu.dessertIds.join(', ') : menu.dessertIds,
    }
    console.log("Creating menu with data:", data);

    const createdMenu = await postRequest('menu/meal-plan', data);
     console.log("Created menu:", createdMenu);
    const weeklyMenu = await createdMenu.data.menu.weeklyPlan;
    const formattedMenu = [];
    weeklyMenu.forEach((menu) => {
      formattedMenu.push({
        id: menu.day,
        date: menu.date,
        items: [menu.side, menu.main, menu.dessert],
        createdAt: new Date().toISOString()
      });
    });
    setMenus(formattedMenu);
    setCreateMenu(false);
    console.log("Formatted menu:", formattedMenu);
  }

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

        <div className="create-button-container">
          <button
            className="create-button"
            onClick={() => { navigate('/recipes'); setCreateMenu(true) }}
          >
            <Plus className="create-button-icon" />
            Create New Weekly Menu
          </button>
        </div>

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
                  <div className="menu-card-header">
                    {/* <h3 className="menu-card-title">{menu.name}</h3> */}
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      <Trash2 className="delete-button-icon" />
                    </button>
                  </div>

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
                    <span className="menu-footer-text">
                      Created {new Date(menu.createdAt).toLocaleDateString()}
                    </span>
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