import React, { useState, useEffect } from 'react';
import { deleteRequest, getRequest, postRequest } from '../js_files/Requests';
import { Search, Filter, ChevronDown, X, Trash2, Plus, Sparkles } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useErrorMessage } from "./useErrorMessage";
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SearchBar.css';
import '../styles/Recipes.css';

function Recipes({ createMenu, addToMenu, menu, setCreateMenu, setMenus }) {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorCode, setErrorCode] = useState(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState([]);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [addedRecipes, setAddedRecipes] = useState(new Set());
  const errorMessage = useErrorMessage(errorCode);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = currentUser?.userType === "admin";
  const navigate = useNavigate();
  const location = useLocation();
  const limit = 12;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'meat', label: 'Meat' },
    { value: 'parve', label: 'Parve' },
    { value: 'dairy', label: 'Dairy' }
  ];

  const dishTypes = [
    { value: 'all', label: 'All Dish Types' },
    { value: 'main', label: 'Main' },
    { value: 'side', label: 'Side' },
    { value: 'dessert', label: 'Dessert' }
  ];
  const sortOptions = [
    { value: '', label: 'Default', sortBy: '', sortOrder: '' },
    { value: 'rating', label: 'Rating', sortBy: 'rating', sortOrder: 'DESC' },
    { value: 'title-asc', label: 'Title A-Z', sortBy: 'title', sortOrder: 'ASC' },
    { value: 'title-desc', label: 'Title Z-A', sortBy: 'title', sortOrder: 'DESC' }
  ];

  const addRecipeToMenu = (recipeId, dishType) => {
    if (createMenu) {
      addToMenu((prevMenu) => {
        const updatedMenu = { ...prevMenu };
        if (dishType === 'side') {
          updatedMenu.sideIds.push(recipeId);
        } else if (dishType === 'main') {
          updatedMenu.mainIds.push(recipeId);
        } else if (dishType === 'dessert') {
          updatedMenu.dessertIds.push(recipeId);
        }
        return updatedMenu;
      });
    }
  }


  const handleCreateMenuFromSelection = async () => {
    const totalSelected = menu.sideIds.length + menu.mainIds.length + menu.dessertIds.length;

    if (totalSelected === 0) {
      toast.warning("Please select at least one recipe before creating your menu!");

      return;
    }
    const trimmedMenu = {
      sideIds: menu.sideIds.slice(0, 5),
      mainIds: menu.mainIds.slice(0, 5),
      dessertIds: menu.dessertIds.slice(0, 5),
    };

    if (
      menu.sideIds.length > 5 ||
      menu.mainIds.length > 5 ||
      menu.dessertIds.length > 5
    ) {
      toast.info("Only the first 5 items from each category will be saved.");
    }
    setIsCreatingMenu(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const unique = arr => [...new Set(arr)];
      const data = {
        userId: currentUser.id,
        sideIds: Array.isArray(trimmedMenu.sideIds) ? unique(trimmedMenu.sideIds).join(',') : trimmedMenu.sideIds,
        mainIds: Array.isArray(trimmedMenu.mainIds) ? unique(trimmedMenu.mainIds).join(',') : trimmedMenu.mainIds,
        dessertIds: Array.isArray(trimmedMenu.dessertIds) ? unique(trimmedMenu.dessertIds).join(',') : trimmedMenu.dessertIds,
      };

      const createdMenu = await postRequest('meal-plan', data);
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
      setCreateMenu(false);
      setMenus(formattedMenu);
      // Navigate back to menu page
      navigate('/personal-area/menus');
    } catch (error) {
      console.error("Error creating menu:", error);
      toast.error("There was an error creating your menu. Please try logging in.");

    } finally {
      setIsCreatingMenu(false);
    }
  };

  // Parse URL parameters into search params object
  const getSearchParamsFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    return {
      title: urlParams.get('title') || '',
      chefName: urlParams.get('chefName') || '',
      category: urlParams.get('category') || 'all',
      dishType: urlParams.get('dishType') || 'all',
      sort: urlParams.get('sort') || '', // No default sort
      tags: urlParams.get('tags') ? urlParams.get('tags').split(',') : []
    };
  };

  // Update URL with current search params
  const updateUrl = (searchParams) => {
    const urlParams = new URLSearchParams();

    if (searchParams.title) urlParams.set('title', searchParams.title);
    if (searchParams.chefName) urlParams.set('chefName', searchParams.chefName);
    if (searchParams.category !== 'all') urlParams.set('category', searchParams.category);
    if (searchParams.dishType !== 'all') urlParams.set('dishType', searchParams.dishType);
    if (searchParams.sort) urlParams.set('sort', searchParams.sort);
    if (searchParams.tags.length > 0) urlParams.set('tags', searchParams.tags.join(','));

    const newUrl = `${location.pathname}?${urlParams.toString()}`;
    navigate(newUrl, { replace: true });
  };

  // Build API query from search params
  const buildApiQuery = (searchParams, currentPage = 1) => {
    const queryParts = [`limit=${limit}`, `page=${currentPage}`];

    if (searchParams.title && searchParams.title.trim()) {
      queryParts.push(`title=${encodeURIComponent(searchParams.title.trim())}`);
    }

    if (searchParams.category && searchParams.category !== 'all') {
      queryParts.push(`category=${searchParams.category}`);
    }

    if (searchParams.dishType && searchParams.dishType !== 'all') {
      queryParts.push(`dishType=${searchParams.dishType}`);
    }

    if (searchParams.chefName && searchParams.chefName.trim()) {
      queryParts.push(`chefName=${encodeURIComponent(searchParams.chefName.trim())}`);
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      queryParts.push(`anyTags=${searchParams.tags.join(',')}`);
    }


    if (searchParams.sort) {
      const sortOption = sortOptions.find(option => option.value === searchParams.sort);
      if (sortOption && sortOption.sortBy) {
        queryParts.push(`sort=${sortOption.sortBy}`);
        queryParts.push(`sortOrder=${sortOption.sortOrder}`);
      }
    }

    return `recipes?${queryParts.join('&')}`;
  };

  // Fetch recipes based on current URL params
  const getRecipes = async (currentPage = 1, append = false) => {
    const searchParams = getSearchParamsFromUrl();
    const apiQuery = buildApiQuery(searchParams, currentPage);

    try {
      const requestResult = await getRequest(apiQuery);
      if (requestResult.succeeded) {
        const newRecipes = requestResult.data;
        if (newRecipes.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        if (currentPage == 1) {
          setRecipes(newRecipes);
        }
        else {
          setRecipes((prev) => [...prev, ...newRecipes]);
        }
        setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setErrorCode(500);
    }
  };

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getRequest('tags');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  // Listen to URL changes and fetch recipes accordingly
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    getRecipes(1, false);
  }, [location.search]);

  // Handle pagination
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getRecipes(nextPage, true);
  };

  // Update search params and URL
  const updateSearchParam = (key, value) => {
    const currentParams = getSearchParamsFromUrl();
    const newParams = { ...currentParams, [key]: value };
    updateUrl(newParams);
  };

  // Remove search param
  const removeSearchParam = (key, value = null) => {
    const currentParams = getSearchParamsFromUrl();
    let newParams = { ...currentParams };

    if (key === 'tags' && value) {
      newParams.tags = newParams.tags.filter(tag => tag !== value);
    } else if (key === 'title') {
      newParams.title = '';
    } else if (key === 'chefName') {
      newParams.chefName = '';
    } else if (key === 'category') {
      newParams.category = 'all';
    } else if (key === 'dishType') {
      newParams.dishType = 'all';
    } else if (key === 'sort') {
      newParams.sort = '';
    } else if (key === 'tags') {
      newParams.tags = [];
    }

    updateUrl(newParams);
  };

  const toggleTag = (tagName) => {
    const currentParams = getSearchParamsFromUrl();
    const newTags = currentParams.tags.includes(tagName)
      ? currentParams.tags.filter(tag => tag !== tagName)
      : [...currentParams.tags, tagName];

    updateSearchParam('tags', newTags);
  };

  const clearAllFilters = () => {
    navigate(location.pathname, { replace: true });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    const params = getSearchParamsFromUrl();
    return params.title ||
      params.chefName ||
      params.category !== 'all' ||
      params.dishType !== 'all' ||
      params.sort ||
      params.tags.length > 0;
  };

  const openRecipePage = (e) => {
    const recipeId = e.currentTarget.getAttribute('name');
    navigate(`/recipes/${recipeId}`);
  };

  const handleSearchInputChange = (e) => {
    const currentParams = getSearchParamsFromUrl();
    const newParams = { ...currentParams, title: e.target.value };
    // Update URL immediately for input field sync, but don't trigger search until Enter
    const urlParams = new URLSearchParams(location.search);
    if (e.target.value) {
      urlParams.set('title', e.target.value);
    } else {
      urlParams.delete('title');
    }
    navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
  };

  const handleSearchSubmit = () => {
    // Force a new search when Enter is pressed
    setPage(1);
    setHasMore(true);
    getRecipes(1, false);
  };

  const handleDeleteRecipe = async (e, recipeId) => {
    e.stopPropagation();
    const requestResult = await deleteRequest(`recipes/${recipeId}`);
    if (requestResult.succeeded) {
      setRecipes(prev => prev.filter(c => c.recipeId !== recipeId));
      setErrorCode(undefined);
    } else {
      setErrorCode(requestResult.status);
    }
  };

  const currentSearchParams = getSearchParamsFromUrl();

  return (
    <div className="recipes-container">
      <h1>Recipes</h1>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Create Menu Button - Only show when in create menu mode */}
      {createMenu && (
        <div className="menu-creation-section">
          <button
            onClick={handleCreateMenuFromSelection}
            disabled={isCreatingMenu}
            className='create-menu'
          >
            <Sparkles size={20} />
            {isCreatingMenu ? "Creating Your Menu..." : "Generate My Weekly Menu"}
          </button>
          <p className="menu-description">
            Select recipes and we'll create your personalized weekly menu
          </p>
        </div>
      )}
      {/* Search Filter Bar */}
      <div className="search-container">
        <div className="searchContainer">
          <div className="relative">
            <Search className="searchIcon" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={currentSearchParams.title}
              onChange={handleSearchInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              className="searchInput"
            />
            {currentSearchParams.title && (
              <button
                onClick={() => removeSearchParam('title')}
                className="clearButton"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="filterControls">
          <div className="selectWrapper">
            <select
              value={currentSearchParams.category}
              onChange={(e) => updateSearchParam('category', e.target.value)}
              className="select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <ChevronDown className="selectArrow" />
          </div>

          <div className="selectWrapper">
            <select
              value={currentSearchParams.dishType}
              onChange={(e) => updateSearchParam('dishType', e.target.value)}
              className="select"
            >
              {dishTypes.map(dishType => (
                <option key={dishType.value} value={dishType.value}>{dishType.label}</option>
              ))}
            </select>
            <ChevronDown className="selectArrow" />
          </div>

          <div className="selectWrapper">
            <select
              value={currentSearchParams.sort}
              onChange={(e) => updateSearchParam('sort', e.target.value)}
              className="select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="selectArrow" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filterButton ${showFilters ? 'filterButtonActive' : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>

          {hasActiveFilters() && (
            <button onClick={clearAllFilters} className="clearAllButton">
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filtersPanel">
            <h3 className="filtersPanelTitle">Filter Options</h3>

            <div className="filterGroup">
              <label className="filterLabel">Tags</label>
              <div className="tagsContainer">
                {tags.map(({ tagId, name }) => (
                  <button
                    key={tagId}
                    onClick={() => toggleTag(name)}
                    className={`tagButton ${currentSearchParams.tags.includes(name) ? 'tagButtonActive' : ''}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasActiveFilters() && (
          <div className="activeFilters">
            <span className="activeFiltersLabel">Active filters:</span>

            {currentSearchParams.title && (
              <span className="filterTag">
                Search: "{currentSearchParams.title}"
                <button
                  onClick={() => removeSearchParam('title')}
                  className="filterTagRemove"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentSearchParams.chefName && (
              <span className="filterTag">
                Chef: "{currentSearchParams.chefName}"
                <button
                  onClick={() => removeSearchParam('chefName')}
                  className="filterTagRemove"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentSearchParams.category !== 'all' && (
              <span className="filterTag">
                {categories.find(c => c.value === currentSearchParams.category)?.label}
                <button
                  onClick={() => removeSearchParam('category')}
                  className="filterTagRemove"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentSearchParams.dishType !== 'all' && (
              <span className="filterTag">
                {dishTypes.find(d => d.value === currentSearchParams.dishType)?.label}
                <button
                  onClick={() => removeSearchParam('dishType')}
                  className="filterTagRemove"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentSearchParams.sort && (
              <span className="filterTag">
                Sort: {sortOptions.find(s => s.value === currentSearchParams.sort)?.label}
                <button
                  onClick={() => removeSearchParam('sort')}
                  className="filterTagRemove"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentSearchParams.tags.map(tag => (
              <span key={tag} className="filterTag">
                {tag}
                <button
                  onClick={() => removeSearchParam('tags', tag)}
                  className="filterTagRemove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recipes List */}
      <div className="recipes-list">
        {recipes.length === 0 ? (
          <p className="no-recipes">No recipes found available</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.recipeId} name={recipe.recipeId} className="recipe-card" onClick={openRecipePage}>
              <div className="recipe-image" style={{ backgroundImage: `url(${recipe.imageURL})` }}>
                {createMenu && (
                  <button className="add-to-menu-button" onClick={(e) => {
                    e.stopPropagation(); addRecipeToMenu(recipe.recipeId, recipe.dishType); setAddedRecipes(prev => new Set(prev).add(recipe.recipeId));
                  }}>
                    {addedRecipes.has(recipe.recipeId) ? '✔ Added to Menu' : 'Add to Menu'}
                  </button>
                )}
                {(isAdmin || (currentUser && currentUser.id === recipe.chefId)) &&
                  <button
                    onClick={(e) => handleDeleteRecipe(e, recipe.recipeId)}
                    style={{ background: "transparent" }}
                  >
                    <Trash2 />
                  </button>
                }
                <div className="recipe-overlay">
                  <h2>{recipe.title}</h2>
                  <p>{recipe.description}</p>
                  <div>
                    Tags:
                    {recipe.tags?.map((tag, index) => (
                      <span key={index} style={{ marginRight: '6px', padding: '2px 6px', backgroundColor: 'black', borderRadius: '4px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && recipes.length > 0 && (
        <button onClick={loadMore} className="load-more-button">
          load more
        </button>
      )}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

    </div>
  );
}

export default Recipes;