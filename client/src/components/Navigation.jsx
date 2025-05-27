import { NavLink } from "react-router-dom";

const navOptions = {
  guest: [
    { path: "/", label: "Home" },
    { path: "/login", label: "Login" },
    { path: "/signup", label: "Signup" },
    { path: "/recipes", label: "Recipes" },
    { path: "/articles", label: "Articles" },
  ],
  user: [
    { path: "/personal-area", label: "Personal Area" },
    { path: "/personal-area/menus", label: "My Menus" },
  ],
  chef: [
    { path: "/chef-area", label: "Chef Area" },
    { path: "/chef-area/add-recipe", label: "Add Recipe" },
    { path: "/chef-area/add-article", label: "Add Article" },
  ],
};

function Navigation({ userType = "guest" }) {
  // Build the hierarchy
  let links = [...navOptions.guest];
  if (userType === "user" || userType === "chef") {
    links = links.concat(navOptions.user);
  }
  if (userType === "chef") {
    links = links.concat(navOptions.chef);
  }

  return (
    <nav>
      <ul>
        {links.map(({ path, label }) => (
          <li key={path}>
            <NavLink to={path}>{label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
export default Navigation;