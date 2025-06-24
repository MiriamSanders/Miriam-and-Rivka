import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import '../styles/Navigation.css';

const navOptions = {
  guest: [
    { path: "/", label: "Home" },
    { path: "/recipes", label: "Recipes" },
    { path: "/articles", label: "Articles" },
    {path:"/chefs",label:"Chefs"}
  ],
  guestAuth: [
    { path: "/login", label: "Login" },
    { path: "/signup", label: "Signup" },
  ],
  loggedIn: [
    { path: "/logout", label: "Logout", isLogout: true },
  ],
  regular: [
    { path: "/personal-area/menus", label: "My Menus" },
  ],
  chef: [
    { path: "/chef-area", label: "Chef Area" },
    { path: "/chef-area/recipe-manager", label: "Recipe Manager" },
    { path: "/chef-area/article-manager", label: "Article Manager" },
  ],
};

function Navigation({ userType = "guest",setUserType, onLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(userType !== "guest");
  }, [userType]);
 

  const handleLogout = () => {
    
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    setUserType('guest');
    if (onLogout) {
      onLogout();
    }
  };

  
  let links = [...navOptions.guest];
  
  if (isLoggedIn && (userType === "regular" || userType === "chef"|| userType === "admin")) {
    links = links.concat(navOptions.regular);
  }
  if (isLoggedIn && (userType === "chef"||userType === "admin")) {
    links = links.concat(navOptions.chef);
  }

  if (isLoggedIn) {
    links = links.concat(navOptions.loggedIn);
  } else {
    links = links.concat(navOptions.guestAuth);
  }

  return (
    <nav>
      <ul>
        {links.map(({ path, label, isLogout }) => (
          <li key={path}>
            {isLogout ? (
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                {label}
              </button>
            ) : (
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;