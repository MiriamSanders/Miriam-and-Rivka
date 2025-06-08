import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import '../styles/Navigation.css';

const navOptions = {
  guest: [
    { path: "/", label: "Home" },
    { path: "/recipes", label: "Recipes" },
    { path: "/articles", label: "Articles" },
  ],
  guestAuth: [
    { path: "/login", label: "Login" },
    { path: "/signup", label: "Signup" },
  ],
  loggedIn: [
    { path: "/logout", label: "Logout", isLogout: true },
  ],
  Regular: [
    { path: "/personal-area", label: "Personal Area" },
    { path: "/personal-area/menus", label: "My Menus" },
  ],
  Chef: [
    { path: "/chef-area", label: "Chef Area" },
    { path: "/chef-area/recipe-manager", label: "Recipe Manager" },
    { path: "/chef-area/article-manager", label: "Article Manager" },
  ],
};

function Navigation({ userType = "guest", onLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // In your actual app, replace this with:
    // const loggedIn = localStorage.getItem('loggedIn');
    // setIsLoggedIn(!!loggedIn);
    
    // For demo purposes, using a mock check
    setIsLoggedIn(userType !== "guest");
  }, [userType]);

  const handleLogout = () => {
    // In your actual app, add:
    // localStorage.removeItem('loggedIn');
    // localStorage.removeItem('userToken'); // or whatever you store
    
    setIsLoggedIn(false);
    localStorage.removeItem('CurrentUser'); // Clear user data from localStorage
    if (onLogout) {
      onLogout();
    }
  };

  // Build the hierarchy
  let links = [...navOptions.guest];
  
  // Add user-specific links if logged in
  if (isLoggedIn && (userType === "Regular" || userType === "Chef")) {
    links = links.concat(navOptions.Regular);
  }
  if (isLoggedIn && userType === "Chef") {
    links = links.concat(navOptions.Chef);
  }
  
  // Add auth links at the end based on login status
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