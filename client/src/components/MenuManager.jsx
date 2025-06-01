import React, { useState } from 'react';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/MenuManager.css'; // Import your CSS styles


const MenuManager = ({setCreateMenu}) => {
  const [menus, setMenus] = useState([
    {
      id: 1,
      name: "Mediterranean Monday",
      date: "2025-06-02",
      items: ["Grilled Salmon", "Quinoa Salad", "Roasted Vegetables"],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Taco Tuesday Fiesta",
      date: "2025-06-03",
      items: ["Fish Tacos", "Black Bean Rice", "Guacamole"],
      createdAt: new Date().toISOString()
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMenu, setNewMenu] = useState({
    name: '',
    date: '',
    items: ['']
  });
    const navigate = useNavigate();
  const handleCreateMenu = () => {
    if (newMenu.name && newMenu.date && newMenu.items.filter(item => item.trim()).length > 0) {
      const menu = {
        id: Date.now(),
        name: newMenu.name,
        date: newMenu.date,
        items: newMenu.items.filter(item => item.trim()),
        createdAt: new Date().toISOString()
      };
      setMenus([...menus, menu]);
      setNewMenu({ name: '', date: '', items: [''] });
      setShowCreateForm(false);
    }
  };

  const handleDeleteMenu = (id) => {
    setMenus(menus.filter(menu => menu.id !== id));
  };

  const addMenuItem = () => {
    setNewMenu({ ...newMenu, items: [...newMenu.items, ''] });
  };

  const updateMenuItem = (index, value) => {
    const updatedItems = [...newMenu.items];
    updatedItems[index] = value;
    setNewMenu({ ...newMenu, items: updatedItems });
  };

  const removeMenuItem = (index) => {
    const updatedItems = newMenu.items.filter((_, i) => i !== index);
    setNewMenu({ ...newMenu, items: updatedItems });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

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
        {/* Create Menu Button */}
        <div className="create-button-container">
          <button
            className="create-button"
            onClick={() => {setShowCreateForm(!showCreateForm)}}
          >
            <Plus className="create-button-icon" />
            Create New Menu
          </button>
        </div>
          <div className="create-button-container">
          <button
            className="create-button"
            onClick={() => {navigate('/recipes') ; setCreateMenu(true)}}
          >
            <Plus className="create-button-icon" />
            Create New  Weekly Menu
          </button>
        </div>

        {/* Create Menu Form */}
        {showCreateForm && (
          <div className="menu-form">
            <h2 className="form-title">Create New Menu</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Menu Name</label>
                <input
                  type="text"
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Mediterranean Monday"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={newMenu.date}
                  onChange={(e) => setNewMenu({ ...newMenu, date: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="menu-items-container">
              <label className="form-label">Menu Items</label>
              {newMenu.items.map((item, index) => (
                <div key={index} className="menu-item-row">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateMenuItem(index, e.target.value)}
                    className="menu-item-input"
                    placeholder="Enter menu item"
                  />
                  {newMenu.items.length > 1 && (
                    <button
                      onClick={() => removeMenuItem(index)}
                      className="remove-item-button"
                    >
                      <Trash2 className="remove-item-icon" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addMenuItem}
                className="add-item-button"
              >
                <Plus className="add-item-icon" />
                Add Item
              </button>
            </div>

            <div className="form-buttons">
              <button
                onClick={handleCreateMenu}
                className="primary-button"
              >
                Create Menu
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                    <h3 className="menu-card-title">{menu.name}</h3>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      <Trash2 className="delete-button-icon" />
                    </button>
                  </div>
                  
                  <div className="menu-date">
                    <Clock className="menu-date-icon" />
                    <span>{formatDate(menu.date)}</span>
                  </div>
                  
                  <div className="menu-items">
                    {menu.items.map((item, index) => (
                      <div key={index} className="menu-item">
                        {item}
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