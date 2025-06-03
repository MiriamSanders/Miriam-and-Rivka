import { NavLink } from "react-router-dom";
import '../styles/Navigation.css';

const navOptions = {
  guest: [
    { path: "/", label: "Home" },
    { path: "/login", label: "Login" },
    { path: "/signup", label: "Signup" },
    { path: "/recipes", label: "Recipes" },
    { path: "/articles", label: "Articles" },
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

function Navigation({ userType = "guest" }) {
  // Build the hierarchy
  let links = [...navOptions.guest];
  if (userType === "Regular" || userType === "Chef") {
    links = links.concat(navOptions.Regular);
  }
  if (userType === "Chef") {
    links = links.concat(navOptions.Chef);
  }

 return (
  <nav>
    <ul>
      {links.map(({ path, label }) => (
        <li key={path}>
          <NavLink
            to={path}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
}
export default Navigation;