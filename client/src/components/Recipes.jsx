import React, { useState, useEffect } from 'react';
import {deleteRequest, getRequest } from '../Requests';
import SearchFilterBar from './SearchBar';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { useErrorMessage } from "./useErrorMessage";
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SearchBar.css';
import '../styles/Recipes.css';

function Recipes({ createMenu,addToMenu,menu }) {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorCode, setErrorCode] = useState(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState([]);

  const errorMessage = useErrorMessage(errorCode);
     const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isAdmin = currentUser?.userType === "Admin";
  const navigate = useNavigate();
  const location = useLocation();
  const limit = 12;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'meat', label: 'Meat' },
    { value: 'parve', label: 'Parve' },
    { value: 'dairy', label: 'Dairy' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' }
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
  console.log("Recipe added to menu:", recipeId, "Dish Type:", dishType);
  console.log("Current Menu State:", menu);
  
  }

  // Parse URL parameters into search params object
  const getSearchParamsFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    return {
      title: urlParams.get('title') || '',
      chefName: urlParams.get('chefName') || '',
      category: urlParams.get('category') || 'all',
      sortBy: urlParams.get('sortBy') || 'relevance',
      tags: urlParams.get('tags') ? urlParams.get('tags').split(',') : []
    };
  };

  // Update URL with current search params
  const updateUrl = (searchParams) => {
    const urlParams = new URLSearchParams();

    if (searchParams.title) urlParams.set('title', searchParams.title);
    if (searchParams.chefName) urlParams.set('chefName', searchParams.chefName);
    if (searchParams.category !== 'all') urlParams.set('category', searchParams.category);
    if (searchParams.sortBy !== 'relevance') urlParams.set('sortBy', searchParams.sortBy);
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
    if (searchParams.chefName && searchParams.chefName.trim()) {
      queryParts.push(`chefName=${encodeURIComponent(searchParams.chefName.trim())}`);
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      queryParts.push(`anyTags=${searchParams.tags.join(',')}`);
    }

    if (searchParams.sortBy && searchParams.sortBy !== 'relevance') {
      queryParts.push(`sortBy=${searchParams.sortBy}`);
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
        console.log(newRecipes);
        
        if (newRecipes.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setRecipes((prev) => [...prev, ...newRecipes]);
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
    } else if (key === 'category') {
      newParams.category = 'all';
    } else if (key === 'sortBy') {
      newParams.sortBy = 'relevance';
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
      params.category !== 'all' ||
      params.sortBy !== 'relevance' ||
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
  const handleDeleteRecipe = async (recipeId) => {
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

      {/* Search Filter Bar */}
      <div className="search-container">
        <div className="searchContainer">
          <div className="relative">
            <Search className="searchIcon" />
            <input
              type="text"
              placeholder="Search anything..."
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
              value={currentSearchParams.sortBy}
              onChange={(e) => updateSearchParam('sortBy', e.target.value)}
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
                    e.stopPropagation(); addRecipeToMenu(recipe.recipeId,recipe.dishType);
                  }}>
                    Add to Menu
                  </button>
                )}
                {console.log(recipe)}
                    {(isAdmin ||currentUser.userId===recipe.userId)&& 
             <button
    onClick={() => handleDeleteRecipe(recipe.recipeId)}
    style={{
      color: "black",
      marginLeft: "5px"
    }}
  >
    🗑
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
    </div>
  );
}

export default Recipes;